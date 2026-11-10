#!/usr/bin/env bash
# Write nested AGENTS.md and project/rules/stack.md from selected profiles.
# Usage: ./scripts/apply-profile.sh [--write-apps] [--force]

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

WRITE_APPS=0
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --write-apps) WRITE_APPS=1 ;;
    --force)      FORCE=1 ;;
    -h|--help)
      sed -n '2,3p' "$0"
      exit 0
      ;;
    *) die "unknown flag: $arg" ;;
  esac
done

FRONTEND="${FRONTEND_PROFILE:-web-react-vite-netlify}"
BACKEND="${BACKEND_PROFILE:-api-python-django}"
WEB="${WEB_DIR:-apps/web}"
API="${API_DIR:-apps/api}"
PROFILES="${PROFILES_DIR:-.agents/profiles}"
TPL="${TEMPLATES_DIR:-.agents/templates}"

require_profile() {
  local name="$1"
  [ -f "$ROOT/$PROFILES/${name}.md" ] || die "missing profile: $PROFILES/${name}.md"
}

require_profile "$FRONTEND"
require_profile "$BACKEND"
[ -f "$ROOT/$PROFILES/layout-split-apps.md" ] || die "missing layout-split-apps profile"

mkdir -p "$ROOT/project/rules"
STACK="$ROOT/project/rules/stack.md"

if [ -f "$STACK" ] && [ "$FORCE" != "1" ] && ! grep -q "$MARKER" "$STACK" 2>/dev/null; then
  warn "skip $STACK (exists). Pass --force to overwrite."
else
  cat > "$STACK" <<EOF
<!-- $MARKER; edit framework.conf profiles, then run scripts/apply-profile.sh -->

# Stack

Selected by \`framework.conf\`. Load the matching profile when writing code; do not load both.

| Side | Profile | Path | Git track |
|---|---|---|---|
| Frontend | \`$FRONTEND\` | \`$WEB\` | frontend |
| Backend | \`$BACKEND\` | \`$API\` | backend |
| Layout | \`layout-split-apps\` | repo root | — |

- Frontend conventions: \`$PROFILES/$FRONTEND.md\`
- Backend conventions: \`$PROFILES/$BACKEND.md\`
- Layout and CI: \`$PROFILES/layout-split-apps.md\`
- Git promotion: \`docs/07-git-workflow.md\`

Commands live in \`$WEB/AGENTS.md\` and \`$API/AGENTS.md\`.
EOF
  say "wrote $STACK"
fi

write_nested() {
  local dest="$1" src="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -f "$dest" ] && [ "$FORCE" != "1" ]; then
    warn "skip $dest (exists)"
    return 0
  fi
  cp "$src" "$dest"
  say "wrote $dest"
}

if [ "$WRITE_APPS" = "1" ]; then
  [ -f "$ROOT/$TPL/agents-web.md" ] || die "missing $TPL/agents-web.md"
  [ -f "$ROOT/$TPL/agents-api.md" ] || die "missing $TPL/agents-api.md"
  write_nested "$ROOT/$WEB/AGENTS.md" "$ROOT/$TPL/agents-web.md"
  write_nested "$ROOT/$API/AGENTS.md" "$ROOT/$TPL/agents-api.md"
else
  say "nested AGENTS.md not written (pass --write-apps when bootstrapping a product)"
fi

say "profiles: frontend=$FRONTEND backend=$BACKEND git=$GIT_MODEL"
say "next: fill AGENTS.md §11 from project/rules/stack.md if this is a product repo"
