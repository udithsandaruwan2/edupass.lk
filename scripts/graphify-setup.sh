#!/usr/bin/env bash
# Install and wire Graphify (official CLI) into a DevOpt project.
# Usage: ./scripts/graphify-setup.sh [target-dir] [--skip-build] [--skip-hooks] [--skip-agents]
#
# Official flow (see https://docs.graphify.com):
#   uv tool install graphifyy
#   graphify update .          # AST code graph, no LLM
#   graphify hook install      # post-commit/checkout/merge/rewrite
#   graphify cursor install    # .cursor/rules/graphify.mdc
#
# DevOpt uses core.hooksPath=.githooks, so this script also installs thin
# .githooks/post-* wrappers that call `graphify update .` in the background.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET="$ROOT"
SKIP_BUILD=0
SKIP_HOOKS=0
SKIP_AGENTS=0

for arg in "$@"; do
  case "$arg" in
    --skip-build)  SKIP_BUILD=1 ;;
    --skip-hooks)  SKIP_HOOKS=1 ;;
    --skip-agents) SKIP_AGENTS=1 ;;
    -h|--help)
      sed -n '2,14p' "$0"
      exit 0
      ;;
    -*)
      printf 'error: unknown flag %s\n' "$arg" >&2
      exit 2
      ;;
    *)
      TARGET="$arg"
      ;;
  esac
done

TARGET="$(cd "$TARGET" && pwd)" || {
  printf 'error: target does not exist\n' >&2
  exit 1
}

if [ -f "$TARGET/scripts/lib.sh" ]; then
  # shellcheck disable=SC1091
  . "$TARGET/scripts/lib.sh"
else
  # shellcheck disable=SC1091
  . "$ROOT/scripts/lib.sh"
fi

ok() { printf 'ok   %s\n' "$*"; }

ensure_cli() {
  if command -v graphify >/dev/null 2>&1; then
    ok "graphify CLI: $(command -v graphify)"
    return 0
  fi
  say "Installing graphifyy (official package)…"
  if command -v uv >/dev/null 2>&1; then
    uv tool install --upgrade graphifyy >/dev/null 2>&1 || uv tool install graphifyy
  elif command -v pipx >/dev/null 2>&1; then
    pipx install graphifyy
  else
    python3 -m pip install --user graphifyy 2>/dev/null \
      || python3 -m pip install --user graphifyy --break-system-packages
  fi
  if ! command -v graphify >/dev/null 2>&1; then
    warn "graphify not on PATH. Run: uv tool install graphifyy && uv tool update-shell"
    return 1
  fi
  ok "graphify CLI installed"
}

write_ignore() {
  local ignore="$TARGET/.graphifyignore"
  if [ -f "$ignore" ]; then
    ok ".graphifyignore exists"
    return 0
  fi
  cat > "$ignore" <<'EOF'
# Keep the knowledge graph focused on product + framework source.
site/
examples/
graphify-out/
dist/
build/
node_modules/
.venv/
venv/
__pycache__/
.netlify/
.agents/.cache/
*.min.js
pnpm-lock.yaml
uv.lock
package-lock.json
EOF
  ok "wrote .graphifyignore"
}

write_githook_wrappers() {
  local hooks="$TARGET/.githooks"
  mkdir -p "$hooks"
  local name
  for name in post-commit post-checkout post-merge post-rewrite; do
    cat > "$hooks/$name" <<'EOF'
#!/bin/sh
# DevOpt + Graphify: rebuild AST knowledge graph after git events.
# core.hooksPath=.githooks (official graphify hooks live under .git/hooks and
# would be skipped). Keep this thin; `graphify update` is AST-only / no LLM.
[ "${GRAPHIFY_SKIP_HOOK:-0}" = "1" ] && exit 0
command -v graphify >/dev/null 2>&1 || exit 0
_TOP=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$_TOP" || exit 0
# Skip during rebase/merge continue
_GD=$(git rev-parse --git-dir 2>/dev/null) || exit 0
[ -d "$_GD/rebase-merge" ] && exit 0
[ -d "$_GD/rebase-apply" ] && exit 0
[ -f "$_GD/MERGE_HEAD" ] && exit 0
_LOG="${XDG_CACHE_HOME:-$HOME/.cache}/graphify-rebuild.log"
mkdir -p "$(dirname "$_LOG")" 2>/dev/null || true
( graphify update . >>"$_LOG" 2>&1 ) &
exit 0
EOF
    chmod +x "$hooks/$name"
  done
  ok "wrote .githooks/post-{commit,checkout,merge,rewrite}"
}

install_agent_rules() {
  (
    cd "$TARGET" || exit 1
    if [ -d .cursor ] || mkdir -p .cursor/rules 2>/dev/null; then
      graphify cursor install >/dev/null 2>&1 && ok "graphify cursor install" \
        || warn "graphify cursor install failed (non-fatal)"
    fi
    # CLAUDE.md is often a symlink to AGENTS.md in DevOpt — do not append via
    # `graphify claude install` (would bloat always-on AGENTS.md). Rules live
    # in AGENTS.md §3 and .cursor/rules/graphify.mdc instead.
  )
}

build_graph() {
  (
    cd "$TARGET" || exit 1
    say "Building code graph (AST, no LLM)…"
    if graphify update .; then
      ok "graphify-out/ updated"
    else
      warn "graphify update failed (non-fatal). Run later: graphify update ."
      return 1
    fi
  )
}

say "DevOpt — Graphify setup"
say "Target: $TARGET"

ensure_cli || exit 1
write_ignore

if [ "$SKIP_AGENTS" != "1" ]; then
  install_agent_rules
fi

if [ "$SKIP_HOOKS" != "1" ]; then
  if git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
    # Official installer registers merge driver; with hooksPath=.githooks it also
    # appends bulky bodies into .githooks — we overwrite with thin wrappers next.
    ( cd "$TARGET" && graphify hook install >/dev/null 2>&1 ) \
      && ok "graphify hook install (merge driver)" \
      || warn "graphify hook install skipped/failed (wrappers still active via .githooks)"
  else
    warn "not a git repo yet — hooks written; activate with install-hooks.sh after git init"
  fi
  write_githook_wrappers
  if [ -x "$TARGET/scripts/install-hooks.sh" ]; then
    "$TARGET/scripts/install-hooks.sh" "$TARGET" >/dev/null || true
  fi
fi

if [ "$SKIP_BUILD" != "1" ]; then
  build_graph || true
fi

say ""
say "Graphify ready. Agents should:"
say "  graphify query \"<question>\"   # before first grep/read"
say "  graphify update .              # after code edits (AST, free)"
say "  graphify path \"A\" \"B\"         # dependency path"
say "  graphify explain \"Concept\"     # node neighborhood"
