#!/usr/bin/env bash
# Lint a work order for missing fields, vague language, and size.
# Usage: ./scripts/prompt-lint.sh <file|->

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/scripts/lib.sh"

SRC="${1:-}"
[ -n "$SRC" ] || die "usage: prompt-lint.sh <file|->"

TMP=""
cleanup() { [ -n "$TMP" ] && rm -f "$TMP"; }
trap cleanup EXIT

if [ "$SRC" = "-" ]; then
  TMP="$(mktemp "${TMPDIR:-/tmp}/apf-prompt.XXXXXX")"
  cat > "$TMP"
  FILE="$TMP"
else
  FILE="$SRC"
fi

[ -f "$FILE" ] || die "file not found: $FILE"

errors=0
warnings=0
fail() { err "$*"; errors=$((errors + 1)); }
warn_() { warn "$*"; warnings=$((warnings + 1)); }

say "Prompt lint — $SRC"

words=$(wc -w < "$FILE" | tr -d '[:space:]')
say "words: $words"

# ---------------------------------------------------------------- required fields
check_field() {
  local label="$1" pattern="$2" level="$3"
  if grep -qiE "$pattern" "$FILE"; then
    say "ok   $label"
  else
    if [ "$level" = "error" ]; then
      fail "missing $label"
    else
      warn_ "missing $label"
    fi
  fi
}

check_field "Goal"        '^#{0,3}[[:space:]]*Goal[[:space:]]*:?' 'error'
check_field "Context"     '^#{0,3}[[:space:]]*Context[[:space:]]*:?' 'warn'
check_field "Constraints" '^#{0,3}[[:space:]]*Constraints[[:space:]]*:?' 'warn'
check_field "Acceptance"  '^#{0,3}[[:space:]]*Acceptance[[:space:]]*:?' 'error'
check_field "Out of scope" '^#{0,3}[[:space:]]*Out of scope[[:space:]]*:?' 'warn'
check_field "Verification" '^#{0,3}[[:space:]]*Verification[[:space:]]*:?' 'error'
check_field "Budget"      '^#{0,3}[[:space:]]*Budget[[:space:]]*:?' 'warn'
check_field "Track"       '^#{0,3}[[:space:]]*Track[[:space:]]*:?' 'warn'

checks=$(grep -cE '^[[:space:]]*- \[ \]' "$FILE" 2>/dev/null || true)
checks=${checks:-0}
if [ "$checks" -ge 2 ]; then
  say "ok   acceptance checks: $checks"
elif [ "$checks" -eq 1 ]; then
  warn_ "only 1 acceptance check; add a failure/regression check"
else
  fail "no acceptance checkboxes (- [ ])"
fi

# ---------------------------------------------------------------- size
if [ "$words" -gt 400 ]; then
  warn_ "work order is $words words; target <=300, hard cap 400"
elif [ "$words" -gt 300 ]; then
  warn_ "work order is $words words; consider trimming"
else
  say "ok   size"
fi

# ---------------------------------------------------------------- vague language
vague="robust seamless production-ready best-practices improve better fast secure easy simple etc maybe some stuff things clean modern scalable optimize"
for word in $vague; do
  hits=$(grep -inE "\b${word}\b" "$FILE" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    warn_ "vague term '$word': $(printf '%s' "$hits" | head -n 1)"
  fi
done

if grep -qiE "while you'?re at it|and also|nice to have" "$FILE"; then
  warn_ "possible scope creep ('while you're at it' / 'and also')"
fi

# ---------------------------------------------------------------- result
if [ "$errors" -gt 0 ]; then
  err "$errors error(s), $warnings warning(s)"
  exit 1
fi

say "Lint: pass ($warnings warning(s))"
