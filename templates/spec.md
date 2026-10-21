# Spec: <feature or change name>

<!-- DESIGN STAGE TEMPLATE — produced in ONE working session with an agent,
     from intent.md. WHAT (requirements) is clearly separated from HOW (design).
     Delete the notes when using. -->

| Field | Value |
|---|---|
| **Originating intent** | `INT-YYYYMM-NNN` (link) |
| **Threat model** | link to [`threat-model.md`](threat-model.md) — REQUIRED if the intent's security screen flagged anything |
| **Status** | draft → reviewed → ready (passes DoR) |
| **Spec Reviewer** | <approving human — a person, not an agent> |
| **Model guidance** | Use a high-reasoning model at temperature ~0.2 in this phase (see docs/en/06-toolchain.md) |

## 1. Context

<2–5 sentences: current state of the relevant system, why this intent leads to this change. Link existing architecture/schema docs.>

## 2. Functional requirements

<!-- Every requirement gets an ID so tests and PRs can trace back to it. -->

| ID | Requirement | Acceptance criteria (measurable) |
|---|---|---|
| FR-1 | <what the system does> | <given X then Y happens, verified by Z> |
| FR-2 | … | … |

## 3. Non-functional requirements

| Type | Requirement |
|---|---|
| Performance | <e.g. p95 ≤ 200ms @ 100 rps> |
| Security | see SR-x table below — derived from the threat model, never generic |
| Observability | <metrics/logs/traces to be emitted> |
| Compatibility | <backward-compatible with API v1? migrations?> |
| Accessibility | <user-facing work: WCAG 2.2 AA — contrast, keyboard paths, labels> |

### Security requirements (SR-x — from the threat model, docs/en/08-security.md §3)

| ID | Requirement | Verified by |
|---|---|---|
| SR-1 | <e.g. passwords hashed with argon2id, never logged> | unit test |
| SR-2 | <e.g. every DB read/write scoped by the session owner> | authorization test matrix |

## 4. Design (HOW — agent proposes, human decides)

- **Architecture:** <short diagram/explanation; services/modules touched>
- **Data:** <schema/migrations>
- **API:** <endpoints/contracts>
- **Error & edge handling:** <timeouts, retries, idempotency>
- **Security:** <which components are sensitive → mandatory human review>

## 5. Test strategy

- Unit: <scope>
- Integration/E2E: <main scenarios>
- Evals (if agents write most of the code): <link to the evals plan — templates/evals.md>

## 6. Task breakdown

<!-- Every task: small enough for one agent run (≤ half a day); scored 1–10
     for routing per docs/en/03-org-autonomy.md section 4. -->

| # | Task | Complexity (1–10) | Mode (auto / ai-review / ai-assist / human) | Notes |
|---|---|:-:|---|---|
| T1 | <e.g. add migration for table X> | 3 | ai-with-review | |
| T2 | <e.g. switch auth flow to OIDC> | 8 | ai-assisted | needs the Spec Reviewer pairing |

## 7. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| <…> | <high/med> | <…> |

---

### Definition of Ready (DoR) — blocks dispatch if incomplete

- [ ] Every FR has measurable acceptance criteria
- [ ] The intent's non-goals have not been quietly expanded
- [ ] Every task ≤ half a day, has a complexity score and a working mode
- [ ] Test strategy stated (unit/integration/evals)
- [ ] Threat model attached & SR-x requirements listed (if the security screen flagged anything)
- [ ] User-facing FRs are Usability-Ready: backed by a tested prototype or an explicit measurement plan (docs/en/09-discovery-ux.md §5)
- [ ] Sensitive components (auth/payment/PII) flagged → mandatory human review
- [ ] Data migrations have a rollback plan
