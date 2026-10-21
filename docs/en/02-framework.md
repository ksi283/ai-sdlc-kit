# 02 · The AI-SDLC Framework: Principles & Six Stages

> The core document of the AI-SDLC kit. Reading it gives you the whole process: foundational principles, six stages (each with goals, human/AI division, artifacts, gates), the feedback loop, and the play map for modular adoption. *(Tiếng Việt: [`../vi/02-framework.md`](../vi/02-framework.md))*

---

## 1. Architecture overview: 3 layers — 6 stages — 1 loop

```
LAYER 1 · LIFECYCLE ────────────────────────────────────────────
                                                              ┌──────────┐
  PLAN ──► DESIGN ──► BUILD ──► TEST ──► DEPLOY ──► MAINTAIN ─┤ metric   │
 (intent)  (spec +      (agent      (verify  (ship       (run &     │ out of    │
           plan)        executes)   it)      it)         monitor)  │ band     │
    ▲          ▲                                                └────┬─────┘
    │          │                                                     │
    └──────────┴─────────────────────────────────────────────────────┘ new intent.md
                        closed loop

LAYER 2 · ORCHESTRATION ───────────────────────────────────────
  • Complexity routing (1–10): ai-with-review / ai-assisted / human-led
  • Autonomy levels L0–L3 (earn-by-evidence, automatic demotion)
  • Orchestrator (dispatch) + Worker agents (execute) + Reviewer agents (independent)
  • Human-in-the-loop: approvals at gates, receives escalations

LAYER 3 · TRUST FOUNDATION ────────────────────────────────────
  • Quality gates (DoR/DoD/Deploy) — 3 enforcement tiers: advisory / soft / hard
  • 5 metric groups + attribution (AI vs human) + cost accounting
  • Knowledge-as-code: AGENTS.md, skills, evals — all versioned in Git
  • Zero-trust: sandbox, short-lived credentials, per-artifact provenance
```

The three layers are tool-agnostic: Layer 1 is a working convention, Layer 2 a permissioning convention, Layer 3 a control convention. You can implement them with Claude Code, Codex, Copilot or your own agents — see `06-toolchain.md`.

---

## 2. Seven foundational principles

Each principle below realizes one design requirement (R1–R7) fixed in `01-research-synthesis.md`:

| # | Principle | Content |
|---|---|---|
| **P1** | **Intent-first** | Every change starts from a short, Git-versioned `intent.md`: *what — why — under which constraints*. Intent is the "contract" between human and agent; no intent, no work. |
| **P2** | **Spec-driven (WHAT ≠ HOW)** | The spec describes the desired outcome (WHAT); the agent chooses the approach (HOW). Specs must pass the **Definition of Ready** before coding. Editing a spec is 10–100× cheaper than fixing code. |
| **P3** | **Verification-first** | The new bottleneck is review/verification, not writing code. Invest the most in: CI evals, independent multi-model review (cross-harness), security scanning. Realistic expectation: only ~27–30% of agent PRs are accepted unmodified on the first pass. |
| **P4** | **Humans accountable, agents executable** | Humans own every judgment (scope, trade-offs, risk, approvals); agents own execution (synthesis, code/tests/docs generation, layer-1 review, monitoring). "The AI did it" never transfers accountability. |
| **P5** | **Earned autonomy** | Agent autonomy must be **earned with evidence** (metrics over time), starting at the lowest sufficient level; automatic demotion on incidents. Never granted by gut feeling or static config. |
| **P6** | **Knowledge-as-code** | Institutional knowledge (code conventions, build commands, review standards, warnings) lives in `AGENTS.md`, skills and evals — versioned and reviewed like code, not stored in people's heads. |
| **P7** | **Closed loop** | The lifecycle is a **loop**: a production metric leaves its control band → diagnosis → new `intent.md` → back to Plan. There is no "done and forget" straight line. |

---

## 3. The six stages in detail

Shared convention per stage: **Inputs** (artifact + gate passed) · **AI does** · **Humans do** · **Outputs + exit gate** · **Common mistakes**.

