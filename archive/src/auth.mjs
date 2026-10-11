import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
const PARAMS = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 });
export const COOKIE = '__Host-wedding_archive';
export const IDLE_MS = 30 * 60 * 1000;
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000;
const digest = (value) => createHash('sha256').update(value).digest('hex');

function decodeHash(value) {
  if (typeof value !== 'string') throw new Error('Invalid password hash');
  const parts = value.split('$');
  if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$131072$8$1' ||
      !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) {
    throw new Error('Invalid password hash');
  }
  return { salt: Buffer.from(parts[4], 'hex'), expected: Buffer.from(parts[5], 'hex') };
}

// Intended only for synthetic tests and an eventual user-controlled, offline
// credential setup. No production credential is created by startup or build.
export async function hashPassword(password) {
  if (typeof password !== 'string' || [...password].length < 15 || Buffer.byteLength(password) > 512) {
    throw new Error('Password must have at least 15 characters and at most 512 bytes');
  }
  const salt = randomBytes(16);
  const hash = await derive(password, salt, 64, PARAMS);
  return `scrypt$131072$8$1$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function validateUsers(users) {
  if (!Array.isArray(users) || users.length !== 2) throw new Error('Exactly two archive users required');
  const normalized = users.map((u) => {
    if (!u || !['jonah', 'sam'].includes(u.id) || typeof u.email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email) || u.email.length > 254) {
      throw new Error('Invalid archive user configuration');
    }
    decodeHash(u.passwordHash);
    return { id: u.id, name: u.id === 'jonah' ? 'Jonah' : 'Sam', email: u.email.trim().toLowerCase(), passwordHash: u.passwordHash };
  });
  if (new Set(normalized.map((u) => u.id)).size !== 2 || new Set(normalized.map((u) => u.email)).size !== 2) {
    throw new Error('Archive users must be distinct');
  }
  return normalized;
}

class WindowLimit {
  constructor(max, windowMs, capacity = 1000) {
    Object.assign(this, { max, windowMs, capacity, entries: new Map() });
  }
  consume(key, now) {
    for (const [key, v] of this.entries) if (v.until <= now) this.entries.delete(key);
    let entry = this.entries.get(key);
    if (!entry) {
      if (this.entries.size >= this.capacity) return false;
      entry = { count: 0, until: now + this.windowMs };
      this.entries.set(key, entry);
    }
    entry.count += 1;
    return entry.count <= this.max;
  }
}

export class Auth {
  constructor(users, { now = Date.now } = {}) {
    this.users = validateUsers(users);
    this.now = now;
    this.sessions = new Map();
    this.networkLimit = new WindowLimit(20, 15 * 60 * 1000);
    this.identityLimit = new WindowLimit(5, 15 * 60 * 1000);
    this.globalLimit = new WindowLimit(60, 15 * 60 * 1000, 1);
    this.activeHash = false;
  }
  async login(email, password, address) {
    const validEmail = typeof email === 'string' && email.length <= 254;
    const normalized = validEmail ? email.trim().toLowerCase() : '';
    const now = this.now();
    // Count all attempts, including successful ones; never trust client XFF.
    const networkOK = this.networkLimit.consume(address, now);
    const identityOK = this.identityLimit.consume(digest(normalized), now);
    const globalOK = this.globalLimit.consume('all', now);
    if (!networkOK || !identityOK || !globalOK || this.activeHash) return { status: 429 };
    const validPassword = typeof password === 'string' && Buffer.byteLength(password) <= 512;
    const user = this.users.find((u) => u.email === normalized);
    // Unknown users still run the same KDF. One concurrent hash bounds memory.
    const { salt, expected } = decodeHash((user ?? this.users[0]).passwordHash);
    this.activeHash = true;
    let actual;
    try { actual = await derive(validPassword ? password : '', salt, 64, PARAMS); }
    finally { this.activeHash = false; }
    if (!timingSafeEqual(actual, expected) || !user || !validEmail || !validPassword) return { status: 401 };
    this.prune();
    // A new login replaces this person's previous session and prevents fixation.
    for (const [key, session] of this.sessions) if (session.user.id === user.id) this.sessions.delete(key);
    const token = randomBytes(32).toString('base64url');
    const session = { user: { id: user.id, name: user.name }, csrfToken: randomBytes(32).toString('base64url'), created: now, last: now };
    this.sessions.set(digest(token), session);
    return { status: 200, token, session };
  }
  prune() {
    const now = this.now();
    for (const [key, s] of this.sessions) {
      if (now - s.last >= IDLE_MS || now - s.created >= ABSOLUTE_MS) this.sessions.delete(key);
    }
  }
  tokenFromCookie(cookie = '') {
    const matches = cookie.split(';').map((s) => s.trim()).filter((s) => s.startsWith(`${COOKIE}=`));
    if (matches.length !== 1) return null;
    const token = matches[0].slice(COOKIE.length + 1);
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
  }
  session(cookie, { touch = true } = {}) {
    this.prune();
    const token = this.tokenFromCookie(cookie);
    const session = token ? this.sessions.get(digest(token)) : null;
    if (session && touch) session.last = this.now();
    return session ?? null;
  }
  logout(cookie) {
    const token = this.tokenFromCookie(cookie);
    if (token) this.sessions.delete(digest(token));
  }
}

export function sessionCookie(token, clear = false) {
  return `${COOKIE}=${clear ? '' : token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : ABSOLUTE_MS / 1000}`;
}
