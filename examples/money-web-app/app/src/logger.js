// SR-4 — masked logging: request logs never contain amounts, notes or emails.
// A ring buffer lets the log-audit eval assert over recent lines.
const RING = [];
const RING_MAX = 500;

const SENSITIVE_KEYS = /amount|note|password|email|token|secret/i;

export function mask(value) {
  if (value == null) return value;
  return String(value).replace(/\d+(\.\d+)?/g, (m) => (m.length >= 3 ? '[amt]' : m));
}

export function log(event, fields = {}) {
  const safe = {};
  for (const [k, v] of Object.entries(fields)) {
    safe[k] = SENSITIVE_KEYS.test(k) ? '[masked]' : (typeof v === 'string' ? mask(v) : v);
  }
  const line = `${new Date().toISOString()} ${event} ${JSON.stringify(safe)}`;
  RING.push(line);
  if (RING.length > RING_MAX) RING.shift();
  if (process.env.QUIET !== '1') console.log(line);
}

export function recentLogs() {
  return [...RING];
}

export function resetLogs() {
  RING.length = 0;
}
