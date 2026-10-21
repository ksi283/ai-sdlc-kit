// FR-3 — monthly summary: exact per-category totals + net, month scoping.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, registerAndLogin, bulk } from './helpers.js';

let server; let base; let eve;
before(async () => {
  ({ server, base } = await boot());
  eve = await registerAndLogin(base, 'eve@test.local');
});
after(() => server.close());

async function tx(t) {
  const r = await eve.post('/transactions', {
    kind: 'expense', amount: '1.00', category: 'food', note: '', occurred_at: '2026-10-05', ...t,
  });
  assert.equal(r.status, 302);
}

test('FR-3: per-category totals and net match the fixture exactly; other months excluded', async () => {
  await tx({ kind: 'income', amount: '3000.00', category: 'salary', occurred_at: '2026-10-01' });
  await tx({ kind: 'income', amount: '500.00', category: 'salary', occurred_at: '2026-10-20' }); // salary total 3500
  await tx({ kind: 'expense', amount: '12.34', category: 'food', occurred_at: '2026-10-05' });
  await tx({ kind: 'expense', amount: '7.66', category: 'food', occurred_at: '2026-10-07' }); // food total 20.00
  await tx({ kind: 'expense', amount: '45.00', category: 'transport', occurred_at: '2026-10-08' });
  await tx({ kind: 'expense', amount: '99.00', category: 'food', occurred_at: '2026-09-30' }); // must NOT count

  const res = await eve.get('/summary?month=2026-10');
  assert.equal(res.status, 200);
  assert.match(res.text, /3,500\.00/); // income
  assert.match(res.text, /65\.00/);    // expenses 20 + 45
  assert.match(res.text, /3,435\.00/); // net
  assert.ok(!res.text.includes('99.00'), 'September transaction excluded');

  const sep = await eve.get('/summary?month=2026-09');
  assert.match(sep.text, /99\.00/);
});

test('FR-3: invalid month → 400; missing month → current month', async () => {
  const bad = await eve.get('/summary?month=2026-13');
  assert.equal(bad.status, 400);
  const fallback = await eve.get('/summary');
  assert.equal(fallback.status, 200);
});

test('FR-3 perf: summary renders for 10k transactions well under 500ms', async () => {
  const { db } = await import('../server.js');
  const { getSessionUser } = await import('../src/repos/users.js');
  const { sidHash } = await import('../src/auth.js');
  const uid = getSessionUser(db, sidHash(eve.cookies.get('pl_sess'))).id;
  const insert = db.prepare(`INSERT INTO transactions (user_id, kind, amount_cents, category, note, occurred_at)
                             VALUES (?, 'expense', 100, 'food', 'seed', '2026-07-15')`);
  bulk(db, () => insert.run(uid), 10000);

  const t0 = performance.now();
  const res = await eve.get('/summary?month=2026-07');
  const ms = performance.now() - t0;
  assert.equal(res.status, 200);
  assert.ok(ms < 500, `summary took ${ms.toFixed(1)}ms — must be < 500ms`);
});
