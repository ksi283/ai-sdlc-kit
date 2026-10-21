# 01 · AI-SDLC Research Synthesis

> Foundational document: it synthesizes and compares the three primary references, captures the context data, and distills them into **7 design requirements** — the direct input for the AI-SDLC framework in `02-framework.md`. *(Tiếng Việt: [`../vi/01-research-synthesis.md`](../vi/01-research-synthesis.md))*

---

## 1. Context: what does the data say?

These numbers shape the entire design of this kit (sources: ai-sdlc.io spec citations, 2024–2026):

| # | Data point | Practical meaning |
|---|---|---|
| 1 | 85% of devs use AI tools; ~41% of GitHub code is AI-generated | AI is the default — the question is no longer "whether" but "how to govern" |
| 2 | Only 1 in 5 organizations has mature agent governance | A large gap between usage and control |
| 3 | 45% of AI-generated test-case code contains security flaws | A dedicated review/scan layer is non-negotiable |
| 4 | Refactoring rate fell 25% → 10%; code churn rose 5.5% → 7.9% | AI produces code fast but degrades structural health if uncontrolled |
| 5 | METR RCT (2025): experienced devs were **19% slower** with AI while believing they were **20% faster** | Measure objectively — perception cannot drive decisions |
| 6 | DORA: each +25% AI adoption correlates with **−7.2%** delivery stability | Speed trades for stability without gates |
| 7 | Faros AI: PRs merged +98%, PR size +154%, review time +91% | **The bottleneck shifts from writing code to reviewing it** |
| 8 | Baselines: only ~27–30% of AI PRs are accepted unmodified; AI churn ~0.41 above human | Set realistic expectations: agents do not one-shot |

**Core conclusion of all three sources:** *code generation is no longer the bottleneck. Verification (review, testing, security) and governance (who may do what, on what evidence) are.*

---

## 2. Source 1 — Anthropic: "The AI-native SDLC Playbook" (Claude Academy, 8/2026)

### Spirit
Not a tooling-first rewrite of the SDLC, but a **human-controlling-agents** perspective: "the work around the code" (process, review, docs, approvals) is where AI accelerates the most. Aimed at engineering/platform/security leads in large organizations that already run Claude Code + Git + CI.

### Structure: 6 stages × 12 "plays"
Each play follows 5 uniform sections: *what changes → getting started → implementation → governance → measurement*. Plays form an explicit **dependency graph**; six plays have no prerequisites and can start immediately:

| Stage | Key plays | Core artifact |
|---|---|---|
| **Plan** | Capture as intent.md | `intent.md` — short, version-controlled: what, why, under which constraints; human-readable and machine-actionable |
| **Design** | Requirements + design merged into one agent working session | Spec (requirements + design) |
| **Build** | Plan mode as default; CLAUDE.md; Skills; parallel sessions + subagents | `CLAUDE.md`/`AGENTS.md`, skills, plan |
| **Test** | Give the agent a feedback loop; **continuous evals in CI** | Eval suite, rerun when agent setup changes |
| **Deploy** | AI reviews every PR; **hooks as approval gates** | Layered PR review; hooks hold releases until a human approves |
| **Maintain** | Close the loop on metrics | Metric breaches control band → **new intent.md** → back to Plan |

### Strengths / limitations
- ✅ Most practical: each play is deployable, with a dependency graph for picking a starting point.
- ✅ "Humans remain accountable for judgment" throughout; layered review — humans only review regulated/critical code.
- ✅ Makes the lifecycle an explicit loop (Maintain → Plan).
- ⚠️ Tied to the Claude Code ecosystem (easily generalized — see `06-toolchain.md`).
- ⚠️ As Waydev noted: lacks a systematic **measurement** layer — this kit adds it in `05-metrics.md`.

---

## 3. Source 2 — Microsoft: "An AI-led SDLC" (Azure Blog, 2026)

### Spirit
A **working end-to-end reference architecture** — "the beginning of a fully agentic, end-to-end SDLC" — where agents write most of the code, humans set direction and supervise, and everything feeds back.

### Architecture flow (cause-effect path)
```
GitHub Repo ──► Spec Kit (spec → plan → tasks)          [DESIGN STAGE]
                    │  configure: planner model, temp 0.2,
                    │  higher reasoning effort to curb "imaginary code"
                    ▼
            Coding Agent (Codex CLI)                     [BUILD STAGE]
                    │  · analyzes repo & remembers "codebase evolution"
                    │  · tests inside Docker containers
                    │  · branch + PR per EVERY task
                    ▼
            AI Code Review                              [TEST STAGE]
                    │  · Claude Sonnet + GPT-5.1 (high) — TWO
                    │    independent models review together, score 1–5
                    │  · AI can apply fixes directly
                    ▼
            Human Review (selective) ──► Merge
                    ▼
            CI/CD + Triage Agent (classifies build failures) [DEPLOY]
                    ▼
            SRE Agent (CodeWatcher/CodeReviewer          [MAINTAIN STAGE]
                    │  running on GitHub Actions, acting autonomously)
                    ▼
            Observability (New Relic) ──► Findings ──► new Issues
                    ▲                                       │
                    └───────── feedback loop ◄──────────────┘
```

