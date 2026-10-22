<div align="center">

# AI-SDLC Kit

**An AI-augmented software development process — core framework, ready-to-use templates, a CLI and a verified reference app.**

[![version](https://img.shields.io/badge/version-1.7.0-blue)]() [![license](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE) [![node](https://img.shields.io/badge/node-%E2%89%A518-339933)]() [![docs](https://img.shields.io/badge/docs-EN%20%7C%20VI-informational)]()

[Tiếng Việt](README.md) · **English**

</div>

---

Writing code is no longer the bottleneck — *verification, governance and measurement* are. This kit provides a complete software process for the AI era: **a 6-stage closed loop · evidence-earned autonomy · 3-tier quality gates · 5 metric groups**, with templates you can apply today and a runnable app proving the theory is not on paper.

| | |
|---|---|
| **Status** | Production-ready |
| **Language** | Bilingual guides EN/VI |
| **Neutrality** | Vendor-neutral — Claude Code / Codex / Cursor / any agent |

## Contents

1. [Why this kit](#1-why-this-kit)
2. [Architecture](#2-architecture)
3. [Installation](#3-installation)
4. [Quick start](#4-quick-start)
5. [What's inside](#5-whats-inside)
6. [Documentation map](#6-documentation-map)
7. [Skill packs](#7-skill-packs)
8. [Examples](#8-examples)
9. [References](#9-references)
10. [License](#10-license)

---

## 1. Why this kit

Four numbers shaped the whole design:

| Fact | Consequence |
|---|---|
| METR: AI-assisted devs were **19% slower** while believing they were **20% faster** | Subjective perception cannot drive decisions — measure |
| DORA: +25% AI adoption ↔ **−7.2%** delivery stability | Speed must travel with gates |
| Faros: review time **+91%** | **Review is the new bottleneck**, not writing code |
| Only **1 in 5** organizations has mature governance | The gap needs mechanisms, not scattered tools |

→ Full analysis: [`docs/en/01-research-synthesis.md`](docs/en/01-research-synthesis.md).

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 1 · LIFECYCLE                            │
│                                                                 │
│   PLAN ─► DESIGN ─► BUILD ─► TEST ─► DEPLOY ─► MAINTAIN ──┐     │
│  (intent) (spec+plan) (agent      (verify (ship    (run & │     │
│                          executes)   it)     it)     watch)│     │
│     ▲        ▲         ▲         ▲        ▲               │     │
│   DoR       DoR      Build    Quality   Deploy      metric out  │
│   gate      gate      Ready    gates     gates        of band   │
│     ▲        ▲         ▲         ▲        ▲               │     │
│   ══════════ LAYER 3 · QUALITY GATES (3 tiers) ═══════ ┌───┴───┐│
│                                                        │intent ││
│  ┌─────────────────────────────────────────────────┐   │.md NEW││
│  │        LAYER 2 · ORCHESTRATION                  │   └───────┘│
│  │  Complexity routing (1–10) · Autonomy L0–L3     │            │
│  │  Cross-harness review · Human-in-the-loop       │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

- **Layer 1 — Lifecycle:** six stages closed by the production feedback loop.
- **Layer 2 — Orchestration:** who does what, at which autonomy level, reviewed how.
- **Layer 3 — Trust foundation:** gates, policy, metrics, knowledge-as-code.

Stage-by-stage details: [`docs/en/02-framework.md`](docs/en/02-framework.md).

## 3. Installation

Zero-dependency CLI (Node ≥ 18). Three ways, pick one:

```bash
# ① Run directly — prefix EVERY command with npx
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --agent claude

# ② Install the global command once, then use it plainly
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit init my-app && ai-sdlc-kit check my-app

# ③ From a clone of the kit
node cli/ai-sdlc-kit.mjs --help          # add --lang vi for Vietnamese help
```

| Command / option | What it does |
|---|---|
| `init <dir>` | Scaffold a project |
| `check [dir]` | 10-point wiring report — **exit 1 when incomplete** |
| `skill <pack> <dir>` | Install a registry pack into a project |
| `update [dir]` | Bring a project to the current kit (project-modified files kept) |
| `--agent <ide name>` | Target agent's skill directory (`claude` · `cursor` · `codex` · `zcode`) |

Details: [`cli/README.md`](cli/README.md).

### Updating the kit

`init` writes `.ai-sdlc-kit.json` into your project (kit version, agent, skills, per-file baseline hashes of kit-owned files) — **commit it alongside your project**. When the kit releases a new version:

```bash
ai-sdlc-kit update my-app            # preview first: add --dry-run
```

Safe by design: unmodified files → updated; **project-modified files → kept** (reported as `skipped`, diff manually or use `--force` to overwrite); deleted files → restored; skills refreshed and the `AGENTS.md` block rewired. Re-running is idempotent.

## 4. Quick start

**Clone & run the verified reference app:**

```bash
git clone https://github.com/ksi283/ai-sdlc-kit.git && cd ai-sdlc-kit
# read exactly 2 docs: docs/en/02-framework.md + docs/en/07-adoption.md
cd examples/money-web-app/app && npm install && npm test   # 22/22 tests = the gate battery
npm start                                                   # → http://localhost:3000
```

## 5. What's inside

| Component | Contents | Role |
|---|---|---|
| `docs/` | 13 guides × 2 languages (EN + VI) | Doctrine: research → framework → security → v2 roadmap |
| `templates/` | 13 ready-to-use files (English) | Real-project artifacts: intent, spec, plan, gates, threat model… |
| `skills/` | Registry + installer + 2 kit-authored skills | Skill-pack mechanism with auto-activation |
| `cli/` | `ai-sdlc-kit`, zero-dependency | Scaffold + wiring verification |
| `examples/` | 2 full-lifecycle walkthroughs, 1 runnable app | Verified by practice |
| `.github/` | CI, 3 jobs | Gate battery + cli-smoke + install.sh round-trip |

## 6. Documentation map

| # | Guide | Answers |
|---|---|---|
| 01 | [Research synthesis](docs/en/01-research-synthesis.md) | Why this design? |
| 02 | [Core framework](docs/en/02-framework.md) | How does the process run? |
| 03 | [Org & autonomy](docs/en/03-org-autonomy.md) | Who does what? What may agents do? |
| 04 | [Gates & policy](docs/en/04-gates-policy.md) | What is blocked, where, how hard? |
| 05 | [Metrics](docs/en/05-metrics.md) | What to measure for decisions? |
| 06 | [Toolchain](docs/en/06-toolchain.md) | Which stack, which model per phase? |
| 07 | [Adoption roadmap](docs/en/07-adoption.md) | Where to start without drowning? |
| 08 | [Security & DevSecOps](docs/en/08-security.md) | Product security across the lifecycle? |
| 09 | [Discovery & UX](docs/en/09-discovery-ux.md) | Building the right thing before building fast? |
| 10 | [Delivery ops](docs/en/10-delivery-ops.md) | Estimation, versioning, tech debt? |
| 11 | [Portfolio](docs/en/11-portfolio.md) | What to prioritize, how to govern vendors? |
| 12 | [Onboarding](docs/en/12-onboarding.md) | Can a newcomer self-serve? |
| 13 | [v2 roadmap](docs/en/13-roadmap-v2.md) | Whole team, one kit, zero chaos? |

## 7. Skill packs

A skill pack = a packaged capability for AI agents (design, review standards, domain conventions). Two separated flows:

```
PUBLISH (once, via PR):   skills/_template/ → skills/<name>/ → register in registry.yml
INSTALL  (per project):   skills/install.sh <pack> <dir> --agent <platform>
                          → copy pack + generate the routing block in AGENTS.md
                          → agents proactively load the right pack for the right work
```

Current registry:
- `ui-ux-pro-max`
- `intent-review`
- `spec-review`

## 8. Examples

| Example | App |
|---|---|
| [`mini-todo-api`](examples/mini-todo-api/) | Todo API — the first run |
| [`money-web-app`](examples/money-web-app/) | PocketLedger — money-tracking web app with auth |

> Both are process walkthroughs, **not for production deployment**.

## 9. References

1. **Anthropic — The AI-native SDLC Playbook** (Claude Academy, 2026) — <https://academy.claude.com/courses/ai-native-sdlc-playbook>
2. **Microsoft — An AI-led SDLC** (Azure Blog, 2026) — <https://techcommunity.microsoft.com/blog/appsonazureblog/an-ai-led-sdlc-building-an-end-to-end-agentic-software-development-lifecycle-wit/4491896>
3. **AI-SDLC Framework** (ai-sdlc.io, Apache-2.0) — <https://ai-sdlc.io/docs>

## 10. License

Released under the **[Apache License 2.0](LICENSE)** — free to use, modify and distribute under its attribution and patent terms. This kit is an independent work; references are cited for study purposes only.
