# 06 · Toolchain & Reference Architecture

> A vendor-neutral translation of Microsoft's "AI-led SDLC" architecture combined with ai-sdlc.io's orchestration model: the end-to-end reference architecture, a per-stage tool selection table, the model-routing strategy, and CI/CD integration patterns. *(Tiếng Việt: [`../vi/06-toolchain.md`](../vi/06-toolchain.md))*

---

## 1. End-to-end reference architecture

```
┌─────────────────────────  SOURCES  ────────────────────────────────┐
│  Issues/tickets · Production incidents · Metrics out of band ·     │
│  Product ideas                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  PLAN · DESIGN  ──────────────────────────┐
│  intent.md ──► Spec engine (Spec Kit-style: /specify /plan         │
│  /tasks) ──► spec.md + plan.md + tasks (complexity 1–10)           │
│  ► DoR GATE (blocks not-ready issues)                               │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  BUILD  ──────────────────────────────────┐
│  Orchestrator (dispatch): pick DoR-passed task → allocate isolated │
│  worktree                                                           │
│      └─► Coding agent (CLI, inside sandbox/container)               │
│              · analyze repo · code + tests · 1 task = 1 PR          │
│              · feedback loop: run tests, self-fix in container      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  TEST · REVIEW  ──────────────────────────┐
│  Layer 1 (machines): ≥2 AI reviewers INDEPENDENT from the builder  │
│                + evals + SAST/dependency scans                     │
│  Layer 2 (humans): critical/regulated parts per routing            │
│  ► QUALITY GATES (advisory / soft / hard)                           │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  DEPLOY  ─────────────────────────────────┐
│  CI/CD · Triage agent (classifies build failures, attempts fixes)  │
│  ► DEPLOY GATE: hook holds the release for human approval           │
│  Progressive rollout: canary → increasing % (feature flags)         │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  MAINTAIN  ───────────────────────────────┐
│  Observability (metrics/logs/traces) · SRE agent (monitor,          │
│  diagnose, open fix PRs, propose rollbacks)                         │
│  ──► Findings ──► new Issues ──► new intent.md ──► (back to PLAN)   │
└──────────────────────────────────────────────────────────────────────┘
```

Architecture principles from the two sources: **one task, one branch, one PR**; **reviewers independent from the builder**; **every phase has its own feedback loop**; **humans always "in the loop" at approval gates**.

---

## 2. Tool selection by stage

The framework is vendor-neutral — each row has interchangeable options:

| Component | Role | Popular options (2026) |
|---|---|---|
| **Coding agent (CLI)** | Build: execute tasks | Claude Code · Codex CLI · Gemini CLI · OpenCode · Aider |
| **IDE agent** | Build: pair with humans (ai-assisted) | Copilot · Cursor · Windsurf |
| **Spec engine** | Design: spec → plan → tasks | GitHub Spec Kit · this kit's `spec.md`/`plan.md` templates + a CLI agent |
| **Orchestrator / pipeline agent** | Task dispatch, worktrees, fan-out | ai-sdlc framework (Apache-2.0) · custom GitHub Actions workflows · Claude Code hooks/subagents |
| **AI code review** | Test layer 1 | GitHub Copilot Code Review · CodeRabbit · Claude (GitHub Action) · Axolo — **run ≥2 from different families** |
| **CI/CD** | Deploy + run gates | GitHub Actions · Azure DevOps · GitLab CI · Jenkins |
| **Security scanning** | Tool-based quality gates | Semgrep · Snyk · SonarQube · GitHub Advanced Security |
| **Evals** | Continuous testing | promptfoo · OpenAI Evals · Braintrust · homegrown (pytest-style) |
| **Observability** | Maintain | New Relic · Datadog · Grafana/Prometheus + OpenTelemetry GenAI |
| **Model gateway** | Routing + accounting | Azure OpenAI · AWS Bedrock · OpenRouter · LiteLLM (self-host, usage ledger) |

Selection notes:
- **Reviewers must be cross-harness** vs the builder — if the builder is Claude Code, reviewers should be GPT or Gemini, and vice versa.
- A **model gateway with a usage ledger** is the precondition for the Economics metric group (`05`) to have data.
- Sandboxing: Docker/Podman covers most cases; container-per-task per the Microsoft model.

---

## 3. Model routing — which model for which phase

Normalized from the Microsoft article (field-proven) plus "model economics" principles:

