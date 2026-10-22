# ai-sdlc-kit CLI

> [🇻🇳 Tiếng Việt](README.md) · 🇬🇧 **English**

Zero-dependency CLI (Node ≥ 18, stdlib only) that scaffolds a new **AI-SDLC project**
and verifies its wiring — so a new member goes from zero to "gates green" with one command
(the [`docs/en/12-onboarding.md`](../docs/en/12-onboarding.md) contract, automated).

## Run it

```bash
# from a clone of the kit:
node cli/ai-sdlc-kit.mjs --help

# or without cloning (npx runs the bin straight from GitHub; private repo → needs your git auth):
npx github:ksi283/ai-sdlc-kit --help

# help + progress messages in Vietnamese:
ai-sdlc-kit --help --lang vi
```

## Commands

### `init <dir> [--ai …] [--skills …] [--force] [--dry-run] [--lang vi|en]`

Scaffolds a new project: `AGENTS.md`, `docs/templates/` (intent, spec, plan, evals,
threat-model), `docs/intents/`, `specs/`, `evals/`, `policy/` (quality gates +
autonomy), `.github/` (PR template, CODEOWNERS, CI workflow), then wires skill
auto-activation into `AGENTS.md`.

```bash
ai-sdlc-kit init my-app --skills intent-review,ui-ux-pro-max --ai claude
```

- `--skills` is a comma list from [`skills/registry.yml`](../skills/registry.yml);
  unknown packs are rejected **before** anything is written (registry-first rule).
- `local` packs are copied from this repo; `external` packs print their pinned
  installer command.
- Re-running is idempotent (AGENTS.md block refreshes, never duplicates).

### `check [dir]`

10-point wiring report (AGENTS.md + skills block, intents, specs, policy, CI,
PR template, CODEOWNERS, evals). **Exit code 1 when incomplete** — usable as a CI step.

### `skill <pack> <dir> [--ai …]`

Install one pack into an existing project (same registry rules as
[`skills/install.sh`](../skills/install.sh), which this CLI mirrors).

## Scope notes

- The CLI scaffolds **projects**; the kit repo itself is not installable as a package
  (`private: true` in package.json — publishing to npm is a deliberate v2 decision, see
  `docs/en/13-roadmap-v2.md`).
- `external` packs need their own prerequisites (e.g. `ui-ux-pro-max` wants Python ≥ 3.9).
- Technical errors stay in English; `--lang` translates the help and progress messages.
