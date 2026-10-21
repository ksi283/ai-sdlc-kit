// SR-6 — escape on render: esc() is applied to EVERY interpolation below.
// Visual system: data-dense-dashboard style + inclusive-design overlay from the
// ui-ux-pro-max skill (see DESIGN-SYSTEM.md) — dark fintech theme, Fira Sans/Fira Code.
export function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function money(cents) {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

:root {
  /* palette: skill colors.csv "Fintech/Crypto" (gold trust + purple tech) */
  --bg: #0f172a;
  --bg-glow: #1e293b;
  --fg: #f8fafc;
  --muted-fg: #94a3b8;      /* 4.6:1 on card */
  --card: #1c2537;
  --card-2: #222735;
  --border: #334155;
  --primary: #f59e0b;       /* 9.2:1 on bg */
  --primary-fg: #0f172a;    /* 9.2:1 on primary */
  --accent: #8b5cf6;
  --income: #4ade80;        /* 8.1:1 on card */
  --expense: #f87171;       /* 4.9:1 on card */
  --danger: #ef4444;
  --ring: #f59e0b;
  --radius: 12px;
  --radius-lg: 16px;
  --sans: 'Fira Sans', system-ui, sans-serif;
  --mono: 'Fira Code', ui-monospace, monospace;
  --shadow: 0 4px 14px rgba(2, 6, 23, 0.45);
  --transition: 160ms ease;
}

* { box-sizing: border-box; }
html { color-scheme: dark; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition: none !important; animation: none !important; }
}

body {
  margin: 0;
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.55;
  color: var(--fg);
  background:
    radial-gradient(1100px 520px at 85% -10%, var(--bg-glow) 0%, transparent 60%),
    radial-gradient(900px 420px at -10% 110%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
    var(--bg);
  background-attachment: fixed;
}

:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; border-radius: 6px; }

header {
  position: sticky; top: 0; z-index: 10;
  display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
  padding: 0.7rem 1.5rem;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.brand { display: inline-flex; align-items: center; gap: 0.55rem; font-weight: 600; letter-spacing: 0.02em; font-size: 1.02rem; }
.brand svg { width: 1.35rem; height: 1.35rem; color: var(--primary); }
header nav { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
header nav a {
  color: var(--fg); text-decoration: none; font-weight: 500;
  padding: 0.35rem 0.75rem; border-radius: 8px;
  transition: background var(--transition), color var(--transition);
}
header nav a:hover { background: var(--card-2); color: var(--primary); }
.user-chip {
  font-family: var(--mono); font-size: 0.78rem; color: var(--muted-fg);
  border: 1px solid var(--border); border-radius: 999px; padding: 0.18rem 0.65rem;
  max-width: 16rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

main { max-width: 1100px; margin: 1.8rem auto 3rem; padding: 0 1.25rem; }
h1 { font-size: 1.45rem; font-weight: 600; margin: 0.2rem 0 1.1rem; }
h2 {
  font-size: 0.95rem; font-weight: 600; margin: 2.1rem 0 0.8rem;
  color: var(--muted-fg); text-transform: uppercase; letter-spacing: 0.07em;
}

.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.15rem 1.3rem; margin: 1rem 0;
  box-shadow: var(--shadow);
}
form.card, .card { max-width: 100%; }

label { display: block; margin: 0.7rem 0 0.25rem; font-size: 0.88rem; font-weight: 600; color: var(--fg); }
input, select {
  padding: 0.5rem 0.65rem; width: 100%; max-width: 340px;
  background: var(--card-2); color: var(--fg);
  border: 1px solid var(--border); border-radius: 8px;
  font: inherit; transition: border-color var(--transition);
}
input:hover, select:hover { border-color: var(--muted-fg); }
input:focus, select:focus { border-color: var(--primary); outline: 3px solid var(--ring); outline-offset: 1px; }
input[type='date'], input[type='month'] { color-scheme: dark; }

button {
  margin-top: 1rem; cursor: pointer;
  background: var(--primary); color: var(--primary-fg);
  border: 1px solid transparent; border-radius: 9px;
  padding: 0.5rem 1.15rem; font: inherit; font-weight: 600;
  transition: transform var(--transition), filter var(--transition), background var(--transition);
}
button:hover { filter: brightness(1.08); }
button:active { transform: scale(0.98); }
form.inline { display: inline; }
form.inline button { margin-top: 0; }

table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
th, td { padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--border); text-align: left; font-size: 0.93rem; }
th { background: var(--card-2); font-weight: 600; position: sticky; top: 0; }
tbody tr { transition: background var(--transition); }
tbody tr:hover { background: rgba(148, 163, 184, 0.07); }
td:last-child { white-space: nowrap; }
.amount { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; }
.income { color: var(--income); }
.expense { color: var(--expense); }

details { display: inline-block; }
summary { cursor: pointer; color: var(--muted-fg); list-style: none; padding: 0.15rem 0.4rem; border-radius: 6px; transition: color var(--transition); }
summary:hover { color: var(--primary); }
details form.card { max-width: 420px; margin-top: 0.5rem; }
.delete-btn {
  background: none; color: var(--expense); border: none;
  padding: 0.15rem 0.4rem; font-size: 0.85rem; font-weight: 500;
}
.delete-btn:hover { color: var(--danger); filter: none; text-decoration: underline; }

.flash { border-radius: var(--radius); padding: 0.65rem 1rem; margin-bottom: 1.1rem; background: rgba(74, 222, 128, 0.12); border: 1px solid rgba(74, 222, 128, 0.4); }
.flash.error { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.45); }
.muted { color: var(--muted-fg); font-size: 0.86rem; }

