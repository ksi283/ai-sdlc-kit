# Spec: Optimize GET /tasks performance (Todo API)

| Field | Value |
|---|---|
| **Originating intent** | `INT-202610-007` |
| **Status** | ready ✅ (passed DoR after 1 revision) |
| **Spec Reviewer** | Minh Tran |
| **Model guidance** | high-reasoning model, temperature 0.2 |

## 1. Context

`svc-todo` (Node 22 + PostgreSQL 16) serves ~300 internal users. `GET /tasks` returns tasks + labels; the ORM issues 1 query per task (N+1) and the `tasks` table lacks an index on `(owner_id, due_date)` — the two causes in INC-20261018-02.

## 2. Functional requirements

| ID | Requirement | Acceptance criteria (measurable) |
|---|---|---|
| FR-1 | Add an index serving owner + due-date queries | Migration has `up`/`down`; load scenario with 200 users: p95 ≤ 800ms; `EXPLAIN` shows an Index Scan (e2e test `perf.spec.ts`) |
| FR-2 | Eliminate the N+1 when loading labels | `db.query_count` ≤ 5/request for lists ≤ 1000 tasks (including > 1000 — **boundary condition added by the reviewer**); API output byte-identical to before (snapshot test) |

## 3. Non-functional requirements

| Type | Requirement |
|---|---|
| Performance | p95 ≤ 800ms at simulated peak (100 rps) |
| Security | No change to permission-based data exposure (owner-permission regression test) |
| Observability | Add the `db.query_count` metric per endpoint |
| Compatibility | API response schema unchanged (snapshot test); online migration (CONCURRENTLY) |

## 4. Design (HOW — agent proposed, human decided)

- **Architecture:** touch only the repository layer of `svc-todo`; no service interface changes
- **Data:** `CREATE INDEX CONCURRENTLY idx_tasks_owner_due ON tasks(owner_id, due_date)`; `down` = DROP INDEX CONCURRENTLY
- **API:** no contract changes
- **Error & edge handling:** large lists → batch-load labels in chunks of 200 ids; snapshot test for > 1000 tasks
- **Security:** no sensitive areas per AGENTS.md — but the **migration touches the DB** → rollback plan + human review mandatory

## 5. Test strategy

- Unit: repository batch loading; migration up/down
- Integration/E2E: `perf.spec.ts` (simulated load), response snapshots, owner-permission regression
- Evals: not needed (mechanical change fully covered by traditional tests) — noted for audit

## 6. Task breakdown

| # | Task | Complexity (1–10) | Mode | Notes |
|---|---|:-:|---|---|
| T1 | Index migration + perf test + permission regression | 3 | ai-with-review | builder-claude L1 |
| T2 | Batch-load labels + snapshot test (incl. > 1000 tasks) | 4 | ai-with-review | boundary condition mandatory |
| T3 | `db.query_count` metric + dashboard panel | 2 | ai-with-review | small, easy to verify |

## 7. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Migration locks the table at peak | high | CONCURRENTLY + off-hours execution + rollback runbook |
| Batch loading changes output ordering | medium | byte-comparison snapshot test; explicit sort in the query |

---

### Definition of Ready (DoR) — checked

- [x] Every FR has measurable acceptance criteria
- [x] The intent's non-goals were not expanded (no cache/rewrite)
- [x] Tasks ≤ half a day, with complexity scores and working modes
- [x] Test strategy stated
- [x] Migration has a rollback plan (up/down)
- [x] No sensitive areas touched; the DB migration is flagged for human review