| Phase | Model need | Reference configuration | Principle |
|---|---|---|---|
| **Spec / Plan (Design)** | High reasoning, controlled creativity | High-reasoning model, temperature ≈ 0.2, increased reasoning effort | Curb "imaginary code": think hard before writing; low temp avoids fabrication |
| **Implement (Build)** | Follow the plan, cost-efficient | Mid-tier model, temperature ≈ 0.1 | The plan exists — execution needs precision, not expensive deliberation |
| **Review (Test)** | Independent, deep critique | **2 models from different families**, high reasoning, in parallel | Independence = they catch each other's blind spots (same-family models share blind spots) |
| **Build-failure triage** | Fast, cheap | Light model | Mechanical classification — don't burn expensive models |
| **SRE / Maintain** | Long-chain causal analysis | High-reasoning model, long context | Correlating metrics ↔ commits requires chain reasoning |

Economics principles (from `05-metrics.md`): route the majority to **cheap models** by default, escalate only hard work to expensive ones; track `model_usage_mix`; set a **per-task budget cap** (auto-abort on breach, e.g. $50).

---

## 4. CI/CD integration patterns

### 4.1. Evals in the pipeline (Play 9)

```yaml
# Conceptual sketch — run on PRs AND when agent config changes
on:
  pull_request:
  push:
    paths: ["AGENTS.md", ".agent/**", "evals/**"]   # agent setup changed → rerun
jobs:
  evals:
    runs-in: sandbox-container
    steps:
      - run: evals run --suite core --fail-below 0.9   # quality gate (soft)
      - run: semgrep --error max                       # scan (hard: critical)
```

### 4.2. Layered review on PRs

```
PR opened
 ├─ (required) CI: build + test + lint + scan
 ├─ (required) Reviewer A (different family from builder) → scores + comments
 ├─ (required) Reviewer B (a third family) → scores + comments
 ├─ (per routing) Human review: medium+ tasks or sensitive paths
 └─ Merge gate: all checks green + approval + valid provenance
```

### 4.3. Hooks as pre-approval for sensitive actions (Play 11)

- Claude Code hooks / CI protected environments / deployment approvals: **actions are held until a person with the right role approves** — no "remember this choice" (one-time override, see `04`).
- Typical sensitive scopes: merge→main touching auth/payment, production deploy, data deletion, gate policy changes.

### 4.4. The Maintain loop: observability → issue

```
Alert (metric outside control band) → SRE agent: gather context
   (metrics + recent deploys + logs + traces)
 → classify: (a) open a fix PR itself (low-tier task, agent ≥ L2)
              (b) open an issue with analysis (medium+ task)
 → postmortem (if severity is high) → new intent.md → Plan
```

Typical integration: GitHub Actions running the SRE agent on a schedule/alert webhook (Microsoft's CodeWatcher/CodeReviewer model); New Relic/Datadog webhook → GitHub issue.

---

## 5. Recommended repo layout for an adopting project

```
your-project/
├── AGENTS.md                 # standard context for every agent (this kit's template)
├── .agent/
│   ├── skills/               # skills: review standards, domain conventions (Play 6)
│   └── policy/               # symlink/submodule to the central policy repo
├── docs/
│   └── intents/              # intent-2026-10-XXX-*.md (every intent versioned)
├── specs/
│   └── 2026-10-XXX-todo-api/ # spec.md + plan.md per unit of work
├── evals/
│   └── suites/               # eval cases run in CI
└── .github/
    ├── workflows/            # ci.yml (gates), evals.yml, sre.yml (maintain)
    ├── CODEOWNERS            # sensitive paths → mandatory reviewers
    ├── PULL_REQUEST_TEMPLATE.md
    └── settings.yml          # protected branches, required checks
```

---

## 6. Integration checklist when starting

- [ ] AGENTS.md at repo root, readable by every agent CLI; updated like code (via review)
- [ ] 1 task = 1 branch = 1 PR enforced (or at least a strict review convention)
- [ ] CI mandatory: build + test + lint + secret-scan before review
- [ ] ≥ 1 AI reviewer independent from the builder runs on every PR
- [ ] Production deploy behind an approval gate (protected environment)
- [ ] Observability has release-tagged metrics (so the Maintain loop can work)
- [ ] Usage ledger enabled at the model gateway (per-task costs)
- [ ] Policy (gates + autonomy) lives in a versioned repo, not scattered manual config

---

*Next: adoption roadmap → [`07-adoption.md`](07-adoption.md) · Back to [README](../../README.md)*
