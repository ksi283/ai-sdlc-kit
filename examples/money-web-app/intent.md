# Intent: PocketLedger — basic money tracking on the web

| Field | Value |
|---|---|
| **ID** | `INT-202611-007` |
| **Date** | 2026-10-22 |
| **Owner** | Lan Nguyen |
| **Origin** | Portfolio scorecard (108/729) + discovery dossier (ticket clustering, 2 spreadsheet incidents) |
| **Tags** | `feature` |
| **Status** | ready ✅ (passed the Intent-Ready gate) |

## Problem

Employees track personal/team expenses in a shared spreadsheet that corrupts, has no access control per person, and forces a 3-hour manual reconciliation every month-end.

## Evidence

- 214 support tickets over 9 months asking for structured expense tracking
- The shared spreadsheet corrupted twice in 2025 (≈ 6h manual repair each)
- Survey (n=150): 68% want structured tracking; finance-close +3h/month

## Goal & success metrics

| Metric | Current | Target | Measured where |
|---|---|---|---|
| Weekly active trackers (staff logging ≥ 1 expense/week) | ~12% (spreadsheet) | **≥ 60% within 6 weeks** | product analytics |
| Month-end reconciliation time | 3h | ≤ 30 min | finance team timer |

## Constraints & non-goals

- Constraints: internal deployment only; must satisfy security policy for financial data; 1 squad; ship MVP in sprint 46
- **Non-goals:** NO payment processing, NO bank sync, NO mobile app, NO multi-currency

## Security screen (per docs/en/08-security.md §2)

| Question | Answer |
|---|---|
| Touches authentication / authorization? | **yes** — email + password login, per-user data |
| Touches payment or money flows? | **yes** (records only — no processing) |
| Collects / moves PII or sensitive data? | **yes — classification: restricted** (personal financial records) |
| Crosses a trust boundary or external system? | **yes** — browser ↔ server ↔ DB; agent sandbox |

> Any "yes" → a threat model ([`threat-model.md`](threat-model.md)) is REQUIRED at Design before DoR can pass. → **All four flagged; threat model is mandatory.**

## Open questions

- Password policy: org SSO vs local accounts? → decided at Design: local accounts for MVP, SSO in a follow-up intent (ADR-0008 pending)
- Data retention: how long keep records? → Design must state (draft: 24 months, user-deletable)
