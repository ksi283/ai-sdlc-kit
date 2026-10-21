// The eval suite (templates/evals.md): security evals that run in CI — log
// masking, secret scan, session expiry, migration rollback path.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { boot, registerAndLogin } from './helpers.js';
import { recentLogs, resetLogs } from '../src/logger.js';
import { openDb, migrateDown } from '../src/db.js';
import { createSession, getSessionUser } from '../src/repos/users.js';
import { sidHash } from '../src/auth.js';

let server; let base;
before(async () => {
  ({ server, base } = await boot());
  resetLogs();
});
after(() => server.close());

test('EV-1 (SR-4): request logs contain no amounts, notes or emails', async () => {
  const frank = await registerAndLogin(base, 'frank@test.local');
  await frank.post('/transactions', {
    kind: 'expense', amount: '777.77', category: 'fun', note: 'secret-note-value', occurred_at: '2026-10-05',
  });
  const logs = recentLogs().join('\n');
  assert.ok(!logs.includes('777.77'), 'no amount in logs');
  assert.ok(!logs.includes('77777'), 'no cents form either');
  assert.ok(!logs.includes('secret-note-value'), 'no note in logs');
  assert.ok(!logs.includes('frank@test.local'), 'no email in logs');
});

test('EV-2 secret scan: no hardcoded credentials in app source', () => {
  const SECRET_LIKE = /(api[_-]?key|apikey|secret|passwd)\s*[:=]\s*['"][A-Za-z0-9+/_-]{16,}['"]/i;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { if (name !== 'node_modules' && name !== 'data') walk(p); continue; }
      if (!/\.(js|mjs)$/.test(name)) continue;
      assert.ok(!SECRET_LIKE.test(readFileSync(p, 'utf8')), `secret-like literal found in ${p}`);
    }
  };
  walk(join(import.meta.dirname, '..'));
});

test('EV-3: expired sessions are not accepted', () => {
  const db = openDb(':memory:');
  db.prepare("INSERT INTO users (email, password_hash) VALUES ('x@t.local','h')").run();
  const uid = db.prepare('SELECT id FROM users').get().id;
  createSession(db, sidHash('sid-that-expired'), uid, Date.now() - 1000);
  assert.equal(getSessionUser(db, sidHash('sid-that-expired')), null);
});

test('EV-4: the latest migration has a working DOWN path (rollback plan)', () => {
  const db = openDb(':memory:');
  const tables = () => db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
  assert.ok(tables().includes('transactions'));
  migrateDown(db); // rolls back 002-transactions
  assert.ok(!tables().includes('transactions'), 'DOWN path drops the transactions table');
});
