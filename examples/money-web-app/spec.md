# Spec: PocketLedger MVP

| Field | Value |
|---|---|
| **Originating intent** | `INT-202611-007` (link) |
| **Threat model** | [`threat-model.md`](threat-model.md) — REQUIRED (security screen flagged all four) ✅ attached |
| **Status** | ready ✅ (passed DoR after 1 revision) |
| **Spec Reviewer** | Minh Tran |
| **Model guidance** | high-reasoning model, temperature 0.2 |

## 1. Context

New internal web app (greenfield): server-rendered Express app with SQLite, htmx for partial updates (ADR-0007). Two personas from discovery: the employee tracking expenses, and finance reconciling month-end. Data classification: **restricted** (personal financial records).

## 2. Functional requirements

| ID | Requirement | Acceptance criteria (measurable) |
|---|---|---|
| FR-1 | Register / login / logout with email + password | valid credentials → authenticated session (2h expiry); invalid → 401 with generic message (no user enumeration); 3 failed logins/15min from one IP → 429 |
| FR-2 | CRUD transactions (income/expense) with category + note | create/list/edit/delete working on 10k transactions with p95 ≤ 300ms; every read/write scoped to the session owner (authz matrix test below); amounts stored as integer cents |
| FR-3 | Monthly summary: totals per category, net cashflow | matches a computed fixture within ±0 for seeded data; renders for a month with 10k transactions ≤ 500ms |

## 3. Non-functional requirements

| Type | Requirement |
|---|---|
| Performance | p95 page ≤ 300ms @ 50 concurrent users (internal scale) |
| Security | see SR-x table below — derived from the threat model, never generic |
| Observability | request logs WITHOUT amounts/notes (masked); counters per route; failed-login metric |
| Compatibility | evergreen browsers; no IE; additive schema only in MVP |
| Accessibility | WCAG 2.2 AA — forms labeled, full keyboard paths, contrast ≥ 4.5:1 (audited on the 3 core screens) |

### Security requirements (SR-x — from the threat model, docs/en/08-security.md §3)

| ID | Requirement | Verified by |
|---|---|---|
| SR-1 | Passwords hashed with argon2id (never plaintext, never logged) | unit test + secret-scan |
| SR-2 | Sessions: signed cookie, HttpOnly + Secure + SameSite=Lax, 2h expiry, regenerated on login | integration test (cookie flags, rotation) |
| SR-3 | Every transaction read/write scoped by session owner | **authz test matrix: user A × user B × {list, get, edit, delete} — all cross-user = 404** |
| SR-4 | No amounts/notes/emails in logs or error messages | log-audit eval + manual spot check |
| SR-5 | Login rate-limited: ≥ 3 failures/15min/IP → 429 with generic body | integration test + DAST re-scan |
| SR-6 | All user input (category, note) treated as untrusted — escaped on render, validated on input (length ≤ 200) | XSS attempt fixtures in tests |

## 4. Design (HOW — agent proposed, human decided)

- **Architecture:** `src/auth` (session, sensitive path), `src/routes` (transactions, summary), `src/repos` (SQLite, ownership scoping enforced HERE, closest to the query), `views/`
- **Data:** `users(id, email UNIQUE, password_hash, created_at)`, `transactions(id, user_id FK, amount_cents INTEGER, category TEXT, note TEXT, occurred_at DATE)` — additive only
- **API:** server-rendered forms + htmx partials; no public API in MVP
- **Error & edge handling:** all auth failures → generic 401; validation → 400 with field codes; 10k+ rows → paginated 50/page
- **Security:** `src/auth/**` is a sensitive path (CODEOWNERS → Security Lead); threat model §4 drives SR-1…6

## 5. Test strategy

- Unit: repos (scoping!), argon2id hash/verify, validation
- Integration/E2E: FR-1…3 scenarios + **SR-3 authz matrix** + rate-limit test (SR-5)
- Evals: security evals EV-1…3 (see below) + docs-accuracy eval against the user guide
- DAST against staging BEFORE release (gate `security-dast-critical`)

## 6. Task breakdown

| # | Task | Complexity (1–10) | Mode | Notes |
|---|---|:-:|---|---|
| T1 | Auth module (register/login/logout/session) + SR-1/2/5 tests | 7 | **ai-assisted** | sensitive path; Minh leads, Security Lead reviews |
| T2 | Transactions CRUD + SR-3/4/6 tests + pagination | 4 | ai-with-review | [`plan.md`](plan.md) |
| T3 | Monthly summary + dashboard UI (accessible) | 4 | ai-with-review | incl. 10k-row boundary |
| T4 | User guide + in-app help (docs-ship) | 2 | ai-with-review | merges with T1–3 PRs |

## 7. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Auth module written fully autonomously | high | complexity 7 → ai-assisted routing; CODEOWNERS; SR-x tests |
| Amount leakage via logs | medium | SR-4 eval + masked logger reviewed in every PR |

---

### Definition of Ready (DoR) — checked

- [x] Every FR has measurable acceptance criteria
- [x] The intent's non-goals have not been expanded (no bank sync crept in)
- [x] Every task ≤ half a day, has a complexity score and a working mode
- [x] Test strategy stated (unit/integration/evals/DAST)
- [x] Threat model attached & SR-x requirements listed ✅
- [x] User-facing FRs are Usability-Ready: prototype tested with 5 users (discovery) ✅
- [x] Sensitive components (auth/PII) flagged → mandatory human review ✅
- [x] Data migrations have a rollback plan (additive-only; down = DROP)
