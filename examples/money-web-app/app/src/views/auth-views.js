import { esc } from './layout.js';

export function loginView({ error } = {}) {
  return `
  <h1>Log in</h1>
  <form class="card" method="post" action="/login">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    <button type="submit">Log in</button>
  </form>
  <p class="muted">No account? <a href="/register">Register</a>. ${error ? esc('') : ''}</p>`;
}

export function registerView() {
  return `
  <h1>Register</h1>
  <form class="card" method="post" action="/register">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
    <label for="password">Password (min 10 characters)</label>
    <input id="password" name="password" type="password" autocomplete="new-password" minlength="10" required>
    <button type="submit">Create account</button>
  </form>
  <p class="muted">Already registered? <a href="/login">Log in</a>.</p>`;
}
