// Auth routes — FR-1 (+SR-1/2/5). All auth failures return a GENERIC message
// (no user enumeration). Login is rate-limited per IP.
import { log } from '../logger.js';
import {
  hashPassword, verifyPassword, newSessionId, sidHash, sessionCookie, clearCookie, SESSION_TTL,
} from '../auth.js';
import { validEmail, validPassword } from '../validate.js';
import { createUser, getUserByEmail, createSession, deleteSession } from '../repos/users.js';
import { loginFailed, isBlocked, loginSucceeded } from '../ratelimit.js';

const GENERIC_LOGIN_ERROR = 'Invalid email or password.';

function parseForm(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

export async function handleRegister(ctx) {
  const { email, password } = parseForm(ctx.body);
  if (!validEmail(email) || !validPassword(password)) {
    return ctx.render(400, 'register', { flash: 'Invalid email or password too short (min 10 chars).', flashKind: 'error' });
  }
  const user = await createUser(ctx.db, { email: email.toLowerCase(), passwordHash: await hashPassword(password) });
  if (user.error === 'email_taken') {
    return ctx.render(409, 'register', { flash: 'That email cannot be registered. Try logging in.', flashKind: 'error' });
  }
  log('user.registered', { uid: user.id });
  return startSession(ctx, user.id, '/transactions');
}

export async function handleLogin(ctx) {
  if (isBlocked(ctx.ip)) {
    log('login.blocked', { ip: ctx.ip });
    return ctx.render(429, 'login', { flash: 'Too many attempts. Try again later.', flashKind: 'error' });
  }
  const { email, password } = parseForm(ctx.body);
  const user = validEmail(email) ? getUserByEmail(ctx.db, String(email).toLowerCase()) : null;
  const ok = user ? await verifyPassword(user.password_hash, String(password ?? '')) : false;

  if (!ok) {
    loginFailed(ctx.ip);
    log('login.failed', { ip: ctx.ip }); // SR-4: no email, no password material
    return ctx.render(401, 'login', { flash: GENERIC_LOGIN_ERROR, flashKind: 'error' });
  }

  loginSucceeded(ctx.ip);
  log('login.ok', { uid: user.id });
  return startSession(ctx, user.id, '/transactions');
}

function startSession(ctx, uid, redirectTo) {
  const sid = newSessionId(); // server-generated random — fixation impossible
  createSession(ctx.db, sidHash(sid), uid, Date.now() + SESSION_TTL);
  ctx.res.setHeader('Set-Cookie', sessionCookie(sid));
  return ctx.redirect(redirectTo);
}

export function handleLogout(ctx) {
  const sid = ctx.cookies.pl_sess;
  if (sid) deleteSession(ctx.db, sidHash(sid));
  ctx.res.setHeader('Set-Cookie', clearCookie());
  log('user.logout', { uid: ctx.user?.id });
  return ctx.redirect('/login');
}
