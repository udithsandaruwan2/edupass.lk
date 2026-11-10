#!/usr/bin/env bash
# Install the Conventional Commits hook for this repository.
# Usage: ./scripts/install-hooks.sh [target-dir]

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET="${1:-$ROOT}"
TARGET="$(cd "$TARGET" && pwd)" || {
  printf 'error: target does not exist\n' >&2
  exit 1
}

chmod +x "$TARGET/.githooks/"* 2>/dev/null || true

if ! git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
  printf 'note: %s is not a git repository; hook installed but not activated.\n' "$TARGET"
  printf '      run: git -C %s init && ./scripts/install-hooks.sh %s\n' "$TARGET" "$TARGET"
  exit 0
fi

git -C "$TARGET" config core.hooksPath .githooks
printf 'Hooks installed: core.hooksPath=.githooks\n'
printf 'Commit format:   type(scope): imperative summary\n'
