// Local browser regression tests. All private records and accounts below are synthetic.
// No live API, mail, upload, or database is used.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { readFile, readdir, stat, mkdir } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { CONTENT_SECURITY_POLICY } from '../../archive/src/app.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const session = { user: { name: 'Synthetic archive reviewer' }, csrfToken: 'synthetic-test-csrf' };
const collections = ['guests', 'invites', 'rsvps', 'categories', 'items', 'contributions', 'campaigns', 'sends'];
let server, origin, browser;

before(async () => {
  server = createServer(async (req, res) => {
    try {
      let path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
      if (path !== root && !path.startsWith(root + sep)) { res.writeHead(404).end(); return; }
      if (!(await stat(path).catch(() => null))?.isFile()) path = resolve(root, 'index.html');
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Security-Policy': CONTENT_SECURITY_POLICY });
      res.end(await readFile(path));
    } catch { res.writeHead(500).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); await new Promise(resolve => server?.close(resolve)); });

async function setup({ authorized = false, mobile = false } = {}) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const state = { authorized, sessionMode: 'normal', recordsMode: 'normal', loginMode: 'normal', logoutMode: 'normal', requests: [], browserRequests: [], errors: [], pendingRecord: null };
  page.on('pageerror', error => state.errors.push(error.message));
  page.on('request', req => state.browserRequests.push(req.url()));
  await page.addInitScript(() => {
    window.__fetchCalls = [];
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', event => window.__cspViolations.push(event.violatedDirective));
    const original = window.fetch;
    window.fetch = (url, options = {}) => {
      window.__fetchCalls.push({ url: String(url), method: options.method ?? 'GET', credentials: options.credentials, cache: options.cache });
      return original(url, options);
    };
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    const req = route.request();
    state.requests.push({ path: url.pathname, search: url.search, method: req.method(), headers: req.headers() });
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'Cache-Control': 'no-store' } });
    if (url.pathname === '/api/archive/session') {
      if (state.sessionMode === 'error') return json(503, {});
      return state.authorized ? json(200, session) : json(401, {});
    }
    if (url.pathname === '/api/archive/login') {
      assert.equal(req.method(), 'POST');
      const body = req.postDataJSON();
      assert.equal(body.email, 'reviewer@example.test');
      assert.equal(body.password, 'synthetic-test-password');
      if (state.loginMode === 'invalid') return json(401, {});
      state.authorized = true;
      return json(200, session);
    }
    if (url.pathname === '/api/archive/logout') {
      assert.equal(req.method(), 'POST');
      assert.equal(req.headers()['x-csrf-token'], session.csrfToken);
      assert.deepEqual(req.postDataJSON(), {});
      if (state.logoutMode === 'error') return json(503, {});
      state.authorized = false;
      return route.fulfill({ status: 204 });
    }
    const collection = url.pathname.split('/').at(-1);
    assert.ok(collections.includes(collection), `Unexpected API route: ${url.pathname}`);
    assert.equal(req.method(), 'GET');
    if (!state.authorized) return json(401, {});
    if (state.recordsMode === 'error') return json(503, {});
    if (state.recordsMode === 'expired') { state.authorized = false; return json(401, {}); }
    const offset = Number(url.searchParams.get('offset'));
    assert.equal(url.searchParams.get('limit'), '100');
    const total = state.recordsMode === 'empty' ? 0 : 101;
    const records = Array.from({ length: Math.max(0, Math.min(100, total - offset)) }, (_, index) => ({
      id: `synthetic-${offset + index + 1}`,
      name: `Synthetic record ${offset + index + 1}`,
      status: 'archived',
      image_url: 'https://example.invalid/private-upload.png',
      html: '<img src="https://example.invalid/tracker.png" onerror="alert(1)">',
      nested: { fixture: true },
      extra: 'Visible in full JSON only',
    }));
    const fulfill = () => json(200, { records, total, offset, limit: 100 });
    if (state.recordsMode === 'delay') { state.pendingRecord = fulfill; return; }
    return fulfill();
  });
  return { context, page, state };
}

