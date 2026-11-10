# 0002 — Stack profiles instead of always-on stack text

Status: accepted
Date: 2026-10-30
Deciders: human

## Context

Default product stack is React + Vite + Netlify, and **Django + DRF**. Nest and FastAPI are real options but not the default. Putting every backend into `AGENTS.md` taxes every session.

## Decision

Keep stack conventions in `.agents/profiles/`. `framework.conf` names `FRONTEND_PROFILE` and `BACKEND_PROFILE`. Agents load **one** profile per task via `context-pack.sh`. Nested `apps/*/AGENTS.md` hold commands.

## Alternatives

- Inline commands in root `AGENTS.md`: convenient, always expensive.
- One skill per stack: extra always-on descriptions.

## Consequences

+ Baseline stays small; Python sessions do not pay for Netlify rules.
− Agent must run the pack or it will miss commands.

## Revisit if

A profile exceeds ~150 lines; split a `reference.md` beside it, not into `AGENTS.md`.
