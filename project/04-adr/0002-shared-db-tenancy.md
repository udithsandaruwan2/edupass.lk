# ADR-0002 — Shared Postgres tenancy via organisationId

- **Status:** accepted
- **Date:** 2026-11-10
- **Deciders:** human (product docs)
- **Supersedes:** none

## Context

Many institutions and individual lecturers need isolation. Scale year-1 does not justify DB-per-tenant ops cost.

## Decision

Single PostgreSQL database; every tenant-owned row keyed by `organisationId`; enforce with Nest guards. Public catalogue is the only intentional cross-tenant read (published seminars).

## Alternatives

| Option | Why not chosen |
|---|---|
| Database per tenant | Ops complexity early |
| Schema per tenant | Migration pain |

## Consequences

**Positive:** Simple Prisma model; one migrate path.  
**Negative:** Bug in OrgScope is a data-leak risk — must test.  
**Neutral:** Platform admin bypasses with audit.

## Revisit if

- Compliance requires physical separation.

## References

- `docs/product/12-platform-billing-and-tenancy.md`
- `docs/product/03-domain-model.md`
