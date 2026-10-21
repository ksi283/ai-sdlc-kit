// FR-2 + SR-3/6 — transaction CRUD, the cross-user authz matrix, input
// validation, XSS escaping and pagination performance.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, registerAndLogin, percentile, bulk } from './helpers.js';

let server; let base; let alice; let bob;
before(async () => {
  ({ server, base } = await boot());
  alice = await registerAndLogin(base, 'alice@test.local');
  bob = await registerAndLogin(base, 'bob@test.local');
});
after(() => server.close());

async function createTx(client, tx) {
  return client.post('/transactions', {
    kind: 'expense', amount: '10.00', category: 'food', note: '', occurred_at: '2026-10-05', ...tx,
  });
}

function extractId(listHtml) {
  const m = listHtml.match(/\/transactions\/(\d+)\/edit/);
  return m ? Number(m[1]) : null;
}

test('FR-2: create → appears in the list with correct rendering', async () => {
  const res = await createTx(alice, { amount: '12.34', note: 'lunch', occurred_at: '2026-10-05' });
  assert.equal(res.status, 302);
  const list = await alice.get('/transactions');
  assert.match(list.text, /lunch/);
  assert.match(list.text, /12\.34/);
  assert.match(list.text, /food/);
});

test('FR-2: edit changes the stored values; delete removes them', async () => {
  await createTx(alice, { amount: '5.00', note: 'before-edit' });
  const id = extractId((await alice.get('/transactions')).text);
  assert.ok(id, 'transaction id parsed from list');

  const edit = await alice.post(`/transactions/${id}/edit`, {
    kind: 'expense', amount: '6.50', category: 'transport', note: 'after-edit', occurred_at: '2026-10-06',
  });
  assert.equal(edit.status, 302);
  const list = await alice.get('/transactions');
  assert.match(list.text, /after-edit/);
  assert.match(list.text, /6\.50/);
  assert.ok(!list.text.includes('before-edit'));

  const del = await alice.post(`/transactions/${id}/delete`, {});
  assert.equal(del.status, 302);
  const after = await alice.get('/transactions');
  assert.ok(!after.text.includes('after-edit'));
});

test('SR-3 authz matrix: user B cannot see/edit/delete user A\'s transaction (404, indistinguishable)', async () => {
  await createTx(alice, { amount: '99.99', note: 'alice-private' });
  const id = extractId((await alice.get('/transactions')).text);
  assert.ok(id);

  // B's list must not leak A's data
  const bobList = await bob.get('/transactions');
  assert.ok(!bobList.text.includes('alice-private'));

  // B edit → 404 ; B delete → 404
  const edit = await bob.post(`/transactions/${id}/edit`, {
    kind: 'expense', amount: '1.00', category: 'food', note: 'hijack', occurred_at: '2026-10-05',
  });
  assert.equal(edit.status, 404);
  const del = await bob.post(`/transactions/${id}/delete`, {});
  assert.equal(del.status, 404);

  // A's data is intact
  const aliceList = await alice.get('/transactions');
  assert.match(aliceList.text, /alice-private/);
});

test('SR-6 validation: negative / malformed amounts, oversized notes → 400', async () => {
  for (const bad of ['-5.00', '1.234', 'abc', '0.00', '']) {
    const r = await createTx(alice, { amount: bad });
    assert.equal(r.status, 400, `amount "${bad}" must be rejected`);
  }
  const longNote = 'x'.repeat(201);
  const r = await createTx(alice, { note: longNote });
  assert.equal(r.status, 400);
  const badCat = await createTx(alice, { category: 'drop table' });
  assert.equal(badCat.status, 400);
});

test('SR-6 XSS fixtures: <script> in note is stored but rendered escaped', async () => {
  await createTx(alice, { note: '<script>alert(1)</script>', category: 'other' });
  const list = await alice.get('/transactions');
  assert.ok(!/<script>alert/.test(list.text), 'no unescaped script tag in output');
  assert.match(list.text, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/, 'note rendered escaped');
});

test('FR-2 pagination: 120 rows → 3 pages of ≤ 50', async () => {
  const carol = await registerAndLogin(base, 'carol@test.local');
  for (let i = 0; i < 120; i++) {
    const r = await createTx(carol, { amount: '1.00', note: `row-${i}`, occurred_at: '2026-09-15' });
    assert.equal(r.status, 302);
  }
  const p1 = await carol.get('/transactions?page=1');
  assert.match(p1.text, /page 1\/3/);
  const rowsOnPage = (p1.text.match(/\/transactions\/\d+\/edit/g) ?? []).length;
  assert.equal(rowsOnPage, 50);
  const p9 = await carol.get('/transactions?page=9');
  assert.match(p9.text, /page 3\/3/, 'out-of-range page clamps to the last page');
});

test('FR-2 perf smoke: p95 list latency < 300ms with 10k rows', async () => {
  const dave = await registerAndLogin(base, 'dave@test.local');
  // bulk-seed via the API would be slow; seed via the repo for speed, then measure HTTP.
  const { db } = await import('../server.js');
  const { getSessionUser } = await import('../src/repos/users.js');
  const uid = getSessionUser(db, (await import('../src/auth.js')).sidHash(dave.cookies.get('pl_sess'))).id;
  const insert = db.prepare(`INSERT INTO transactions (user_id, kind, amount_cents, category, note, occurred_at)
                             VALUES (?, 'expense', 100, 'food', 'seed', '2026-08-10')`);
  bulk(db, () => insert.run(uid), 10000);

  const latencies = [];
  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    const r = await dave.get('/transactions');
    latencies.push(performance.now() - t0);
    assert.equal(r.status, 200);
  }
  latencies.sort((a, b) => a - b);
  const p95 = percentile(latencies, 95);
  assert.ok(p95 < 300, `p95 ${p95.toFixed(1)}ms must be < 300ms`);
});
