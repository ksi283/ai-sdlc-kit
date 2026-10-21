# 05 · Metrics & Measurement

> The framework's measurement layer. Because subjective perception is off by up to **39 points** (METR: AI users believed they were 20% faster while being 19% slower), every AI-SDLC decision — autonomy promotion, scope expansion, tooling investment — must rest on objective numbers with attribution. *(Tiếng Việt: [`../vi/05-metrics.md`](../vi/05-metrics.md))*

---

## 1. Structure: five metric groups

Standardized after the ai-sdlc.io metrics spec (extending OpenTelemetry GenAI semantic conventions, prefix `ai_sdlc.*`). A minimal implementation needs the first three groups.

### Group 1 · Task Effectiveness — "Does the agent get the job done?"

| Metric | Definition | Reference thresholds |
|---|---|---|
| `task.success_rate` | Successfully completed tasks / assigned tasks | ≥ 0.7 (start), trending to ≥ 0.9 |
| `task.completion_time` | Assignment → completion, per complexity tier | Per team SLA |
| `task.time_vs_baseline` | Agent time / human baseline for equivalent tasks | < 1.0 is a win |
| `task.resolution_time` | Issue creation → closure | Per tier |

Recommended dimensions: agent, complexity_tier, task_type.

### Group 2 · Human-in-the-Loop — "How much human intervention is needed?"

| Metric | Definition | Meaning |
|---|---|---|
| `human.intervention_rate` | Tasks needing intervention / total | Must **decline** over time — the system's "learning" indicator |
| `human.escalation_count` | Agent→human escalations | Anomalous rise = weak specs or missing agent context |
| `human.override_rate` | Gate overrides / total evaluations | > 10% = gates are wrongly placed (blocking good work) — revisit policy |

### Group 3 · Code Quality — "What is the quality of agent output?"

| Metric | Definition | Research baseline |
|---|---|---|
| `code.acceptance_rate` | PRs accepted **unmodified** / total PRs | AI ~0.27–0.30 — don't expect one-shot |
| `code.defect_density` | Defects / KLOC, split by author_type | Compare AI vs human in your own repo |
| `code.churn_rate` | Lines changed within 14 days of commit / total | AI ~0.41 above human — needs anti-churn gates |
| `code.security_pass_rate` | Security scan pass rate by author_type | 45% of AI samples flawed — this gate is not optional |

**Attribution is the soul of this group:** every metric must split `author_type ∈ {ai-agent, human}` — without the split you cannot assess AI's real impact.

### Group 4 · Economic Efficiency — "What does it cost?"

| Metric | Definition |
|---|---|
| `cost.per_task` / `cost_per_line` / `tco_per_feature` | Full cost per unit of output (tokens + compute + review) |
| `model_usage_mix` | Cheap vs expensive model call ratio — goal: routing pushes the majority to cheap models, hard work goes to expensive ones |
| `token_*`, `cache_hit_rate`, `cache_savings` | Token accounting (input/output/cache) by model, agent, stage |
| `human_review_cost` | Review hours × reviewer rate — review is the bottleneck; it belongs in TCO |
| `budget_consumed` / `budget_remaining` / `retry_waste` | Budget overrun must ABORT automatically (e.g. $50/task) |

Rule: **every model call is accounted** (usage ledger). No accounting, no optimization.

### Group 5 · Autonomy Trajectory — "Is the system becoming more autonomous?"

| Metric | Definition |
|---|---|
| `autonomy.level` | Current level (0–3) per agent |
| `autonomy.complexity_handled` | Distribution of task complexity the agent handles autonomously |
| `autonomy.intervention_trend` | Rolling average of intervention_rate — **must decline over time** |
| `autonomy.time_to_promotion` | Time from L(n) → L(n+1) |

This group feeds the promotion/demotion reviews in `03-org-autonomy.md`.

---

## 2. Adding delivery measures (DORA + AI-era throughput)

This AI-SDLC doesn't replace DORA — it adds the "when AI writes most of the code" lens:

