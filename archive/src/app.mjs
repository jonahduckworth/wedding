import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { COLLECTIONS } from './database.mjs';
import { sessionCookie } from './auth.mjs';

export const CONTENT_SECURITY_POLICY = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'";

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const PUBLIC_ROUTES = new Set(['/', '/story', '/party', '/details', '/travel', '/faq', '/rsvp', '/registry']);
const PUBLIC_ASSET_ROOTS = new Set(['static', 'Gallery', 'WeddingParty', 'activities', 'travel']);
const PUBLIC_ROOT_ASSETS = new Set(['apple-touch-icon.png', 'favicon.png', 'favicon.svg', 'hero-desktop.jpg', 'hero-mobile.jpg', 'icon-192.png', 'invitation.jpg', 'og-image.jpg', 'save-the-date-hero.png', 'wedding-hero.jpg']);
function reply(res, status, value) {
  res.statusCode = status;
  if (value === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}
async function body(req) {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw { status: 415 };
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) throw { status: 413 };
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value;
  } catch { throw { status: 400 }; }
}
function headers(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
}
async function sendFile(req, res, root, relative, download = false) {
  // Never allow traversal, dotfiles, symlinks escaping the mount, or directory lists.
  if (!relative || relative.split('/').some((part) => !part || part.startsWith('.') || part.includes('\\'))) return reply(res, 404, { error: 'Not found' });
  let full;
  try {
    const resolvedRoot = await realpath(root);
    full = await realpath(path.join(resolvedRoot, relative));
    if (!full.startsWith(`${resolvedRoot}${path.sep}`)) return reply(res, 404, { error: 'Not found' });
    const info = await stat(full);
    if (!info.isFile()) return reply(res, 404, { error: 'Not found' });
    const ext = path.extname(full).toLowerCase();
    if (!TYPES[ext] || ext === '.json') return reply(res, 404, { error: 'Not found' });
    res.setHeader('Content-Type', download ? 'application/octet-stream' : TYPES[ext]);
    res.setHeader('Content-Length', info.size);
    if (download) res.setHeader('Content-Disposition', 'attachment');
    if (req.method === 'HEAD') return res.end();
    await pipeline(createReadStream(full), res);
  } catch {
    if (!res.headersSent) reply(res, 404, { error: 'Not found' });
    else res.destroy();
  }
}

