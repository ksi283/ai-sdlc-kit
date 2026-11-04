---
description: Report AI-SDLC wiring for a project (ai-sdlc-kit check)
argument-hint: "[project-dir]"
allowed-tools: Bash(node:*)
---

Run the kit's wiring check against the target project (default: current directory):

!`node "${CLAUDE_PLUGIN_ROOT}/cli/ai-sdlc-kit.mjs" check $ARGUMENTS`

Summarise the result: list each failing wiring check and the doc section that fixes it
(docs/en/12-onboarding.md). Do not modify files.
