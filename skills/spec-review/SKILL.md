---
name: spec-review
description: "USE WHEN writing, reviewing or approving a spec.md (Design stage, Definition-of-Ready gate). Enforces the kit's spec quality bar: measurable acceptance criteria, non-goal integrity, scored tasks, test strategy, threat-model linkage — rejects untestable specs before any code is dispatched."
---

# Spec Review

Enforce the Definition of Ready honestly: a spec whose requirements cannot be tested,
whose tasks are unscored, or whose security screen flags lack a threat model must NOT
pass DoR — code must not be dispatched against it.

## When to apply

- Drafting or editing any `spec.md` (Design stage)
- Reviewing a spec at the DoR gate before dispatch
- Re-scoring tasks when scope changes mid-design

## When NOT to apply

- Intent drafting/review (that is the Intent-Ready gate — the `intent-review` skill)
- Runtime code review (that is Test stage, layered review)

## Rules

1. **Every FR has measurable acceptance criteria** — "works", "fast", "user-friendly"
   fail; "p95 ≤ 300ms @ 10k rows", "cross-user edit → 404" pass. If you cannot write
   the test, the requirement is not ready.
2. **Non-goal integrity** — diff the spec's scope against the originating intent's
   non-goals; any quiet expansion is a DoR failure, cite the non-goal.
3. **Tasks are dispatchable** — each ≤ half a day of agent work, carries a 1–10
   complexity score and a working mode (fully-autonomous / ai-with-review /
   ai-assisted / human-led per docs/en/03 §4).
4. **Test strategy is stated** — unit/integration/evals named per requirement; user-facing
   work includes usability verification (prototype tested or measurement plan).
5. **Security screen linkage** — any "yes" on the intent's screen ⇒ the threat model is
   attached and its mitigations exist as SR-x requirements with named tests.
6. **Sensitive components flagged** — auth/payment/PII paths named for CODEOWNERS review.
7. **Migrations have rollback** — every schema change ships an undo path (expand →
   migrate → contract; never big-bang).
8. An issue failing any rule above is **not dispatched** — the gate is the point.

## References

- [`templates/spec.md`](../../templates/spec.md) — the artifact being reviewed
- docs/en/02-framework.md §3 Stage 2 — DoR definition
- docs/en/08-security.md §3 — threat modeling contract
