#!/usr/bin/env bash
# Validate framework structure, skill frontmatter, links, and budgets.
# Usage: ./scripts/doctor.sh

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

errors=0
warnings=0

fail() { err "$*"; errors=$((errors + 1)); }
warn_() { warn "$*"; warnings=$((warnings + 1)); }
ok() { printf 'ok   %s\n' "$*"; }

say "$FRAMEWORK_NAME — doctor"
say "Root: $ROOT"
say ""

# ---------------------------------------------------------------- required files
required="
AGENTS.md
README.md
framework.conf
$SKILLS_DIR
$TEMPLATES_DIR
$PROJECT_DIR/STATE.md
$PROJECT_DIR/00-brief.md
$PROJECT_DIR/02-prd.md
$PROJECT_DIR/02-product-catalog.md
$PROJECT_DIR/03-architecture.md
$PROJECT_DIR/05-plan.md
$PROJECT_DIR/06-specs
$PROJECT_DIR/04-adr
$DOCS_DIR/00-start-here.md
$DOCS_DIR/10-token-economy.md
scripts/sync-adapters.sh
scripts/token-audit.sh
scripts/doctor.sh
scripts/bootstrap.sh
scripts/new.sh
scripts/install-hooks.sh
scripts/graphify-setup.sh
scripts/lib.sh
scripts/prompt-lint.sh
scripts/promote.sh
scripts/context-pack.sh
scripts/apply-profile.sh
.githooks/commit-msg
.graphifyignore
.github/workflows/framework-check.yml
$PROFILES_DIR/README.md
$PROFILES_DIR/web-react-vite-netlify.md
$PROFILES_DIR/api-python-django.md
$PROFILES_DIR/api-python.md
$PROFILES_DIR/api-node-nest.md
$PROFILES_DIR/layout-split-apps.md
$PACKS_DIR/session.txt
$PACKS_DIR/implement-web.txt
$PACKS_DIR/implement-api.txt
$PACKS_DIR/implement-api-python.txt
$PACKS_DIR/implement-api-nest.txt
$PACKS_DIR/git.txt
.agents/recipes/react-vite-feature.md
.agents/recipes/django-drf-crud.md
.agents/recipes/fastapi-router.md
.agents/recipes/nestjs-module.md
"

for item in $required; do
  if [ -e "$ROOT/$item" ]; then
    ok "$item"
  else
    fail "missing: $item"
  fi
done
say ""

# ---------------------------------------------------------------- budgets
agents="$ROOT/AGENTS.md"
if [ -f "$agents" ]; then
  lines=$(line_count "$agents")
  if [ "$lines" -le "$AGENTS_MAX_LINES" ]; then
    ok "AGENTS.md lines: $lines / $AGENTS_MAX_LINES"
  else
    fail "AGENTS.md has $lines lines (budget $AGENTS_MAX_LINES)"
  fi
fi

