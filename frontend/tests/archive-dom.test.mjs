// Exercises the production bundle in an isolated DOM. This does not replace visual browser QA.
// All API responses are synthetic; ResourceLoader serves only the local production build.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const collectionNames = ['guests', 'invites', 'rsvps', 'categories', 'items', 'contributions', 'campaigns', 'sends'];
const fixtureSession = { user: { name: 'Synthetic reviewer' }, csrfToken: 'synthetic-csrf' };

class LocalBuild extends ResourceLoader {
  constructor(requests) { super(); this.requests = requests; }
  fetch(url) {
    this.requests.push(url);
    const parsed = new URL(url);
    if (parsed.origin !== 'http://archive.test') return null;
    // JSDOM cannot parse Tailwind's modern CSS; this suite tests behavior only.
    if (parsed.pathname.endsWith('.css')) return Promise.resolve(Buffer.from(''));
    const path = resolve(root, `.${decodeURIComponent(parsed.pathname)}`);
    if (!path.startsWith(root + sep)) return null;
    return readFile(path).catch(() => null);
  }
}

function setup(path, authorized = false) {
  const state = { authorized, mode: 'normal', loginInvalid: false, logoutFailed: false, sessionFailed: false, api: [], assets: [], errors: [], intervals: [], delay: null };
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => state.errors.push(error.message));
  const dom = new JSDOM(html, {
    url: `http://archive.test${path}`, runScripts: 'dangerously', resources: new LocalBuild(state.assets), pretendToBeVisual: true, virtualConsole,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      const setInterval = window.setInterval.bind(window);
      window.setInterval = (callback, delay, ...args) => { if (delay === 60_000) state.intervals.push(callback); return setInterval(callback, delay, ...args); };
      window.fetch = async (url, options) => {
        state.api.push({ url, options });
        const response = (status, body) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
        if (url === '/api/archive/session') return state.sessionFailed ? response(503, {}) : response(state.authorized ? 200 : 401, fixtureSession);
        if (url === '/api/archive/login') {
          assert.equal(options.method, 'POST');
          assert.deepEqual(JSON.parse(options.body), { email: 'reviewer@example.test', password: 'synthetic-test-password' });
          if (state.loginInvalid) return response(401, {});
          state.authorized = true; return response(200, fixtureSession);
        }
        if (url === '/api/archive/logout') {
          assert.equal(options.method, 'POST');
          assert.equal(options.headers['X-CSRF-Token'], fixtureSession.csrfToken);
          assert.equal(options.body, '{}');
          if (state.logoutFailed) return response(typeof state.logoutFailed === 'number' ? state.logoutFailed : 503, {});
          state.authorized = false; return response(204);
        }
        assert.match(url, /^\/api\/archive\/records\/(guests|invites|rsvps|categories|items|contributions|campaigns|sends)\?offset=\d+&limit=100$/);
        assert.ok(!options.method || options.method === 'GET');
        if (state.mode === 'expired') { state.authorized = false; return response(401, {}); }
        if (state.mode === 'error') return response(503, {});
        if (state.mode === 'delay') await new Promise(resolve => { state.delay = resolve; });
        const offset = Number(new URL(url, 'http://archive.test').searchParams.get('offset'));
        const records = state.mode === 'empty' ? [] : [{ id: `synthetic-${offset + 1}`, name: `Synthetic record ${offset + 1}`, image_url: 'https://example.invalid/private.png', html: '<img src="https://example.invalid/tracker.png">', nested: { synthetic: true }, status: 'archived', extra: 'Complete saved value' }];
        return response(200, { records, total: state.mode === 'empty' ? 0 : 101, offset, limit: 100 });
      };
    },
  });
  return { dom, state, document: dom.window.document };
}

