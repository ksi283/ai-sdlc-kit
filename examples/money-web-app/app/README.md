# PocketLedger — Reference Implementation (runnable)

The executable counterpart of the [`../spec.md`](../spec.md) walkthrough: a server-rendered
money-tracking web app with authentication, built to verify the spec's FR/SR requirements
against real behavior. This folder is what the AI-SDLC Test stage calls a **gate run** —
see [RUN-REPORT.md](RUN-REPORT.md) for the requirement-by-requirement verdict.

## Stack

Node ≥ 22.13 (built-in `node:sqlite`, zero native modules; developed and tested on Node 24)
· `hash-wasm` (argon2id, pure WASM — the only dependency) · server-rendered HTML.

## Run it

```bash
cd examples/money-web-app/app
npm install          # installs hash-wasm only
npm start            # → http://localhost:3000  (PORT=xxx to change)
```

Open http://localhost:3000 → Register → add transactions → Summary.
The SQLite file lives in `data/pocketledger.db` (auto-created; delete it for a fresh start).

## Run the gate battery (tests)

```bash
npm test             # node --test — 22 tests mapped to FR-1..3 / SR-1..6 / EV-1..4
```

Test layout (each file = one gate lens):

| File | Verifies |
|---|---|
| `tests/auth.test.js` | FR-1 flows · SR-1 argon2id · SR-2 cookie flags/rotation · SR-5 rate limit |
| `tests/transactions.test.js` | FR-2 CRUD/pagination/perf · SR-3 cross-user authz matrix · SR-6 validation + XSS |
| `tests/summary.test.js` | FR-3 exact totals, month scoping, 10k-row perf |
| `tests/security-evals.test.js` | EV-1 log masking · EV-2 secret scan · EV-3 session expiry · EV-4 migration DOWN |

## Project layout

```
server.js              router + context (auth required for /transactions, /summary)
src/db.js              node:sqlite + additive migrations (up AND down)
src/auth.js            argon2id hashing, signed session cookies (SR-1/2)
src/ratelimit.js       login rate limiter (SR-5)
src/logger.js          masked logging (SR-4)
src/validate.js        input validation (SR-6)
src/repos/             users/sessions + transactions — ownership scoping lives here (SR-3)
src/routes/            auth + transaction/summary handlers
src/views/             layout + screens (escaping on render — SR-6)
tests/                 the gate battery
```

## Known deviations from the spec (honest ledger)

1. **htmx omitted** — spec §4 says "htmx partials"; MVP ships plain full-page form posts
   (works without JS). Adding htmx is a cosmetic enhancement, not a behavior gap.
2. **Register reveals a taken email (409)** — FR-1 only mandates generic *login* errors;
   full anti-enumeration at registration needs email verification (out of MVP scope,
   listed as a residual risk in the threat model).
3. **`Secure` cookie over plain HTTP** — matches SR-2 exactly; browsers treat
   `localhost` as a trustworthy origin. On any non-localhost deployment, terminate TLS
   first or login silently fails.
