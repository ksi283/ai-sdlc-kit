# Threat Model: <feature/system name>

<!-- SECURITY TEMPLATE — run during DESIGN for every change that crosses a trust
     boundary or touches sensitive data/auth/payment. Lightweight and repeatable
     beats exhaustive and never-done. Every mitigation becomes either a security
     requirement (SR-x in the spec), a test, or a gate. -->

| Field | Value |
|---|---|
| **Spec / intent** | link + `INT-YYYYMM-NNN` |
| **Date / version** | YYYY-MM-DD · v1 |
| **Facilitator** | <person> · **Participants**: <dev + security + agent owner> |
| **Data classification** | <public / internal / confidential / restricted-PII> |
| **Review trigger** | any change to trust boundaries, auth, data flows, or agent tooling |

## 1. Scope & assets in play

<What is in scope for this change. List the assets worth protecting:>

- Asset: <user PII (names, emails)> — impact if compromised: <confidentiality breach, GDPR>
- Asset: <payment transaction integrity> — impact: <financial loss, fraud>
- Asset: <auth tokens> — impact: <account takeover>

## 2. Trust boundaries & data flows

```
<ASCII diagram. Mark trust boundaries with ║>

  Browser ──HTTPS──║── API Gateway ──║── Service A ──║── Database
                     ║                ║
                     ╚══ Agent sandbox (untrusted) ══╝
```

## 3. STRIDE per element

| Element (from diagram) | Threat | S | T | R | I | D | E | Risk (H/M/L) | Mitigation → control |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| API endpoint | forged requests | ✔ | | | | | | M | → SR-1: authn + input schema validation (test `auth.spec.ts`) |
| DB at rest | data theft | | | | ✔ | | | H | → SR-2: encryption at rest + column-level for PII |
| Service log | PII leakage | | | | ✔ | | | M | → SR-3: log masking rule (gate `no-secrets-in-logs`) |

*S = Spoofing, T = Tampering, R = Repudiation, I = Information disclosure, D = Denial of service, E = Elevation of privilege.*

## 4. Agentic threats (when agents build or operate this change)

Check all that apply — from OWASP Agentic AI / ASI guidance:

- [ ] **Prompt injection** — untrusted content (files, issues, PR descriptions, web pages) steering the agent → controls: untrusted-content marking, instruction/ data separation, approval gates on sensitive actions
- [ ] **Excessive tool access** — agent holds broader tool/credential scope than the task needs → controls: per-task scoped credentials, allowlist tools per AgentRole
- [ ] **Data exfiltration** — agent sends repo/secret content to external endpoints → controls: egress allowlist, sandbox network policy
- [ ] **Memory/poisoning persistence** — poisoned AGENTS.md/skills influencing future runs → controls: review-only changes to `.agent/**`, CODEOWNERS on agent config
- [ ] **Cascade/hallucinated actions** — agent invents an "urgent" instruction and escalates privileges → controls: escalation requires human approval, no self-granted rights
- [ ] **Supply chain** — agent adds a malicious/typo-squatted dependency → controls: dependency allowlist gate, lockfile mandatory, SBOM

## 5. Security requirements produced

<!-- These IDs go into spec.md §3 (non-functional requirements) and get tests. -->

| ID | Requirement | Verified by |
|---|---|---|
| SR-1 | All endpoints require authn; inputs validated against schema | unit + integration test |
| SR-2 | PII columns encrypted at rest | migration test + config check |
| SR-3 | No PII/secrets in logs | gate `no-secrets-in-logs` (hard) |

## 6. Residual risk & sign-off

- Accepted residual risks: <what we consciously accept, why, until when>
- Sign-off: <Security Lead> · Date: <YYYY-MM-DD>
- Re-review: <trigger or date — e.g. "on any change to auth", "quarterly">
