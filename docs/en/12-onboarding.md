# 12 · Installation & Onboarding — Handing the Kit to Another Person

> The answer to: *"If this kit is handed to another developer or team member, will they
> know how to use it? Can they self-serve and build their own app?"* — this document is
> the hand-off contract. A new member should reach "my app is running with gates green"
> in under an hour, without asking anyone anything. *(Tiếng Việt: [`../vi/12-onboarding.md`](../vi/12-onboarding.md))*

---

## 1. Who gets what (the three hand-off levels)

| Level | What they receive | What they can do |
|---|---|---|
| **L-Read** | Read access to the kit repo | Understand the framework; review intents/PRs |
| **L-Build** ⭐ | Kit repo + a fresh project repo created from it | Run the whole lifecycle on **their own app**; install skill packs; use templates |
| **L-Maintain** | Everything + write access to the kit repo | Change templates/policy/docs; review others' work |

Most hand-offs are L-Build. The rest of this document is the L-Build path.

## 2. Prerequisites (5 minutes)

- [ ] Git + a GitHub account
- [ ] **Node ≥ 22.13** (`node --version`) — runs the example app and its 22-test gate battery
- [ ] **Python ≥ 3.9** — only if you install skill packs (the `ui-ux-pro-max` search engine)
- [ ] Any AI coding agent CLI you already use (Claude Code, Codex, …) — the kit is agent-agnostic

## 3. First 30 minutes — "hello, gates"

```bash
# 1. Get the kit (clone, or "Use this template" if your org published it as one)
git clone https://github.com/ksi283/ai-sdlc-kit.git && cd ai-sdlc-kit

# 2. Read exactly two documents (≤ 40 minutes):
#    docs/en/02-framework.md   — the whole process (principles, 6 stages, gates)
#    docs/en/07-adoption.md    — how to start without boiling the ocean

# 3. Run the reference app and its gate battery — proof the environment works:
cd examples/money-web-app/app
npm install && npm test        # expect: 22/22 pass
npm start                      # → http://localhost:3000 — register, add transactions
```

If `npm test` is green, your machine is ready. Nothing else needs installing.

> **Verification log.** The mechanical path above (init → check 10/10 → first intent from
> the scaffolded template) was executed as an uncoached-member simulation on 2026-10-22:
> scaffold + wiring check complete in under 5 seconds, intent filled from
> `docs/templates/intent.md` without leaving the scaffolded tree. One day-0 trap was found
> and fixed: the scaffolded CI workflow now skips its test step until `package.json`
> exists, so a fresh project's first push is green — red always means *your* tests failed.

## 4. First 60 minutes — start YOUR app

1. Scaffold your project with the kit CLI (zero dependencies; also works via
   `npx github:ksi283/ai-sdlc-kit …` for repo members):

   ```bash
   # from a clone of the kit:
   node <kit>/cli/ai-sdlc-kit.mjs init my-app --skills intent-review --agent claude
   # or straight from GitHub (every command needs the npx prefix):
   npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --agent claude
   # or install the global command once and drop the prefix:
   npm install -g github:ksi283/ai-sdlc-kit && ai-sdlc-kit init my-app --skills intent-review --agent claude
   ```

   This creates `AGENTS.md`, `docs/templates/` (intent, spec, plan, evals, threat-model),
   `docs/intents/`, `specs/`, `evals/`, `policy/` (gates + autonomy), `.github/`
   (PR template + CODEOWNERS + CI), and wires skill auto-activation into `AGENTS.md`.
   Then verify the wiring: `ai-sdlc-kit check my-app` (exit 1 = something missing).
2. Manual fallback (what the CLI automates): `git init` + copy the starter files yourself —
   [`templates/intent.md`](../../templates/intent.md), [`templates/spec.md`](../../templates/spec.md),
   [`templates/AGENTS.md`](../../templates/AGENTS.md), [`templates/plan.md`](../../templates/plan.md).
3. Write your first `intent.md` (≤ 1 page, with the security screen filled).
4. Walk Design → Build with your agent: spec in one session, DoR checklist, then one task.
5. Install an optional skill pack when you need it (not before) — see [`skills/README.md`](../../skills/README.md):
   external packs install via their own pinned installer (`npx ui-ux-pro-max-cli@2.15.0 init --ai claude`),
   kit-authored skills via `skills/install.sh intent-review <project-dir> --ai claude`;
   either way the installer wires **auto-activation** into your project's `AGENTS.md`, so
   agents proactively route matching work to the pack.