for doc in "$ROOT/$DOCS_DIR"/*.md; do
  [ -f "$doc" ] || continue
  lines=$(line_count "$doc")
  if [ "$lines" -gt "$DOC_MAX_LINES" ]; then
    fail "$(basename "$doc") has $lines lines (budget $DOC_MAX_LINES)"
  fi
done
say ""

# ---------------------------------------------------------------- skills
skills="$ROOT/$SKILLS_DIR"
skill_total=0
if [ -d "$skills" ]; then
  for dir in "$skills"/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"
    file="$dir/SKILL.md"
    skill_total=$((skill_total + 1))

    if [ ! -f "$file" ]; then
      fail "skill $name: missing SKILL.md"
      continue
    fi

    first="$(head -n 1 "$file")"
    if [ "$first" != "---" ]; then
      fail "skill $name: SKILL.md must start with YAML frontmatter"
      continue
    fi

    fm_name="$(awk -F': *' '/^name:/ { print $2; exit }' "$file")"
    desc="$(skill_description "$file")"
    body_lines=$(line_count "$file")

    if [ "$fm_name" != "$name" ]; then
      fail "skill $name: frontmatter name '$fm_name' does not match folder"
    fi

    if [ -z "$desc" ]; then
      fail "skill $name: missing description"
    else
      chars=$(printf '%s' "$desc" | wc -c | tr -d '[:space:]')
      if [ "$chars" -gt "$SKILL_DESC_MAX_CHARS" ]; then
        fail "skill $name: description $chars chars (budget $SKILL_DESC_MAX_CHARS)"
      fi
    fi

    if [ "$body_lines" -gt "$SKILL_MAX_LINES" ]; then
      fail "skill $name: $body_lines lines (budget $SKILL_MAX_LINES)"
    fi

    if [ -n "$desc" ] && [ "$fm_name" = "$name" ]; then
      ok "skill $name ($body_lines lines)"
    fi
  done
fi

if [ "$skill_total" -eq 0 ]; then
  fail "no skills found in $SKILLS_DIR"
else
  say "skills: $skill_total"
fi
say ""

# ---------------------------------------------------------------- state
state="$ROOT/$PROJECT_DIR/STATE.md"
if [ -f "$state" ]; then
  grep -q '^phase:' "$state" || fail "project/STATE.md missing 'phase:'"
  grep -q '^next_action:' "$state" || fail "project/STATE.md missing 'next_action:'"
  if grep -q '{{DATE}}' "$state" 2>/dev/null && ! grep -q '{{PROJECT_NAME}}' "$state" 2>/dev/null; then
    warn_ "project/STATE.md still has {{DATE}}; run bootstrap.sh"
  fi
  if grep -q '^phase:' "$state" && grep -q '^next_action:' "$state"; then
    ok "project/STATE.md frontmatter"
  fi
fi
say ""

# ---------------------------------------------------------------- links
check_links() {
  local file="$1" dir link target clean
  dir="$(dirname "$file")"

  while IFS= read -r link; do
    [ -n "$link" ] || continue
    case "$link" in
      http://*|https://*|mailto:*|\#*|'') continue ;;
      *'{{'*|*'<'*|*'>'*) continue ;;
    esac

    clean="${link%%#*}"
    clean="${clean%%\?*}"
    [ -n "$clean" ] || continue

    case "$clean" in
      /*) target="$clean" ;;
      *)  target="$dir/$clean" ;;
    esac

    if [ ! -e "$target" ]; then
      fail "broken link in ${file#"$ROOT/"}: $link"
    fi
  done < <(grep -oE '\]\([^)]+\)' "$file" 2>/dev/null | sed -E 's/^\]\((.*)\)$/\1/')
}

link_files=("$ROOT/AGENTS.md" "$ROOT/README.md")
for f in "$ROOT/$DOCS_DIR"/*.md; do
  [ -f "$f" ] && link_files+=("$f")
done
for f in "$ROOT/$SKILLS_DIR"/*/SKILL.md; do
  [ -f "$f" ] && link_files+=("$f")
done

before_errors=$errors
for f in "${link_files[@]}"; do
  [ -f "$f" ] && check_links "$f"
done

if [ "$errors" -eq "$before_errors" ]; then
  ok "links resolve"
else
  fail "broken links found"
fi
say ""

# ---------------------------------------------------------------- git model + profiles
case "${GIT_MODEL:-promotion}" in
  promotion|trunk) ok "GIT_MODEL=$GIT_MODEL" ;;
  *) fail "GIT_MODEL='$GIT_MODEL' (use promotion or trunk)" ;;
esac

for p in "$FRONTEND_PROFILE" "$BACKEND_PROFILE" layout-split-apps; do
  if [ -f "$ROOT/$PROFILES_DIR/${p}.md" ]; then
    ok "profile $p"
  else
    fail "missing profile: $PROFILES_DIR/${p}.md"
  fi
done
say ""

# ---------------------------------------------------------------- adapters
if [ -f "$ROOT/CLAUDE.md" ]; then
  if [ -L "$ROOT/CLAUDE.md" ]; then
    ok "CLAUDE.md symlink"
  elif [ -d "$ROOT/.claude/skills" ] && [ ! -L "$ROOT/.claude/skills" ]; then
    ok "CLAUDE.md copy (copy mode)"
  else
    warn_ "CLAUDE.md is a regular file; prefer the generated symlink"
  fi
fi

for gen in \
  "$ROOT/.github/copilot-instructions.md" \
  "$ROOT/.cursor/rules/000-agents.mdc" \
  "$ROOT/.windsurf/rules/00-agents.md" \
  "$ROOT/.roo/rules/00-agents.md" \
  "$ROOT/.junie/guidelines.md"; do
  if [ -f "$gen" ]; then
    if grep -q "$MARKER" "$gen" 2>/dev/null; then
      ok "generated: ${gen#"$ROOT/"}"
    else
      warn_ "generated file lacks marker: ${gen#"$ROOT/"}"
    fi
    if [ "$agents" -nt "$gen" ]; then
      warn_ "${gen#"$ROOT/"} is older than AGENTS.md; run sync-adapters.sh"
    fi
  fi
done

if [ ! -e "$ROOT/.github/copilot-instructions.md" ] && \
   [ ! -e "$ROOT/.cursor/rules/000-agents.mdc" ] && \
   [ ! -e "$ROOT/CLAUDE.md" ]; then
  warn_ "no adapters found; run ./scripts/sync-adapters.sh"
fi
say ""

# ---------------------------------------------------------------- summary
if [ "$errors" -gt 0 ]; then
  err "$errors error(s), $warnings warning(s)"
  exit 1
fi

say "Doctor: pass ($warnings warning(s))"
