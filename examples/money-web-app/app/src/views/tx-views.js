import { esc, money } from './layout.js';
import { CATEGORIES, KINDS, MAX_TEXT } from '../validate.js';

function txForm(tx = {}, action = '/transactions', buttonLabel = 'Add') {
  const kindOpts = KINDS.map((k) => `<option value="${k}" ${tx.kind === k ? 'selected' : ''}>${k}</option>`).join('');
  const catOpts = CATEGORIES.map((c) => `<option value="${c}" ${tx.category === c ? 'selected' : ''}>${c}</option>`).join('');
  const amt = tx.amount_cents != null ? (tx.amount_cents / 100).toFixed(2) : '';
  return `
  <form class="card" method="post" action="${esc(action)}">
    <label for="kind">Type</label>
    <select id="kind" name="kind">${kindOpts}</select>
    <label for="amount">Amount (e.g. 12.34)</label>
    <input id="amount" name="amount" inputmode="decimal" value="${esc(amt)}" required>
    <label for="category">Category</label>
    <select id="category" name="category">${catOpts}</select>
    <label for="note">Note (max ${MAX_TEXT} chars)</label>
    <input id="note" name="note" maxlength="${MAX_TEXT}" value="${esc(tx.note ?? '')}">
    <label for="occurred_at">Date</label>
    <input id="occurred_at" name="occurred_at" type="date" value="${esc(tx.occurred_at ?? '')}" required>
    <button type="submit">${esc(buttonLabel)}</button>
  </form>`;
}

export function listView({ data, page }) {
  const rows = data.rows.map((t) => `
    <tr>
      <td>${esc(t.occurred_at)}</td>
      <td class="${esc(t.kind)}">${esc(t.kind)}</td>
      <td>${esc(t.category)}</td>
      <td>${esc(t.note)}</td>
      <td style="text-align:right" class="${esc(t.kind)}">${money(t.amount_cents)}</td>
      <td>
        <details><summary class="muted" style="cursor:pointer">edit</summary>${txForm(t, `/transactions/${t.id}/edit`, 'Save')}</details>
        <form class="inline" method="post" action="/transactions/${t.id}/delete"
              onsubmit="return confirm('Delete this transaction?')">
          <button class="muted" style="background:none;color:#b3261e;padding:0.1rem 0.3rem">delete</button>
        </form>
      </td>
    </tr>`).join('');

  const pages = [];
  for (let p = 1; p <= data.pages; p++) {
    pages.push(p === data.page ? `<span class="cur">${p}</span>` : `<a href="/transactions?page=${p}">${p}</a>`);
  }

  return `
  <h1>Transactions</h1>
  ${txForm({ occurred_at: new Date().toISOString().slice(0, 10) })}
  <h2>History <span class="muted">(${data.total} total, page ${data.page}/${data.pages})</span></h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th style="text-align:right">Amount</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted">No transactions yet — add your first above.</td></tr>'}</tbody>
  </table>
  <nav class="pages" aria-label="pages">${pages.join('')}</nav>`;
}

export function summaryView({ summary }) {
  const rows = summary.byCategory.map((r) => `
    <tr><td>${esc(r.category)}</td><td class="${esc(r.kind)}">${esc(r.kind)}</td>
    <td style="text-align:right">${money(r.total)}</td></tr>`).join('');
  return `
  <h1>Summary — ${esc(summary.month)}</h1>
  <form class="card" method="get" action="/summary">
    <label for="month">Month</label>
    <input id="month" name="month" type="month" value="${esc(summary.month)}">
    <button type="submit">Show</button>
  </form>
  <div class="tot">
    <div>Income <strong class="income">${money(summary.incomeCents)}</strong></div>
    <div>Expense <strong class="expense">${money(summary.expenseCents)}</strong></div>
    <div>Net <strong>${money(summary.netCents)}</strong></div>
  </div>
  <table>
    <thead><tr><th>Category</th><th>Type</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" class="muted">Nothing recorded this month.</td></tr>'}</tbody>
  </table>`;
}
