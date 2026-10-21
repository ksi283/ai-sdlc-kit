# 08 · Security & DevSecOps

> Security of the **product** across the whole lifecycle — threat modeling, secure design, security testing, supply chain, secrets, vulnerability management, security incident response. This document closes the largest gap of v1.0. Security of the **agent platform** (sandbox, scoped credentials, prompt injection, reviewer independence) remains in [`04-gates-policy.md`](04-gates-policy.md) §4 — the two domains meet at the gates. *(Tiếng Việt: [`../vi/08-security.md`](../vi/08-security.md))*

---

## 1. Two security domains — don't mix them up

| Domain | Question it answers | Where |
|---|---|---|
| **Product security** (this doc) | Can attackers harm our software, our data, our users? | Here |
| **Agent-platform security** | Can the AI agents building/operating the software be abused? | `04` §4 |

In an AI-SDLC the two overlap at one critical point: **agents write most of the code, so product security controls must assume untrusted-ish input from fast, prolific authors.** That is exactly why 45%-flawed AI sample rates (research, `01`) demand the gates below.

---

## 2. Security activities across the six stages

| Stage | Security activity | Output |
|---|---|---|
| **Plan** | Security screen in the intent: does it touch PII/auth/payment/external boundaries? Data classification | `intent.md` constraint row |
| **Design** | **Threat model** for every change crossing a trust boundary; security requirements (SR-x) | [`templates/threat-model.md`](../../templates/threat-model.md) → spec §3 |
| **Build** | Secure-coding rules in AGENTS.md; secrets hygiene; dependency allowlist; SAST on every PR | AGENTS.md security section; CI |
| **Test** | Security gate battery: SAST/SCA/secret-scan/DAST/container-scan; security evals; fuzz on parsers | Gate results in the quality pipeline |
| **Deploy** | Hardening checklist; signed artifacts + SBOM; release security gate; config review | Release audit trail |
| **Maintain** | Vulnerability management (intake→triage→SLA→patch); security incident response; disclosure | Vuln register; security postmortem → intent |

Rule of thumb: **security work is scheduled work, not heroics** — every SR-x has a test, every gate has an owner, every vuln has an SLA.

---

## 3. Threat modeling (Design stage)

- **When:** any change that crosses a trust boundary, touches authn/authz, moves PII, or changes agent tooling. Small changes → 30-minute lightweight pass; new subsystem → half-day session.
- **How:** STRIDE per data-flow element (diagram → boundary → threat → risk → mitigation → control), plus the agentic threat checklist. Template: [`templates/threat-model.md`](../../templates/threat-model.md).
- **Output contract:** every mitigation becomes either (a) a security requirement `SR-x` in the spec with a test, or (b) a gate in `quality-gates.yml`. A threat model that produces no controls is theater.
- **Cadence:** re-open on trigger (boundary/auth/data-flow change) or quarterly for critical systems.
- **Who:** Spec Reviewer facilitates; Security Lead signs off; the agent can draft the diagram from the spec — humans validate trust boundaries.

---

## 4. Security testing & the gate battery

| Control | Catches | Tier (start → target) | Notes |
|---|---|---|---|
| **SAST** (static) | Injection, unsafe patterns in source | soft → **hard** (critical) | Semgrep/Sonar; per-PR; custom rules for your stack |
| **SCA / dependency audit** | Known CVEs in dependencies | soft → **hard** (critical) | With license check; enforce lockfiles |
| **Secret scanning** | Committed credentials | **hard** day one | Also scan history on onboarding |
| **DAST** (dynamic, vs staging) | Runtime flaws — auth bypass, misconfig | advisory → soft (critical/high) | Pre-release against staging |
| **Container/image scan** | Base-image CVEs, config drift | advisory → soft | Match to registry policy |
| **IaC scan** | Insecure Terraform/K8s | advisory → soft | Same pipeline as app code |
| **Fuzzing** | Parser/protocol crashes | advisory | Feeds regression tests from crashes |
| **Security evals for agents** | Agent code violating security conventions | advisory → soft | Eval cases: "does the agent leak data to logs / add unlisted deps / weaken authz" |
| **Pen-test** | What automation misses | External cadence: internet-facing ≥ 1×/year; before major releases | Freshness gate (advisory) |

