# 07 · Adoption Roadmap

> From "finished reading" to "a team actually running the AI-SDLC": readiness assessment, the four-stage Crawl → Walk → Run → Scale path, choosing your first play, safe starter policies, skills to train, and the anti-patterns to avoid. *(Tiếng Việt: [`../vi/07-adoption.md`](../vi/07-adoption.md))*

---

## 1. Readiness assessment (one meeting)

Answer honestly — the more "Not yet", the slower you should go in Crawl:

| # | Question | Ready when… |
|---|---|---|
| 1 | Does the repo have automated CI (build+test) on PRs? | Every PR auto-runs CI; main branch protected |
| 2 | Clear branch/PR conventions? | 1 change = 1 PR is habit |
| 3 | Does anyone use an agent CLI daily? | ≥ 2 people fluent (Claude Code/Codex…) |
| 4 | Do you measure lead time / review time? | Numbers exist (even manual) |
| 5 | Is anyone accountable for the "AI platform"? | A concrete name (even part-time) |
| 6 | Does leadership accept "speed traded for measurable control"? | Not just a "% of code written by AI" KPI |

The most common barrier per the data (`01`): only 1 in 5 organizations has mature governance — most start below standard, **and that is normal**.

---

## 2. The four stages

```
 CRAWL (weeks 1–4)     WALK (months 2–3)    RUN (months 4–6)       SCALE (months 7+)
 new habits, old tools spec-driven + gates   agent orchestration   org-wide
 ─────────────────►   ─────────────────►    ─────────────────►    ─────────────────►
 6 no-prereq plays    + DoR/quality gates   + autonomy L1→L2      + platform team
 1 pilot squad        2–3 squads            + SRE agent           + central policy
 agent = assistant    agent = doer          + model routing       + TCO dashboard
```

### Stage 1 · CRAWL — "New habits, old tools" (weeks 1–4)

**Goal:** change working habits; no new infrastructure yet.

| Do | Play | Done when |
|---|---|---|
| Every change starts with `intent.md` (even 5 lines) | Play 1 | 100% of last sprint's PRs trace to an intent |
| Write `AGENTS.md` for the pilot repo | Play 4 | The agent answers build commands/conventions correctly without explanation |
| Agents present a plan before editing (plan mode) | Play 5 | No more "agent changed course" PRs |
| Give agents a feedback loop (run tests, self-fix in a container) | Play 8 | "Agent delivered non-running code" incidents drop visibly |
| Install hooks holding sensitive actions (if your tools support it) | Play 11 | Nobody merges to production without a human |

**Scorecard:** 1 pilot squad, 2–4 weeks, collecting the 5 starter metrics in `05-metrics.md` section 5.

### Stage 2 · WALK — "Standardize specs + gates" (months 2–3)

**Goal:** quality before speed — build Layer 3 (the trust foundation).

- Roll out the **DoR gate** (Play 3): not-ready issues are not coded.
- **Spec-in-one-session** (Play 2) + task breakdown scored 1–10 (`03` section 4).
- The **starter quality gates** (`04` section 5, `templates/quality-gates.yml`): advisory first, promote gradually.
- **Evals in CI** (Play 9) for agent-heavy areas.
- **Skills** packaging review standards/domain conventions (Play 6).
- Start attribution: mandatory AI/human PR labels.

**Done when:** override rate < 10%; every PR has attribution; coverage diff ≥ 80% (advisory trending right).

### Stage 3 · RUN — "Agents orchestrate, humans supervise" (months 4–6)

**Goal:** build Layer 2 (orchestration).

- **Layered multi-model review** (Play 10): ≥ 2 independent AI reviewers; humans only for critical parts.
- **Formal AutonomyPolicy** (`templates/autonomy-policy.yml`): promote the pilot agent L1→L2 on metric evidence (`03` section 3.2).
- **Model routing** per phase (`06` section 3) + per-task budget caps.
- **Subagents/parallel sessions** for independent tasks (Play 7).
- **SRE agent + the Maintain loop** (Play 12): alert → classify → issue/PR → new intent.
- **Close the metrics loop** (Play 12): control bands defined in intents; at least one real intent born from a production metric.

**Done when:** ≥ 1 complete chain "production incident → SRE agent → fix PR → new intent"; the first agent reaches L2 on evidence.

### Stage 4 · SCALE — "Org-wide" (months 7+)

- An agentic platform team serving multiple squads (`03` section 6): central policy, adapters, shared dashboards.
- Many agents at mixed autonomy levels; periodic evidence-based promotion/demotion.
- TCO dashboard for leadership; model-mix optimization.
- Formal compliance mapping if in regulatory scope (`04` section 6).
- Quarterly drills: demotion events / platform outages (chaos-style).

---

## 3. Picking your first play (if you read nothing else)

Six no-prerequisite plays: **1 · intent.md**, **4 · AGENTS.md**, **5 · plan-mode-first**, **8 · feedback loop**, **11 · approval hooks** (+ skills if AGENTS.md exists).

Pick by your team's symptom:

