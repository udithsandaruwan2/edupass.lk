# ADR-0001 — NestJS + Fastify backend (not Django)

- **Status:** accepted
- **Date:** 2026-11-10
- **Deciders:** human (via existing repo + kickoff)
- **Supersedes:** none

## Context

DevOpt default backend is Django. This monorepo already has NestJS 11 + Fastify scaffold and product docs assume Nest + Prisma.

## Decision

Keep **NestJS 11 + Fastify** under `backend/`. DevOpt profile: `api-node-nest`. Do not migrate to Django.

## Alternatives

| Option | Why not chosen |
|---|---|
| Django + DRF | Would discard existing backend and docs |
| FastAPI | Not present in repo |

## Consequences

**Positive:** Continuity; Fastify already wired in `backend/src/main.ts`.  
**Negative:** Some DevOpt Django recipes irrelevant — use Nest recipe/profile only.  
**Neutral:** `/api` prefix retained (product); Nest profile mentions `/v1` — **product `/api` wins**.

## Revisit if

- Greenfield rewrite explicitly requested by owner.

## References

- `docs/product/08-backend-nestjs-plan.md`
- `.agents/profiles/api-node-nest.md`
