# Implementation Plan: PocketLedger — T2 Transactions CRUD

| Field | Value |
|---|---|
| **Originating spec** | spec.md (`INT-202611-007`) |
| **Current task** | T2 — Transactions CRUD + SR-3/4/6 tests + pagination |
| **Complexity / mode** | 4/10 — ai-with-review |
| **Executing agent** | builder-claude / Claude Code 2.x |
| **Current autonomy level** | L1 |

## Alignment check (the agent confirms before writing)

- [x] I have read the spec + the files listed below
- [x] I understand this task's acceptance criteria: CRUD on transactions, **every read/write scoped to the session owner**, p95 ≤ 300ms @ 10k rows, amounts in integer cents
- [x] I must NOT: add dependencies / change the schema beyond spec §4 / touch `src/auth/**` (T1's territory)
- [x] This task touches SR-3/SR-4/SR-6 → each has a named test in the test plan below

## Implementation steps

1. Repo layer with ownership scoping → `src/repos/transactions.ts` → verify: unit tests incl. authz matrix
2. Routes (list/create/edit/delete) + validation → `src/routes/transactions.ts` → verify: integration tests
3. Masked logging for this route family → `src/logger.ts` (extend) → verify: log-audit eval EV-2
4. Views + htmx partials + pagination (50/page) → `views/transactions.*` → verify: E2E + a11y checklist
5. XSS fixtures from threat model §3 → `tests/xss.fixtures.ts` → verify: all render escaped

## Files to be touched

```
src/repos/transactions.ts    (create — scoped queries, closest to SQL)
src/routes/transactions.ts   (create — validation, error codes)
src/logger.ts                (modify — mask amounts/notes)
views/transactions.hbs       (create — list + form + pagination)
tests/transactions.test.ts   (create — CRUD + authz matrix)
tests/xss.fixtures.ts        (create — from threat model)
migrations/002-transactions.sql (create — additive, has DOWN)
```

> If you discover you need to touch files outside this list (e.g. `src/auth/**`) → STOP and escalate.

## Test plan

- New: CRUD happy path; **SR-3 authz matrix (user A × user B × list/get/edit/delete → cross-user 404)**; pagination @ 10k rows; validation bounds; XSS fixtures (SR-6); masked-log assertions (SR-4)
- Existing to change: session helper tests — none (auth untouched)
- Sandbox run: `docker compose -f ci.yml up && npm test`

## Task completion criteria (task DoD)

- [ ] Every acceptance criterion of T2 has a passing test
- [ ] Build + lint clean inside the container
- [ ] PR ≤ 200 lines (L1) — may need split into T2a repo/routes, T2b views if it grows
- [ ] Provenance attached to the PR

## Rollback plan

Revert PR; migration 002 is additive — `DOWN` drops only the new table; feature flag `pocketledger.transactions` defaults off until T3 lands.
