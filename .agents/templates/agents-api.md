# AGENTS.md — api

> Nested instructions for `apps/api`. Keep under 40 lines. Closest file wins.

## Scope

This file applies to `apps/api`. Git track: **backend**.

## Commands

```bash
uv sync
uv run python manage.py runserver
uv run python manage.py migrate
uv run pytest
uv run ruff check .
```

Nest opt-in (`BACKEND_PROFILE=api-node-nest`): `pnpm start:dev && pnpm test && pnpm lint`.
FastAPI opt-in (`BACKEND_PROFILE=api-python`): `uv run uvicorn app.main:app --reload && uv run pytest`.

## Local invariants

- Default: Django + DRF + uv. Profile: `.agents/profiles/api-python-django.md`
- Validation at the HTTP boundary. Authz server-side.
- Branch from `dev/backend`. Promote to `prod/backend` only when asked.

## Differences from the root

- Do not edit `apps/web` from this worktree.

## Context

- Root: `../../AGENTS.md`
- Pack: `./scripts/context-pack.sh implement-api`