6. Before your first merge, port the gate battery: copy `examples/money-web-app/app/tests/`
   patterns into your own tests, wire CI (see `.github/workflows/tests.yml` in the kit).

### Then: your first feature, stage by stage (the self-serve proof)

The 60 minutes above set the repo up; this runbook builds your first real feature in
**your own app** — one pass per stage, each with a concrete "done" test. This is the
exercise that answers "can I build an app of my own choosing with this kit?":

| Stage | Do (in your app) | Done when |
|---|---|---|
| Plan | write `intent.md` for the feature — security screen filled | Intent-Ready checklist ticks |
| Design | one session with your agent → `spec.md` + `plan.md`; tasks scored 1–10 | DoR checklist ticks — nothing dispatched before |
| Build | `AGENTS.md` in place; agent presents a plan first, then codes on a branch; 1 task = 1 branch = 1 PR | build + lint pass in your CI |
| Test | run your gate battery; ≥ 1 AI reviewer **independent of the builder**; human review per routing | tests map to acceptance criteria; review recorded |
| Deploy | CI gate green + human approval before anything production-ish | audit trail shows who approved what |
| Maintain | define the success metric's control band; check it weekly | first "metric → intent" chain exists |

**Port the gates concretely** — copy these from the kit into your repo:

- `.github/workflows/tests.yml` → CI running your tests on every push/PR
- [`templates/quality-gates.yml`](../../templates/quality-gates.yml) → start at advisory, promote per docs/en/04 §5
- [`templates/pr-template.md`](../../templates/pr-template.md) → provenance + security checklist from PR #1
- `CODEOWNERS` → sensitive paths (auth/payment/migrations) owned from day one
- `tests/` structure from [`examples/money-web-app/app/tests/`](../../examples/money-web-app/app/tests/) → helper patterns + requirement-mapped test names (FR/SR/EV IDs)

## 5. Self-assessment — "am I really able to self-serve?"

Tick honestly; any three "no" answers → re-read the linked doc:

- [ ] I can write an intent that passes Intent-Ready (problem, evidence, metric, owner) — *docs/02 §3 Stage 1*
- [ ] I can run a Design session that produces a DoR-passable spec — *docs/02 §3 Stage 2*
- [ ] I know why an issue failing DoR must NOT be dispatched — *docs/04 §1*
- [ ] I can route a task by complexity (1–10 → working mode) — *docs/03 §4*
- [ ] I can explain the review layers and why the builder never self-reviews — *docs/02 §3 Stage 4*
- [ ] I can state which gates are hard-mandatory and why — *docs/04 §5*
- [ ] I can install a skill pack from the registry and record its decisions — *skills/README.md*
- [ ] I can close the loop: name the metric → intent chain in my own project — *docs/02 §6*

The deepest check: **build one small real feature end-to-end** following
[`examples/money-web-app/`](../../examples/money-web-app/) as the worked example —
artifacts chain, gate run, and the UI/UX evaluation as models to imitate.

## 6. What the examples are (and are not)

Both `examples/` projects are **walkthroughs for the process, not deployable apps**
(labeled in their READMEs). Copy their *patterns* — artifact chains, test-to-requirement
mapping, gate wiring — never their deployment.

## 7. Where new members get stuck (and the unblock)

| Symptom | Missing knowledge | Fix |
|---|---|---|
| "Where do I start with the docs?" | reading order | §3 above: only 02 + 07 first |
| Agent breaks conventions | no project memory | write `AGENTS.md` before Build (Play 4) |
| Agent edits recklessly | no plan mode habit | Play 5; approve the plan before code |
| "Is this skill pack safe?" | registry rules | install only registry-listed versions |
| PRs too big to review | task bundling | 1 task = 1 branch = 1 PR (hard rule) |
| "Do I need all 6 stages on day 1?" | modular adoption | start with plays 1 → 4 → 5 → 8 → 11 |

## 8. Asking for help the kit's way

Open an issue in the kit repo using the same discipline it teaches: **problem,
evidence, what you tried, options you weighed** — the escalation format agents are
held to in `templates/AGENTS.md` ("answerable in < 2 minutes"). A question that
follows this format usually answers itself on the way out.

---

*Back to [README](../../README.md) · v2 multi-user plan → [`13-roadmap-v2.md`](13-roadmap-v2.md)*
