# 04 · Quality Gates, Policy & Security

> Layer 3 of the framework: the gate system controlling quality at each lifecycle checkpoint, the 3-tier enforcement model (advisory / soft / hard), the evaluation pipeline, zero-trust safety rules for agents, and the compliance mapping. Product security (threat modeling, security testing, supply chain, vulnerability management) has its own document: [`08-security.md`](08-security.md). *(Tiếng Việt: [`../vi/04-gates-policy.md`](../vi/04-gates-policy.md))*

---

## 1. The gate map across the lifecycle

```
 PLAN ────► DESIGN ────► BUILD ────► TEST ────► DEPLOY ────► MAINTAIN
           │            │           │          │
        ┌──┴───┐    ┌───┴──┐   ┌────┴───┐  ┌───┴────┐
        │ DoR  │    │Build │   │Quality │  │Deploy  │
        │ gate │    │Ready │   │ gates  │  │ gates  │
        └──────┘    └──────┘   └────────┘  └────────┘
           │            │           │          │
        not-ready    PR failing  PR not      unsafe
        issue        build       reviewed    release
        → NOT        → NOT       → NOT       → NOT
        dispatched   reviewed    merged      deployed
```

| Gate | Where | What it blocks | Example rules |
|---|---|---|---|
| **Intent-Ready** | Plan → Design | Intents lacking goals/metrics | Must have: problem, evidence, success metric, owner |
| **DoR** (Definition of Ready) | Design → Build | Tasks not ready for agents | Measurable acceptance criteria; task ≤ half a day; non-goals explicit; test strategy stated |
| **Build-Ready** | Build → Test | PRs not ready for review | Build passes; tests cover the change; PR ≤ autonomy limit; provenance complete |
| **Quality gates** | Test → Deploy (merge) | Code not trusted enough to merge | Coverage ≥ 80%; zero critical scan findings; ≥ 1 human reviewer (medium+ tasks); evals in band; AI attribution valid |
| **Deploy gates** | Deploy → Maintain | Unsafe releases | Release approved via hook; rollback runbook exists; monitoring wired to new metrics; canary ≤ 5% |

---

## 2. Three enforcement tiers

Inherited from ai-sdlc.io's Sentinel/Gatekeeper model — **rule logic is decoupled from strictness**; the same rule can run at different tiers depending on context:

| Tier | Behavior on failure | Use for | Example |
|---|---|---|---|
| **Advisory** | Warn + dashboard, does NOT block | New policies being validated, style guidelines | "Coverage should be ≥ 70%" in month one |
| **Soft-mandatory** | Blocks, unless a person with the right role overrides with justification (audited, non-renewing) | Day-to-day governance | "1 reviewer required" — a lead may override in a crunch |
| **Hard-mandatory** | Blocks unconditionally, **nobody may override, not even admins** | Security, compliance, production safety | "No secrets in code", "Human review required for auth-flow changes" |

> Golden rule: **hard-mandatory is only for genuinely non-negotiable things** — overuse turns gates into an off-switch for the whole pipeline. Start at advisory, promote to soft when stable, hard only once data proves the rule catches real problems.

### 2.1. Evaluating an action (Kubernetes admission-control style)

```
1. AUTHENTICATION  → is this a human, an agent (which AgentRole), or a bot/service?
2. AUTHORIZATION   → does the agent's autonomy level permit this action?
3. MUTATING GATES  → auto-enrich the request: labels, provenance, default reviewers
4. VALIDATION      → schema/structure of the request
5. ENFORCING GATES → run all QualityGates; a single hard failure blocks the action
6. ADMISSION       → allow, OR reject with the full list of failed gates
```

### 2.2. Override rules (soft-mandatory only)

- Check the overrider's role (`requiredRole`).
- Justification mandatory when `requiresJustification: true` (default on).
- **Immutable** audit entry: gate, actor, role, justification, timestamp, resource.
- An override applies to **a single evaluation** — the next cycle fails again unless the root cause is fixed; no "permanent" overrides.

---

## 3. The five gate rule types

| Type | Mechanism | Example |
|---|---|---|
| **Metric-based** | Numeric threshold comparison | coverage ≥ 0.80; churn ≤ threshold; eval pass-rate ≥ 0.9 |
| **Tool-based** | Run a tool, compare findings by severity | SAST/dependency scan: 0 critical, ≤ 5 medium; audit pass |
| **Reviewer-based** | Reviewer count/structure | ≥ 1 reviewer (medium+); 2 reviewers if touching auth/payment; reviewer ≠ PR author |
| **Documentation-based** | Docs must exist when files change | API change → CHANGELOG + docs updated; new module → README |
| **Provenance-based** | Traceability of origin | Every PR carries AI/human attribution (model, promptHash, timestamp); AI-authored → human-review record mandatory |

Advanced options: write rules in Rego (OPA) for cross-resource checks, or CEL for lightweight expressions; reference external policies instead of embedding.

**Stricter thresholds for AI:** the same gate can set different thresholds by `authorTypes` (e.g. AI code needs 2 reviewers, human code 1; AI code blocked from security-sensitive paths below L2) — no duplicated gate definitions.

