# Changelog

All notable changes to ai-sdlc-kit. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions: [Semantic Versioning](https://semver.org/).

Release dates are the dates of the release commits. The repository has no git tags yet.

**Claude Code plugin:** the plugin tracks commits (SHA), not this version. Its changes appear under *Unreleased* until a release number is set. See [docs/vi/14-plugin-distribution.md](docs/vi/14-plugin-distribution.md) §10.

## [Unreleased]

### Added
- Claude Code plugin: `.claude-plugin/plugin.json` and a single-plugin marketplace at the repo root. No `version` is pinned, so the plugin tracks commits.
- `/ai-sdlc-kit:sdlc-check` command: a read-only wiring report for a project.
- SessionStart hook (`hooks/hooks.json`) that runs `ai-sdlc-kit notify`. When a project was scaffolded by an older kit release, it asks the user to decide whether to run `update`. It never runs `update` itself.
- `ai-sdlc-kit notify [dir]`: the command behind the hook. Silent unless the project is behind this kit release.
- `ai-sdlc-kit init --plugin` (Claude only): local skills are not copied. Routing uses the `ai-sdlc-kit:<pack>` names, and the manifest records `"mode": "plugin"`.
- CI: round-trip checks for plugin mode, routing rows and `notify`.

### Changed
- The skill template moved from `skills/_template/` to `templates/skill/SKILL.md`. Copy new skills from the new path. Claude Code loads every directory under `skills/` as a skill, so the template had to move out.
- The CI version check now requires `package.json` and the CLI to match, and requires `plugin.json` not to pin `version`.

### Fixed
- `ai-sdlc-kit skill <pack>` no longer drops the routing rows of packs already installed in the project.

## [1.7.0] - 2026-10-22

### Added
- `ai-sdlc-kit update [dir] [--dry-run] [--force]`. Files the project has not changed are updated. Files it has changed are kept. Missing files are restored, skills are refreshed, and the AGENTS.md routing block is rewired.
- `init` writes `.ai-sdlc-kit.json`: the kit version, the agent, the skills, and a baseline hash for each kit-owned file.
- `check` reports whether the project is behind the kit release. This is informational and never fails.
- CI: a regression round-trip for `update`. A skipped file keeps its edits, `--force` overwrites, and a second run converges.

### Fixed
- Re-baselining a skipped file to the project's hash could make the next `update` overwrite local edits. Baselines now always reference the kit version.

## [1.6.0] - 2026-10-22

### Changed
- **Breaking:** `--ai` is renamed to `--agent` on `init`, `skill` and `skills/install.sh`. `--ai` still works as a deprecated alias.
- Omitting the agent flag prints an explicit notice that the default is `claude`.

## [1.5.1] - 2026-10-22

### Added
- Skill-pack registry (`skills/registry.yml`) with auto-activation routing written to AGENTS.md.
- `spec-review` skill (the Definition-of-Ready gate).
- Onboarding guide (`docs/en/12`, `docs/vi/12`) and the v2 roadmap (`docs/*/13`).

### Fixed
- `npx` usage: a bare `npx` run does not install the command. The docs now show the prefix form or a global install.
- Scaffolded CI no longer fails on a project that has no `package.json` yet.
- Language switchers no longer use flag emojis, which Windows renders as letter pairs.

## [1.5.0] - 2026-10-22

### Added
- The first versioned CLI, with zero dependencies (Node ≥ 18): `init`, `check`, `skill`.
- Bilingual CLI output (`--lang vi|en`).
- CI: the gate battery for the reference example, and a `cli-smoke` job (scaffold, then check).

Before 1.5.0 the repository held framework docs, templates and example apps, with no versioned releases. See `git log` for that history.
