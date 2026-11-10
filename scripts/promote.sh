#!/usr/bin/env bash
# Promote a git track. Default is dry-run.
# Usage:
#   ./scripts/promote.sh <frontend|backend> <dev|prod> [--apply] [--push]
#   ./scripts/promote.sh phase [--apply] [--push]
#
# frontend prod  = merge dev/frontend  → prod/frontend
# backend  prod  = merge dev/backend   → prod/backend
# frontend dev   = (no-op reminder: features merge via PR)
# phase          = merge both prod tracks → main
#
# Agents: never pass --apply for prod or phase unless the human said
# "go to production" or "promote to main".

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

APPLY=0
PUSH=0
TRACK=""
DEST=""

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    --push)  PUSH=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    --*) die "unknown flag: $arg" ;;
    *)
      if [ -z "$TRACK" ]; then
        TRACK="$arg"
      elif [ -z "$DEST" ]; then
        DEST="$arg"
      else
        die "unexpected argument: $arg"
      fi
      ;;
  esac
done

[ -n "$TRACK" ] || die "usage: promote.sh <frontend|backend|phase> [dev|prod] [--apply] [--push]"

if [ "${GIT_MODEL:-promotion}" != "promotion" ]; then
  die "GIT_MODEL=${GIT_MODEL:-} (promotion required). Trunk-based repos merge feature PRs to main instead."
fi

cd "$ROOT"

require_clean() {
  if [ -n "$(git status --porcelain)" ]; then
    die "working tree is dirty; commit or stash first"
  fi
}

resolve() {
  case "$1" in
    frontend)
      SRC="${BRANCH_DEV_FRONTEND:-dev/frontend}"
      DST="${BRANCH_PROD_FRONTEND:-prod/frontend}"
      ;;
    backend)
      SRC="${BRANCH_DEV_BACKEND:-dev/backend}"
      DST="${BRANCH_PROD_BACKEND:-prod/backend}"
      ;;
    *) die "track must be frontend or backend (got $1)" ;;
  esac
}

plan_merge() {
  local src="$1" dst="$2"
  say "plan: merge $src → $dst"
  git fetch origin --quiet 2>/dev/null || true
  if git rev-parse --verify "$src" >/dev/null 2>&1 && git rev-parse --verify "$dst" >/dev/null 2>&1; then
    git log --oneline "$dst..$src" 2>/dev/null | sed 's/^/  /' || true
    local count
    count="$(git rev-list --count "$dst..$src" 2>/dev/null || printf '0')"
    say "commits to promote: $count"
  else
    say "note: local branches may not exist yet; create them before --apply"
    say "  git branch $src ${BRANCH_MAIN:-main}"
    say "  git branch $dst ${BRANCH_MAIN:-main}"
  fi
}

do_merge() {
  local src="$1" dst="$2" msg="$3"
  git rev-parse --verify "$src" >/dev/null 2>&1 || die "missing branch $src"
  git rev-parse --verify "$dst" >/dev/null 2>&1 || die "missing branch $dst"
  git switch "$dst"
  git merge --no-ff "$src" -m "$msg"
  if [ "$PUSH" = "1" ]; then
    git push origin "$dst"
  else
    say "merged locally. Push: git push origin $dst"
  fi
}

if [ "$TRACK" = "phase" ]; then
  MAIN="${BRANCH_MAIN:-main}"
  PF="${BRANCH_PROD_FRONTEND:-prod/frontend}"
  PB="${BRANCH_PROD_BACKEND:-prod/backend}"
  say "phase promote: $PF + $PB → $MAIN"
  plan_merge "$PF" "$MAIN"
  plan_merge "$PB" "$MAIN"
  if [ "$APPLY" != "1" ]; then
    say "dry-run. Re-run with --apply after human approval."
    exit 0
  fi
  require_clean
  do_merge "$PF" "$MAIN" "chore(promote): $PF → $MAIN (phase)"
  do_merge "$PB" "$MAIN" "chore(promote): $PB → $MAIN (phase)"
  say "phase promote complete"
  exit 0
fi

case "$TRACK" in
  frontend|backend) ;;
  *) die "track must be frontend, backend, or phase" ;;
esac

[ -n "$DEST" ] || die "missing destination (dev|prod)"

resolve "$TRACK"

case "$DEST" in
  prod)
    say "promote $TRACK: $SRC → $DST"
    plan_merge "$SRC" "$DST"
    if [ "$APPLY" != "1" ]; then
      say "dry-run. Re-run with --apply only if the human said go to production."
      exit 0
    fi
    require_clean
    do_merge "$SRC" "$DST" "chore(promote): $SRC → $DST"
    ;;
  dev)
    say "features merge into $SRC via PR, not this script."
    say "create: git switch $SRC && git switch -c feat/${TRACK}/<slug>"
    exit 0
    ;;
  *)
    die "destination must be prod (or use: promote.sh phase)"
    ;;
esac
