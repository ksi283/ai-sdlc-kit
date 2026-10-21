// SR-5 — login rate limiting: >= 3 failures / 15 min / IP => 429 for 15 min.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 3;

const hits = new Map(); // ip -> { count, windowStart, blockedUntil }

export function loginFailed(ip, now = Date.now()) {
  const rec = hits.get(ip) ?? { count: 0, windowStart: now, blockedUntil: 0 };
  if (now - rec.windowStart >= WINDOW_MS) {
    rec.count = 0;
    rec.windowStart = now;
  }
  rec.count += 1;
  if (rec.count >= MAX_FAILURES) rec.blockedUntil = now + WINDOW_MS;
  hits.set(ip, rec);
}

export function isBlocked(ip, now = Date.now()) {
  const rec = hits.get(ip);
  return Boolean(rec && rec.blockedUntil > now);
}

export function loginSucceeded(ip) {
  hits.delete(ip);
}

export function resetRateLimiter() {
  hits.clear();
}