| Symptom | First play |
|---|---|
| Lots of output, unclear why / scope creep | **1 · intent.md** |
| Agent breaks conventions, asks repeatedly | **4 · AGENTS.md** |
| Agent edits recklessly, PRs hard to review | **5 · plan-mode-first** |
| Delivered code doesn't run | **8 · feedback loop** |
| Fear of losing merge/deploy control | **11 · hooks** |
| Review backlog is the bottleneck | **10 · layered review** (needs 4 first) |

---

## 4. Safe starter policy (day-one defaults)

Default to **generous with humans, strict with agents** — widen with evidence:

1. Every agent starts at **L1** (draft PRs; all merges through a human).
2. Complexity scoring: medium+ always human-reviewed; critical never autonomous.
3. The only day-one hard gates: **CI pass + secret-scan + human approval before deploy**.
4. Token/cost budget per task with a cap (e.g. $50) — abort on breach.
5. No long-lived credentials in agent environments.
6. The 5 starter metrics (`05` section 5) collected from week one — no expansion decision without data.

---

## 5. Humans: skills & change management

| Group | Skills to build | Fast training |
|---|---|---|
| Devs | Reading specs over reading code; writing intents/acceptance criteria; steering agents (prompts, plan mode, escalations) | Two-week pairing: one agent-fluent + one newcomer; internal "play of the week" |
| Tech leads | Task complexity scoring; architecture review over line review; gate design | One workshop using `03` + `04` on the team's real PRs |
| EM / PM | Reading dashboards; understanding earned autonomy; setting control bands | 30-minute weekly dashboard review with the Agentic Engineer |
| AppSec | Agent threat modeling (injection, exfiltration, supply chain); provenance | Review the `04` section 4 checklist on the pilot repo |

The most important change message: **AI does not remove human accountability — it replaces mechanical human work.** The "pure typing" role shrinks; the "define the right problem + verify the right outcome" role grows.

---

## 6. Anti-patterns and remedies

| # | Anti-pattern | Symptom | Remedy |
|---|---|---|---|
| 1 | **Autonomy by decree** — granting high agent rights because "we trust the tech" | Repeated incidents, nobody can explain why the agent was allowed | Earned autonomy L0–L3 + automatic demotion (`03`) |
| 2 | **Speed-washing** — KPIs are only "% of code AI wrote" | Speed up, stability down (DORA −7.2%) | The trio KPI: effectiveness × quality × cost (`05`) |
| 3 | **Vibe-coding to main** — no gates, agents commit straight | High churn, hotfix chains | 1 task = 1 PR + mandatory CI + layered review |
| 4 | **Spec theater** — specs written for show, agents ignore them | Rework > 2 iterations/PR | A real DoR (blocks dispatch) + the spec as the agent's source of truth |
| 5 | **One model reviewing itself** | Systemic blind spots never caught | Mandatory cross-harness review (`06`) |
| 6 | **Dead AGENTS.md** — written once, drifting from reality | Agents keep "misremembering" conventions | Treat AGENTS.md as code: convention changes ship with a file change |
| 7 | **Gate stacking** | Override rate > 10%, the team resents gates | Monthly review: 0%/100% gates → rewrite or delete |
| 8 | **Broken loop** — production alerts pile up, no intents born | The question in `02` section 6 is unanswerable | Mandatory postmortem→intent after high-severity incidents |
| 9 | **Removing humans** — cutting human review for "full automation" | Business/ethical errors machines can't catch | Keep humans on critical paths; 2-minute escalations |

---

## 7. Quick FAQ

**— Must all 6 stages be in place to call it an AI-SDLC?**
No. This kit is modular: start with one play. But note: automating only Build without matching Test/Deploy is anti-pattern #3.

**— Does a small team (3–5) need formal autonomy levels?**
Use the light version: one CONTRIBUTING line — "agents may only draft PRs; humans merge" — IS L1. What matters is the earn-by-evidence principle, not the paperwork.

**— How fast are results?**
Habits (Crawl): 2–4 weeks. Measurable quality (Walk): 1 quarter. Evidence-backed autonomy (Run): 2+ quarters. Faster usually means skipped steps — and the DORA/METR data shows the outcome.

**— Use this for greenfield or legacy systems?**
Both, but legacy should start with AGENTS.md + a feedback loop (helping agents understand the legacy), while greenfield should start with intent.md + spec-driven from the first commit.

---

## 8. The "mature AI-SDLC organization" checklist

- [ ] Every change traces to a versioned intent
- [ ] DoR blocks junk issues before agents touch them
- [ ] Every PR passes layered review with AI reviewers independent from the builder
- [ ] AI/human attribution on every PR; secret-scan is a hard gate
- [ ] Production deploys always behind human approval (hook)
- [ ] A 5-group metrics dashboard someone reviews weekly
- [ ] At least one agent promoted to a higher level **on evidence**, with a demotion having occurred (or a drill)
- [ ] ≥ 1 "metric out of band → new intent" chain in the last 3 months

*All boxes ticked → you are running the spirit of all three reference sources.*

---

*End of the framework docs. See also: [templates](../../templates/) · [end-to-end example](../../examples/mini-todo-api/) · [README](../../README.md)*
