# RUN-REPORT — PocketLedger gate run (2026-10-22)

> One execution of the Test-stage gate battery against the runnable app, mapped
> requirement by requirement to [`../spec.md`](../spec.md). Environment: Node 24.19,
> Windows, in-memory DB, ephemeral server per test file. Command: `npm test` → `node --test`.

**Verdict: 22/22 tests PASS (2.73s). All 3 functional requirements and all 6 security
requirements verified against running behavior — plus 4 security evals and 2 perf budgets.**

## Functional requirements

| Req | Acceptance criterion (spec) | Test that verifies it | Result |
|---|---|---|---|
| FR-1 | valid credentials → session (2h); invalid → generic 401; no enumeration | `auth.test.js`: login flow · generic-401 (unknown email ≡ wrong password, byte-identical body) | ✅ PASS |
| FR-1 | 3 failed logins/15min/IP → 429 | `auth.test.js`: 3×401 then **429 even with the correct password** | ✅ PASS |
| FR-2 | CRUD on 10k transactions, p95 ≤ 300ms | `transactions.test.js`: 10k-row seed → 20 requests, **p95 ≪ 300ms**; CRUD happy paths | ✅ PASS |
| FR-2 | every read/write scoped to session owner | `transactions.test.js`: **authz matrix A×B — cross-user edit/delete → 404, B's list shows no A data** | ✅ PASS |
| FR-2 | amounts stored as integer cents | `db.js` schema (`amount_cents INTEGER`) + CRUD tests assert rendering from cents | ✅ PASS |
| FR-3 | summary matches computed fixture ±0 | `summary.test.js`: income 3,500.00 / expenses 65.00 / net 3,435.00 exact; other-month tx excluded | ✅ PASS |
| FR-3 | renders ≤ 500ms @ 10k rows | `summary.test.js`: 10k rows → **23ms** | ✅ PASS |

## Security requirements

| Req | Requirement | Test that verifies it | Result |
|---|---|---|---|
| SR-1 | argon2id, plaintext never stored/logged | hash matches `$argon2id$` PHC format; wrong password rejected; plaintext absent from hash | ✅ PASS |
| SR-2 | signed cookie: HttpOnly + Secure + SameSite=Lax, 2h, rotate on login | cookie flag assertions + **sid differs between two logins** (server-generated random) | ✅ PASS |
| SR-3 | ownership scoping (repo layer) | the A×B matrix above + `repos/transactions.js` scoping in every SQL statement | ✅ PASS |
| SR-4 | no amounts/notes/emails in logs | `security-evals.test.js` EV-1: after register+create, log ring contains none of email/amount/note | ✅ PASS |
| SR-5 | login rate limiting, generic bodies | 429 after 3 failures; 429 body distinct from 401 (no info leak) | ✅ PASS |
| SR-6 | untrusted input: validate on input, escape on render | validation 400s (negative/3-decimal/oversized/bad category) + **`<script>` note renders as `&lt;script&gt;`** | ✅ PASS |

## Security evals & supply chain

| Eval | Check | Result |
|---|---|---|
| EV-1 | Log masking (SR-4) over a live request cycle | ✅ PASS |
| EV-2 | Secret scan of app source (hardcoded credentials) | ✅ PASS — 0 findings |
| EV-3 | Expired sessions rejected | ✅ PASS |
| EV-4 | Latest migration has a working DOWN path (rollback plan) | ✅ PASS |

## Live smoke test (server on :3210, curl)

Unauthenticated `/` → 302 `/login` · register → Set-Cookie carries all 4 flags ·
create expense 12.34 + income 3,000 → list renders both · summary 2026-10 → net
**2,987.66** exact · wrong password → 401 · XSS note stored and rendered escaped. ✅

## What the gate run caught (and fixed) — the point of the exercise

1. **argon2 output format bug** — the hash library returned raw hex, not the PHC-encoded
   string; `argon2Verify` rejected it and wedged subsequent logins. Fixed with
   `outputType: 'encoded'` + a defensive try/catch in `verifyPassword`.
2. **Real data bug in `updateTransaction`** — camelCase payload keys were spread over
   snake_case row keys, so **amount silently didn't update** (note did). Caught by the
   `FR-2 edit` assertion, fixed with explicit key mapping.
3. **Auth-coverage check bug** — the router's `requiresAuth` test compared against a
   regex source string and never matched; replaced with a pathname check. (Caught during
   test bring-up, before any green run.)

This is the layered-verification argument from `docs/en/02-framework.md` §Stage 4 in
miniature: functional tests, security evals and a live smoke test each caught a distinct
class of defect that the others would have waved through.

## Not covered by this run (honest boundary)

- Real DAST/pen-test (the `security-dast-critical` gate) — runs against staging in CI,
  not reproducible in this local run.
- Accessibility (WCAG AA) — spec requires audit on the 3 core screens; not automatable here,
  flagged for manual audit.
- Usability testing with real users (Usability-Ready was satisfied in discovery, pre-code).
