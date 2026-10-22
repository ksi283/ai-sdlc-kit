---
name: intent-review
description: "USE WHEN writing, reviewing or approving an intent.md (Plan stage, Intent-Ready gate). Enforces the kit's intent quality bar: problem/evidence/metric/owner/security screen — rejects vibes-based intents."
---

# Intent Review

Enforce the Intent-Ready gate honestly: an intent that reads well but lacks evidence,
a measurable metric, or a named human owner must NOT pass.

## When to apply

- Drafting or editing any `intent.md` (Plan stage)
- Reviewing someone's intent before it moves to Design
- Converting incidents/postmortems into new intents

## When NOT to apply

- Spec review (that is the DoR gate, `templates/spec.md`)
- Task complexity routing (docs/en/03 §4)

## Rules

1. **Evidence over prose** — every claim in "Problem" needs a number, ticket, or metric
   link in "Evidence". No quantified pain → the intent stays `draft`.
2. **Metric must be measurable and sourced** — name the dashboard/query; "better UX" is
   not a metric.
3. **Non-goals are mandatory** — scope creep is blocked at the intent, not at the PR.
4. **Security screen decides the path** — any "yes" ⇒ threat model REQUIRED at Design;
   say so explicitly in the hand-off.
5. **Owner is a human name** — never a team, never an agent.
6. Keep the intent ≤ 1 page; move HOW-thinking to the spec.

## References

- [`templates/intent.md`](../../templates/intent.md) — the artifact being reviewed
- docs/en/02-framework.md §3 Stage 1 — gate definition
