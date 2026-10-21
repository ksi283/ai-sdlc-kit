// Users + sessions persistence.
export function createUser(db, { email, passwordHash }) {
  try {
    const r = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
    return { id: Number(r.lastInsertRowid), email };
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return { error: 'email_taken' };
    throw e;
  }
}

export function getUserByEmail(db, email) {
  return db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) ?? null;
}

export function createSession(db, sidHashValue, userId, expiresAt) {
  db.prepare('INSERT INTO sessions (sid_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sidHashValue, userId, expiresAt);
}

export function getSessionUser(db, sidHashValue, now = Date.now()) {
  const row = db.prepare(`
    SELECT u.id, u.email FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.sid_hash = ? AND s.expires_at > ?`).get(sidHashValue, now);
  return row ?? null;
}

export function deleteSession(db, sidHashValue) {
  db.prepare('DELETE FROM sessions WHERE sid_hash = ?').run(sidHashValue);
}

export function purgeExpiredSessions(db, now = Date.now()) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
}