export function createArchiveServer({ auth, readRecords, publicDir, uploadsDir, origin }) {
  const configured = new URL(origin);
  if (configured.protocol !== 'https:' || configured.origin !== origin) throw new Error('A canonical HTTPS archive origin is required');
  const server = createServer(async (req, res) => {
    headers(res);
    try {
      // Host is forwarded unchanged by the approved reverse proxy. Never trust
      // arbitrary X-Forwarded-Host or X-Forwarded-For headers.
      if (req.headers.host !== configured.host) return reply(res, 421, { error: 'Wrong host' });
      const url = new URL(req.url, origin);
      if (url.origin !== origin) return reply(res, 400, { error: 'Invalid URL' });
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { return reply(res, 400, { error: 'Invalid URL' }); }
      if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some((p) => p === '..' || p === '.')) return reply(res, 404, { error: 'Not found' });
      const isRead = req.method === 'GET' || req.method === 'HEAD';
      if (pathname === '/health' && isRead) return reply(res, 200, { status: 'ok', mode: 'readonly' });
      const login = pathname === '/api/archive/login';
      const logout = pathname === '/api/archive/logout';
      if (login || logout) {
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(res, 405, { error: 'Method not allowed' }); }
        if (req.headers.origin !== origin || req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return reply(res, 403, { error: 'Same-origin request required' });
        if (login) {
          const input = await body(req);
          const result = await auth.login(input.email, input.password, req.socket.remoteAddress ?? 'unknown');
          if (result.status !== 200) {
            if (result.status === 429) res.setHeader('Retry-After', '900');
            return reply(res, result.status, { error: result.status === 429 ? 'Too many attempts. Try again later.' : 'Invalid email or password' });
          }
          res.setHeader('Set-Cookie', sessionCookie(result.token));
          return reply(res, 200, { user: result.session.user, csrfToken: result.session.csrfToken });
        }
        const session = auth.session(req.headers.cookie);
        if (!session) { res.setHeader('Set-Cookie', sessionCookie('', true)); return reply(res, 401, { error: 'Sign in required' }); }
        if (req.headers['x-csrf-token'] !== session.csrfToken) return reply(res, 403, { error: 'Invalid request token' });
        await body(req);
        auth.logout(req.headers.cookie);
        res.setHeader('Set-Cookie', sessionCookie('', true));
        return reply(res, 204);
      }
      if (pathname.startsWith('/api/archive/')) {
        if (!isRead) { res.setHeader('Allow', 'GET, HEAD'); return reply(res, 405, { error: 'Archive records are read-only' }); }
        if (req.headers.origin && req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') return reply(res, 403, { error: 'Same-origin request required' });
        const session = auth.session(req.headers.cookie, { touch: pathname !== '/api/archive/session' });
        if (!session) { res.setHeader('Set-Cookie', sessionCookie('', true)); return reply(res, 401, { error: 'Sign in required' }); }
        if (pathname === '/api/archive/session') return reply(res, 200, { user: session.user, csrfToken: session.csrfToken });
        const match = /^\/api\/archive\/records\/([a-z]+)$/.exec(pathname);
        if (match && Object.hasOwn(COLLECTIONS, match[1])) {
          const offsetText = url.searchParams.get('offset') ?? '0';
          const limitText = url.searchParams.get('limit') ?? '100';
          if (!/^\d{1,7}$/.test(offsetText) || !/^\d{1,3}$/.test(limitText)) return reply(res, 400, { error: 'Invalid pagination' });
          const offset = Number(offsetText), limit = Number(limitText);
          if (limit < 1 || limit > 100 || offset > 1000000) return reply(res, 400, { error: 'Invalid pagination' });
          return reply(res, 200, await readRecords(match[1], offset, limit));
        }
        if (pathname.startsWith('/api/archive/uploads/') && uploadsDir) {
          return await sendFile(req, res, uploadsDir, pathname.slice('/api/archive/uploads/'.length), true);
        }
        return reply(res, 404, { error: 'Not found' });
      }
      // Hard deny ALL legacy reads and writes, including tracking pixels,
      // invitations, reminders, public registry amounts and raw upload paths.
      if (pathname === '/api' || pathname.startsWith('/api/') || pathname === '/uploads' || pathname.startsWith('/uploads/')) {
        return reply(res, 410, { error: 'This service has been archived' });
      }
      if (!isRead) { res.setHeader('Allow', 'GET, HEAD'); return reply(res, 405, { error: 'Archive is read-only' }); }
      const pagePath = pathname.replace(/\/+$/, '') || '/';
      if (PUBLIC_ROUTES.has(pagePath) || pathname.startsWith('/rsvp/') || pathname.startsWith('/registry/') || pagePath === '/admin' || pathname.startsWith('/admin/')) {
        if (pathname.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        return await sendFile(req, res, publicDir, 'index.html');
      }
      const relative = pathname.slice(1);
      const root = relative.split('/')[0];
      if (!PUBLIC_ROOT_ASSETS.has(relative) && !PUBLIC_ASSET_ROOTS.has(root)) return reply(res, 404, { error: 'Not found' });
      if (/\.map$/i.test(relative)) return reply(res, 404, { error: 'Not found' });
      return await sendFile(req, res, publicDir, relative);
    } catch (error) {
      // Deliberately never log request bodies, URLs, SQL errors or credentials.
      if (!res.headersSent) reply(res, error.status ?? 503, { error: error.status ? 'Invalid request' : 'Archive temporarily unavailable' });
      else res.destroy();
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.timeout = 20_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 50;
  return server;
}
