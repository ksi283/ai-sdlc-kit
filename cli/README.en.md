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
| `check [dir]` | 10-point wiring report — **exit 1 when incomplete**, CI-usable |
| `skill <pack> <dir>` | Install a pack from [`skills/registry.yml`](../skills/registry.yml) into a project |
| `update [dir]` | Bring a project to the current kit: unmodified files updated, **project-modified files kept**, missing files restored, skills refreshed |
| `--agent <ide name>` | Target agent's skill directory (`claude` · `cursor` · `codex` · `zcode`) — defaults to `claude` with a printed notice when omitted |
| `--lang vi\|en` | Switch help + progress language (technical errors stay in English) |
| `--skills <list>` | Comma list of packs; unknown packs rejected **before** any file is written |
| `--force` / `--dry-run` | Scaffold into a non-empty dir / preview without writing |

## Notes

- **Idempotent**: re-running `init`/`skill`/`update` never duplicates the AGENTS.md block.
- **`.ai-sdlc-kit.json`** (written by `init`) records the kit version + baseline hashes — commit it; `update` uses it so project edits are never overwritten.
- **Registry-first**: only packs registered in `skills/registry.yml` (via PR) are installable.
- Private repo → npx/npm installs from GitHub require your repo credentials.
- The kit itself is not an importable package (`private: true`); npm publishing is a deliberate v2 decision.