**AI-specific point:** because agents refactor and regenerate code quickly, drift matters more than in human SDLCs — run the battery on **every PR**, not weekly. Cost is manageable with model-mix routing (cheap triage, deep analysis only on findings).

---

## 5. Supply chain security

1. **Lockfiles mandatory** — reproducible builds; gate `quality-no-new-dependency-unlisted` (soft).
2. **Dependency allowlist** in `AGENTS.md`; anything new goes through a human review (novelty check: maintainer history, download curve, transitive deps).
3. **SBOM per build** (CycloneDX/SPDX), attached to the release — gate `security-sbom-required` (soft). You cannot patch what you cannot inventory.
4. **Artifact signing & provenance** — SLSA-style: build from source in your CI, sign artifacts (e.g. sigstore/cosign), attest the build. Target SLSA level 3 for critical systems; start with signed containers.
5. **Private registry mirror / proxy** — pin external packages through an internal mirror; block direct pulls from agent sandboxes.
6. **Agent-specific:** dependency additions by agents are **diffed against the allowlist by a gate**, not trusted from the plan (prompt injection can weaponize "add this helpful package").

---

## 6. Secrets & data protection

- **Secrets:** single source of truth (vault/KMS); short-lived, scoped tokens everywhere — humans and agents alike; rotation schedule; the only long-lived credentials left should be the break-glass ones, sealed and audited.
- **No real secrets in sandboxes** — fake values in test envs; secret-scan gate hard from day one.
- **Data classification:** four tiers (public / internal / confidential / restricted-PII) assigned at Plan (intent) and enforced by rules: encryption at rest + in transit for confidential+; column-level or tokenization for restricted; log masking rules per tier.
- **Data minimization by design:** specs must justify every PII field collected ("we store it because…"), retention periods explicit, deletion paths testable (right-to-erasure tests are regression tests).
- **Privacy is a gate, not a promise:** PII-touching changes require the threat model + Security Lead review (CODEOWNERS path rule).

---

## 7. Identity & access — humans and agents

| Subject | Rules |
|---|---|
| Humans | SSO + MFA; RBAC by role (`release-manager`, `security-lead`…); quarterly access review; no shared accounts |
| Agents | **First-class identities** — every agent has its own service identity bound to its AgentRole; credentials scoped + short-lived (TTL, revoke-on-complete); permission = f(autonomy level) — an L1 agent structurally cannot hold merge rights |
| Service-to-service | mTLS or signed requests inside the perimeter; no implicit trust of "the network" |
| Review | Monthly: credential ledger vs. granted scopes; the usage ledger (from `04`) is the evidence |

The autonomy system (`03`) is itself an access-control system: **demotion to L0 is an immediate revocation of write capability** — faster than most human deprovisioning.

---

## 8. Vulnerability management (Maintain stage)

Flow: **intake → triage → SLA → patch → verify → learn**

1. **Intake:** continuous scanners (SCA/image/DAST), advisories (CVE feeds), responsible-disclosure inbox, pen-test reports, and SRE-agent findings.
2. **Triage:** severity = CVSS **× exploitability in your context** (internet-facing? auth required? data at stake?). A CVSS-9 behind an internal VPN may rank below a CVSS-7 on the login page.
3. **SLA & escalation:**

| Severity | Fix SLA | Escalation on breach |
|---|---|---|
| Critical (exploitable, sensitive data) | **7 days** | hard gate blocks deploys with the vuln present; Security Lead notified daily |
| High | 30 days | EM notified weekly |
| Medium | 90 days | register review monthly |
| Low | best effort / batched | — |

4. **Exceptions:** recorded with justification + expiry date + compensating control; auto-expire (no eternal risk acceptances). Gate `security-vuln-sla-critical` (hard) enforces the critical SLA on deployable artifacts.
5. **Verify & learn:** every fix gets a regression test; every escaped-to-production vuln gets a postmortem → new intent (the `02` loop applies to security, too).

