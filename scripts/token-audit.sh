#!/usr/bin/env bash
# Estimate context cost and enforce budgets.
# Usage: ./scripts/token-audit.sh [--strict] [--json]

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

STRICT=0
JSON=0

for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=1 ;;
    --json)   JSON=1 ;;
    -h|--help)
      sed -n '2,3p' "$0"
      exit 0
      ;;
    *) die "unknown flag: $arg" ;;
  esac
done

AGENTS="$ROOT/AGENTS.md"
[ -f "$AGENTS" ] || die "AGENTS.md not found"

agents_tokens=$(est_tokens "$AGENTS")
agents_lines=$(line_count "$AGENTS")

skills_dir="$ROOT/$SKILLS_DIR"
desc_tokens=0
skill_count=0
skill_over=0
desc_over=0
skill_rows=""

if [ -d "$skills_dir" ]; then
  for skill in "$skills_dir"/*/SKILL.md; do
    [ -f "$skill" ] || continue
    name="$(basename "$(dirname "$skill")")"
    desc="$(skill_description "$skill")"
    body_lines=$(line_count "$skill")
    chars=$(printf '%s' "$desc" | wc -c | tr -d '[:space:]')
    toks=$(awk -v c="$chars" 'BEGIN { printf "%d", (c + 3) / 4 }')
    desc_tokens=$((desc_tokens + toks + 10))
    skill_count=$((skill_count + 1))
    [ "$body_lines" -gt "$SKILL_MAX_LINES" ] && skill_over=$((skill_over + 1))
    [ "$chars" -gt "$SKILL_DESC_MAX_CHARS" ] && desc_over=$((desc_over + 1))
    skill_rows="${skill_rows}${name}|${toks}|${body_lines}|${chars}\n"
  done
fi

baseline=$((agents_tokens + desc_tokens))

# ---------------------------------------------------------------- collect
doc_rows=""
doc_count=0
doc_over=0
for doc in "$ROOT/$DOCS_DIR"/*.md; do
  [ -f "$doc" ] || continue
  name="${doc#"$ROOT/"}"
  toks=$(est_tokens "$doc")
  lines=$(line_count "$doc")
  doc_count=$((doc_count + 1))
  [ "$lines" -gt "$DOC_MAX_LINES" ] && doc_over=$((doc_over + 1))
  doc_rows="${doc_rows}${name}|${toks}|${lines}\n"
done

project_rows=""
for f in \
  "$ROOT/project/STATE.md" \
  "$ROOT/project/00-brief.md" \
  "$ROOT/project/01-discovery.md" \
  "$ROOT/project/02-prd.md" \
  "$ROOT/project/02-product-catalog.md" \
  "$ROOT/project/03-architecture.md" \
  "$ROOT/project/05-plan.md" \
  "$ROOT/project/07-runbook.md" \
  "$ROOT/project/08-metrics.md"; do
  [ -f "$f" ] || continue
  name="${f#"$ROOT/"}"
  project_rows="${project_rows}${name}|$(est_tokens "$f")|$(line_count "$f")\n"
done

templates_rows=""
templates_tokens=0
for f in "$ROOT/$TEMPLATES_DIR"/*.md; do
  [ -f "$f" ] || continue
  t=$(est_tokens "$f")
  templates_tokens=$((templates_tokens + t))
  templates_rows="${templates_rows}$(basename "$f")|${t}\n"
done

# ---------------------------------------------------------------- json
if [ "$JSON" = "1" ]; then
  printf '{\n'
  printf '  "agents_md": {"tokens": %d, "lines": %d, "budget_lines": %d},\n' "$agents_tokens" "$agents_lines" "$AGENTS_MAX_LINES"
  printf '  "skills": {"count": %d, "description_tokens": %d, "over_body_budget": %d, "over_description_budget": %d},\n' "$skill_count" "$desc_tokens" "$skill_over" "$desc_over"
  printf '  "baseline_tokens": %d,\n' "$baseline"
  printf '  "baseline_budget": %d,\n' "$BASELINE_MAX_TOKENS"
  printf '  "docs": {"count": %d, "over_budget": %d},\n' "$doc_count" "$doc_over"
  printf '  "templates_tokens": %d\n' "$templates_tokens"
  printf '}\n'
  exit 0
fi

# ---------------------------------------------------------------- report
say "$FRAMEWORK_NAME — token audit"
say "Version: $FRAMEWORK_VERSION"
say ""
say "TIER 0 — always loaded"
printf '  %-42s %6s tokens %5s lines\n' "AGENTS.md" "$agents_tokens" "$agents_lines"
printf '  %-42s %6s tokens %5s skills\n' "skill descriptions (name+desc)" "$desc_tokens" "$skill_count"
printf '  %-42s %6s tokens\n' "BASELINE" "$baseline"
say ""

say "TIER 1 — skills (body loads on trigger)"
printf '  %-34s %6s %5s %6s\n' "skill" "desc" "lines" "chars"
while IFS='|' read -r name toks lines chars; do
  [ -n "$name" ] || continue
  printf '  %-34s %6s %5s %6s\n' "$name" "$toks" "$lines" "$chars"
done < <(printf "%b" "$skill_rows")
say ""

say "TIER 2 — docs (one at a time)"
printf '  %-34s %6s %5s\n' "file" "tokens" "lines"
while IFS='|' read -r name toks lines; do
  [ -n "$name" ] || continue
  printf '  %-34s %6s %5s\n' "$name" "$toks" "$lines"
done < <(printf "%b" "$doc_rows")
say ""

say "TIER 2 — project artifacts"
printf '  %-34s %6s %5s\n' "file" "tokens" "lines"
while IFS='|' read -r name toks lines; do
  [ -n "$name" ] || continue
  printf '  %-34s %6s %5s\n' "$name" "$toks" "$lines"
done < <(printf "%b" "$project_rows")
say ""

profile_rows=""
if [ -d "$ROOT/${PROFILES_DIR:-.agents/profiles}" ]; then
  for f in "$ROOT/$PROFILES_DIR"/*.md; do
    [ -f "$f" ] || continue
    profile_rows="${profile_rows}${f#"$ROOT/"}|$(est_tokens "$f")|$(line_count "$f")\n"
  done
  say "TIER 2 — stack profiles (load one)"
  printf '  %-34s %6s %5s\n' "file" "tokens" "lines"
  while IFS='|' read -r name toks lines; do
    [ -n "$name" ] || continue
    printf '  %-34s %6s %5s\n' "$name" "$toks" "$lines"
  done < <(printf "%b" "$profile_rows")
  say ""
fi

say "TIER 3 — templates (on creation): $templates_tokens tokens across $(printf "%b" "$templates_rows" | grep -c . ) files"
say ""

# ---------------------------------------------------------------- checks
problems=0
[ "$agents_lines" -gt "$AGENTS_MAX_LINES" ] && { warn "AGENTS.md is $agents_lines lines (budget $AGENTS_MAX_LINES)"; problems=$((problems + 1)); }
[ "$baseline" -gt "$BASELINE_MAX_TOKENS" ] && { warn "baseline is $baseline tokens (budget $BASELINE_MAX_TOKENS)"; problems=$((problems + 1)); }
[ "$skill_over" -gt 0 ] && { warn "$skill_over skill(s) over $SKILL_MAX_LINES lines"; problems=$((problems + 1)); }
[ "$desc_over" -gt 0 ] && { warn "$desc_over skill description(s) over $SKILL_DESC_MAX_CHARS chars"; problems=$((problems + 1)); }
[ "$doc_over" -gt 0 ] && { warn "$doc_over doc(s) over $DOC_MAX_LINES lines"; problems=$((problems + 1)); }

if grep -q '{{PROJECT_NAME}}' "$AGENTS" 2>/dev/null; then
  say "note: AGENTS.md still contains {{PROJECT_NAME}}; run bootstrap.sh to personalize."
fi

if [ "$problems" -eq 0 ]; then
  say "All token budgets pass."
else
  say "$problems budget warning(s)."
  if [ "$STRICT" = "1" ]; then
    exit 1
  fi
fi
