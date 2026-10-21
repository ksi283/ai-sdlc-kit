# Portfolio Priority Scorecard: PocketLedger — internal money tracking

| Field | Value |
|---|---|
| **Initiative** | PocketLedger · **Sponsor/Owner**: Lan Nguyen |
| **Date** | 2026-10-22 · **Inputs**: 9 months of support tickets; 2 spreadsheet-corruption incidents; ops survey |
| **Competes with** | Team wiki revamp; SSO rollout phase 2 |

## Scores (0–3 per dimension)

| Dimension | 0 = | 3 = | Score | Evidence |
|---|---|---|:-:|---|
| **Strategic alignment** | serves no stated goal | directly advances a top company goal | **3** | "Reduce internal friction 20%" OKR; finance-close time +3h/month from spreadsheet reconciliation |
| **User demand** | no signal | strong, quantified demand | **3** | 214 tickets/9mo; survey: 68% of 150 staff want structured tracking |
| **Market / regulatory force** | none | deadline-bound or competitor gap | **1** | no external deadline; internal tool — mild force only |
| **Execution readiness** | unknown scope, no skills | spec-able now, team + agents fluent | **3** | plain web stack; 4–6 medium tasks; squad already in Walk stage |
| **Cost of delay / entropy** | waiting costs nothing | debt or risk compounds weekly | **2** | spreadsheet corrupted twice already; each incident ≈ 6h of manual repair |
| **Confidence in the above** | guesses | measured data | **2** | demand & readiness measured; effort estimate from limited calibration |

## Multiplicative result

```
score = 3 × 3 × 1 × 3 × 2 × 2 = 108   (max 729)
```

- **Any dimension = 0 → VETO** — none here
- score **< 100** (team threshold) → skip / park — 108 ≥ 100 → proceed
- **Confidence ≤ 1 → mandatory human review** — confidence 2, EM co-signed
- score ≥ threshold → queue for intent.md creation → [`intent.md`](intent.md)

| Result | Value |
|---|---|
| Computed score | **108 / 729** |
| Decision | **proceed → intent** |
| Decided by | EM + Lan Nguyen · 2026-10-22 |

## Notes

- Re-score triggers: a third spreadsheet corruption, survey shift, or security-policy change affecting financial data handling.
- The wiki revamp scored 54 → parked with re-entry condition "next quarter if doc-search metric worsens" — killing is a healthy output.
- Security Lead pre-consulted at this stage (financial data visible from the demand evidence) — cheap here, expensive later.
