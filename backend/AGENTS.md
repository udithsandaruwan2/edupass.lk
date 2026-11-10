# AGENTS.md — backend

> Nested instructions for `backend/`. Keep under 40 lines. Closest file wins.

## Scope

This file applies to `backend`. Git track: **backend**.

## Commands

```bash
# from repo root
npm install
npm run start:dev --workspace=backend
npm run test --workspace=backend
npm run test:e2e --workspace=backend
npm run lint --workspace=backend
npm run build --workspace=backend
```

Preferred local port: **3000** (falls back +1 if busy). Global prefix: `/api`.

## Local invariants

- NestJS 11 + **Fastify** (`@nestjs/platform-fastify`). Profile: `.agents/profiles/api-node-nest.md`
- Prisma + PostgreSQL planned (see `docs/product/08-backend-nestjs-plan.md`). Health exists today.
- Authz server-side; tenant isolation by `organisationId`; PayHere disabled until finance stage.
- Branch from `dev/backend` when promotion tracks exist. Until then follow repo `development` workflow.

## Differences from the root

- Do not edit `frontend/` from a backend-only worktree.

## Context

- Root: `../AGENTS.md`
- Pack: `./scripts/context-pack.sh implement-api`
- Product docs: `docs/product/`