async function signIn(page) {
  await page.getByLabel('Email', { exact: true }).fill('reviewer@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}
async function visible(page, text) { await page.getByText(text, { exact: true }).waitFor(); }
async function storageEmpty(page) {
  assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), { local: [], session: [] });
}
async function checkClient(page, state) {
  assert.deepEqual(state.errors, []);
  assert.deepEqual(await page.evaluate(() => window.__cspViolations), []);
  const calls = await page.evaluate(() => window.__fetchCalls);
  for (const call of calls) {
    assert.ok(call.url.startsWith('/api/archive/'));
    assert.equal(call.credentials, 'same-origin');
    assert.equal(call.cache, 'no-store');
  }
  assert.ok(!state.browserRequests.some(url => url.includes('example.invalid')));
  await storageEmpty(page);
}

 test('production bundle excludes legacy APIs, browser auth, and source maps; admin is split', async () => {
  const files = await readdir(root, { recursive: true });
  assert.ok(!files.some(file => file.endsWith('.map')));
  const scripts = files.filter(file => file.endsWith('.js'));
  const contents = await Promise.all(scripts.map(file => readFile(resolve(root, file), 'utf8')));
  const all = contents.join('\n');
  for (const blocked of ['api.samandjonah.com', '/api/admin/', '/api/rsvp', '/api/registry/', 'wedding_admin_session', 'ADMIN_USERS', 'mailto:']) assert.ok(!all.includes(blocked), `Blocked legacy marker: ${blocked}`);
  assert.equal(contents.filter(code => code.includes('/api/archive/')).length, 1);
  assert.ok(scripts[contents.findIndex(code => code.includes('/api/archive/'))].includes('async/'));
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  assert.ok(!html.includes('/static/js/async/'));
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html));
 });

 test('every public route and closed legacy link works without API calls or admin chunk', async () => {
  const { context, page, state } = await setup();
  try {
    for (const path of ['/', '/story', '/party', '/details', '/travel', '/faq', '/rsvp?code=synthetic', '/rsvp/synthetic', '/registry', '/registry/synthetic']) {
      await page.goto(origin + path);
      await page.getByText('Wedding archive · August 15, 2026 · RSVPs and contributions are closed', { exact: true }).waitFor();
      assert.equal(await page.locator('form').count(), 0);
      assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    }
    assert.equal(state.requests.length, 0);
    assert.ok(!state.browserRequests.some(url => url.includes('/static/js/async/')));
    await checkClient(page, state);
  } finally { await context.close(); }
 });

 test('mobile public navigation remains usable and shows closed notices', async () => {
  const { context, page, state } = await setup({ mobile: true });
  try {
    await page.goto(origin);
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.locator('div.fixed.inset-0').getByRole('link', { name: 'RSVP closed', exact: true }).click();
    await page.getByRole('heading', { name: 'RSVPs are closed', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Close menu' }).count(), 0);
    assert.equal(state.requests.length, 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await context.close(); }
 });

 test('anonymous login, invalid credentials, successful sign in, all collections, JSON details, pagination and logout', async () => {
  const { context, page, state } = await setup();
  try {
    await page.goto(origin + '/admin');
    await visible(page, 'Archive sign in');
    assert.equal(state.requests.filter(req => req.path.includes('/records/')).length, 0);
    state.loginMode = 'invalid';
    await signIn(page);
    await visible(page, 'Unable to sign in with those details.');
    assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), '');
    state.loginMode = 'normal';
    await signIn(page);
    await visible(page, 'Wedding history');
    for (const collection of collections) {
      const loaded = page.waitForResponse(response => response.url().includes(`/api/archive/records/${collection}?`));
      await page.locator(`.archive-nav a[href="/admin/${collection}"]`).click();
      await loaded;
      await visible(page, 'Synthetic record 1');
      assert.equal(await page.locator('tbody tr').count(), 100);
    }
    await page.getByRole('link', { name: 'View 1', exact: true }).click();
    await page.getByLabel('Saved record JSON').waitFor();
    assert.ok((await page.getByLabel('Saved record JSON').textContent()).includes('Visible in full JSON only'));
    assert.equal(await page.locator('main img').count(), 0);
    await page.goBack();
    await visible(page, 'Synthetic record 1');
    await page.getByRole('link', { name: 'Next 100 →', exact: true }).click();
    await visible(page, 'Synthetic record 101');
    await page.getByRole('link', { name: 'View 101', exact: true }).click();
    await page.getByLabel('Saved record JSON').waitFor();
    await page.reload();
    await page.getByLabel('Saved record JSON').waitFor();
    assert.ok((await page.getByLabel('Saved record JSON').textContent()).includes('synthetic-101'));
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await visible(page, 'You have signed out.');
    assert.equal(await page.getByLabel('Saved record JSON').count(), 0);
    await checkClient(page, state);
  } finally { await context.close(); }
 });

 test('session errors, record errors and retry, loading, empty state and session expiry clear records', async () => {
  const { context, page, state } = await setup({ authorized: true });
  try {
    state.sessionMode = 'error';
    await page.goto(origin + '/admin/guests');
    await page.getByRole('button', { name: 'Retry connection' }).waitFor();
    assert.equal(state.requests.filter(req => req.path.includes('/records/')).length, 0);
    state.sessionMode = 'normal'; state.recordsMode = 'error';
    await page.getByRole('button', { name: 'Retry connection' }).click();
    await page.getByRole('button', { name: 'Retry records' }).waitFor();
    state.recordsMode = 'delay';
    await page.getByRole('button', { name: 'Retry records' }).click();
    await visible(page, 'Loading guests…');
    while (!state.pendingRecord) await new Promise(resolve => setTimeout(resolve, 10));
    await state.pendingRecord(); state.recordsMode = 'normal';
    await visible(page, 'Synthetic record 1');
    state.recordsMode = 'empty';
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await visible(page, 'No saved records');
    assert.equal(await page.locator('tbody tr').count(), 0);
    state.recordsMode = 'normal';
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await visible(page, 'Synthetic record 1');
    state.recordsMode = 'expired';
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await visible(page, 'Your session ended. Sign in again to view the archive.');
    assert.equal(await page.getByText('Synthetic record 1', { exact: true }).count(), 0);
    assert.equal(await page.locator('.archive-nav').count(), 0);
    await checkClient(page, state);
  } finally { await context.close(); }
 });

 test('background validation does not reread records or keep idle alive, then clears expired data', async () => {
  const { context, page, state } = await setup({ authorized: true });
  try {
    await page.clock.install();
    await page.goto(origin + '/admin/guests');
    await visible(page, 'Synthetic record 1');
    const before = state.requests.filter(req => req.path.includes('/records/')).length;
    const sessionResponse = page.waitForResponse(response => response.url().endsWith('/api/archive/session'));
    await page.clock.fastForward(60_000);
    await sessionResponse;
    assert.equal(state.requests.filter(req => req.path.includes('/records/')).length, before);
    state.authorized = false;
    await page.clock.fastForward(60_000);
    await visible(page, 'Archive sign in');
    assert.equal(await page.getByText('Synthetic record 1', { exact: true }).count(), 0);
    await checkClient(page, state);
  } finally { await context.close(); }
 });

 test('failed logout hides records until sign-out retry succeeds; mobile private view has no viewport overflow', async () => {
  const { context, page, state } = await setup({ authorized: true, mobile: true });
  try {
    await page.goto(origin + '/admin/items');
    await visible(page, 'Synthetic record 1');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    state.logoutMode = 'error';
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await visible(page, 'Sign-out could not be confirmed');
    assert.equal(await page.locator('tbody tr').count(), 0);
    state.logoutMode = 'normal';
    await page.getByRole('button', { name: 'Retry sign out' }).click();
    await visible(page, 'You have signed out.');
    await checkClient(page, state);
  } finally { await context.close(); }
 });

 test('unknown collections and invalid offsets do not issue records requests', async () => {
  const { context, page, state } = await setup({ authorized: true });
  try {
    for (const path of ['/admin/unknown', '/admin/guests?offset=-1', '/admin/guests?offset=1', '/admin/guests/NaN', '/admin/guests?offset=999999999999999999999']) {
      await page.goto(origin + path);
      await visible(page, 'Page not found');
    }
    assert.equal(state.requests.filter(req => req.path.includes('/records/')).length, 0);
  } finally { await context.close(); }
 });

 test('optional review screenshots contain synthetic data only', { skip: !process.env.ARCHIVE_SCREENSHOTS }, async () => {
  const { context, page } = await setup({ authorized: true });
  try {
    await mkdir(process.env.ARCHIVE_SCREENSHOTS, { recursive: true });
    await page.goto(origin);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: resolve(process.env.ARCHIVE_SCREENSHOTS, 'public-home.png') });
    await page.goto(origin + '/admin/guests');
    await visible(page, 'Synthetic record 1');
    await page.screenshot({ path: resolve(process.env.ARCHIVE_SCREENSHOTS, 'synthetic-admin.png') });
  } finally { await context.close(); }
 });
