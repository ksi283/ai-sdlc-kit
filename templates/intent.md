# Intent: <short name of the intent>

<!-- PLAN STAGE TEMPLATE — delete the <!-- --> notes when using.
     Rules: ≤ 1 page. No spec content here. A human signs it, an agent reads it. -->

| Field | Value |
|---|---|
| **ID** | `INT-YYYYMM-NNN` (e.g. `INT-202610-014`) |
| **Date** | YYYY-MM-DD |
| **Owner** | <signing human — mandatory> |
| **Origin** | <ticket / incident / metric out of band / idea — with link> |
| **Tags** | `feature` / `debt` / `security` / `docs` (drives capacity split, see docs/en/10) |
| **Status** | draft → ready (passes the Intent-Ready gate) |

## Problem

<1–3 sentences: what hurts, for whom. No solutions here.>

## Evidence

- <Concrete data/tickets/quotes. e.g. "checkout p95 at 4.2s (band ≤ 2s) Oct 12–15", "17 tickets in October about expired tokens">

## Goal & success metrics

| Metric | Current | Target | Measured where |
|---|---|---|---|
| <e.g. API p95 latency> | <4.2s> | <≤ 2s> | <Grafana: svc-checkout> |

## Constraints & non-goals

- Constraints: <deadline, budget, technical, compliance…>
- **Non-goals:** <what is EXPLICITLY OUT of scope — as important as the goal>

## Security screen (per docs/en/08-security.md §2)

| Question | Answer |
|---|---|
| Touches authentication / authorization? | <yes/no> |
| Touches payment or money flows? | <yes/no> |
| Collects / moves PII or sensitive data? | <yes/no — classification: public / internal / confidential / restricted> |
| Crosses a trust boundary or external system? | <yes/no> |

> Any "yes" → a threat model ([`threat-model.md`](threat-model.md)) is REQUIRED at Design before DoR can pass.

## Open questions

- <what is unclear, must be answered before Design>

---

### Intent-Ready gate (self-check before moving to Design)

- [ ] Problem + quantified evidence
- [ ] Measurable success metric with a measurement source
- [ ] Explicit non-goals
- [ ] Security screen completed (and threat model queued if any "yes")
- [ ] A named human owner