### Stage 1 · PLAN — "Capture the intent"

Answers: *what problem are we solving, why, and what does success look like?*

| Aspect | Content |
|---|---|
| **Inputs** | Any source: tickets, customer complaints, production incidents, metrics out of band (from Maintain), product ideas |
| **AI does** | Extracts pain points from raw sources (tickets, logs, meeting transcripts) into an intent draft; clusters problems; gathers quantitative evidence |
| **Humans do** | Decide *whether it's worth doing*, priority, scope; confirm success metrics; sign the intent (own it) |
| **Output** | `intent.md` (≤ 1 page, versioned) — template: [`templates/intent.md`](../../templates/intent.md) |
| **Exit gate (→Design)** | **Intent-Ready**: problem + evidence + measurable goal + constraints + owner. Missing → no Design |
| **Mistakes** | Writing a 5-page spec instead of an intent (long = dead); no success metric; no named owner |

> Per Anthropic: intent.md must be "human readable and machine actionable" — humans read it to judge, machines read it to act.

### Stage 2 · DESIGN — "Spec + plan in one session"

Answers: *what should the world look like when done, and in which steps?*

| Aspect | Content |
|---|---|
| **Inputs** | A gate-passed intent.md |
| **AI does** | In **one working session with an agent**: turn intent into a spec (functional + non-functional requirements + acceptance criteria) + design (architecture, API, data, security, test strategy) + task breakdown (each task scored 1–10 for routing). Use Spec Kit-style tooling (`/specify` → `/plan` → `/tasks`) |
| **Humans do** | Review & approve the spec (the biggest human leverage point — fixing things here is cheapest); decide architectural trade-offs; adjust complexity → working mode (see `03-org-autonomy.md`) |
| **Outputs** | `spec.md` + `plan.md` + complexity-labeled task list — templates: [`templates/spec.md`](../../templates/spec.md), [`templates/plan.md`](../../templates/plan.md) |
| **Exit gate (→Build)** | **Definition of Ready (DoR)**: measurable acceptance criteria; explicit boundaries/non-goals; tasks small enough (≤ half a day per agent run); test strategy stated; security risks recorded. Issues failing DoR are **not dispatched** — the single most important gate of the framework |
| **Mistakes** | Spec without acceptance criteria; giant tasks like "redo module X"; omitting non-goals so the agent over-expands scope |

> Tip from Microsoft: at planning time, pick a **high-reasoning model + low temperature (~0.2)** to reduce "imaginary code"/hallucination during thinking.

### Stage 3 · BUILD — "Agents execute, humans hold the wheel"

Answers: *how do we turn the spec into code + tests safely?*

| Aspect | Content |
|---|---|
| **Inputs** | DoR-passed tasks; an up-to-date repo `AGENTS.md` |
| **AI does** | Start in **plan mode** (agent must present a plan before editing); analyze the existing repo before writing (respect conventions); write code + tests in parallel; run tests in an isolated environment (container/sandbox); **1 task = 1 branch = 1 PR**; use subagents for broad exploration and parallel sessions for independent tasks |
| **Humans do** | Approve the agent's plan (first time / critical parts); answer escalations; keep `AGENTS.md` and skills accurate (this is how you "program" your agents) |
| **Output** | Branch + PR containing code/tests/docs, with **provenance** (which model, prompt hash, when — see `templates/pr-template.md`) |
| **Exit gate (→Test)** | **Build-Ready**: build passes, new tests cover the change, lint clean, PR ≤ autonomy-level limit (L1 ≤ 200 lines…) |
| **Mistakes** | Letting the agent "change course" away from the plan; accepting code without tests; bloated PRs from merged tasks; writing `AGENTS.md` once and forgetting it |

> Per DORA/churn data: AI code runs ~0.4 higher churn — PR evaluation should include an anti-"code-deleted-in-two-weeks" gate.

### Stage 4 · TEST — "Verification is the bottleneck — pay for it"

Answers: *how do we TRUST what the agent just did?*

