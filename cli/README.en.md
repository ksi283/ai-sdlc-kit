# ai-sdlc-kit CLI

> [Tiếng Việt](README.md) · **English**

Zero-dependency CLI (Node ≥ 18, stdlib only) that scaffolds a new **AI-SDLC project**
and verifies its wiring — so a new member goes from zero to "gates green" with one command
(the [`docs/en/12-onboarding.md`](../docs/en/12-onboarding.md) contract, automated).

## Run it

**Nothing installed — but EVERY command needs the `npx` prefix** (the most common trap:
running `npx github:…` once and then calling `ai-sdlc-kit` directly gives `command not found`):

```bash
npx github:ksi283/ai-sdlc-kit --help
npx github:ksi283/ai-sdlc-kit --help --lang vi
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --ai claude
```

**Or install the global command once** to drop the prefix:

```bash
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit --help --lang vi
```

**Or from a clone of the kit:** `node cli/ai-sdlc-kit.mjs --help`.

*(Private repo → npx/npm installs from GitHub need your repo credentials.)*

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
