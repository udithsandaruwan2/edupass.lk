#!/usr/bin/env bash
# Scaffold a new ADR, spec, task, skill, or project rule.
# Usage: ./scripts/new.sh <adr|spec|task|skill|rule> "<title>"

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

TYPE="${1:-}"
TITLE="${2:-}"

[ -n "$TYPE" ] || die "usage: new.sh <adr|spec|task|skill|rule> \"<title>\""
[ -n "$TITLE" ] || die "missing title"

SLUG="$(slugify "$TITLE")"
[ -n "$SLUG" ] || die "title produced an empty slug"

next_seq() {
  local dir="$1" prefix="$2" digits="$3" max=0 n b f
  if [ -d "$dir" ]; then
    for f in "$dir"/${prefix}*; do
      [ -f "$f" ] || continue
      b="$(basename "$f")"
      n="$(printf '%s' "$b" | sed -E "s/^${prefix}([0-9]+).*/\\1/")"
      case "$n" in
        ''|*[!0-9]*) continue ;;
      esac
      n=$((10#$n))
      [ "$n" -gt "$max" ] && max=$n
    done
  fi
  printf "%0${digits}d" $((max + 1))
}

case "$TYPE" in
  adr)
    dir="$ROOT/$PROJECT_DIR/04-adr"
    num="$(next_seq "$dir" "" 4)"
    dest="$dir/${num}-${SLUG}.md"
    [ -e "$dest" ] && die "already exists: $dest"
    cp "$ROOT/$TEMPLATES_DIR/adr.md" "$dest"
    replace_token "$dest" "<nnnn>" "$num"
    replace_token "$dest" "<decision title>" "$TITLE"
    say "Created $dest"
    say "Remember to add it to the ADR index in project/04-adr/README.md"
    ;;

  spec)
    dir="$ROOT/$PROJECT_DIR/06-specs"
    num="$(next_seq "$dir" "FEAT-" 3)"
    dest="$dir/FEAT-${num}-${SLUG}.md"
    [ -e "$dest" ] && die "already exists: $dest"
    cp "$ROOT/$TEMPLATES_DIR/feature-spec.md" "$dest"
    replace_token "$dest" "<###>" "$num"
    replace_token "$dest" "<feature name>" "$TITLE"
    say "Created $dest"
    say "Link it from project/02-product-catalog.md"
    ;;

  task)
    dir="$ROOT/$PROJECT_DIR/05-plan/tasks"
    mkdir -p "$dir"
    num="$(next_seq "$dir" "T-" 3)"
    dest="$dir/T-${num}-${SLUG}.md"
    [ -e "$dest" ] && die "already exists: $dest"
    cp "$ROOT/$TEMPLATES_DIR/task.md" "$dest"
    replace_token "$dest" "<###>" "$num"
    replace_token "$dest" "<task title>" "$TITLE"
    say "Created $dest"
    say "Add it to the task index in project/05-plan/tasks/README.md"
    ;;

  skill)
    dir="$ROOT/$SKILLS_DIR/$SLUG"
    dest="$dir/SKILL.md"
    [ -e "$dest" ] && die "already exists: $dest"
    mkdir -p "$dir"
    cp "$ROOT/$TEMPLATES_DIR/skill.md" "$dest"
    replace_token "$dest" "<skill-name>" "$SLUG"
    replace_token "$dest" "<Skill title>" "$TITLE"
    say "Created $dest"
    say "Write a trigger-focused description, then run ./scripts/sync-adapters.sh"
    ;;

  rule)
    dir="$ROOT/$PROJECT_DIR/rules"
    dest="$dir/${SLUG}.md"
    [ -e "$dest" ] && die "already exists: $dest"
    cp "$ROOT/$TEMPLATES_DIR/rule.md" "$dest"
    replace_token "$dest" "<topic>" "$SLUG"
    say "Created $dest"
    say "Add it to the rule index in project/rules/README.md"
    ;;

  *)
    die "unknown type '$TYPE' (use adr, spec, task, skill, or rule)"
    ;;
esac
