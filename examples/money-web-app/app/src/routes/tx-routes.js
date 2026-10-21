// Transaction + summary routes — FR-2/FR-3 (+SR-3/6). Every repo call is
// scoped by the session user; cross-user ids return 404 (indistinguishable
// from missing), per the threat model.
import { log } from '../logger.js';
import { parseAmountToCents, validText, validCategory, validMonth, KINDS } from '../validate.js';
import * as txRepo from '../repos/transactions.js';

function parseForm(body) {
  return Object.fromEntries(new URLSearchParams(body).entries());
}

function parseTxPayload(raw) {
  const errors = [];
  const amountCents = parseAmountToCents(String(raw.amount ?? ''));
  if (amountCents == null) errors.push('amount');
  if (!KINDS.includes(raw.kind)) errors.push('kind');
  if (!validCategory(raw.category)) errors.push('category');
  if (!validText(raw.note ?? '')) errors.push('note');
  const occurredAt = String(raw.occurred_at ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredAt)) errors.push('occurred_at');
  return { errors, tx: { kind: raw.kind, amountCents, category: raw.category, note: raw.note ?? '', occurredAt } };
}

export function handleList(ctx) {
  const page = Math.max(1, Number(ctx.query.get('page')) || 1);
  const data = txRepo.listTransactions(ctx.db, ctx.user.id, page);
  return ctx.render(200, 'list', { data });
}

export function handleCreate(ctx) {
  const { errors, tx } = parseTxPayload(parseForm(ctx.body));
  if (errors.length) {
    return ctx.render(400, 'list', {
      data: txRepo.listTransactions(ctx.db, ctx.user.id, 1),
      flash: `Invalid input: ${errors.join(', ')}.`, flashKind: 'error',
    });
  }
  const created = txRepo.createTransaction(ctx.db, ctx.user.id, tx);
  log('tx.created', { uid: ctx.user.id, id: created.id }); // SR-4: no amount/note
  return ctx.redirect('/transactions');
}

export function handleEdit(ctx, id) {
  const { errors, tx } = parseTxPayload(parseForm(ctx.body));
  if (errors.length) return ctx.render(400, 'list', {
    data: txRepo.listTransactions(ctx.db, ctx.user.id, 1),
    flash: `Invalid input: ${errors.join(', ')}.`, flashKind: 'error',
  });
  const updated = txRepo.updateTransaction(ctx.db, ctx.user.id, id, tx);
  if (!updated) return ctx.notFound(); // SR-3: cross-user or missing => 404
  log('tx.updated', { uid: ctx.user.id, id });
  return ctx.redirect('/transactions');
}

export function handleDelete(ctx, id) {
  const ok = txRepo.deleteTransaction(ctx.db, ctx.user.id, id);
  if (!ok) return ctx.notFound(); // SR-3
  log('tx.deleted', { uid: ctx.user.id, id });
  return ctx.redirect('/transactions');
}

export function handleSummary(ctx) {
  const fallback = new Date().toISOString().slice(0, 7);
  const month = ctx.query.get('month') ?? fallback;
  if (!validMonth(month)) {
    return ctx.render(400, 'summary', { summary: { month: fallback, byCategory: [], incomeCents: 0, expenseCents: 0, netCents: 0 }, flash: 'Invalid month.', flashKind: 'error' });
  }
  const summary = txRepo.monthlySummary(ctx.db, ctx.user.id, month);
  return ctx.render(200, 'summary', { summary });
}
