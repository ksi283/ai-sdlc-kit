# Threat Model: PocketLedger MVP

| Field | Value |
|---|---|
| **Spec / intent** | spec.md · `INT-202611-007` |
| **Date / version** | 2026-10-22 · v1 |
| **Facilitator** | Minh Tran · **Participants**: Lan Nguyen, Security Lead, builder-claude (draft) |
| **Data classification** | **restricted** — personal financial records |
| **Review trigger** | any change to auth, session handling, data model, or agent tooling |

## 1. Scope & assets in play

MVP scope: register/login, transaction CRUD, monthly summary. Assets:

- Asset: **password credentials** — impact: account takeover, credential stuffing across other systems (password reuse)
- Asset: **personal transaction history (amounts, notes, categories)** — impact: privacy breach of financial behavior (restricted classification), reputational/regulatory
- Asset: **session tokens** — impact: hijack = full account access without password
- Asset: **data integrity of records** — impact: silently corrupted records destroy trust in reconciliation

## 2. Trust boundaries & data flows

```
  Browser ──HTTPS──║── Express app ──║── SQLite
                     ║        │
                     ║        ╚── log sink (masked)
                     ║
        ══ Agent sandbox (untrusted executor) ══
             reads repo · runs tests · NO real creds · egress-filtered
```

## 3. STRIDE per element

| Element | Threat | S | T | R | I | D | E | Risk | Mitigation → control |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| Login endpoint | credential stuffing / brute force | ✔ | | | | | | H | → **SR-5** rate limit 3/15min/IP + generic 401 |
| Session cookie | token theft/forgery, fixation | ✔ | ✔ | | | | ✔ | H | → **SR-2** signed, HttpOnly+Secure+SameSite, 2h expiry, rotate on login |
| Transactions storage | cross-user access (IDOR) | | | | ✔ | | ✔ | **H** | → **SR-3** scoping in the repo layer + authz test matrix (A×B×CRUD = 404) |
| Views (htmx render) | stored XSS via note/category | | ✔ | | ✔ | | | M | → **SR-6** escape on render + input validation + XSS fixtures |
| Log sink | amounts/emails in logs | | | | ✔ | | | M | → **SR-4** masked logger + eval |
| Express app | DoS via huge queries (no pagination) | | | | | ✔ | | M | → FR-2 pagination 50/page + input length caps |
| Users table | repudiation of edits (who changed this?) | | | ✔ | | | | L | → audit columns + request id in masked logs (accepted residual for MVP) |

*S = Spoofing, T = Tampering, R = Repudiation, I = Information disclosure, D = Denial of service, E = Elevation of privilege.*

## 4. Agentic threats (agents build & operate this app)

- [x] **Prompt injection** — transaction notes/categories are user text rendered in the agent's context during debugging → controls: notes are DATA (never commands); AGENTS.md security rule; SR-6 escaping
- [x] **Excessive tool access** — builder sandbox holds no real credentials; DB access is synthetic-data SQLite (fake values policy)
- [x] **Data exfiltration** — sandbox egress allowlist: package registry + CI only; no external POST from tests
- [ ] **Memory/poisoning persistence** — `.agent/**` changes require review (CODEOWNERS) — low risk this MVP
- [x] **Cascade/hallucinated actions** — agent twice proposed `localStorage` tokens (habit from training data): AGENTS.md rule made it escalate instead of implement → exactly why context rules exist
- [x] **Supply chain** — dependency allowlist (express, better-sqlite3, argon2 + test deps); SBOM gate; lockfile mandatory

## 5. Security requirements produced

| ID | Requirement | Verified by |
|---|---|---|
| SR-1 | argon2id password hashing; never logged | unit test + secret-scan |
| SR-2 | Signed HttpOnly+Secure+SameSite sessions, 2h, rotated on login | integration test |
| SR-3 | Ownership scoping at the repo layer | authz matrix test (A×B×CRUD) |
| SR-4 | Masked logging — no amounts/notes/emails | log-audit eval |
| SR-5 | Login rate limiting + generic errors | integration test + DAST |
| SR-6 | Untrusted input: escape on render, validate on input | XSS fixtures |

(All carried into spec.md §3 — the contract below is satisfied.)

## 6. Residual risk & sign-off

- Accepted residual: no per-edit audit trail (R=row above) for MVP — re-open if multi-user shared ledgers arrive; password reset via admin for MVP (no email flow) — re-open at scale
- Sign-off: Security Lead · 2026-10-22
- Re-review: on any change to `src/auth/**` or the data model; quarterly otherwise