---

## 4. Zero-trust safety for agents

Context: 45% of sampled AI code in tests had security flaws (ai-sdlc.io); reviewers must be independent from implementers — "the review runs where the implementer cannot reach."

### 4.1. Sandbox & isolation

- Agents execute in **dedicated containers/sandboxes**, one **isolated worktree + branch** per task (`ai-sdlc/issue-{n}` per the ai-sdlc.io convention, or `feat/task-{id}`).
- Self-contained test environments (Docker) — no network/staging access unless explicitly granted.
- No interactive commands, no GUI — everything declared.

### 4.2. Scoped, time-bound credentials

- Grant **scoped, short-lived** credentials: short TTL, auto-revoked on task completion; least privilege per AgentRole.
- Never long-lived tokens in agent environments.
- Every credential use lands in the usage ledger.

### 4.3. Provenance & attribution

Every artifact (PR, review, deploy) carries mandatory metadata: `model`, `tool` (agent/harness), `promptHash` (SHA-256), `timestamp`; optional: `humanReviewer`, `reviewDecision`. The `requireAttribution` gate validates before admission. **Goal: every line of code answers "which human/machine created it, from which prompt, approved by whom."**

### 4.4. Agent-workflow-specific security

| Risk | Mitigation |
|---|---|
| **Prompt injection** (malicious code/comments steering the agent) | Mark untrusted content; agents never obey instructions embedded in files/issues/PR descriptions; separate read permission from action permission |
| **Secrets leaking in PRs** | Hard gate: secret-scan; sandboxes hold no real secrets (fake values in tests) |
| **Supply chain** (malicious dependencies) | Lockfiles mandatory; dependency + license audit gate; agents may not add dependencies outside the allowlist |
| **Data exfiltration** | Egress filtering from sandboxes; exports only via declared channels |
| **Merge/deploy privilege abuse** | Hooks hold sensitive actions; agents below L3 cannot merge; production deploys always signed by a human |
| **Fake reviews** (a model approving its own output) | Cross-harness review mandatory — reviewers from a different vendor/harness than the implementer |

### 4.5. Proof of Execution

Every review conclusion must bind to **the exact diff reviewed** (hash) executed by an **independent harness** — defeating "approve without review" and "review something other than what was merged."

---

## 5. Recommended starter gates (for a new team)

See the ready-made YAML: [`templates/quality-gates.yml`](../../templates/quality-gates.yml). Philosophy in brief: *start at advisory for 2–4 weeks → promote to soft-mandatory → promote to hard only once internal data proves the rule catches real issues.*

| Gate | Rule | Start tier | Target tier |
|---|---|---|---|
| DoR | Spec has acceptance criteria + non-goals | soft | soft |
| DoR | Tasks carry a complexity score | advisory | soft |
| Build | Build + lint + unit tests pass | hard (existing CI) | hard |
| Build | PR size per autonomy level (L1 ≤ 200…) | advisory | soft |
| Quality | Coverage diff ≥ 80% of new lines | advisory | soft |
| Quality | SAST/dependency: 0 critical | soft | **hard** |
| Quality | ≥ 1 human reviewer (medium+ tasks) | soft | soft (ALWAYS soft to keep a crunch path) |
| Quality | Attribution complete | advisory | soft |
| Quality | Evals in band (if evals exist) | advisory | soft |
| Deploy | Human approval via hook | **hard** | **hard** |
| Deploy | Rollback runbook exists | advisory | soft |

---

## 6. Compliance mapping

If your organization falls under regulatory scope, gates are where obligations become code:

| Framework | Core requirement | Mechanism in this AI-SDLC |
|---|---|---|
| **EU AI Act** | Risk tiering; AI transparency | Complexity routing; attribution + provenance on every PR |
| **NIST AI RMF** | Govern · Map · Measure · Manage | Policy layer (Govern); complexity scoring (Map); 5 metric groups (Measure); autonomy + gates (Manage) |
| **ISO/IEC 42001** | AI management system (PDCA) | The whole framework is a Plan-Do-Check-Act loop: intent→deploy→metrics→new intent |
| **ISO 12207** | Software lifecycle processes | The 6 stages + artifacts map directly |
| **OWASP ASI** | Agentic system security | Section 4 (sandbox, credentials, injection, exfiltration) |
| **CSA Agentic Trust** | Zero-trust for agents | Autonomy L0–L3 + reviewer independence |

---

## 7. The "policy-as-code" completeness checklist

Before calling it done, your organization should have:

- [ ] A central repo holding `quality-gates.yml` + `autonomy-policy.yml` (reviewed and versioned like code)
- [ ] Every gate has: an owner (who answers when it wrongly blocks), an enforcement tier, thresholds, and a business reason
- [ ] Immutable audit trails for every override/promotion/demotion/agent-merge
- [ ] Monthly review of fail/override rates per gate — a gate failing 100% or 0% of the time both deserve a look
- [ ] A DRILL: simulate a demotion event (who does what, how fast?) — the ai-sdlc.io spec requires demotion notification within ~1s

---

*Next: measurement → [`05-metrics.md`](05-metrics.md) · Back to [README](../../README.md)*
