# 03 · Organization, Roles & Autonomy

> Who does what in the AI-SDLC: new human roles, responsibilities per stage (RACI), the L0–L3 "earned by evidence" autonomy system, and complexity-based work routing. *(Tiếng Việt: [`../vi/03-org-autonomy.md`](../vi/03-org-autonomy.md))*

---

## 1. The work-assignment principle

Two axes decide "who does this work":

```
            HIGH risk / complexity
                  │   human-led
                  │   (agent only assists with lookups)
                  │
  ai-with-review │  ai-assisted
  (AI builds,    │  (human leads,
   human approves)│   AI suggests)
                  │
                  │   fully-autonomous
                  │   (L2–L3 only, low-tier tasks,
LOW risk / complexity     post-hoc audit)
```

1. **By task complexity** (routing 1–10) — section 4.
2. **By agent autonomy level** (L0–L3, earn-by-evidence) — section 3.

The two axes are independent: an L3 agent still may not take "critical" tasks (scored 9–10); a low-complexity task still needs human approval when the agent is at L1.

---

## 2. Humans: new roles and RACI

### 2.1. The roles

| Role | Main responsibilities in AI-SDLC | Traditional equivalent |
|---|---|---|
| **Owner / Author** | Signs the intent, decides scope & success metrics | PO / requester |
| **Spec Reviewer** | Approves specs + DoR; decides trade-offs; scores task complexity | Tech lead / analyst |
| **Agentic Engineer** ⭐ new | Designs & operates the agent pipeline: `AGENTS.md`, skills, evals, gates, model routing; an "engineer of the agent system" rather than a typist | Evolved senior dev |
| **Platform Engineer** | Infrastructure: adapters (repo/CI/tracker), sandbox, credentials, dashboards | DevOps/Platform |
| **Security & Compliance Lead** | Defines hard gates, audit trails, provenance, compliance mapping (ISO 42001, NIST RMF, EU AI Act) | AppSec + GRC |
| **Engineering Manager** | Owns the AutonomyPolicy: promotion/demotion reviews by metrics; handles overrides | EM |
| **Operator** (as-needed hat) | Watches the flow via TUI/dashboard, answers questions the system cannot decide (escalations) | Elevated on-call |

> The **Agentic Engineer** is an emerging profession (ai-sdlc.io calls it "a strategic architect of intelligent delivery systems") — fluent in feedback loops, orchestration and policy, not just code.

### 2.2. RACI by stage

R = does the work, A = accountable/final call, C = consulted, I = informed.
(**AE** = Agent — the AI executing part of the work; the other letters are humans.)

| Activity | Owner | Spec Rev. | Agentic Eng. | Plat. Eng. | Sec Lead | EM | AE |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Write & sign intent.md | **A/R** | C | I | – | I | I | R (draft) |
| Approve spec + DoR | C | **A** | C | I | C | I | R (drafts) |
| Write code + tests (per task) | I | – | C | – | – | – | **R** |
| Maintain `AGENTS.md`/skills | I | C | **A/R** | C | C | I | – |
| Layer-1 review (AI, multi-model) | – | I | C | – | C | – | **R** |
| Layer-2 review (human, critical) | I | **A/R** | R | – | **R** | I | – |
| Merge / deploy approval | I | C | C | R | C (hard gate) | I | R (triage) |
| Operate SRE agent | I | – | C | R | C | I | **R** |
| Autonomy promotion/demotion review | I | C | C | I | C | **A** | – |
| Postmortem → new intent | **R** | C | R | C | C | **A** | R (data) |

Principle P4 holds: **the A column is always human** — agents may be R in many places, never A.

---

## 3. Agent autonomy: L0–L3

Standard adopted from the ai-sdlc.io spec (CSA ATF + Knight-Columbia lineage), condensed.

### 3.1. Level definitions

| | **L0 · Observer** | **L1 · Junior** | **L2 · Senior** | **L3 · Principal** |
|---|---|---|---|---|
| **May do** | Read everything; produces no artifacts | Draft PRs, comments, run test suites | Branches + PRs, run test/lint/build | L2 + merge non-critical + deploy to **staging** |
| **Needs approval** | Every action | Every change before execution | Only security-critical parts | Only architecture-level changes |
| **PR limit (recommended)** | – | ≤ 200 lines | ≤ 500 lines | ≤ 1000 lines |
| **Minimum time at level** | 2 weeks | 4 weeks | 8 weeks | None (continuous validation) |
| **Default working mode** | Observe/learn | ai-assisted → ai-with-review | ai-with-review | fully-autonomous (low/medium tasks) |
| **Mental model** | "Read-only intern" | "Junior: every PR approved" | "Senior: autonomous, sensitive parts reviewed" | "Principal: runs within domain, validated after" |