async function until(predicate, description = 'condition') {
  const deadline = Date.now() + 5000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error(`Timed out waiting for ${description}`); await new Promise(resolve => setTimeout(resolve, 10)); }
}
const has = (document, text) => document.body.textContent.includes(text);
async function click(document, text, selector = 'button, a') {
  const target = [...document.querySelectorAll(selector)].find(element => element.textContent.trim() === text);
  assert.ok(target, `Missing ${text}`); target.click(); await new Promise(resolve => setTimeout(resolve, 0));
}
async function login(document) {
  document.querySelector('[name=email]').value = 'reviewer@example.test';
  document.querySelector('[name=password]').value = 'synthetic-test-password';
  await click(document, 'Sign in', 'button');
}
function check(state, dom) {
  assert.deepEqual(state.errors, []);
  for (const request of state.api) { assert.equal(request.options.credentials, 'same-origin'); assert.equal(request.options.cache, 'no-store'); }
  assert.deepEqual(Object.keys(dom.window.localStorage), []);
  assert.deepEqual(Object.keys(dom.window.sessionStorage), []);
  assert.ok(!state.assets.some(url => url.includes('example.invalid')));
}

 test('built scripts are split and exclude obsolete endpoints, auth markers and source maps', async () => {
  const files = await readdir(root, { recursive: true });
  assert.ok(!files.some(file => file.endsWith('.map')));
  const scripts = await Promise.all(files.filter(file => file.endsWith('.js')).map(async file => [file, await readFile(resolve(root, file), 'utf8')]));
  for (const marker of ['api.samandjonah.com', '/api/admin/', '/api/rsvp', '/api/registry/', 'wedding_admin_session', 'ADMIN_USERS', 'mailto:']) assert.ok(!scripts.some(([, source]) => source.includes(marker)), marker);
  const apiChunks = scripts.filter(([, source]) => source.includes('/api/archive/'));
  assert.equal(apiChunks.length, 1); assert.ok(apiChunks[0][0].includes('async/'));
  assert.ok(!html.includes('/static/js/async/'));
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html));
 });

 test('public routes load no private chunk or API and closed routes contain no forms', async () => {
  for (const path of ['/', '/story', '/party', '/details', '/travel', '/faq', '/rsvp?code=synthetic', '/rsvp/synthetic', '/registry/synthetic']) {
    const { dom, document, state } = setup(path);
    try {
      await until(() => has(document, 'Wedding archive · August 15, 2026'), path);
      assert.equal(state.api.length, 0);
      assert.ok(!state.assets.some(url => url.includes('/static/js/async/')));
      assert.equal(document.querySelectorAll('form, a[href^="mailto:"]').length, 0);
      check(state, dom);
    } finally { dom.window.close(); }
  }
 });

 test('server login, all eight read-only histories, JSON detail, pagination and logout', async () => {
  const { dom, document, state } = setup('/admin');
  try {
    await until(() => has(document, 'Archive sign in'));
    assert.equal(state.api.filter(req => req.url.includes('/records/')).length, 0);
    state.loginInvalid = true; await login(document);
    await until(() => has(document, 'Unable to sign in with those details.'));
    assert.equal(document.querySelector('[name=password]').value, '');
    state.loginInvalid = false; await login(document);
    await until(() => has(document, 'Wedding history'));
    for (const collection of collectionNames) {
      document.querySelector(`.archive-nav a[href="/admin/${collection}"]`).click();
      await until(() => state.api.some(req => req.url.startsWith(`/api/archive/records/${collection}?`)) && has(document, 'Synthetic record 1'));
      assert.ok(state.api.some(req => req.url.startsWith(`/api/archive/records/${collection}?`)));
    }
    await click(document, 'View 1'); await until(() => document.querySelector('.archive-json'));
    assert.ok(has(document, 'Complete saved value'));
    assert.equal(document.querySelectorAll('main img').length, 0);
    await click(document, '← Back to sends'); await until(() => document.querySelector('table'));
    await click(document, 'Next 100 →'); await until(() => has(document, 'Synthetic record 101'));
    await click(document, 'View 101'); await until(() => document.querySelector('.archive-json'));
    assert.ok(has(document, 'synthetic-101'));
    await click(document, 'Sign out'); await until(() => has(document, 'You have signed out.'));
    assert.equal(document.querySelectorAll('.archive-json, table').length, 0);
    check(state, dom);
  } finally { dom.window.close(); }
 });

 test('loading, empty, errors, retry and expired sessions remove private records', async () => {
  const { dom, document, state } = setup('/admin/guests', true);
  try {
    state.sessionFailed = true;
    await until(() => has(document, 'Retry connection'));
    state.sessionFailed = false; state.mode = 'error'; await click(document, 'Retry connection');
    await until(() => has(document, 'Retry records'));
    state.mode = 'delay'; await click(document, 'Retry records');
    await until(() => has(document, 'Loading guests…') && state.delay);
    state.mode = 'normal'; state.delay(); await until(() => has(document, 'Synthetic record 1'));
    state.mode = 'empty'; await click(document, 'Refresh'); await until(() => has(document, 'No saved records'));
    assert.equal(document.querySelectorAll('table').length, 0);
    state.mode = 'normal'; await click(document, 'Refresh'); await until(() => has(document, 'Synthetic record 1'));
    state.mode = 'expired'; await click(document, 'Refresh'); await until(() => has(document, 'Your session ended.'));
    assert.ok(!has(document, 'Synthetic record 1')); assert.equal(document.querySelectorAll('.archive-nav').length, 0);
    check(state, dom);
  } finally { dom.window.close(); }
 });

 test('session poll does not reload records and a failed check clears the mounted history', async () => {
  const { dom, document, state } = setup('/admin/guests', true);
  try {
    await until(() => has(document, 'Synthetic record 1') && state.intervals.length);
    const initial = state.api.filter(req => req.url.includes('/records/')).length;
    await state.intervals.at(-1)();
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(state.api.filter(req => req.url.includes('/records/')).length, initial);
    assert.ok(has(document, 'Synthetic record 1'));
    state.sessionFailed = true; await state.intervals.at(-1)();
    await until(() => has(document, 'Retry connection'));
    assert.ok(!has(document, 'Synthetic record 1'));
    check(state, dom);
  } finally { dom.window.close(); }
 });

 test('logout failure clears visible records and supports retry', async () => {
  const { dom, document, state } = setup('/admin/items', true);
  try {
    await until(() => has(document, 'Synthetic record 1'));
    state.logoutFailed = 403; await click(document, 'Sign out');
    await until(() => has(document, 'Sign-out could not be confirmed'));
    assert.ok(!has(document, 'Synthetic record 1'));
    state.logoutFailed = false; await click(document, 'Retry sign out');
    await until(() => has(document, 'You have signed out.'));
    check(state, dom);
  } finally { dom.window.close(); }
 });

 test('invalid collections, offsets and row indexes do not request records', async () => {
  for (const path of ['/admin/missing', '/admin/guests?offset=1', '/admin/guests?offset=-1', '/admin/guests/bad', '/admin/guests?offset=999999999999999999999']) {
    const { dom, document, state } = setup(path, true);
    try { await until(() => has(document, 'Page not found')); assert.equal(state.api.filter(req => req.url.includes('/records/')).length, 0); check(state, dom); }
    finally { dom.window.close(); }
  }
 });
