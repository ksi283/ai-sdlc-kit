# Portfolio Priority Scorecard: <initiative name>

<!-- PORTFOLIO TEMPLATE — multiplicative scoring adapted from the ai-sdlc.io
     PriorityPolicy model: a single zero VETOES the whole initiative; a low-but-
     nonzero score drags the total down. Score quarterly or on trigger. -->

| Field | Value |
|---|---|
| **Initiative** | <name> · **Sponsor/Owner**: <person> |
| **Date** | YYYY-MM-DD · **Inputs**: <evidence links — metrics, tickets, research> |
| **Competes with** | <other candidate initiatives this cycle> |

## Scores (0–3 per dimension)

| Dimension | 0 = | 3 = | Score | Evidence |
|---|---|---|:-:|---|
| **Strategic alignment** | serves no stated goal | directly advances a top company goal | | |
| **User demand** | no signal | strong, quantified demand (tickets/usage) | | |
| **Market / regulatory force** | none | deadline-bound (compliance) or competitor gap | | |
| **Execution readiness** | unknown scope, no skills | spec-able now, team + agents fluent | | |
| **Cost of delay / entropy** | waiting costs nothing | debt or risk compounds weekly | | |
| **Confidence in the above** | guesses | measured data | | |

## Multiplicative result

```
score = alignment × demand × force × readiness × delay × confidence   (max 729)
```

- **Any dimension = 0 → VETO** (do not proceed; record why)
- score **< threshold** (team-set, e.g. 100) → skip / park
- **Confidence ≤ 1 → mandatory human review** before any funding
- score ≥ threshold → queue for intent.md creation (Plan stage)

| Result | Value |
|---|---|
| Computed score | |
| Decision | proceed → intent / park / skip / veto |
| Decided by | <EM + Owner> · Date |

## Notes

- Re-score on trigger: a metric leaves band, a competitor ships, a compliance date moves.
- Killing an initiative is a normal, healthy output — park it with a re-entry condition, not shame.
