#!/usr/bin/env bash
# skills/install.sh — install a skill pack into a project and wire auto-activation.
#
# Usage:
#   skills/install.sh <pack-name> <project-dir> [--agent claude|cursor|codex|zcode|gemini|copilot]
#   ('--ai' still works as a deprecated alias)
#
# This is a thin wrapper around `ai-sdlc-kit skill`. The CLI is the single implementation,
# so this script and the CLI cannot drift apart: same routing rows, same agent
# directories, same entry files. Requires Node >= 18 (the kit's CLI is Node-based).
#
# Idempotent: safe to re-run after upgrading a pack or its registry entry.

set -euo pipefail

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v node >/dev/null 2>&1 || { echo "error: node >= 18 is required (the kit CLI runs on Node)" >&2; exit 1; }
[ $# -ge 2 ] || { echo "usage: skills/install.sh <pack-name> <project-dir> [--agent claude|cursor|codex|zcode|gemini|copilot]" >&2; exit 1; }

exec node "$KIT_ROOT/cli/ai-sdlc-kit.mjs" skill "$@"