### Notable details
- **Model routing per phase** (full table in `06-toolchain.md`): high-reasoning planner + low temperature; mid-tier implementer; **two different-family models** as reviewers catching each other's blind spots.
- **Branching discipline:** 1 task = 1 branch = 1 PR.
- **Agent fixes during review:** AI reviewers can fix code directly; humans review selectively.
- **Proactive SRE agent:** not just alerting — it opens fix PRs, triages failures, decides rollbacks.
- **Humans always "in or on the loop."**

### Strengths / limitations
- ✅ Names concrete technologies, models, parameters — usable as a technical blueprint.
- ✅ Proves **multi-model routing per phase** and the **production → issue feedback loop**.
- ⚠️ Azure/GitHub-oriented; needs translation to a neutral stack (done in `06-toolchain.md`).
- ⚠️ Governance/autonomy described lightly — no evidence-based permissioning like Source 3.

---

## 4. Source 3 — AI-SDLC Framework (ai-sdlc.io, Apache-2.0)

### Spirit
An **open governance specification**, not a tool: "Kubernetes for your development process" — declare the desired SDLC state in YAML; controllers reconcile actual activity toward the declaration. Sits above MCP (agent↔tool), A2A (agent↔agent) and AGENTS.md (per-repo instructions).

### Four architecture layers
1. **Specification** — 5 resource types (JSON Schema validated, versioned `v1alpha1 → v1beta1 → v1`): `Pipeline`, `AgentRole`, `QualityGate`, `AutonomyPolicy`, `AdapterBinding`.
2. **Adapter** — Terraform-style provider contracts (IssueTracker, SourceControl, CIPipeline, CodeAnalysis, Messenger, DeploymentTarget): swapping Jira ↔ Linear changes one field.
3. **Policy** — OPA/Gatekeeper-style 3-tier gates + CSA ATF autonomy levels.
4. **Runtime** — Kubernetes-style reconciliation loop; A2A Agent Cards.

### Five operational pillars
| Pillar | Role |
|---|---|
| **DoR gate** (Definition of Ready) | Pre-dispatch gate: issues that are not "ready" are not dispatched |
| **Autonomous orchestrator** | Picks the next issue, allocates an isolated worktree, runs the two-tier pipeline |
| **Two-tier pipeline** | Dispatch tier + execution tier (implement → review → deploy) |
| **Cross-harness review** | Reviewed by agents from a **different harness than the implementer** (3 parallel or staged) |
| **Operator TUI** | Where a human watches the flow and answers questions the system cannot decide |

Plus trust concepts: **Proof of Execution** ("a review ran against this exact diff"), **reviewer independence** ("the review ran where the implementer cannot reach"), **zero-trust PR verification** (untrusted contributors cannot escalate, exfiltrate or forge), **usage ledger** (every model call is accounted).

### Autonomy levels L0–L3 (summary — details in `03-org-autonomy.md`)
| Level | Name | Can do | Approval | PR limit |
|---|---|---|---|---|
| 0 | Observer/Intern | Read-only, produces no artifacts | Every action | — (min 2 weeks) |
| 1 | Junior | Draft PRs, comments, run tests | Every change | ≤ 200 lines (min 4 weeks) |
| 2 | Senior | Branches/PRs, tests/lint/build | Security-critical only | ≤ 500 lines (min 8 weeks) |
| 3 | Principal | Merge non-critical, deploy staging | Architecture-level only | ≤ 1000 lines |

- **Least Autonomy principle:** agents always start at L0/L1; autonomy is **earned through evidence** (pr-approval ≥ 0.90, rollback ≤ 0.02, zero security incidents…), never granted by configuration.
- **Automatic, immediate demotion** on serious security incidents (to L0) or rollback-threshold breaches (one level) + cooldown.
- **Complexity routing 1–10:** low → fully-autonomous; medium → ai-with-review; high → ai-assisted; critical → human-led.

### Five metric groups (summary — details in `05-metrics.md`)
Task Effectiveness · Human-in-the-Loop · Code Quality · Economic Efficiency · Autonomy Trajectory — extending OpenTelemetry GenAI semantic conventions, prefix `ai_sdlc.*`.