| Aspect | Content |
|---|---|
| **Inputs** | A Build-Ready PR |
| **AI does** | **Layer-1 review (machines):** ≥ 2 models/agents **independent from the implementer** review together (cross-harness), score findings, detect bugs/security/anti-patterns; agents may fix directly and re-run; run **evals** in CI (evals rerun when the agent setup changes — not only when code changes); security + dependency + license scans |
| **Humans do** | **Layer-2 review (humans):** focus only on regulated/critical/security parts per routing; approve with notes; gate overrides require justification (audited) |
| **Outputs** | A PR that passed layered review + eval results + scan reports; every conclusion traceable to "a review ran on this exact diff" (proof of execution) |
| **Exit gate (→Deploy)** | **Quality gates**: coverage ≥ threshold, zero critical scan findings, minimum reviewers, evals in band, attribution valid — the 3 enforcement tiers are detailed in `04-gates-policy.md` |
| **Mistakes** | One model writing and reviewing its own code (no independence); running evals only on code changes but not agent-setup changes; treating "the AI said OK" as evidence |

### Stage 5 · DEPLOY — "Ship behind approval gates"

Answers: *how do we release safely when agents wrote most of the code?*

| Aspect | Content |
|---|---|
| **Inputs** | A PR that passed all quality gates |
| **AI does** | Orchestrate CI/CD; draft release notes; **triage agents** classify build/deploy failures and attempt fixes; support rollback per runbook |
| **Humans do** | **Hooks = approval gates:** sensitive actions (merge to main, production deploy, data deletion, permission grants) are **held** until a person with the right role approves; humans decide progressive rollout (canary %, feature flags) |
| **Outputs** | A release + an audit trail (who approved what, when, based on which report) |
| **Exit gate (→Maintain)** | **Deploy gates:** rollback plan in place; monitoring/dashboards wired to the new metrics; rollout phases configured |
| **Mistakes** | Giving agents production-deploy rights from day one (only L3 may deploy to staging — see `03`); no approval audit trail; skipping feature flags |

### Stage 6 · MAINTAIN — "Close the loop"

Answers: *after release, who watches it and how does the system self-heal?*

| Aspect | Content |
|---|---|
| **Inputs** | Production + observability (metrics, logs, traces, alerts) |
| **AI does** | **SRE agent** monitors continuously: analyzes alerts, correlates anomalies with recent commits/PRs, opens investigations; for qualifying failures: opens fix issues/PRs with root-cause analysis; proposes cost/performance optimizations |
| **Humans do** | Vet SRE-agent actions per its autonomy level; decide major rollbacks; **turn findings into a new `intent.md`** when a metric leaves its control band — formally opening the next lifecycle |
| **Outputs** | Fix issues/PRs + an inheriting `intent.md` (from the postmortem — template: [`templates/postmortem-to-intent.md`](../../templates/postmortem-to-intent.md)) |
| **Exit gate (→Plan)** | **Loop-Ready**: findings backed by quantitative evidence + impact assessment + a link back to the original intent |
| **Mistakes** | Alerts piling into a garbage heap nobody processes; postmortems that never spawn a new intent (broken loop); control bands not defined back in Plan |

---

## 4. Artifact × stage matrix

| Artifact | Plan | Design | Build | Test | Deploy | Maintain | Template |
|---|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `intent.md` | ⭐ | reads | | | | produces | [`templates/intent.md`](../../templates/intent.md) |
| `spec.md` | | ⭐ | reads | | | | [`templates/spec.md`](../../templates/spec.md) |
| `plan.md` + tasks (1–10) | | ⭐ | reads | | | | [`templates/plan.md`](../../templates/plan.md) |
| `AGENTS.md` / skills | updates | updates | ⭐ | uses | | updates | [`templates/AGENTS.md`](../../templates/AGENTS.md) |
| Evals | | plan | write | ⭐ | run | | [`templates/evals.md`](../../templates/evals.md) |
| PR + provenance | | | ⭐ | review | | | [`templates/pr-template.md`](../../templates/pr-template.md) |
| Quality gates (YAML) | | DoR | Build | ⭐ | Deploy | | [`templates/quality-gates.yml`](../../templates/quality-gates.yml) |
| Metrics / dashboard | define | | | collect | collect | ⭐ | `05-metrics.md` |
| Postmortem → intent | | | | | | ⭐ | [`templates/postmortem-to-intent.md`](../../templates/postmortem-to-intent.md) |

