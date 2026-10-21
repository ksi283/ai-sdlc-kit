# Intent: Bring p95 GET /tasks back inside the ≤ 800ms band

| Field | Value |
|---|---|
| **ID** | `INT-202610-007` |
| **Date** | 2026-10-22 |
| **Owner** | Lan Nguyen |
| **Origin** | SRE agent analysis + `svc-todo` dashboard, week 42 |
| **Status** | ready ✅ (passed the Intent-Ready gate) |

## Problem

The `GET /tasks` endpoint of the internal todo service is severely slow at peak hours, blocking other squads' work on this tool.

## Evidence

- p95 `GET /tasks` = **1.8s** for 7 consecutive days (allowed band ≤ 800ms) — Grafana `svc-todo`
- SRE agent analysis (INC-20261018-02): 62% of requests throttled; query logs show an **N+1 query** when joining `tasks→labels` and a **missing index** on `(owner_id, due_date)`
- 9 internal tickets in 2 weeks about "todo loading slowly"

## Goal & success metrics

| Metric | Current | Target | Measured where |
|---|---|---|---|
| p95 `GET /tasks` | 1.8s | **≤ 800ms** | Grafana `svc-todo` (predefined band) |
| Queries per request | ~41 | ≤ 5 | `db.query_count` metric (added in this work) |

## Constraints & non-goals

- Constraints: no downtime (online migration); no API contract changes; done in sprint 44
- **Non-goals:** NO service rewrite; NO Redis cache; NO UI changes

## Open questions

- Is `(owner_id, due_date)` enough, or do we need a partial index for overdue tasks? → answer in Design
