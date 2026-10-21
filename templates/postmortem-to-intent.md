# Postmortem → New Intent: <incident name>

<!-- MAINTAIN STAGE TEMPLATE (Play 12) — the piece that closes the loop.
     Rule: when finished, it MUST produce a new intent.md (or explain why not). -->

| Field | Value |
|---|---|
| **Incident** | <INC-YYYYMMDD-NNN> · severity <S1–S3> |
| **Timing** | detected / recovered / total downtime |
| **Facilitator** | <person> · **Scribe**: <may be the SRE agent, signed off by a human> |
| **Related original intent** | `INT-YYYYMM-NNN` (if traceable) |

## 1. Timeline (data, not blame)

- HH:MM — <which alert fired, who/what saw it first>
- HH:MM — <which action, taken by whom/what>
- HH:MM — <recovery>

## 2. Impact

- Customers: <affected requests / SLA breaches>
- Business: <if measurable>
- Which metric left its band: <name + value + band>

## 3. Root cause (5-whys — find the system/process failure, not the person)

1. Why did it happen? → <…>
2. Why did that happen? → <…>
5. …root: <which process/tool/gate let it through — e.g. "no gate scanned for X", "spec missed an edge condition">

## 4. What worked?

<which gate partially blocked it / the SRE agent caught it early / rollback saved the day — record it to keep it>

## 5. Actions

| # | Action | Type | Owner | Gate/eval produced |
|---|---|---|---|---|
| A1 | <code fix — PR exists?> | fix | <person/agent> | EV-<n> regression |
| A2 | <add a gate/scan…> | prevention | <person> | gate `<id>` |
| A3 | <update AGENTS.md/runbook> | prevention | <person> | — |

## 6. → New intent (mandatory)

> If a preventive action is worth doing → open the intent below and link it in `docs/intents/`.

```markdown
# Intent: <name — e.g. "Block secrets from reaching adapter-layer logs">
ID: INT-YYYYMM-NNN · Owner: <person> · Origin: INC-YYYYMMDD-NNN
Problem: <1–2 sentences from section 3>
Evidence: <this incident + previous ones if any>
Goal: <metric/band> · Non-goals: <...>
```

- [ ] New intent created and approved → back to PLAN (the loop closes)

## 7. Does the agent's autonomy need review?

- [ ] No — the agent did not contribute to the cause
- [ ] Yes — agent <name> involved → trigger a review per the autonomy policy (docs/en/03-org-autonomy.md section 3.3)

## 8. Security incident? (addendum — docs/en/08-security.md §9)

Only when the incident involves an adversary (breach, attempted exploit, stolen credentials):

- Classification: <confidentiality / integrity / availability breach>
- Regulatory clock: <e.g. GDPR — 72h to the supervisory authority; started at HH:MM, due HH:MM>
- Disclosure owner: <named person> · template used: <link>
- Credential revocations done: <list + timestamps> — time-to-revoke: <duration>
- Threat model updated: <link to the revised threat-model.md>
