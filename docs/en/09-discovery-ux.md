# 09 · Product Discovery, UX & End-user Documentation

> Stage 0 of the lifecycle — everything that should happen **before** an intent.md is born: problem discovery, stakeholder elicitation, feasibility, UX/UI design, prototyping, usability validation, and the end-user documentation track that ships with the product. Without this doc, the AI-SDLC optimizes how fast you build the *wrong* thing. *(Tiếng Việt: [`../vi/09-discovery-ux.md`](../vi/09-discovery-ux.md))*

---

## 1. Position in the framework

```
 DISCOVERY (this doc)          PLAN            DESIGN ...
 research · UX · feasibility ──► intent.md ──► spec.md ──► ...
        ▲                                            │
        └────────── usability feedback ◄─────────────┘        (UX runs through Build/Test too)
```

Discovery is not a phase gate bureaucracy — it is the **evidence factory for intents**. A good discovery output makes `intent.md` a 10-minute formality instead of a guessing exercise.

---

## 2. Problem discovery

| Activity | AI does | Humans do |
|---|---|---|
| User interviews & support mining | Transcribe + cluster thousands of tickets/CSAT comments into themes; draft interview guides; summarize calls | Choose whom to interview; validate themes against reality; kill pet theories |
| Analytics review | Correlate usage funnels, detect drop-offs, quantify frequency | Interpret *why* behind the numbers |
| Competitive / domain scan | Summarize alternatives, extract pattern libraries, regulation summaries | Judge fit to your users & strategy |
| Opportunity sizing | Draft TAM/effort estimates from historical task data (`05`) | Sanity-check with portfolio (`11`) |

**Output:** a validated problem statement + quantified evidence — exactly what `intent.md`'s "Problem / Evidence" sections demand. Anti-pattern: *AI-fabricated personas* — synthetic users are hypotheses to test, never evidence.

## 3. Stakeholder elicitation & alignment

- **Stakeholder map** per initiative: who decides, who pays, who uses, who blocks (compliance/legal/ops).
- **Elicitation kit** (AI-drafted, human-run): 5-question interviews, assumption logs, decision-driver checklists.
- **Decision log (ADR-lite):** every discovery decision above a threshold is one paragraph — context, options, choice, consequence — versioned next to intents. This is what agents will later read as context; undocumented verbal decisions are invisible to them.
- **Cadence:** async by default; one alignment session at discovery exit (see gate below), not weekly status theater.

## 4. Feasibility screening (three lenses)

| Lens | Question | Quick test |
|---|---|---|
| **Technical** | Can we build it with current stack/agents? | 1–3 spike tasks (complexity ≤ 3, dispatched as real tasks — output is knowledge, not code) |
| **Economic** | Is it worth it? | Cost-per-feature estimate from `05` metrics × priority scorecard (`templates/priority-scorecard.md`) |
| **Regulatory** | Are we allowed? | Compliance screen: data classification, jurisdictions, AI-act implications → route to `08` §6 if PII |

Fail a lens → the initiative dies cheap here, not expensively in Build.

## 5. UX/UI design & prototyping

The loop: **wireframe → prototype → usability test → iterate** — now accelerated by agents:

1. **Wireframing:** agents generate layout variants from the spec's user stories in minutes; designer curates. Multi-variant by default (3 directions, not 1 sacred mockup).
2. **Prototyping:** clickable prototypes (HTML/Figma via MCP/agents) wired to fake data — good enough for usability tests before any backend exists.
3. **Design system as knowledge-as-code:** tokens, components, do/don'ts live in the repo (`.agent/skills/design-system` + AGENTS.md section). This is how Build-stage agents produce UI that doesn't look alien; drift from the system is a review checklist item, not a taste debate.
4. **Accessibility:** WCAG 2.2 AA as explicit SR-x requirements in specs (contrast, keyboard paths, screen-reader labels) — verified by automated checks + manual audit; agents draft fixes, humans audit.
5. **Usability testing:** 5 users per round on the prototype or staging feature-flag; task-success rate + SUS scored. AI-simulated users may pre-screen flows, but **simulated users never replace real ones** for anything user-facing or regulated.

**UX gate into Build:** "Usability-Ready" — the spec's user-facing FRs are backed by a tested prototype or an explicit experiment plan (feature-flagged rollout with measured task success in Deploy).

## 6. End-user documentation track

Documentation is a product surface, not an afterthought — and agents make it nearly free to maintain *if* wired into the lifecycle:

| Stage | Documentation activity |
|---|---|
| Design | Docs plan in the spec: what user-facing docs change (guides, API refs, in-app help) — the `documentation-based` gates enforce it |
| Build | Agents draft doc updates **in the same PR** as the feature change (docs live in `/docs`, versioned with the code they describe) |
| Test | Docs review: accuracy evals — does the doc still match the behavior? (AI cross-checks docs against tests) |
| Deploy | Release notes auto-drafted from PR chain (intent → tasks → user-visible changes), human-edited tone |
| Maintain | Docs feedback loop: support-ticket themes + "this page didn't help" signals → new intents (`postmortem-to-intent` pattern applies) |

**Rule:** a feature is Done when its docs ship. The `documentation-required` gate type (already in `quality-gates.yml`) is the enforcement point.

## 7. Gates summary

| Gate | Where | Blocks |
|---|---|---|
| **Discovery-Ready** (exit of discovery) | → Plan | Intents without: validated problem, stakeholder map, feasibility screen pass |
| **Usability-Ready** | Design → Build (user-facing work) | UI features without a tested prototype or a measurement plan |
| **Docs-ship-with-feature** | Test → Deploy | Merges changing user-facing behavior without matching docs updates |

## 8. Anti-patterns

| Anti-pattern | Symptom | Remedy |
|---|---|---|
| AI-persona theater | Personas with lovely names, zero evidence | Personas must cite interview/ticket sources; synthetic = labeled hypothesis |
| Prototype-to-prod skip | "The demo worked, ship it" | Usability gate + measurement plan in Deploy |
| Design system amnesia | Every agent-generated UI screen looks different | Design tokens in repo + skill + review checklist |
| Docs debt | Docs describe the product of 2 quarters ago | Docs gate + Maintain docs-feedback intents |

---

*Related: [`02-framework.md`](02-framework.md) (Plan stage) · [`11-portfolio.md`](11-portfolio.md) (what deserves discovery) · Back to [README](../../README.md)*
