# 10 · Delivery Operations: Estimation, Versioning, Environments & Tech Debt

> The engineering-ops layer that keeps delivery predictable at AI speed: calibration-based estimation, versioning & release strategy, environment/IaC management, technical-debt governance, disciplined data migrations, and stakeholder reporting. *(Tiếng Việt: [`../vi/10-delivery-ops.md`](../vi/10-delivery-ops.md))*

---

## 1. Estimation — calibrate, don't guess

Complexity scoring (1–10, from `03`) becomes estimation by **calibrating it against measured history**:

| Tier | Score | Working mode | Effort calibration (initial, refine monthly) |
|---|:-:|---|---|
| Low | 1–3 | fully-autonomous | 0.5–2h agent time, ~0 human dev hours |
| Medium | 4–6 | ai-with-review | 2–8h agent time, 0.5–2h human (review/spec-fix) |
| High | 7–8 | ai-assisted | 1–3 days human-led with agent support |
| Critical | 9–10 | human-led | sized per case by the Spec Reviewer |

- **Calibration loop:** `task.completion_time` per tier (from `05`) replaces initial guesses; after ~30 tasks per tier your estimates become empirical.
- **Agent-specific distortion:** agent *generation* time is cheap — the real cost drivers are review iterations and gate failures. Estimate **total cycle time** (dispatch → merged), not coding time.
- **Estimation accuracy is a metric:** `|estimated − actual| / estimated` tracked per tier; a team consistently under-estimating medium tasks fixes the calibration table, not the individuals.
- **Spikes:** unknowns become spike tasks with a time-box and a knowledge output (never merged code) — see `09` §4.

## 2. Versioning & release strategy

- **Semantic versioning** for artifacts: breaking = major, feature = minor, fix = patch. Agents propose the bump in the PR; the merge gate validates it against the diff type.
- **API versioning policy:** explicit versions (`/v1/`, `v2/`) with a written deprecation policy: announce → dual-run (≥ 2 releases or 90 days) → sunset date enforced by a gate (`documentation-based`: deprecation notice required).
- **Release modes — pick per product, not per mood:**

| Mode | Fits | Notes |
|---|---|---|
| Continuous (deploy on green) | SaaS, strong gates, feature flags | Default target; only with Deploy gates from `04` in place |
| Release train (fixed cadence) | Multi-team dependencies, enterprise contracts | Work not ready slides to the next train — no exceptions mid-train |
| Scheduled batch | Regulated releases | Extra review window; gates + sign-offs stack |

- **Changelog automation:** release notes drafted by agents from the PR chain (intent → tasks → user-visible changes); humans edit tone, never compile lists by hand.
- **Feature-flag lifecycle:** flags have owners + expiry dates; "flag graveyard" is a tech-debt item (below) — a monthly gate report lists flags older than 90 days.

## 3. Environments & infrastructure-as-code

- **Environment matrix:**

| Env | Purpose | Who deploys | Data |
|---|---|---|---|
| sandbox (per task) | agent execution, tests | orchestrator, ephemeral | synthetic only |
| ephemeral preview | per-PR review env | CI, auto-destroyed | synthetic |
| staging | DAST, usability, release verification | pipeline | anonymized |
| production | users | pipeline behind approval gate | real |

- **IaC through the same lifecycle:** Terraform/K8s manifests are code — agents may write them, but they pass the **IaC scan gate** (`08` §4), plan-preview review (like plan mode), and protected apply with human approval for production state.
- **Config discipline:** config lives in versioned stores (not console clicks); drift detection alerts on manual changes; a monthly reconciliation report is the `reconciliation` trace from `04` applied to infrastructure.
- **Cost of environments:** preview-env auto-destroy (TTL ≤ 48h) and sandbox quotas (budget per task) keep the parallel-PR model from melting the cloud bill — monitored via the Economics metrics (`05`).

## 4. Technical-debt governance

AI churn (research: ~0.41 above human) makes debt accumulate *faster* unless governed:

1. **Debt register = intents:** every accepted debt item is a small `intent.md` tagged `debt`, with the cost-of-delay argument written down (not a TODO comment).
2. **Debt budget:** each sprint reserves capacity (start 20%) for debt intents chosen by scorecard; unused budget does not roll into feature work.
3. **Churn-triggered cleanup:** the anti-churn gate flags modules with 14-day churn above threshold → auto-drafts a debt intent ("module X rewritten 3× in 2 weeks — consolidation needed").
4. **Refactors as first-class tasks:** scored like any task; refactoring *drops* when AI adoption rises (25%→10%, research `01`) — treat a falling refactor rate as a leading indicator of debt pile-up, and schedule accordingly.
5. **Dependency refresh cadence:** monthly minor-version bumps (agent-executable, low complexity), quarterly major bumps with migration plans.

## 5. Data migrations (the disciplined pattern)

Every migration PR follows **expand → migrate → contract**:

1. **Expand:** additive schema change, backward-compatible, deployable independently (online DDL / `CONCURRENTLY`).
2. **Migrate:** dual-write or backfill job with progress metrics; verification counts (row deltas) reported in the PR; throttled, resumable.
3. **Contract:** remove old schema only after N verified clean days behind a flag; `down` path tested in CI before merge.

Gates already in place: `deploy-rollback-plan` (documentation-based, paths `migrations/**`) + human review via CODEOWNERS. **Never** bundle contract steps with feature work in one PR.

## 6. Stakeholder communication & reporting

- **Dashboards over decks:** the 4-panel dashboard (`05` §4.1) is the single status surface; leadership reviews it live, async by default.
- **Decision records:** ADRs from discovery (`09` §3) chain with intents — the full "why" of the product is queryable, and agents use it as context.
- **Commitment hygiene:** roadmaps split into commitments (contractual dates, from `11`) vs forecasts (probabilistic, from estimation calibration); never present a forecast as a commitment.
- **Escalation paths:** gate overrides, autonomy demotions and security incidents each have a named owner and channel (`04`, `08`) — stakeholders hear about risk from the dashboard, not the hallway.

## 7. Anti-patterns

| Anti-pattern | Symptom | Remedy |
|---|---|---|
| Story-point astrology | Estimates never touched by reality | Calibrated tier table + accuracy metric |
| Version anarchy | `v2-final-final` tags, breaking changes in "patch" | Semver gate + deprecation policy |
| Click-ops infra | Environments that only one person can reproduce | IaC-only changes + drift detection |
| Hero refactor quarters | Debt ignored 3 quarters, then a freeze to "clean up" | 20% debt budget + churn-triggered intents |
| Big-bang migrations | Weekend cutover, all hands on deck | Expand/migrate/contract, always |

---

*Related: [`03-org-autonomy.md`](03-org-autonomy.md) (complexity routing) · [`05-metrics.md`](05-metrics.md) (calibration data) · Back to [README](../../README.md)*
