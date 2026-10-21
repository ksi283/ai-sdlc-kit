// SR-3 — ownership scoping enforced HERE, closest to the SQL: every statement
// filters by user_id. Cross-user ids simply do not match (routes return 404).
const PAGE_SIZE = 50; // FR-2

export function createTransaction(db, uid, tx) {
  const r = db.prepare(`
    INSERT INTO transactions (user_id, kind, amount_cents, category, note, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uid, tx.kind, tx.amountCents, tx.category, tx.note, tx.occurredAt);
  return getTransaction(db, uid, Number(r.lastInsertRowid));
}

export function getTransaction(db, uid, id) {
  return db.prepare(
    'SELECT id, kind, amount_cents, category, note, occurred_at FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, uid) ?? null;
}

export function updateTransaction(db, uid, id, patch) {
  const cur = getTransaction(db, uid, id);
  if (!cur) return null;
  // Payload keys are camelCase; row keys are snake_case — map explicitly.
  const next = {
    kind: patch.kind ?? cur.kind,
    amountCents: patch.amountCents ?? cur.amount_cents,
    category: patch.category ?? cur.category,
    note: patch.note ?? cur.note,
    occurredAt: patch.occurredAt ?? cur.occurred_at,
  };
  db.prepare(`
    UPDATE transactions SET kind = ?, amount_cents = ?, category = ?, note = ?, occurred_at = ?
    WHERE id = ? AND user_id = ?`)
    .run(next.kind, next.amountCents, next.category, next.note, next.occurredAt, id, uid);
  return getTransaction(db, uid, id);
}

export function deleteTransaction(db, uid, id) {
  const r = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, uid);
  return r.changes > 0;
}

export function countTransactions(db, uid) {
  return db.prepare('SELECT COUNT(*) AS n FROM transactions WHERE user_id = ?').get(uid).n;
}

export function listTransactions(db, uid, page = 1) {
  const total = countTransactions(db, uid);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  const rows = db.prepare(`
    SELECT id, kind, amount_cents, category, note, occurred_at
    FROM transactions WHERE user_id = ?
    ORDER BY occurred_at DESC, id DESC
    LIMIT ? OFFSET ?`)
    .all(uid, PAGE_SIZE, (p - 1) * PAGE_SIZE);
  return { rows, page: p, pages, total };
}

// FR-3 — monthly summary: per-category totals + net, computed in SQL.
export function monthlySummary(db, uid, month /* 'YYYY-MM' */) {
  const like = `${month}-%`;
  const byCategory = db.prepare(`
    SELECT kind, category, SUM(amount_cents) AS total
    FROM transactions
    WHERE user_id = ? AND occurred_at LIKE ?
    GROUP BY kind, category
    ORDER BY total DESC`).all(uid, like);
  let income = 0;
  let expense = 0;
  for (const r of byCategory) {
    if (r.kind === 'income') income += r.total;
    else expense += r.total;
  }
  return { month, byCategory, incomeCents: income, expenseCents: expense, netCents: income - expense };
}
