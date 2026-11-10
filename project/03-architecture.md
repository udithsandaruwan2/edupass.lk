# Architecture

> Phase 3 · Gate G3 · Draft · Aligns with `docs/product/04-architecture.md`

## Context

Monorepo SPA + Nest API for multi-tenant edupass.lk. Single Postgres with `organisationId` isolation. Bank-slip payments first; PayHere stubbed. Two product modules (seminars, institute) share auth/billing platform layer.

## Constraints

| Constraint | Value | Source |
|---|---|---|
| FE stack | React 19, Vite 6, RR7, Tailwind 4, Netlify | existing `frontend/` |
| BE stack | NestJS 11 + Fastify, `/api` prefix | existing `backend/` |
| ORM/DB | Prisma + PostgreSQL | product docs |
| Money MVP | Bank transfer/deposit + slip | owner |
| PayHere | Disabled (`PAYHERE_ENABLED=false`) | owner |
| Data class | Education PII (students) | PRD |
| API layout paths | `frontend/`, `backend/` | framework.conf |

## System shape

```
Browser SPA (frontend/) → Nest Fastify /api (backend/) → PostgreSQL
                              ↘ object storage (slips/posters)
                              ↘ email (notifications later)
```

| Component | Responsibility | Owns data? | Exit path |
|---|---|---|---|
| frontend | Public + student + 3 panels | no (tokens only) | Netlify redeploy |
| backend | Auth, domain, billing, slips | yes via Prisma | API redeploy + migrate |
| Postgres | Tenants, orders, tickets, plans | yes | backups / Neon branch |
| Storage | Slip/poster blobs | files | bucket lifecycle |

## Options considered

| Decision | Option A | Option B | Choice | ADR |
|---|---|---|---|---|
| Backend framework | Django | Nest (existing) | Nest + Fastify | 0001 |
| Tenancy | DB-per-tenant | Shared DB + orgId | Shared + orgId | 0002 |
| Git | Only `development` | Promotion tracks | Promotion in conf; keep `development` until tracks created | 0003 |
| Payments | PayHere first | Bank slip first | Bank slip; PayHere stub | 0004 |

## Boundaries

| Module | Responsibility | Interface | Owner |
|---|---|---|---|
| Auth / Users / Orgs | Identity, memberships, entitlements | `/api/auth/*` | backend |
| Billing | Plans, subscriptions, PlatformFeeLine, commission | `/api/admin/plans`, checkout snapshot | backend |
| Catalogue / Seminars / Checkout / Tickets / CheckIn | Seminar Ops | `/api/seminars`, `/organiser/*` | backend |
| Institute / Tuition | Classes + tuition | `/api/institute/*` | backend |
| Payments (slips) | Multipart + approve paths | `/api/payments/slips` | backend |
| FE api client | Bearer + nav from `/auth/me` | `frontend/src/api/` | frontend |

Dependency rule: UI → API client → Nest modules → Prisma. No FE direct DB.

## Data model

Canonical entities: `docs/product/03-domain-model.md`.

- Tenancy key: `organisationId`
- Attendance split: `CheckInEvent` (seminar) ≠ `AttendanceRecord` (class)
- Money split: `Order` ≠ `TuitionInvoice` ≠ `PlatformInvoice` / `PlatformFeeLine`
- Commission % snapshotted on Order at checkout
- Migration: expand → migrate → contract

## Contracts

See endpoint inventory `docs/product/05-api-surface.md`. Auth Bearer JWT; public catalogue unauthenticated; institute routes require entitlement + plan feature.

## Threat model

| Threat | Mitigation | Test |
|---|---|---|
| Tenant data leak | OrgScope + membership checks | dual-org e2e |
| Privilege escalation | Role + entitlement guards | 403 cases |
| Slip spoof / unpaid QR | Tickets valid only after approve | status machine test |
| Card path abuse | Reject card while PayHere off | API 400 |
| Secret leak | ConfigService; no secrets in FE | review |

## Observability

- Logs: requestId, organisationId, userId (no slip images/PII dumps)
- Metrics: checkout→paid, check-in success/fail, slip queue age
- Alerts: 5xx rate, check-in error spike
- Dashboard: TBD host

## Failure modes

| Failure | Impact | Detection | Response |
|---|---|---|---|
| DB down | Full outage | health fail | restart / failover |
| Storage down | Slip upload fails | upload errors | retry; manual approve later |
| Wrong commission config | Revenue miss | fee line audits | admin fix %; no rewrite of past snapshots |

## Decisions

- [ADR-0001](04-adr/0001-nestjs-fastify-stack.md) — Nest + Fastify (not Django)
- [ADR-0002](04-adr/0002-shared-db-tenancy.md) — Shared DB + organisationId
- [ADR-0003](04-adr/0003-git-tracks.md) — Promotion tracks config; preserve existing branches
- [ADR-0004](04-adr/0004-bank-slip-first.md) — Bank slip first; PayHere hold

## Open questions

| # | Question | Blocks | Default |
|---|---|---|---|
| Q1 | API production host | G6 | Neon + Node host TBD |
| Q2 | Object storage vendor | slip upload impl | local/dev disk or S3-compatible |

**Approved by:** human on 2026-11-10
