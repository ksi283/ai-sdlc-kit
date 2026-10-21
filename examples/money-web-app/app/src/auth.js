// SR-1 — argon2id via hash-wasm (pure WASM, no native build).
// SR-2 — server-side sessions: random sid (never client-supplied — prevents
// fixation), stored hashed, 2h expiry, signed HttpOnly+Secure+SameSite=Lax
// cookie, new sid on every login (rotation).
import { argon2id, argon2Verify } from 'hash-wasm';
import { createHash, randomBytes } from 'node:crypto';

const ARGON_PARAMS = {
  parallelism: 1, iterations: 2, memorySize: 19456, hashLength: 32,
  outputType: 'encoded', // PHC string ($argon2id$v=19$...) — required by argon2Verify
}; // OWASP
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h
export const SESSION_TTL = SESSION_TTL_MS;
export const COOKIE_NAME = 'pl_sess';

export async function hashPassword(password) {
  const salt = randomBytes(16);
  return argon2id({ password, salt, ...ARGON_PARAMS });
}

export async function verifyPassword(hash, password) {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    // A malformed/unreadable stored hash must never crash or wedge login —
    // it simply fails (defense in depth; rate limiting still applies upstream).
    return false;
  }
}

export function newSessionId() {
  return randomBytes(32).toString('base64url');
}

export function sidHash(sid) {
  return createHash('sha256').update(sid).digest('base64url');
}

export function sessionCookie(sid) {
  const parts = [
    `${COOKIE_NAME}=${sid}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  return parts.join('; ');
}

export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const raw = part.slice(idx + 1).trim();
      let v = raw;
      try { v = decodeURIComponent(raw); } catch { /* malformed cookie — keep raw */ }
      out[k] = v;
    }
  }
  return out;
}
