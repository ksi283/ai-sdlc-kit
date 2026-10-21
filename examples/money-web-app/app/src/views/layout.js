// SR-6 — escape on render: esc() is applied to EVERY interpolation below.
export function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function money(cents) {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CSS = `
  :root { color-scheme: light; }
  body { font-family: system-ui, sans-serif; margin: 0; background: #f6f7f9; color: #1c2430; }
  header { background: #14324f; color: #fff; padding: 0.8rem 1.4rem; display: flex; justify-content: space-between; align-items: center; }
  header a { color: #cfe3ff; margin-left: 1rem; text-decoration: none; }
  main { max-width: 760px; margin: 1.5rem auto; padding: 0 1rem; }
  h1 { font-size: 1.25rem; } h2 { font-size: 1.05rem; margin-top: 1.6rem; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dde3ea; }
  th, td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #edf1f5; text-align: left; font-size: 0.92rem; }
  th { background: #eef2f7; }
  .income { color: #0a7d33; } .expense { color: #b3261e; }
  form.inline { display: inline; }
  form.card, .card { background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 1rem 1.2rem; margin: 1rem 0; }
  label { display: block; margin: 0.6rem 0 0.2rem; font-size: 0.88rem; font-weight: 600; }
  input, select { padding: 0.45rem; width: 100%; max-width: 320px; border: 1px solid #b9c3cf; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; }
  button { margin-top: 0.9rem; background: #14324f; color: #fff; border: 0; padding: 0.55rem 1.1rem; border-radius: 6px; font-size: 0.95rem; cursor: pointer; }
  button:hover { background: #1d466e; }
  .flash { background: #e8f4ea; border: 1px solid #b7dfc0; padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 1rem; }
  .flash.error { background: #fbeae9; border-color: #efc4c1; }
  .muted { color: #5a6a7a; font-size: 0.85rem; }
  .tot { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 0.8rem 0; }
  .tot div { background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 0.6rem 1rem; }
  nav.pages { margin: 1rem 0; display: flex; gap: 0.4rem; }
  nav.pages a, nav.pages span { padding: 0.25rem 0.6rem; border: 1px solid #c9d3de; border-radius: 6px; text-decoration: none; color: #14324f; background: #fff; }
  nav.pages .cur { background: #14324f; color: #fff; }
`;

export function layout({ title, user, flash, flashKind = 'ok', body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · PocketLedger</title>
<style>${CSS}</style>
</head>
<body>
<header>
  <strong>💸 PocketLedger</strong>
  <nav>
    ${user
      ? `<a href="/transactions">Transactions</a><a href="/summary">Summary</a>
         <span class="muted" style="color:#9fb8d4">${esc(user.email)}</span>
         <form class="inline" method="post" action="/logout"><button style="margin:0;padding:0.2rem 0.7rem">Log out</button></form>`
      : '<a href="/login">Log in</a> · <a href="/register">Register</a>'}
  </nav>
</header>
<main>
  ${flash ? `<div class="flash ${flashKind === 'error' ? 'error' : ''}" role="status">${esc(flash)}</div>` : ''}
  ${body}
</main>
</body>
</html>`;
}