**Least Autonomy principle (mandatory):** agents always start at L0/L1; the system must **reject** configurations with an initial level > L1. "Autonomy is earned through demonstrated reliability, never granted through configuration."

### 3.2. Promotion criteria (ALL must hold simultaneously)

| Criterion | L1→L2 | L2→L3 |
|---|:-:|:-:|
| PR approval rate (current window) | ≥ 0.90 | ≥ 0.95 |
| Rollback rate | ≤ 0.02 | ≤ 0.01 |
| Average review iterations per PR | ≤ 1.5 | ≤ 1.5 |
| Security incidents caused | = 0 | = 0 |
| Production incidents caused | = 0 | = 0 |
| Coverage maintained | ≥ 0.80 | ≥ 0.80 |
| Minimum tasks at current level | per policy (e.g. 50) | per policy |
| Time at current level | ≥ 4 weeks | ≥ 8 weeks |
| Human approval | EM + Security Lead sign | EM + Security Lead sign |

Only **current-level** performance counts — prior-level history does not. Reviews are periodic (e.g. weekly), with notification and explicit approval awaited.

### 3.3. Automatic & immediate demotion

| Event | Action | Cooldown |
|---|---|---|
| Serious security incident caused by/exploiting the agent | **To L0** | 4 weeks |
| Access attempt outside granted permissions | **To L0** | 4 weeks |
| Rollback rate > 5% in window | Down one level | 2 weeks |
| Quality degradation two consecutive review cycles | Down one level | 2 weeks |

During cooldown: promotion reviews pause, task counters reset to zero, and **notification is mandatory** (which agent, from which level to which, triggered by what, for how long).

### 3.4. Example policy declaration

Ready to use: [`templates/autonomy-policy.yml`](../../templates/autonomy-policy.yml).

---

## 4. Complexity-based routing (1–10)

### 4.1. Scoring

Every task in `plan.md` gets an integer score 1–10. Scoring sources: static estimation (size/#files/#systems touched), agent assessment, or task history. Who scores? **The Spec Reviewer decides** (AI proposes).

Point-raising criteria: touches PII/identity data, touches payment/auth flows, non-backward-compatible schema changes, external system dependencies, architectural decisions required, no existing tests.

### 4.2. The routing table

| Tier | Score | Mode | AI does | Humans do |
|---|:-:|---|---|---|
| Low | 1–3 | **fully-autonomous** | Everything; L2+ agents only | Post-hoc audit (spot-check) |
| Medium | 4–6 | **ai-with-review** (default) | All execution | Approve output before merge |
| High | 7–8 | **ai-assisted** | Suggests, drafts, looks up | Leads, decides each step |
| Critical | 9–10 | **human-led** | Information support only | Owns everything; agent MUST NOT change anything autonomously |

Safety rule: routing is **decided by humans**, never by an agent downgrading itself; a "routing compliance" gate double-checks this (see `04-gates-policy.md`).

### 4.3. Examples

| Task | Score | Mode | Why |
|---|:-:|---|---|
| Fix a UI typo + test | 2 | fully-autonomous | Near-zero risk, easy to verify |
| Add a CRUD endpoint with a new schema | 5 | ai-with-review | Touches API + migration, clear acceptance criteria |
| Switch the auth mechanism to OIDC | 8 | ai-assisted | Security + external IdP dependency |
| Replace the payment system's DB engine | 10 | human-led | Critical: money data + hard rollback |

---

## 5. Human-in-the-loop: three intervention types

| Type | Mechanism | Use when |
|---|---|---|
| **Human-approval gate** (before) | A hook/gate holds the action until a person approves | Merge, deploy, data deletion, policy changes — anything sensitive |
| **Escalation** (during) | The agent hits a decision beyond its permissions/confidence → stops and asks | Baked into AgentRole: "when unsure → ask, don't guess" |
| **Controlled override** (after) | A person with the right role may bypass a soft-mandatory gate, justification required, audited; **never auto-renews** | A gate is wrongly blocking and speed matters — but the next run blocks again |

Escalation design rule: *one agent question must carry enough context for a human to answer in < 2 minutes* (relevant diff, what it tried, options it weighed).

---

## 6. Suggested team topology

- **Starting out (≤ 2 squads):** no dedicated team needed — each squad has 1–2 people wearing the Agentic Engineer hat; Platform & Security are org-wide shared roles.
- **At scale:** form a **central agentic platform team** (owning gates, adapters, dashboards, model routing for the org) per Team Topologies' platform-team model; squads consume "AI-SDLC as a service".
- Avoid: every squad inventing its own policies from scratch → inconsistent, hard to audit cross-team; use a central policy repo (see `templates/quality-gates.yml`).

---

*Next: gates & policy → [`04-gates-policy.md`](04-gates-policy.md) · Back to [README](../../README.md)*
