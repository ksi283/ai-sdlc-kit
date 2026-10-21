// SR-6 — user input is untrusted: validate on input (bounds), escape on render (views).
export const MAX_TEXT = 200;
export const CATEGORIES = ['food', 'transport', 'bills', 'salary', 'health', 'fun', 'other'];
export const KINDS = ['income', 'expense'];

export function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{1,10}$/.test(email);
}

export function validPassword(pw) {
  return typeof pw === 'string' && pw.length >= 10 && pw.length <= 200;
}

export function validText(text) {
  return typeof text === 'string' && text.length <= MAX_TEXT;
}

export function validCategory(c) {
  return CATEGORIES.includes(c);
}

// "12.34" or "12" -> 1234 cents; reject negatives, > 2 decimals, absurd amounts.
export function parseAmountToCents(raw) {
  if (typeof raw !== 'string' || !/^\d{1,9}(\.\d{1,2})?$/.test(raw.trim())) return null;
  const [whole, frac = ''] = raw.trim().split('.');
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, '0') || '0');
  return cents > 0 && cents <= 1e11 ? cents : null;
}

export function validMonth(month) {
  return typeof month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}