### Compliance mapping
EU AI Act (risk tiers → routing; transparency → provenance) · NIST AI RMF (Govern/Map/Measure/Manage) · ISO 42001 (PDCA) · OWASP ASI · CSA ATF.

### Strengths / limitations
- ✅ Deepest governance: time-bound, evidence-based autonomy with demotion — aligned with international standards.
- ✅ Vendor-neutral, agent-agnostic (adapter layer).
- ⚠️ Currently `v1alpha1/Draft` — some RFCs still shipping; treat it as a **thinking model**, not a rigid product.

---

## 5. Cross-comparison of the three sources

| Criterion | Anthropic Playbook | Microsoft AI-led SDLC | AI-SDLC Framework |
|---|---|---|---|
| Focus | Humans + modular plays | Concrete end-to-end architecture | Governance & specification |
| Maturity | Battle-tested, easy start | Actually running (blueprint) | Open standard (draft) |
| Stages | 6 (Plan→Maintain) | Full loop (spec→SRE) | implement→review→deploy + gates |
| Human-in-loop | Judgment & approvals | Supervision + selective review | DoR, controlled overrides |
| Autonomy | Not explicit | Moderate (agent self-fixes) | **L0–L3 earn-by-evidence** |
| Measurement | Per-play measurement | Product observability | **5 standardized metric groups** |
| Review | Layered, AI as layer 1 | Independent multi-model | **Cross-harness + Proof of Execution** |
| Vendor | Claude | Azure/GitHub/OpenAI | Neutral |

**The three sources complement each other:** Anthropic for *how to start and the culture*, Microsoft for *technical architecture and model routing*, ai-sdlc.io for *governance, autonomy and measurement*.

---

## 6. Lessons → 7 design requirements for our AI-SDLC kit

| # | Design requirement | Origin |
|---|---|---|
| R1 | **Intent-first:** every change starts from a versioned intent.md, readable by both humans and machines | Anthropic (Plan) |
| R2 | **Spec-driven, WHAT/HOW split:** specs are gate-checked (DoR) before coding; use Spec Kit-style tooling | All three (Microsoft, ai-sdlc.io, Anthropic Design) |
| R3 | **Verification-first:** invest the most in multi-model (cross-harness) review, CI evals, security scanning — that is the new bottleneck | Anthropic + Microsoft + Faros data |
| R4 | **Earned autonomy:** grant permissions on metric evidence (L0–L3) with automatic demotion; start at the lowest sufficient level | ai-sdlc.io (AutonomyPolicy) |
| R5 | **Complexity routing:** not every task goes to an autonomous agent — score 1–10, four working modes | ai-sdlc.io + Microsoft |
| R6 | **Closed loop:** Maintain spawns a new intent when a metric leaves its control band — the lifecycle is a loop, not a line | Anthropic (Maintain) + Microsoft (SRE→issues) |
| R7 | **Objective measurement + economics:** a 5-group metric dashboard, AI/human attribution, per-task cost accounting — because perception is off by up to 39 points | ai-sdlc.io (metrics) + METR + Waydev |

These seven requirements are realized in `02-framework.md` (7 corresponding principles) and the component documents.

---

## 7. Further reading

- **GitHub Spec Kit** — spec-driven workflow tooling (`/specify`, `/plan`, `/tasks`) for the Design stage: <https://github.com/github/spec-kit>
- **METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"** — the RCT behind the 39-point perception gap.
- **DORA Report** — AI adoption vs. delivery stability correlation.
- **CSA Agentic Trust Framework** (2/2026) — zero-trust standard for agents; basis of the autonomy levels.
- **NIST AI RMF · ISO/IEC 42001 · EU AI Act** — compliance frames mapped in `04-gates-policy.md`.
- **OWASP Agentic Security Initiative (ASI)** — agent security checklist.
- Extended commentary on the Anthropic playbook: [Draftt — Extending the playbook](https://www.draftt.io/post/extending-anthropics-ai-native-sdlc-playbook-what-it-takes-to-make-maintain-autonomous) · [Waydev — A missing layer: measurement](https://waydev.co/anthropics-ai-native-sdlc-playbook-has-a-missing-layer-measurement) · [Mabl — Fixing the Verification Gap](https://www.mabl.com/blog/fixing-the-verification-gap-in-the-adlc)

---

*Internal links: [`02-framework.md`](02-framework.md) · [`03-org-autonomy.md`](03-org-autonomy.md) · [`04-gates-policy.md`](04-gates-policy.md) · [`05-metrics.md`](05-metrics.md) · [`06-toolchain.md`](06-toolchain.md) · [`07-adoption.md`](07-adoption.md) · [Back to README](../../README.md)*
