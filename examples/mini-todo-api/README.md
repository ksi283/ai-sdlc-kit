# End-to-end Example: Mini Todo API

> A small unit of work passing through **all six stages** of the AI-SDLC kit, using the exact templates from `templates/`. Purpose: to show what a real lifecycle run looks like — not complete code, but the chain of artifacts + decisions at each gate.

**Scenario:** the "Internal Tools" squad (5 people) is in the Walk stage (months 2–3 of the `07-adoption.md` roadmap). The pilot agent **builder-claude** is at level **L1**. Tooling: Claude Code (build), a GPT reviewer + a Gemini reviewer (layer-1 review), GitHub Actions (CI/gates), Docker (sandbox).

---

## Stage 1 · PLAN — the source is a metric out of band

Last week the SRE agent found `p95 GET /tasks` on the internal todo service at **1.8s vs. an allowed band of ≤ 800ms**. It opened an issue with an analysis: 62% of requests throttled due to a missing index + an N+1 query.

Lan (owner) writes `intent.md` (filled version: [`intent.md`](intent.md)) — 15 lines. The **Intent-Ready** gate passes: evidence (dashboard + SRE analysis), a success metric (p95 ≤ 800ms), non-goals (no API contract changes).

> Notable: this intent was born from the **Maintain stage of a previous lifecycle** — the loop is working.

## Stage 2 · DESIGN — one session, full spec + tasks

In one session with an agent (high-reasoning model, temp 0.2), Lan turns the intent into `spec.md` (filled version: [`spec.md`](spec.md)):

- 2 functional requirements, each with measurable acceptance criteria
- 3 tasks scored: **T1 = 3** (add index + test), **T2 = 4** (fix N+1 via batching), **T3 = 2** (add a metric)
- Risk flagged: a DB migration → rollback plan required

**DoR** gate: the Spec Reviewer (Minh) catches one gap: T2 lacks the boundary condition "lists > 1000 items". Fixed, re-passed. **The issue is only now dispatchable.**

## Stage 3 · BUILD — 1 task = 1 branch = 1 PR

The orchestrator takes T1 (score 3, mode ai-with-review since builder-claude is L1 → every change through a human):

- Allocates the dedicated worktree `ai-sdlc/issue-142`, a container sandbox, read-only credentials with a 2h TTL
- The agent presents its **plan** first (plan mode): 2 files, 3 new tests, a migration with `down` — Minh approves the plan in 2 minutes
- The agent writes code + tests, runs `npm test` in the container, self-fixes once (a test failed → a missing unique index), done on iteration 2
- PR #143 opens with the `pr-template.md` template: provenance complete (model, promptHash), ~140 lines — within the L1 limit (≤ 200)

## Stage 4 · TEST — layered review

- **Layer 1 (machines):** the `gpt` and `gemini` reviewers (different families from the builder) both score — GPT catches a missing duplicate-title test (4/5), Gemini confirms (3/5). The builder adds one test, re-run: 5/5 + 4/5
- CI: build/lint/tests green; semgrep clean; coverage diff = 92% (advisory gate, trending right)
- **Layer 2 (humans):** a medium task (4/10) → 1 human reviewer required. Minh reviews ~10 minutes (not line-by-line — he reads the FR→test mapping + the migration diff), approves with one naming comment

Gates: all soft-mandatory green; attribution valid → merge.

## Stage 5 · DEPLOY — held by the hook, signed by a human

- Staging deploy runs automatically (the pipeline acts; the L1 agent itself holds no deploy authority)
- The **production** deploy is held by a hook for the release manager (Minh) — he approves after seeing 30 stable minutes on the staging dashboard; canary rollout 5% → 25% → 100%
- The audit trail records: approver, timestamp, and which report it was based on

## Stage 6 · MAINTAIN — closing the loop

- 3 days later: `p95 GET /tasks` = 640ms — **inside the band**. Because the control band was defined in the intent, the dashboard confirms "goal met" automatically
- The next week, the SRE agent notices the new T3 metric (`db.query_count`) showing that `/tasks/due` still runs N+1 → opens an issue with a proposal
- The squad decides it's small enough to become the next intent → `INT-202611-003` is born — **a new lifecycle begins**

## The numbers after one sprint (collected per `05-metrics.md`)

| Metric | Value | Note |
|---|---|---|
| `task.success_rate` | 3/3 | all tasks passed gates |
| `code.acceptance_rate` (T1) | 0 after 1 fix iteration → 1 | a reasonable outcome (industry baseline 0.27–0.30) |
| `human.intervention_rate` | 1/3 tasks | routing worked (only the medium task needed a human) |
| Avg iterations per PR | 1.3 | < 1.5 — counts toward builder-claude's L2 review |
| Cost/task | $2.10 | within the $50 cap |

→ Continuing to accumulate toward autonomy L1→L2 per the criteria table in `docs/en/03-org-autonomy.md` section 3.2.

## Lessons from this example

1. **Human effort concentrates in Design and approvals**, not typing — exactly the P4 division of labor.
2. **DoR caught a spec gap immediately** — far cheaper than letting it leak into code.
3. **Cross-harness review caught a real bug** the builder family alone might have missed.
4. **The loop keeps the framework alive**: metric → SRE → issue → new intent.
