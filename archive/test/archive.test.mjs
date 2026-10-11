import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Auth, hashPassword, validateUsers, IDLE_MS, ABSOLUTE_MS, COOKIE } from '../src/auth.mjs';
import { createArchiveServer } from '../src/app.mjs';
import { createRecordsReader, verifyReadOnlyRole, COLLECTIONS } from '../src/database.mjs';

// Reserved .test identities and synthetic passwords only. Never use live data.
const PASSWORD = 'Synthetic test password only 2048';
const hash = await hashPassword(PASSWORD);
const users = [
  { id: 'jonah', email: 'person-one@example.test', passwordHash: hash },
  { id: 'sam', email: 'person-two@example.test', passwordHash: hash },
];
const origin = 'https://wedding.jdbuilds.ca';
let clock = 1000000;

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'wedding-archive-test-'));
  const publicDir = path.join(root, 'public'); const uploadsDir = path.join(root, 'uploads');
  await mkdir(publicDir); await mkdir(uploadsDir); await mkdir(path.join(publicDir, 'static'));
  await writeFile(path.join(publicDir, 'index.html'), '<html><body>Archive login shell</body></html>');
  await writeFile(path.join(publicDir, 'static', 'app.js'), '/* public bundle */');
  await writeFile(path.join(uploadsDir, 'fixture.png'), 'synthetic private image');
  await writeFile(path.join(uploadsDir, 'fixture.gif'), 'synthetic private gif');
  await writeFile(path.join(root, 'secret.png'), 'must not escape');
  await symlink(path.join(root, 'secret.png'), path.join(uploadsDir, 'escape.png'));
  const calls = []; const auth = new Auth(users, { now: () => clock });
  const server = createArchiveServer({ origin, publicDir, uploadsDir, auth, readRecords: async (collection, offset, limit) => {
    calls.push({ collection, offset, limit });
    return { records: [{ id: 'synthetic', name: 'Synthetic removed guest', removed: true }], total: 1, offset, limit };
  }});
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(async () => { await new Promise((r) => server.close(r)); await rm(root, { recursive: true }); });
  function request(url, { method = 'GET', data, cookie, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: server.address().port, path: url, method,
        headers: { Host: 'wedding.jdbuilds.ca', ...(data === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }), ...(cookie ? { Cookie: cookie } : {}), ...headers } }, (res) => {
        const chunks = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => {
          const text = Buffer.concat(chunks).toString(); let json; try { json = JSON.parse(text); } catch {}
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      });
      req.on('error', reject); if (data !== undefined) req.write(JSON.stringify(data)); req.end();
    });
  }
  async function login(email = users[0].email, password = PASSWORD) {
    const response = await request('/api/archive/login', { method: 'POST', data: { email, password } });
    return { ...response, cookie: response.headers['set-cookie']?.[0].split(';')[0] };
  }
  return { request, login, calls, auth };
}

test('configuration requires precisely the two designated slots and strong hash parameters', () => {
  assert.equal(validateUsers(users).length, 2);
  assert.throws(() => validateUsers([...users, users[0]]));
  assert.throws(() => validateUsers([{ ...users[0], id: 'someone_else' }, users[1]]));
  assert.throws(() => validateUsers([users[0], { ...users[1], email: users[0].email }]));
  assert.throws(() => validateUsers([{ ...users[0], passwordHash: hash.replace('131072', '1024') }, users[1]]));
});

test('anonymous private data is denied; public pages never read the database', async (t) => {
  const { request, calls } = await fixture(t);
  for (const url of ['/', '/story', '/party', '/details', '/travel', '/faq', '/rsvp?code=synthetic', '/rsvp/synthetic', '/registry', '/registry/synthetic', '/travel/', '/admin']) {
    assert.equal((await request(url)).status, 200, url);
  }
  for (const url of ['/api/archive/session', '/api/archive/records/guests', '/api/archive/uploads/fixture.png']) {
    const r = await request(url); assert.equal(r.status, 401); assert.equal(r.headers['cache-control'], 'no-store');
  }
  assert.deepEqual(calls, []);
});