---

## 9. Security incident response

Distinct from operational incidents: **adversarial, legal-clock-driven.**

| Phase | Actions |
|---|---|
| **Detect** | Alerts routed 24/7; SRE agent does first triage (correlate with deploys/diffs) but **cannot contain alone** — human authorization required for isolation steps |
| **Contain** | Pre-approved playbooks: revoke credentials, isolate hosts, disable feature flags, rotate keys; agent-executable steps are pre-declared in the runbook |
| **Eradicate / recover** | Patch + verify; the audit trails from gates and provenance (`04`) double as forensics — every action already has who/what/when/why |
| **Disclose** | Regulatory clocks run (e.g. GDPR: 72h to supervisory authority); pre-drafted notification templates; disclosure policy decided at the portfolio level, not mid-incident |
| **Learn** | Security postmortem (blameless, like ops) → threat-model update → new evals/gates → new intent |

**Drill quarterly** (tabletop at minimum): stolen agent credential, poisoned dependency, prompt-injection in a PR. The question is not *if* — it is *how fast you notice and revoke*.

---

## 10. Security metrics

| Metric | Definition | Target (start) |
|---|---|---|
| Vuln MTTR (critical) | Detect → fix verified | < 7d |
| Escape rate | Vulns found in production / all found | < 10% trending down |
| Scan coverage | % PRs running the full battery | 100% |
| Secret leaks caught pre-merge | count (should be > 0 early — that's the gate working) | — |
| Security eval pass rate | Agent security-behavior evals | ≥ 0.95 |
| % releases with SBOM + signature | Supply-chain attestations | → 100% |
| Time-to-revoke | Incident → credential revocation | < 1h |

Report these next to the delivery metrics (`05`) — security posture is a first-class dashboard panel, not an annual audit slide.

---

## 11. Roles & responsibilities (extends `03`)

| Role | Security duties |
|---|---|
| Security & Compliance Lead | Owns the gate battery, threat-model sign-off, vuln SLA policy, incident commander |
| Agentic Engineer | Security evals, sandbox/egress policies, secure defaults in AGENTS.md, credential plumbing |
| Spec Reviewer | Forces the security screen in intents; hosts threat modeling |
| Every developer | Ships SR-x tests; treats security findings as defects, not paperwork |
| Agents | Layer-1 security reviewers (continuous scanning, draft threat models from specs) — **never** the approver of their own output (cross-harness, `04` §4.5) |

---

## 12. Standards mapping

| Standard | Where it lands in this kit |
|---|---|
| OWASP Top 10 / ASVS | SR-x requirements derived per feature; DAST/SAST coverage |
| OWASP Agentic AI (ASI) | `04` §4 agent threats + this doc's eval section |
| NIST SSDF (SP 800-218) | Practices PS/PO/PW/RV map to stages in §2 |
| SLSA | Supply-chain provenance levels (§5) |
| ISO 27001 / 27701 | Gate audit trails; privacy/data handling (§6) |
| GDPR / EU AI Act | Data minimization, 72h clock, AI transparency via attribution |

---

## 13. Starter checklist

Day one (before any of this feels heavy):
- [ ] Secret-scan hard gate; lockfiles mandatory; SAST+SCA on every PR (soft)
- [ ] Security screen row in `intent.md` template (PII/auth/payment → threat model required)
- [ ] One threat-model session on the most-exposed feature — using the template
- [ ] Vuln register exists (a spreadsheet is fine) with severity + SLA columns

Mature (within 2 quarters):
- [ ] Full battery incl. DAST + image/IaC scans; SBOM + signing on releases
- [ ] Agent security evals in CI; quarterly pen-test for internet-facing
- [ ] Security incident playbooks drilled; time-to-revoke measured
- [ ] Security metrics panel live next to delivery metrics

---

*Related: [`04-gates-policy.md`](04-gates-policy.md) (agent zero-trust, enforcement tiers) · [`02-framework.md`](02-framework.md) (the six stages) · [`templates/threat-model.md`](../../templates/threat-model.md) · Back to [README](../../README.md)*
