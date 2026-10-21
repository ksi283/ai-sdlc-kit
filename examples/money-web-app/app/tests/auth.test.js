// FR-1 + SR-1/2/5 — authentication flows, password hashing, session cookie
// flags/rotation, login rate limiting.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, Client } from './helpers.js';
import { hashPassword, verifyPassword } from '../src/auth.js';
import { resetRateLimiter } from '../src/ratelimit.js';

let server; let base;
before(async () => {
  ({ server, base } = await boot());
});
after(() => server.close());

test('SR-1: argon2id hash/verify round-trip; plaintext never stored', async () => {
  const hash = await hashPassword('correct-horse-battery');
  assert.match(hash, /^\$argon2id\$/);
  assert.ok(!hash.includes('correct-horse-battery'));
  assert.equal(await verifyPassword(hash, 'correct-horse-battery'), true);
  assert.equal(await verifyPassword(hash, 'wrong-password-123'), false);
});

test('FR-1: register → redirect to transactions; login works with valid credentials', async () => {
  const c = new Client(base);
  const reg = await c.post('/register', { email: 'alice@test.local', password: 'correct-horse-battery' });
  assert.equal(reg.status, 302);
  assert.equal(reg.headers.get('location'), '/transactions');
  assert.ok(c.cookies.has('pl_sess'), 'register issues a session');

  const list = await c.get('/transactions');
  assert.equal(list.status, 200);
  assert.match(list.text, /Transactions/);
});

test('FR-1: unauthenticated access redirects to /login', async () => {
  const c = new Client(base);
  const res = await c.get('/transactions');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/login');
});

test('FR-1: invalid login → 401 with a GENERIC message (no user enumeration)', async () => {
  const c = new Client(base);
  const unknown = await c.post('/login', { email: 'ghost@test.local', password: 'whatever-long-1' });
  const wrongPw = await c.post('/login', { email: 'alice@test.local', password: 'wrong-password-123' });
  assert.equal(unknown.status, 401);
  assert.equal(wrongPw.status, 401);
  assert.equal(unknown.text, wrongPw.text, 'unknown email and wrong password must be indistinguishable');
  assert.ok(!unknown.text.includes('alice'), 'response must not confirm which emails exist');
});

test('SR-2: session cookie has HttpOnly + Secure + SameSite=Lax + 2h Max-Age', async () => {
  const c = new Client(base);
  const res = await c.post('/login', { email: 'alice@test.local', password: 'correct-horse-battery' });
  const cookie = res.setCookie.find((x) => x.startsWith('pl_sess='));
  assert.ok(cookie, 'session cookie set on login');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=7200/);
});

test('SR-2: session rotates on re-login (new cookie value, old session usable only until expiry)', async () => {
  const c1 = new Client(base);
  await c1.post('/login', { email: 'alice@test.local', password: 'correct-horse-battery' });
  const sid1 = c1.cookies.get('pl_sess');
  const c2 = new Client(base);
  await c2.post('/login', { email: 'alice@test.local', password: 'correct-horse-battery' });
  const sid2 = c2.cookies.get('pl_sess');
  assert.notEqual(sid1, sid2, 'every login mints a fresh server-generated sid');
});

test('FR-1: logout clears the session', async () => {
  const c = await import('./helpers.js').then((h) => h.registerAndLogin(base, 'bob@test.local'));
  const out = await c.post('/logout', {});
  assert.equal(out.status, 302);
  assert.ok(out.setCookie.some((x) => x.startsWith('pl_sess=;')), 'cookie cleared');
  const after = await c.get('/transactions');
  assert.equal(after.status, 302, 'session no longer valid');
});

test('SR-5: 3 failed logins → 429 even with the correct password afterwards', async () => {
  resetRateLimiter();
  const c = new Client(base);
  for (let i = 0; i < 3; i++) {
    const r = await c.post('/login', { email: 'alice@test.local', password: 'nope-nope-nope' });
    assert.equal(r.status, 401);
  }
  const blocked = await c.post('/login', { email: 'alice@test.local', password: 'correct-horse-battery' });
  assert.equal(blocked.status, 429, 'blocked despite correct credentials');
  assert.ok(!blocked.text.includes('Invalid email or password'), '429 body is generic');
});