test('every legacy method is closed, including public registry reads and tracking', async (t) => {
  const { request, calls } = await fixture(t);
  for (const url of ['/api/rsvp/synthetic', '/api/rsvp/synthetic/submit', '/api/registry/categories', '/api/registry/items/1', '/api/registry/contributions', '/api/admin/guests', '/api/admin/invitations/send', '/api/admin/reminders/one-month/send', '/api/admin/campaigns/1/send', '/api/track/open/1', '/uploads/registry/fixture.png']) {
    for (const method of ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      assert.equal((await request(url, { method })).status, 410, `${method} ${url}`);
    }
  }
  assert.deepEqual(calls, []);
});

test('wrong password and a third identity are indistinguishable and issue no session', async (t) => {
  const { login } = await fixture(t);
  const wrong = await login(users[0].email, 'Incorrect synthetic password');
  const third = await login('uninvited@example.test');
  assert.equal(wrong.status, 401); assert.equal(third.status, 401);
  assert.deepEqual(wrong.json, third.json); assert.equal(wrong.cookie, undefined); assert.equal(third.cookie, undefined);
});

test('both authorized users can read complete synthetic history; writes always fail', async (t) => {
  const { login, request, calls } = await fixture(t);
  for (const user of users) {
    const signed = await login(user.email); assert.equal(signed.status, 200);
    assert.match(signed.headers['set-cookie'][0], /__Host-wedding_archive=.*; Path=\/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800/);
    assert.ok(!signed.text.includes(user.email));
    for (const collection of Object.keys(COLLECTIONS)) {
      const r = await request(`/api/archive/records/${collection}`, { cookie: signed.cookie });
      assert.equal(r.status, 200); assert.equal(r.json.records[0].removed, true);
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
        assert.equal((await request(`/api/archive/records/${collection}`, { method, cookie: signed.cookie })).status, 405);
      }
    }
    assert.equal((await request('/api/archive/records/guests?offset=0&limit=1000', { cookie: signed.cookie })).status, 400);
    assert.equal((await request('/api/archive/records/notatable', { cookie: signed.cookie })).status, 404);
  }
  assert.equal(calls.length, 16);
});

test('same-origin login and CSRF logout; logged-out session cannot be reused', async (t) => {
  const { request, login } = await fixture(t);
  assert.equal((await request('/api/archive/login', { method: 'POST', data: {}, headers: { Origin: 'https://elsewhere.test' } })).status, 403);
  assert.equal((await request('/api/archive/login', { method: 'POST', data: {}, headers: { Origin: '' } })).status, 403);
  const signed = await login();
  assert.equal((await request('/api/archive/logout', { method: 'POST', data: {}, cookie: signed.cookie })).status, 403);
  const out = await request('/api/archive/logout', { method: 'POST', data: {}, cookie: signed.cookie, headers: { 'X-CSRF-Token': signed.json.csrfToken } });
  assert.equal(out.status, 204); assert.match(out.headers['set-cookie'][0], /Max-Age=0/);
  assert.equal((await request('/api/archive/records/guests', { cookie: signed.cookie })).status, 401);
});

test('session idle expiry, absolute expiry and replacement revoke old cookies', async (t) => {
  const { request, login } = await fixture(t);
  const first = await login(); const second = await login();
  assert.notEqual(first.cookie, second.cookie);
  assert.equal((await request('/api/archive/session', { cookie: first.cookie })).status, 401);
  clock += IDLE_MS / 2;
  assert.equal((await request('/api/archive/session', { cookie: second.cookie })).status, 200);
  clock += IDLE_MS / 2;
  assert.equal((await request('/api/archive/session', { cookie: second.cookie })).status, 401);
  const third = await login();
  for (let n = 0; n < ABSOLUTE_MS / (IDLE_MS / 2) - 1; n++) {
    clock += IDLE_MS / 2; assert.equal((await request('/api/archive/records/guests', { cookie: third.cookie })).status, 200);
  }
  clock += IDLE_MS / 2;
  assert.equal((await request('/api/archive/session', { cookie: third.cookie })).status, 401);
});

