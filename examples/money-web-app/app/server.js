// PocketLedger — server-rendered money tracking. Reference implementation for
// the AI-SDLC kit example (see ../spec.md). Run: npm start → http://localhost:3000
import { createServer } from 'node:http';
import { openDb } from './src/db.js';
import { log } from './src/logger.js';
import { parseCookies, sidHash, COOKIE_NAME } from './src/auth.js';
import { getSessionUser } from './src/repos/users.js';
import { handleRegister, handleLogin, handleLogout } from './src/routes/auth-routes.js';
import { handleList, handleCreate, handleEdit, handleDelete, handleSummary } from './src/routes/tx-routes.js';
import { loginView, registerView } from './src/views/auth-views.js';
import { listView, summaryView } from './src/views/tx-views.js';
import { layout } from './src/views/layout.js';

const PORT = Number(process.env.PORT) || 3000;
const db = openDb(process.env.DB_PATH || 'data/pocketledger.db');

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 64 * 1024) req.destroy();
    });
    req.on('end', () => resolve(data));
  });
}

function makeCtx(req, res, url, body) {
  const cookies = parseCookies(req.headers.cookie);
  const user = cookies[COOKIE_NAME] ? getSessionUser(db, sidHash(cookies[COOKIE_NAME])) : null;
  return {
    req, res, url, body, cookies, user,
    db,
    query: url.searchParams,
    ip: req.socket.remoteAddress || 'unknown',
    redirect(to) {
      res.writeHead(302, { Location: to });
      res.end();
    },
    notFound() {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(layout({ title: 'Not found', user: null, body: '<h1>404 — not found</h1>' }));
    },
    render(status, view, extra = {}) {
      const views = { login: loginView, register: registerView, list: listView, summary: summaryView };
      const body = views[view](extra);
      res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(layout({ title: view, user, flash: extra.flash, flashKind: extra.flashKind, body }));
    },
  };
}

const routes = [
  ['GET', /^\/$/, (c) => c.redirect(c.user ? '/transactions' : '/login')],
  ['GET', /^\/login$/, (c) => c.render(200, 'login')],
  ['GET', /^\/register$/, (c) => c.render(200, 'register')],
  ['POST', /^\/login$/, handleLogin],
  ['POST', /^\/register$/, handleRegister],
  ['POST', /^\/logout$/, handleLogout],
  ['GET', /^\/transactions$/, handleList],
  ['POST', /^\/transactions$/, handleCreate],
  ['POST', /^\/transactions\/(\d+)\/edit$/, handleEdit],
  ['POST', /^\/transactions\/(\d+)\/delete$/, handleDelete],
  ['GET', /^\/summary$/, handleSummary],
];

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const body = req.method === 'POST' ? await readBody(req) : '';
  const ctx = makeCtx(req, res, url, body);
  try {
    for (const [method, pattern, handler] of routes) {
      if (req.method !== method) continue;
      const m = url.pathname.match(pattern);
      if (!m) continue;
      const requiresAuth = url.pathname === '/transactions'
        || url.pathname === '/summary' || url.pathname.startsWith('/transactions/');
      if (requiresAuth && !ctx.user) {
        log('auth.required', { path: url.pathname });
        return ctx.redirect('/login');
      }
      const id = m[1] ? Number(m[1]) : undefined;
      return id !== undefined ? handler(ctx, id) : handler(ctx);
    }
    ctx.notFound();
  } catch (err) {
    log('request.error', { path: url.pathname }); // SR-4: no body content
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(layout({ title: 'Error', user: ctx.user, body: '<h1>Something went wrong</h1>' }));
  }
});

if (process.env.VIA_CLI !== '1') {
  server.listen(PORT, () => console.log(`PocketLedger running → http://localhost:${PORT}`));
}

export { server, db };
