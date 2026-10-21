// Test helpers — boot the real server on an ephemeral port with an in-memory DB.
// VIA_CLI stops server.js from listening on its own.
export async function boot() {
  process.env.VIA_CLI = '1';
  process.env.DB_PATH ??= ':memory:';
  const { server } = await import('../server.js');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

// Minimal cookie-jar HTTP client (follows nothing — assertions see raw status).
export class Client {
  constructor(base) {
    this.base = base;
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  get(path) { return this.req('GET', path); }

  post(path, form) {
    return this.req('POST', path, new URLSearchParams(form).toString());
  }

  async req(method, path, body) {
    const res = await fetch(this.base + path, {
      method,
      body,
      headers: {
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        ...(this.cookieHeader() ? { cookie: this.cookieHeader() } : {}),
      },
      redirect: 'manual',
    });
    const setCookie = res.headers.getSetCookie?.() ?? [];
    for (const c of setCookie) {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      const k = pair.slice(0, i).trim();
      const v = pair.slice(i + 1).trim();
      if (v === '') this.cookies.delete(k);
      else this.cookies.set(k, v);
    }
    return { status: res.status, headers: res.headers, setCookie, text: await res.text() };
  }
}

export async function registerAndLogin(base, email, password = 'correct-horse-battery') {
  const client = new Client(base);
  await client.post('/register', { email, password });
  return client;
}

export function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

// node:sqlite has no db.transaction() helper — wrap bulk inserts in BEGIN/COMMIT.
export function bulk(db, fn, n) {
  db.exec('BEGIN');
  try {
    for (let i = 0; i < n; i++) fn();
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
