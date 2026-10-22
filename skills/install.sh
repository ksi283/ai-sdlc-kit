#!/usr/bin/env bash
# skills/install.sh — install a skill pack into a project and wire auto-activation.
#
# Usage:
#   skills/install.sh <pack-name> <project-dir> [--agent claude|cursor|codex|zcode]
#   ('--ai' still works as a deprecated alias)
#
# What it does:
#   local pack    → copies skills/<pack-name>/ into <project>/.<agent>/skills/<pack-name>/
#   external pack → prints the pack's own install command (its installer must run;
#                   version/license live in registry.yml — never bypassed)
#   both          → refreshes the AUTO-ACTIVATION block in <project>/AGENTS.md so every
#                   agent session proactively routes work to the right pack
#
# Idempotent: safe to re-run after upgrading a pack or its registry entry.

set -euo pipefail

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGISTRY="$KIT_ROOT/skills/registry.yml"

die() { echo "error: $*" >&2; exit 1; }

[ $# -ge 2 ] || die "usage: skills/install.sh <pack-name> <project-dir> [--agent claude|cursor|codex|zcode]"
PACK="$1"; PROJECT="$2"; AI="${3:-}"
if [ "$AI" = "--agent" ] || [ "$AI" = "--ai" ]; then AI="${4:-}"; fi
if [ -z "$AI" ]; then
  AI="claude"
  echo "note: no --agent given — defaulting to claude (.claude/skills/)."
fi
[ -f "$REGISTRY" ] || die "registry not found: $REGISTRY"
[ -d "$PROJECT" ] || die "project dir not found: $PROJECT"

case "${AI:-claude}" in
  claude) AGENT_DIR=".claude/skills" ;;
  cursor) AGENT_DIR=".cursor/skills" ;;
  codex)  AGENT_DIR=".agents/skills" ;;
  zcode)  AGENT_DIR=".zcode/skills" ;;
  *) die "unknown --agent target '$AI' (claude|cursor|codex|zcode)" ;;
esac

# resolve class + version from the registry (python stdlib only)
META="$(python - "$REGISTRY" "$PACK" <<'PY'
import sys, yaml
registry, pack = sys.argv[1], sys.argv[2]
data = yaml.safe_load(open(registry, encoding="utf-8"))
entry = next((p for p in data["packs"] if p["name"] == pack), None)
if entry is None:
    sys.exit(f"pack '{pack}' is not in the registry — add it via PR first")
print(entry.get("class", ""), entry.get("version", ""))
PY
)"
CLASS="${META%% *}"; VERSION="${META##* }"
[ -n "$CLASS" ] || die "pack '$PACK' not resolved from registry"

case "$CLASS" in
  local)
    SRC="$KIT_ROOT/skills/$PACK"
    [ -f "$SRC/SKILL.md" ] || die "local pack '$PACK' has no SKILL.md at $SRC"
    DEST="$PROJECT/$AGENT_DIR/$PACK"
    mkdir -p "$(dirname "$DEST")"
    rm -rf "$DEST"
    cp -r "$SRC" "$DEST"
    echo "installed (local)   $PACK $VERSION -> $DEST"
    ;;
  external)
    echo "external pack       $PACK $VERSION"
    echo "run its own installer (registry 'install.cmd'), then re-run this"
    echo "script so the AGENTS.md routing block is refreshed."
    ;;
  *) die "unknown class '$CLASS'" ;;
esac

# ── refresh the auto-activation block in the project's AGENTS.md ──────
python - "$REGISTRY" "$PROJECT/AGENTS.md" <<'PY'
import sys, re, yaml
registry_path, agents_path = sys.argv[1], sys.argv[2]
data = yaml.safe_load(open(registry_path, encoding="utf-8"))

rows = []
for p in data["packs"]:
    if p["name"].startswith("<"):
        continue  # skip placeholder entries
    aa = p.get("auto_activate", {})
    stages = ", ".join(aa.get("lifecycle_stages", [])) or "-"
    use = "; ".join(aa.get("use_when", [])) or " ".join(p.get("purpose", "-").split())
    rows.append(f"| {p['name']} | {p.get('version','-')} | {aa.get('capability','-')} | {stages} | {use} |")

block = (
    "<!-- skills:auto:start (managed by skills/install.sh — do not edit) -->\n"
    "## Installed skill packs — auto-activation routing\n\n"
    "| Pack | v | Capability | Reach for it at | Use when |\n"
    "|---|---|---|---|---|\n"
    + "\n".join(rows) + "\n\n"
    "**Routing rule:** before starting work that matches a capability above, open the\n"
    "pack's SKILL.md (in the agent skill directory) and follow it; record the decisions\n"
    "the pack produces in project-owned knowledge (e.g. `DESIGN-SYSTEM.md`).\n"
    "<!-- skills:auto:end -->"
)

try:
    text = open(agents_path, encoding="utf-8").read()
except FileNotFoundError:
    text = "# AGENTS.md\n"
pattern = re.compile(r"<!-- skills:auto:start.*?<!-- skills:auto:end -->\n?", re.S)
text = pattern.sub(block + "\n", text) if pattern.search(text) else text.rstrip("\n") + "\n\n" + block + "\n"
open(agents_path, "w", encoding="utf-8", newline="\n").write(text)
print(f"auto-activation block refreshed in {agents_path}")
PY

echo "done."
