---
description: Scaffold an AI-SDLC project from Claude Code (ai-sdlc-kit init --plugin). Dry run first; writes only after you confirm.
argument-hint: "<project-dir> [--skills intent-review,spec-review] [--force]"
allowed-tools: Bash(node:*)
disable-model-invocation: true
---

Scaffold an AI-SDLC project with the kit CLI in plugin mode. In plugin mode the local skills come from this plugin, so nothing is copied into the project. Arguments: `$ARGUMENTS`

This command writes files into the target project. Follow the steps in order.

1. **Check the target directory.** The first argument must be the project directory. If `$ARGUMENTS` does not give one, ask the user for it and stop. Do not guess, and do not default to the current directory.

2. **Dry run.** Run this, with the directory first and any other options from `$ARGUMENTS` after it:

   `node "${CLAUDE_PLUGIN_ROOT}/cli/ai-sdlc-kit.mjs" init <project-dir> --agent claude --plugin --dry-run <other options>`

   Do not add `--agent` or `--plugin` if the user already passed them. Passing `--agent` with a value other than `claude` makes the CLI refuse, which is the correct behaviour.

3. **Ask for confirmation.** Show the user what the dry run would write: the directory, the files, and the skills. Then ask whether to proceed. Do not run the real command until the user confirms in a later message.

4. **Real run.** After confirmation, run the same command again without `--dry-run`.

5. **Verify.** Run the wiring check on the same directory:

   `node "${CLAUDE_PLUGIN_ROOT}/cli/ai-sdlc-kit.mjs" check <project-dir>`

6. **Report.** Say which wiring checks pass. Give the next step the CLI printed: edit `AGENTS.md` for the project, then write the first intent in `docs/intents/`.

If the dry run fails because the directory is not empty, do not add `--force` on your own. `--force` writes over kit files that already exist in that directory. List which of them exist (for example with `ls`), tell the user, and ask before retrying with `--force`.

If the CLI fails for any other reason, show the error and stop. Do not create the kit's files by hand to work around it.
