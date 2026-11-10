#!/usr/bin/env bash
# Print the exact files an agent should load for a task class.
# Usage: ./scripts/context-pack.sh <pack>
#        ./scripts/context-pack.sh --list

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

PACKS="${PACKS_DIR:-.agents/packs}"
PACK_DIR="$ROOT/$PACKS"

list_packs() {
  [ -d "$PACK_DIR" ] || die "missing $PACKS"
  say "Available packs:"
  for f in "$PACK_DIR"/*.txt; do
    [ -f "$f" ] || continue
    printf '  %s\n' "$(basename "$f" .txt)"
  done
}

if [ -z "${1:-}" ] || [ "${1:-}" = "--list" ] || [ "${1:-}" = "-l" ]; then
  list_packs
  exit 0
fi

NAME="$1"
FILE="$PACK_DIR/${NAME}.txt"
[ -f "$FILE" ] || die "unknown pack '$NAME' (try --list)"

# implement-api follows BACKEND_PROFILE (Django default).
if [ "$NAME" = "implement-api" ]; then
  case "${BACKEND_PROFILE:-api-python-django}" in
    api-python)     FILE="$PACK_DIR/implement-api-python.txt" ;;
    api-node-nest)  FILE="$PACK_DIR/implement-api-nest.txt" ;;
    *)              FILE="$PACK_DIR/implement-api.txt" ;;
  esac
fi

say "# context-pack: $(basename "$FILE" .txt)"
say "Load only these files, in order. Skip any path that does not exist."
say "Do not read other playbooks, profiles, or the rest of the repo."
say ""

n=0
while IFS= read -r rel || [ -n "$rel" ]; do
  case "$rel" in
    ''|\#*) continue ;;
  esac
  n=$((n + 1))
  if [ -e "$ROOT/$rel" ]; then
    printf '%2d. %s\n' "$n" "$rel"
  else
    printf '%2d. %s  (missing — skip)\n' "$n" "$rel"
  fi
done < "$FILE"

say ""
say "Then read the task/spec named in the request. Stop."
