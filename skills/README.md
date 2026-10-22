# Skills — Capability Packs with Auto-Activation

> The kit's mechanism for **custom skills**: reusable capability packs that an AI coding
> assistant loads when working on a project (design intelligence, review standards,
> domain conventions…). Principle P6 (knowledge-as-code): what agents must obey lives
> here, versioned and reviewed like code.

## The three layers

```
1. REGISTRY (neutral catalog)     skills/registry.yml
   what packs exist: name, class, pinned version, license, install command,
   and — the key field — auto_activate: capability → lifecycle stages → use-when triggers.
   Project-agnostic BY DESIGN: the registry never says which project a pack is "for".

2. INSTALL (per project)          skills/install.sh <pack> <project-dir> [--ai …]
   local pack    → copies skills/<name>/ into <project>/.<agent>/skills/<name>/
   external pack → hands you the pack's own installer command (never bypassed)
   both          → refreshes the AUTO-ACTIVATION BLOCK in <project>/AGENTS.md

3. AUTO-ACTIVATION (the payoff)
   Every agent entering the project reads AGENTS.md → sees the routing table
   ("UI/UX work → ui-ux-pro-max · intent drafting → intent-review") and proactively
   loads the right pack. Agents with native skill discovery additionally match the
   pack's own SKILL.md description ("USE WHEN …") against the current task.
```

Example: you add `ui-ux-pro-max` to the registry, run the installer in any project —
from then on, AI-SDLC work on screens, colors or accessibility **proactively** uses that
pack, on every stage its `lifecycle_stages` cover, in **every** project where it is
installed. Nothing is hard-wired to one project.

## Two flows: publish vs install

Installing an existing pack and publishing a new one are different flows — the most
common misunderstanding is running `install.sh` first. It refuses exactly that:

```
FLOW A — PUBLISH A NEW SKILL (once, via PR — human review required)
  1. write it       skills/_template/ → skills/<name>/SKILL.md  (description = "USE WHEN …" trigger)
  2. REGISTER it    skills/registry.yml entry (class, version, license, auto_activate)  ← via PR
  3. install.sh     per project, whenever needed

FLOW B — INSTALL AN EXISTING PACK (per project, per upgrade)
  1. skills/install.sh <pack> <project-dir> --ai <agent>
       local pack    → copied into <project>/.<agent>/skills/<pack>/
       external pack → prints its pinned installer command
       both          → AGENTS.md auto-activation block refreshed
```

`install.sh` NEVER registers anything: it **reads** the registry and fails on
unregistered packs — that refusal is the review gate doing its job.

## Two pack classes

| Class | Source of truth | Installed by | Examples |
|---|---|---|---|
| `external` | the pack's own repo (npm/CLI) | the pack's installer, version pinned here | [`ui-ux-pro-max` 2.15.0 (MIT)](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| `local` | **this repo**, `skills/<name>/SKILL.md` | `skills/install.sh` (idempotent copy) | [`intent-review`](intent-review/SKILL.md) — the Intent-Ready gate as an agent skill |

**User-developed skills** are first-class: copy [`skills/_template/SKILL.md`](_template/SKILL.md)
to `skills/<name>/`, write the description as a real trigger ("USE WHEN …"), add the
registry entry, PR. `install.sh` distributes it to any project, any agent directory
(`.claude/` `.cursor/` `.agents/` `.zcode/`). Personal skills kept outside the kit
(e.g. `~/.claude/skills/`) are allowed but carry no kit governance — they are a private
matter, not team knowledge.

## Registry rules

- Pin an **exact version** for external packs; local packs carry their own version.
- Record the **license** — MIT/Apache packs are installable; unlicensed packs are not.
- **Security review before first use**: files the pack generates, network calls
  (`ui-ux-pro-max` search scripts are stdlib-only/offline — verified).
- **Do not commit installed packs** (large third-party trees; `.gitignore` covers
  `.claude/` etc.). What IS committed: the registry entry + reviewed outputs the pack
  produced (e.g. a project's `DESIGN-SYSTEM.md`) — those become project-owned knowledge.
- **Provenance on the project side**: record what the pack recommended, what was chosen
  and why (worked example: [`examples/money-web-app/app/DESIGN-SYSTEM.md`](../examples/money-web-app/app/DESIGN-SYSTEM.md)).

## Adding a pack (checklist)

1. Security-review the pack; fill a `registry.yml` entry (class, version, license, `auto_activate`).
2. PR the entry — a reviewer checks version pin + license + triggers.
3. Install per project (`install.sh` or the pack's installer); commit only reviewed outputs.
4. Upgrades: bump the pinned version in a PR; projects re-run `install.sh` (idempotent,
   AGENTS.md block refreshes automatically).
