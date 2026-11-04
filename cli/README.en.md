<div align="center">

# ai-sdlc-kit CLI

**Scaffold and verify AI-SDLC projects with one command — zero-dependency, Node ≥ 18.**

[Tiếng Việt](README.md) · **English**

</div>

---

This CLI automates the hand-off contract in [`docs/en/12-onboarding.md`](../docs/en/12-onboarding.md): a new member goes from zero to "gates green" without being coached.

## Run it

```bash
# ① Run directly — prefix EVERY command with npx
npx github:ksi283/ai-sdlc-kit --help
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --agent claude

# ② Install the global command once, then use it plainly
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit --help --lang vi

# ③ From a clone of the kit
node cli/ai-sdlc-kit.mjs --help
```

> Most common trap: running `npx github:…` once and then calling `ai-sdlc-kit` directly gives `command not found` — npx is one-shot, it does not install a command.

## Commands

| Command / option | What it does |
|---|---|
| `init <dir>` | Scaffold a project: AGENTS.md, templates, policy, CI, CODEOWNERS + skill auto-activation |
| `init <dir> --plugin` | (`claude` only) copies no local skills: they come from the `ai-sdlc-kit` Claude Code plugin, and routing uses `ai-sdlc-kit:<pack>` |
| `notify [dir]` | Plugin SessionStart hook: asks for a decision when the project was scaffolded by an older kit release; silent otherwise |
| `check [dir]` | 10-point wiring report — **exit 1 when incomplete**, CI-usable |
| `skill <pack> <dir>` | Install a pack from [`skills/registry.yml`](../skills/registry.yml) into a project |
| `update [dir]` | Bring a project to the current kit: unmodified files updated, **project-modified files kept**, missing files restored, skills refreshed |
| `--agent <ide name>` | Target agent's skill directory (`claude` · `cursor` · `codex` · `zcode` · `gemini` · `copilot`) — defaults to `claude` with a printed notice when omitted |
| `--lang vi\|en` | Switch help + progress language (technical errors stay in English) |
| `--skills <list>` | Comma list of packs; unknown packs rejected **before** any file is written |
| `--force` / `--dry-run` | Scaffold into a non-empty dir / preview without writing |

## Supported agents

`--agent` picks the agent's skill directory. The routing in `AGENTS.md` names the exact `SKILL.md` path of each pack, so an agent that reads `AGENTS.md` can open the file even when it does not load skills on its own.

| Agent | Skill directory | Reads `AGENTS.md` | Verification |
|---|---|---|---|
| Claude Code (`claude`) | `.claude/skills/` | Yes, when there is no `CLAUDE.md` (Claude Code v2.1.277 or later). If you have a `CLAUDE.md`, add an `@AGENTS.md` line to it | Verified: [memory docs](https://code.claude.com/docs/en/memory), [skills docs](https://code.claude.com/docs/en/skills) |
| Codex (`codex`) | `.agents/skills/` | Yes, at the repository root (Codex walks down from the Git root to the current directory) | Verified: [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Codex skills](https://learn.chatgpt.com/docs/build-skills.md) |
| Cursor (`cursor`) | `.cursor/skills/` (also reads `.agents/skills/`, `.claude/skills/`, `.codex/skills/`) | Yes, at the project root; subdirectories are supported too | Verified: [Cursor rules](https://cursor.com/docs/context/rules), [Cursor skills](https://cursor.com/docs/skills) |
| ZCode (`zcode`) | `.zcode/skills/` | Yes, at the root, like Claude Code (confirmed by the maintainer) | **Not verified**: the skill directory is not documented. The routing still points at the exact file |
| Gemini CLI (`gemini`) | `.gemini/skills/` | Not by default. The kit creates a `GEMINI.md` with an `@AGENTS.md` line, so Gemini reads the routing | Verified: [Gemini CLI skills](https://geminicli.com/docs/cli/skills), [GEMINI.md](https://geminicli.com/docs/cli/gemini-md.md) |
| Copilot (`copilot`) | `.github/skills/` | Yes, at the root: coding agent, Copilot CLI and code review on GitHub.com (root location confirmed by the maintainer) | Verified: [Copilot skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills), [custom instructions](https://docs.github.com/en/copilot/reference/custom-instructions-support) |

## Notes

- **Idempotent**: re-running `init`/`skill`/`update` never duplicates the AGENTS.md block.
- **`.ai-sdlc-kit.json`** (written by `init`) records the kit version + baseline hashes — commit it; `update` uses it so project edits are never overwritten.
- **Plugin mode** (`init --plugin`): `.ai-sdlc-kit.json` records `"mode": "plugin"`; `update` and `skill` stop copying local skills. Projects without a `mode` field are treated as `copy`.
- **Registry-first**: only packs registered in `skills/registry.yml` (via PR) are installable.
- Private repo → npx/npm installs from GitHub require your repo credentials.
- The kit itself is not an importable package (`private: true`); npm publishing is a deliberate v2 decision.