⭐ = the stage's central artifact.

---

## 5. The play map — modular adoption

Inherits Anthropic's "play + dependency graph" thinking, adapted vendor-neutral. **Bold plays = no prerequisites, can start today** (still read `07-adoption.md` before running).

| # | Play | Stage | Depends on | Short description |
|---|---|---|---|---|
| 1 | **Capture as intent.md** | Plan | — | Every change starts from a versioned intent file |
| 2 | Spec-in-one-session | Design | Play 1 | Merge requirements + design in one agent session |
| 3 | DoR gate | Design | Play 2 | The "ready before coding" gate |
| 4 | **AGENTS.md/CLAUDE.md as project memory** | Build | — | Standard context for every agent entering the repo |
| 5 | **Plan-mode-first** | Build | — | Agents must present a plan before editing |
| 6 | Skills = institutional knowledge | Build | Play 4 | Package standards/review checklists into versioned skills |
| 7 | Subagents & parallel sessions | Build | Play 4, 5 | Increase throughput for independent tasks |
| 8 | **Feedback loop for agents** | Test | — | Let agents run tests/evals and self-fix in a sandbox |
| 9 | Evals in CI | Test | Play 8 | Eval suites rerun when code OR agent setup changes |
| 10 | Layered multi-model review | Test | Play 4 | Layer 1: ≥ 2 independent AI reviewers; layer 2: humans for critical parts |
| 11 | **Hooks as approval gates** | Deploy | — | Sensitive actions held for human approval |
| 12 | Close the loop with metrics | Maintain | Play 1, 9 | Metric out of band → new intent |

Most practical start: **1 → 4 → 5 → 8 → 11** (enough to raise one team's quality in 2–4 weeks with no new infrastructure).

---

## 6. The feedback loop — what makes AI-SDLC different from traditional SDLC

Three nested loops, with increasingly longer cycles:

1. **Seconds–minutes loop (Build/Test):** agent writes → runs tests/evals → self-fixes in sandbox → AI review → human approves. Rule: *never let an agent "finish" without running anything.*
2. **Daily loop (Deploy):** a quality gate blocks → triage agent classifies → fix or escalate → phase rollout.
3. **Weekly/monthly loop (Maintain→Plan):** a production metric's control band is breached → SRE agent diagnoses → postmortem → **new intent.md** → back to Plan. *Old and new intents chain into an auditable causal history — that is a "lifecycle" in the true sense.*

Health check question for the loop: *"When was the last time a production metric became an intent.md?"* — if nobody can answer, the loop is broken.

---

## 7. How this maps to the traditional SDLC

| Traditional SDLC | In this AI-SDLC | Note |
|---|---|---|
| Requirements workshops | Plan + raw data sources + agent extraction | Faster, evidence-backed |
| Analyst-authored spec docs | Design: spec generated in one session, standardized by template + DoR | The spec is a living, versioned artifact |
| Line-by-line code review | Layered review: AI layer 1 (multi-model), humans layer 2 for critical parts | Humans *decide*, they don't *read everything* |
| QA at the end of the cycle | Continuous evals across Build→Deploy | Testing is not a "final phase" |
| Approval by meeting | Hooks + gates + audit trails | Asynchronous, recorded approvals |
| Manual operations | SRE agent + observability + postmortem→intent | Loop closed |

---

*Next: roles & autonomy → [`03-org-autonomy.md`](03-org-autonomy.md) · Extended coverage: [`08-security.md`](08-security.md) (product security) · [`09-discovery-ux.md`](09-discovery-ux.md) (stage 0: discovery & UX) · [`10-delivery-ops.md`](10-delivery-ops.md) (estimation, versioning, environments, tech debt) · [`11-portfolio.md`](11-portfolio.md) (prioritization & vendors) · Back to [README](../../README.md)*
