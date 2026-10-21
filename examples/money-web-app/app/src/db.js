// PocketLedger — SQLite via node:sqlite (built-in). Additive migrations only,
// each with a DOWN path (spec §4 / plan.md).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const MIGRATIONS = [
  {
    id: 1,
    name: '001-users-and-sessions',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sessions (
        sid_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      );`,
    down: 'DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS users;',
  },
  {
    id: 2,
    name: '002-transactions',
    up: `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        category TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        occurred_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, occurred_at);`,
    down: 'DROP TABLE IF EXISTS idx_tx_user_date; DROP TABLE IF EXISTS transactions;',
  },
];

export function openDb(path = 'data/pocketledger.db') {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL);');
  const applied = new Set(db.prepare('SELECT id FROM schema_migrations').all().map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    db.exec(m.up);
    db.prepare('INSERT INTO schema_migrations (id, name) VALUES (?, ?)').run(m.id, m.name);
  }
  return db;
}

// For tests: roll back the latest migration (verification of the DOWN paths).
export function migrateDown(db) {
  const row = db.prepare('SELECT id, name FROM schema_migrations ORDER BY id DESC LIMIT 1').get();
  if (!row) return null;
  const m = MIGRATIONS.find((x) => x.id === row.id);
  db.exec(m.down);
  db.prepare('DELETE FROM schema_migrations WHERE id = ?').run(m.id);
  return row.name;
}
