# Skills — Optional Capability Packs

> The kit's mechanism for **custom skills**: reusable capability packs that an AI coding
> assistant loads when working on a project (design intelligence, review standards,
> domain conventions…). Principle P6 (knowledge-as-code): anything an agent must obey
> lives in this repo, versioned and reviewed like code.

## How the mechanism works

1. **Registry first** — an approved pack is listed in [`registry.yml`](registry.yml):
   source repo, pinned version, license, install command, and what it is allowed to do.
2. **Install per project** (not per machine) — run the pack's install command inside the
   project root; the pack lands in the agent's skill directory (`.claude/skills/`,
   `.cursor/skills/`, `.agents/skills/`, … depending on the pack).
3. **Do not commit installed packs** — installed packs are large third-party trees.
   `.gitignore` excludes them; what IS committed: the registry entry + the pack's
   *outputs* that survive review (design tokens, `DESIGN-SYSTEM.md`, generated
   checklists) — those become project-owned knowledge.
4. **Decision provenance is mandatory** — when a pack produces recommendations, record
   what was chosen, what was rejected and why (example:
   [`examples/money-web-app/app/DESIGN-SYSTEM.md`](../examples/money-web-app/app/DESIGN-SYSTEM.md)).

## Registry rules

- An entry MUST pin an exact version (`uipro` / CLI versions move fast).
- An entry MUST record the license — MIT/Apache packs are safe to install; unlicensed
  packs are not installable, full stop.
- Security review before first use: what files the pack generates, whether its scripts
  make network calls (the `ui-ux-pro-max` search scripts are stdlib-only/offline — verified).
- Removing an entry = also removing its generated artifacts from projects, via PR.

## Entries

See [`registry.yml`](registry.yml). Current approved packs:

| Pack | Version | License | Purpose |
|---|---|---|---|
| `ui-ux-pro-max` | 2.15.0 | MIT | Design intelligence for UI work (styles, palettes, typography, a11y checklists) — first used on the money-web-app UI/UX upgrade |

## Authoring kit-owned skills

Kit-authored skills (our own standards packaged for agents) live in this directory as
`skills/<name>/SKILL.md` and ARE committed. Template for a minimal skill:

```
skills/<name>/
├── SKILL.md          # frontmatter: name + description ("use when…"); body: rules
└── references/       # optional deep-dive docs the agent reads on demand
```
