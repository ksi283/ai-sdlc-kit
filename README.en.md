# AI-SDLC Kit for Software Development

> [🇻🇳 Tiếng Việt](README.md) · 🇬🇧 **English**

> An AI-augmented / AI-native software development lifecycle framework — synthesized and designed from leading references, with a ready-to-use template set and a runnable reference app for verification.

**Version:** 1.3 · **Date:** 2026-10-22

---

## 1. Why this AI-SDLC kit?

AI has inverted the economics of software development:

- **85%** of developers use AI tools; **41%** of GitHub code is AI-generated — yet only **1 in 5** companies has mature governance (ai-sdlc.io).
- METR study: experienced devs were **19% slower** with AI while believing they were **20% faster** — a 39-point perception gap.
- DORA: each +25% AI adoption correlates with **−7.2%** delivery stability.
- Faros AI: PRs merged **+98%**, PR size **+154%**, review time **+91%** → **review is the new bottleneck**.

**Conclusion:** writing code is no longer the bottleneck — *verification, governance and measurement* are. The whole kit is designed around that reality, and is verified in practice by a runnable reference app (section 6).

## 2. Overall design: "3 layers — 6 stages — 1 loop"

```
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 1: LIFECYCLE                            │
│                                                                 │
│   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│   │ PLAN │→ │DESIGN│→ │BUILD │→ │ TEST │→ │DEPLOY│→ │MAINT.│
│   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──┬───┘
│        ↑          ↑          ↑          ↑          ↑         │
│      DoR        DoR        DoR       Quality    Deploy    metric
│     gate        gate       gate       gates     gates     out of
│        ↑          ↑          ↑          ↑          ↑       band
│   ═══════════ LAYER 3: QUALITY GATES ═════════════════  ┌────┴────┐
│                                                        │intent.md│
│  ┌─────────────────────────────────────────────────┐   │  NEW    │
│  │     LAYER 2: ORCHESTRATION                      │   └─────────┘
│  │  Complexity routing · Autonomy levels L0–L3 ·   │
│  │  Orchestrator + worker agents · Cross-harness   │
│  │  review · Human-in-the-loop                     │
│  └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

- **Layer 1 — Lifecycle:** Plan → Design → Build → Test → Deploy → Maintain, closed by the production feedback loop (metric out of band → new intent).
- **Layer 2 — Orchestration:** who does what (human/agent), at which autonomy level, reviewed how.
- **Layer 3 — Trust foundation:** 3-tier quality gates, 5 metric groups, knowledge-as-code, zero-trust.

## 3. Language convention

| Component | Language |
|---|---|
| [`README.md`](README.md) | **Vietnamese** — the default shown on GitHub |
| `README.en.md` (this file) | English — mirrored content, kept in sync |
| `docs/vi/` (11 guides) | Vietnamese, each file cross-links its English twin |
| `docs/en/` (11 guides) | English |
| `templates/` + `examples/` | **English only** — these are the artifacts used in real project repos (code, PRs, specs, policy) |

## 4. Repository layout

```
ai-sdlc/
├── README.md                  ← default: Vietnamese
├── README.en.md               # you are here (English)
├── docs/
│   ├── vi/                    # 11 hướng dẫn tiếng Việt
│   └── en/                    # 11 English guides
│       01 research · 02 core framework · 03 org & autonomy
│       04 gates & policy · 05 metrics · 06 toolchain
│       07 adoption · 08 security & DevSecOps
│       09 discovery & UX · 10 delivery ops · 11 portfolio
├── templates/                 # 13 ready-to-use files — ENGLISH ONLY
│   ├── intent.md · spec.md · plan.md · AGENTS.md · evals.md
│   ├── quality-gates.yml · autonomy-policy.yml · pipeline.yml
│   ├── pr-template.md · threat-model.md · priority-scorecard.md
│   └── adr.md · postmortem-to-intent.md
└── examples/
    ├── mini-todo-api/         # "first run" walkthrough (EN)
    └── money-web-app/         # security-heavy walkthrough: auth + money data (EN)
        └── app/               # RUNNABLE APP (npm start / npm test)
