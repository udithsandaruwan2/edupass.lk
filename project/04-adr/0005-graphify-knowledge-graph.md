# 0004 — Graphify as the code-map token reducer

Status: accepted
Date: 2026-11-10
Deciders: human

## Context

Agents still burn tokens on broad `rg`/Read exploration even when context packs and profiles exist. We need a cheap, machine-maintained map of symbols and edges so agents open only the files that matter.

## Decision

Integrate **Graphify** (official CLI `graphifyy` → `graphify`) into DevOpt:

1. **Bootstrap:** `./scripts/graphify-setup.sh` runs after hooks in `bootstrap.sh`.
2. **Agent-first:** query with `graphify query|path|explain` before first grep/read when `graphify-out/` exists.
3. **Update-after-change:** `graphify update .` (AST-only, no LLM) after code edits; also via `.githooks/post-{commit,checkout,merge,rewrite}` because DevOpt sets `core.hooksPath=.githooks` (official `graphify hook install` alone would miss those events).
4. **Cursor:** `graphify cursor install` → `.cursor/rules/graphify.mdc`. Do **not** run `graphify claude install` when `CLAUDE.md` is a symlink to `AGENTS.md` (would bloat always-on context); keep a short pointer in `AGENTS.md` §3 instead.
5. **Artifacts:** `graphify-out/` is gitignored and rebuilt locally. `.graphifyignore` excludes `site/`, `examples/`, locks, build dirs.

## Alternatives

- Rely only on packs + `rg` (status quo; more exploratory reads).
- Commit `graphify-out/` (heavy, noisy diffs; stale on branch switches).
- Only official `.git/hooks` (skipped under `hooksPath=.githooks`).

## Consequences

+ Fewer files opened per task; cheaper orientation than repo dumps.
− Requires `graphify` on PATH (`uv tool install graphifyy`).
− Hooks must stay thin and non-blocking (background rebuild).

## Revisit if

Graphify CLI changes hook/install surface; or measured tokens-per-merged-task does not improve after adoption.