test('rate limit applies after five identity attempts and expires; XFF cannot evade it', async (t) => {
  const { request } = await fixture(t);
  for (let n = 0; n < 5; n++) {
    assert.equal((await request('/api/archive/login', { method: 'POST', data: { email: users[0].email, password: 'incorrect' }, headers: { 'X-Forwarded-For': `192.0.2.${n}` } })).status, 401);
  }
  const blocked = await request('/api/archive/login', { method: 'POST', data: { email: users[0].email, password: PASSWORD } });
  assert.equal(blocked.status, 429); assert.equal(blocked.headers['retry-after'], '900');
  clock += 15 * 60 * 1000;
  assert.equal((await request('/api/archive/login', { method: 'POST', data: { email: users[0].email, password: PASSWORD } })).status, 200);
});

test('private uploads require session; dotfiles, traversal, symlinks, source maps and wrong hosts fail', async (t) => {
  const { login, request } = await fixture(t); const signed = await login();
  const image = await request('/api/archive/uploads/fixture.png', { cookie: signed.cookie });
  assert.equal(image.status, 200); assert.equal(image.headers['content-disposition'], 'attachment');
  assert.equal((await request('/api/archive/uploads/fixture.gif', { cookie: signed.cookie })).status, 200);
  for (const url of ['/api/archive/uploads/escape.png', '/api/archive/uploads/%2e%2e%2fsecret.png', '/api/archive/uploads/.env', '/static/app.js.map', '/archive/src/start.mjs', '/.git/config']) {
    assert.equal((await request(url, { cookie: signed.cookie })).status, 404, url);
  }
  assert.equal((await request('/', { headers: { Host: 'evil.test' } })).status, 421);
  assert.equal((await request('/api/archive/session', { cookie: signed.cookie, headers: { Origin: 'https://evil.test' } })).status, 403);
});

test('reader executes parameterized SELECTs in read-only transactions without removed filter', async () => {
  const queries = []; let released = false;
  const client = { query: async (sql, args) => { queries.push({ sql, args }); return /count/.test(sql) ? { rows: [{ total: '1' }] } : { rows: [{ record: { removed: true } }] }; }, release: () => { released = true; } };
  const reader = createRecordsReader({ connect: async () => client });
  const data = await reader('guests', 100, 20);
  assert.equal(data.records[0].removed, true); assert.equal(released, true);
  assert.match(queries[0].sql, /READ ONLY/);
  assert.deepEqual(queries.find((q) => /LIMIT \$1/.test(q.sql)).args, [20, 100]);
  assert.ok(queries.every((q) => !/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|CREATE|DROP|WHERE removed)\b/.test(q.sql)));
  await assert.rejects(() => reader('guests; DROP TABLE guests', 0, 100));
});

test('privilege verifier refuses powerful or writable database roles', async () => {
  for (const key of ['powerful', 'membership', 'database_write', 'schema_write', 'relation_write', 'custom_function_access', 'large_object_write']) {
    const pool = { query: async () => ({ rows: [{ [key]: true }] }) };
    await assert.rejects(() => verifyReadOnlyRole(pool));
  }
  let reads = 0;
  await verifyReadOnlyRole({ query: async () => (++reads === 1 ? { rows: [{ powerful: false, membership: false, database_write: false, schema_write: false, relation_write: false, custom_function_access: false, large_object_write: false }] } : reads === 2 ? { rows: Object.values(COLLECTIONS).map((relname) => ({ relname, relkind: 'r', relrowsecurity: false })) } : { rows: [] }) });
  assert.equal(reads, 10);
  for (const bad of [{ relkind: 'v', relrowsecurity: false }, { relkind: 'r', relrowsecurity: true }]) {
    let n = 0;
    await assert.rejects(() => verifyReadOnlyRole({ query: async () => (++n === 1 ? { rows: [{ powerful: false }] } : { rows: Object.values(COLLECTIONS).map((relname) => ({ relname, ...bad })) }) }));
  }
});

test('production startup fails closed without configuration and logs no secrets', async () => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['src/start.mjs'], {
    cwd: new URL('..', import.meta.url), env: {}, encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Archive startup refused/);
  assert.ok(!result.stderr.includes('@'));
  assert.ok(!result.stderr.includes('postgres:'));
});