| Measure | Question | Data-driven warning |
|---|---|---|
| Deployment frequency / Lead time | Are we shipping faster? | It should improve — if not, the bottleneck moved (review/gates) |
| Change failure rate | Is it stable? | DORA: +25% AI adoption ↔ −7.2% stability without gates |
| **Review throughput** (PRs merged/day, time in review) | Can review keep up? | Faros: PRs +98%, review time +91% — this is the bottleneck meter |
| **Rework rate** (iterations per PR) | How good are the specs? | > 1.5 iterations = weak specs or context |
| **% of pipeline executed end-to-end by agents** | True automation level | Ground truth for the `07` roadmap |

---

## 3. From metrics to decisions

| Signal | Likely cause | Action |
|---|---|---|
| `acceptance_rate` < 0.2 | Weak specs / missing AGENTS.md / task too complex for the agent | Improve DoR; add context; lower dispatched-task complexity |
| `override_rate` > 10% | Gates blocking wrongly | Downgrade the gate (hard→soft→advisory) or fix thresholds |
| `intervention_trend` flat after a month | A missing feedback loop (agent cannot self-correct) | Play 8 (feedback loop); invest in evals |
| AI `churn_rate` ≫ human | Agent generates throwaway code | Anti-churn gate; review plans (plan mode) more strictly |
| `human_review_cost` climbing fast | Review is the true bottleneck | Layered review (AI layer 1) + PR size limits |
| `model_usage_mix` skewed to expensive models | Routing misconfigured | See `06-toolchain.md`, model routing |
| A gate fails 0% or 100% of the time for long | Meaningless rule or wrong target | Delete or rewrite it |

---

## 4. Dashboards & operations

### 4.1. Suggested 4-panel dashboard layout

1. **Flow:** tasks per stage (Plan→…→Maintain funnel) + lead time + PRs awaiting review — *for EM/leads.*
2. **Quality:** acceptance, churn, defects by author_type + gate status — *for the Agentic Engineer.*
3. **Autonomy:** per-agent level + intervention trend + promotion/demotion events — *for EM + Security.*
4. **Economics:** cost/task, budget vs actual, model mix — *for leadership.*

### 4.2. Standardized traces

Enable pipeline trace spans to debug "why was this task slow": `pipeline.stage → agent.task → gate.evaluation → handoff`, linked into one whole-issue trace (ai-sdlc.io standard). Mandatory structured logs: `gate.failure`, `gate.override` (actor, role, justification), `autonomy.promotion/demotion`, `reconciliation.decision`.

### 4.3. Operating cadence

- **Daily (async):** glance at Flow + Quality panels; alert when a metric leaves its band.
- **Weekly:** review overrides + escalations; pin one "learning case" (a gate that caught something / an agent win).
- **Monthly:** autonomy promotion/demotion reviews per `03`; gate portfolio review; TCO report.
- **Control bands:** every production metric gets a normal band defined back in Plan (inside intent.md) — the precondition for Maintain to auto-spawn a new intent on breach.

### 4.4. Anti-gaming

- No single-metric KPIs (rewarding only `task.success_rate` → agents/tasks get "chosen easy"); always evaluate the trio: effectiveness × quality × cost.
- Autonomy reviews use the **current window only** (no old track record — ai-sdlc.io standard).
- Metrics measurable at **gameable intermediate points** (lines, PR count) must be paired with outcomes (defects, churn, rollbacks).

---

## 5. Minimal start (week one)

No big system needed — start with this table in a spreadsheet, automate gradually:

| # | Starter metric | How to collect |
|---|---|---|
| 1 | PRs by author_type (AI/human) | Mandatory PR labels (PR template) |
| 2 | acceptance_rate + rework rate (iterations/PR) | PR statistics |
| 3 | Time in review | GitHub/GitLab API |
| 4 | Cost/task (tokens & $) | Provider API reports + manual usage ledger |
| 5 | Gate fail/override | CI logs |

Once these five stabilize → rename to the `ai_sdlc.*` convention and feed a real observability stack.

---

*Next: tools & reference architecture → [`06-toolchain.md`](06-toolchain.md) · Back to [README](../../README.md)*