```

## 5. Read what first?

| Who you are / what you need | Read first |
|---|---|
| Need the context & why | `docs/en/01-research-synthesis.md` |
| Grasp the framework (one ~20-min read) | `docs/en/02-framework.md` |
| Start a pilot this week | `docs/en/07-adoption.md` + copy `templates/intent.md`, `templates/AGENTS.md` |
| Standardize review & quality | `docs/en/04-gates-policy.md` + `templates/quality-gates.yml` |
| Dashboards / leadership reporting | `docs/en/05-metrics.md` |
| Choose tools, system architecture | `docs/en/06-toolchain.md` |
| Secure the product (threat modeling, vuln mgmt, DevSecOps) | `docs/en/08-security.md` + `templates/threat-model.md` |
| Decide what to build before Plan (research, UX, feasibility) | `docs/en/09-discovery-ux.md` |
| Estimation, versioning, environments, tech debt | `docs/en/10-delivery-ops.md` |
| Prioritization, capacity, vendor/model governance | `docs/en/11-portfolio.md` + `templates/priority-scorecard.md` |
| See a small project run the full lifecycle | `examples/mini-todo-api/` |
| See a security-heavy run + the runnable app | `examples/money-web-app/` |

**Fastest path (30 min):** read `docs/en/02-framework.md` → copy `templates/intent.md` + `templates/AGENTS.md` into your repo → run one small feature through the six stages.

## 6. Run the sample app (verified in practice)

```bash
cd examples/money-web-app/app
npm install && npm start     # → http://localhost:3000 (money-tracking web app with auth)
npm test                     # 22 tests = the gate battery: FR-1..3, SR-1..6, evals
```

The run results, mapped requirement by requirement, are in [`examples/money-web-app/app/RUN-REPORT.md`](examples/money-web-app/app/RUN-REPORT.md) — including the three real bugs the test battery caught along the way.

## 7. Primary references

1. **Anthropic — The AI-native SDLC Playbook** (Claude Academy, 2026): 12 plays across 6 stages; artifacts `intent.md`, `CLAUDE.md`/`AGENTS.md`, skills, hooks, evals. <https://academy.claude.com/courses/ai-native-sdlc-playbook>
2. **Microsoft — An AI-led SDLC** (Azure Blog, 2026): an end-to-end architecture: GitHub Spec Kit → coding agent → multi-model AI code review → CI/CD → SRE agent → observability → feedback loop. <https://techcommunity.microsoft.com/blog/appsonazureblog/an-ai-led-sdlc-building-an-end-to-end-agentic-software-development-lifecycle-wit/4491896>
3. **AI-SDLC Framework** (ai-sdlc.io, Apache-2.0): the open governance spec — Pipeline/AgentRole/QualityGate/AutonomyPolicy, autonomy L0–L3, 3-tier policy, 5 metric groups. <https://ai-sdlc.io/docs>

Full synthesis, comparison and further reading: `docs/en/01-research-synthesis.md`.

## 8. Adoption principles

- The kit is **vendor-neutral** — every tool choice has interchangeable alternatives in `docs/*/06-toolchain.md`.
- Adopt **modularly**: start from the no-prerequisite plays (`docs/*/07-adoption.md`).
- Templates carry **guidance notes** (`<!-- ... -->` blocks) — delete them when using for real.

## 9. License

Released under the **[Apache License 2.0](LICENSE)** — you are free to use, modify and distribute it (subject to the attribution terms and the patent grant in the license). The references (Anthropic, Microsoft, ai-sdlc.io) cited in section 7 are for study purposes; this kit is an independent work and contains no source code copied from them.

---

*These two READMEs are kept in sync: [🇻🇳 Tiếng Việt](README.md) · [🇬🇧 English](README.en.md). For study and internal adoption; all cited figures are sourced in `docs/en/01-research-synthesis.md`.*
