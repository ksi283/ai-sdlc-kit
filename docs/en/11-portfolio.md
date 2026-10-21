# 11 · Portfolio, Capacity & Vendor Management

> The layer above the lifecycle: deciding which intents deserve to exist (prioritization), what the organization can actually deliver (capacity), and how to govern external tools, models and vendors without lock-in. *(Tiếng Việt: [`../vi/11-portfolio.md`](../vi/11-portfolio.md))*

---

## 1. Position — the lifecycle's upstream valve

```
 PORTFOLIO (this doc)
   what gets funded ──► DISCOVERY (09) ──► PLAN (intent) ──► the 6-stage loop (02)
        ▲                                                        │
        └──────────── kill / expand decisions ◄── delivery evidence ─┘
```

Every framework below produces its evidence from delivery metrics (`05`) — portfolio decisions in an AI-SDLC are as data-driven as the pipeline itself.

## 2. Prioritization — multiplicative scoring

Adapted from ai-sdlc.io's PriorityPolicy: dimensions multiply, so **one zero vetoes**, and middling scores drag hard. Template: [`templates/priority-scorecard.md`](../../templates/priority-scorecard.md).

| Dimension | Ask | Scored 0–3 from |
|---|---|---|
| Strategic alignment | Does it advance a stated company/team goal? | strategy doc |
| User demand | Is demand quantified? | tickets, usage, research (`09`) |
| Market / regulatory force | Deadline or competitive gap? | compliance calendar, market scan |
| Execution readiness | Is it spec-able now, with current skills/agents? | feasibility screen (`09` §4) |
| Cost of delay / entropy | Does waiting compound pain? | debt register, churn data |
| Confidence | How much of the above is measured vs guessed? | evidence quality |

- **Decision rule:** any 0 → veto · product < threshold (team-set, e.g. 100/729) → park · confidence ≤ 1 → mandatory human review before funding.
- **Cadence:** re-score on trigger (metric out of band, competitor ships, compliance date moves) — not just quarterly ritual.
- **Kill decisions are healthy:** park with a written re-entry condition. Zombie initiatives burn the autonomy budget agents could use elsewhere.

## 3. Capacity planning — measured, not wished

- **Throughput is empirical:** tasks/week per tier from `05` metrics, discounted by the human-review capacity of the current autonomy mix. A team of 5 with L1 agents and 2 available reviewers has a *review-bandwidth* ceiling, not a coding ceiling (Faros: review time +91% — the constraint is real).
- **WIP limits:** max concurrent tasks per squad = review capacity × iteration budget; queue visible on the Flow panel. Autonomous fan-out (`06` Play 7) only within WIP.
- **Mix planning:** as agents earn L2/L3, review bandwidth frees up — capacity planning shifts quarterly with the autonomy trajectory (`05` group 5).
- **Forecasting:** probabilistic — "80% of medium tasks complete within 3 days" (from calibration, `10` §1) instead of deterministic dates; commitments reserved for contractual cases.

## 4. Roadmap hygiene

- **Themes over feature-dates:** quarterly themes, per-initiative forecasts underneath; dates attach to compliance deadlines and external promises only.
- **Buffer rule:** reserve 15–20% for Maintain-born intents (incidents, security, debt) — they *will* arrive; an unbuffered roadmap treats its own feedback loop as a surprise.
- **Portfolio review cadence:** monthly (60 min): scorecard re-scores, capacity vs WIP, kill/park/expand calls, vendor spend line.

## 5. Vendor, model & tooling governance

| Concern | Policy |
|---|---|
| **Model selection** | Per-phase routing (`06` §3) chosen by evidence: capability on **your** evals (run the eval suite per candidate), cost per task, latency, data terms. Re-evaluate quarterly — model quality moves fast |
| **No single-vendor lock** | The cross-harness principle doubles as insurance: builder + reviewers from different families means one vendor outage degrades you, not stops you. Model gateway abstraction (`06` §2) keeps switching to a config change |
| **Data governance** | DPA review before any provider sees repo/PII data; sandbox egress rules (`08` §5) apply to model calls; training-use opt-outs documented per vendor |
| **License compliance** | License scan gate for dependencies; tool licenses reviewed (which agent CLI terms allow commercial repo use) |
| **Spend governance** | Usage ledger (`05` group 4) is the source of truth: per-squad budgets, alerts at 90%, model-mix optimization as a standing agenda item |
| **Evaluation lab** | New tools/models run a fixed 2-week trial on a fork of your eval suite with a written verdict — adoption is a decision, not a hype response |
| **Exit strategy** | Every critical tool has a documented replacement path (the adapter pattern, `06` §2, exists exactly for this); vendor lock-in is a portfolio risk, reviewed annually |

## 6. Anti-patterns

| Anti-pattern | Symptom | Remedy |
|---|---|---|
| loudest-voice-first | roadmap = last meeting's winners | Multiplicative scorecard, evidence-linked |
| Capacity by optimism | "AI will 10× us" plans | Measured throughput × review bandwidth |
| Zombie initiatives | 40% "almost done" forever | Kill decisions with re-entry conditions |
| Model fandom | Tool choices by vendor evangelism | Eval-lab verdicts on your own suite |
| Shadow AI spend | Provider bills surprise finance | Usage ledger + squad budgets |

---

*Related: [`09-discovery-ux.md`](09-discovery-ux.md) (what gets discovered) · [`05-metrics.md`](05-metrics.md) (the evidence) · [`06-toolchain.md`](06-toolchain.md) (gateway & adapters) · Back to [README](../../README.md)*