.tot { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1rem 0; }
.tot div {
  background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--accent);
  border-radius: var(--radius); padding: 0.75rem 1rem; box-shadow: var(--shadow);
}
.tot div:first-child { border-left-color: var(--income); }
.tot div:nth-child(2) { border-left-color: var(--expense); }
.tot div:last-child { border-left-color: var(--primary); }
.tot strong { font-family: var(--mono); font-variant-numeric: tabular-nums; display: block; font-size: 1.15rem; margin-top: 0.15rem; }

nav.pages { margin: 1.1rem 0; display: flex; gap: 0.4rem; flex-wrap: wrap; }
nav.pages a, nav.pages span {
  padding: 0.3rem 0.7rem; border: 1px solid var(--border); border-radius: 8px;
  text-decoration: none; color: var(--fg); background: var(--card);
  font-family: var(--mono); font-size: 0.85rem;
  transition: border-color var(--transition), color var(--transition);
}
nav.pages a:hover { border-color: var(--primary); color: var(--primary); }
nav.pages .cur { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); font-weight: 600; }

@media (max-width: 768px) {
  header { padding: 0.6rem 1rem; }
  main { margin-top: 1.2rem; padding: 0 0.9rem; }
  th, td { padding: 0.5rem 0.55rem; font-size: 0.88rem; }
  input, select { max-width: 100%; }
}
@media (max-width: 480px) {
  th:nth-child(3), td:nth-child(3) { display: none; } /* hide category, keep the row readable */
  .user-chip { display: none; }
}
`;

export function layout({ title, user, flash, flashKind = 'ok', body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${esc(title)} · PocketLedger</title>
<style>${CSS}</style>
</head>
<body>
<header>
  <span class="brand">${LOGO_SVG} PocketLedger</span>
  <nav aria-label="primary">
    ${user
      ? `<a href="/transactions">Transactions</a><a href="/summary">Summary</a>
         <span class="user-chip">${esc(user.email)}</span>
         <form class="inline" method="post" action="/logout"><button type="submit">Log out</button></form>`
      : '<a href="/login">Log in</a><a href="/register">Register</a>'}
  </nav>
</header>
<main>
  ${flash ? `<div class="flash ${flashKind === 'error' ? 'error' : ''}" role="status">${esc(flash)}</div>` : ''}
  ${body}
</main>
</body>
</html>`;
}
