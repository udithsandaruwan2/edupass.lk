# EduPass documentation

**edupass.lk** — a multi-tenant education SaaS for Sri Lanka: many institutions and individual lecturers on one platform, with two products (Seminar Ops + Institute Management) and platform billing (plans + per-ticket fees).

## How to use these docs

1. [01-product-vision.md](01-product-vision.md) — who registers, products, admin surfaces.
2. [12-platform-billing-and-tenancy.md](12-platform-billing-and-tenancy.md) — multi-tenant model + **platform** fees/plans (not institute tuition).
3. [03-domain-model.md](03-domain-model.md) + [05-api-surface.md](05-api-surface.md) + [11-one-go-build-playbook.md](11-one-go-build-playbook.md) when coding.
4. [09-delivery-roadmap.md](09-delivery-roadmap.md) + [10-progress-tracker.md](10-progress-tracker.md).

## Document index

| Doc | Purpose |
|---|---|
| [01-product-vision.md](01-product-vision.md) | Multi-tenant vision, products, personas, panels |
| [02-research-current-state.md](02-research-current-state.md) | Frontend/backend audit |
| [03-domain-model.md](03-domain-model.md) | Entities, tenancy, platform billing objects |
| [04-architecture.md](04-architecture.md) | Monorepo, modules, isolation |
| [05-api-surface.md](05-api-surface.md) | Endpoints by actor |
| [06-user-flows.md](06-user-flows.md) | Register, sell, attend, subscribe |
| [07-frontend-masterpiece-plan.md](07-frontend-masterpiece-plan.md) | Three panel shells + checkout |
| [08-backend-nestjs-plan.md](08-backend-nestjs-plan.md) | Nest + Prisma build |
| [09-delivery-roadmap.md](09-delivery-roadmap.md) | Phased delivery |
| [10-progress-tracker.md](10-progress-tracker.md) | Living checklist |
| [11-one-go-build-playbook.md](11-one-go-build-playbook.md) | One-pass task breakdown |
| [12-platform-billing-and-tenancy.md](12-platform-billing-and-tenancy.md) | Plans, % fees, tenant isolation |

## Status snapshot (2026-11-10)

| Area | Status |
|---|---|
| Frontend seminar marketplace (mock) | Demo UI — localStorage |
| Backend Nest + Fastify | Scaffold + `/api/health` |
| Multi-tenant orgs + individual lecturers | Designed in docs |
| Student→seller money | Bank transfer/deposit + slip |
| **Platform billing** (plans + ticket %) | Designed — Free / Premium / Platinum + configurable % |
| PayHere card | Disabled until finance stage |
| Institute tuition fees | Separate product feature (not platform fee) |

## Locked defaults

- **Multi-tenant:** many institutions + many individual lecturers; each tenant isolated (own staff, students, seminars, data).
- **Two products:** Seminar Ops ≠ Institute Management; entitlements per tenant.
- **Register paths:** Institution org · Individual lecturer · Student · Platform admin (seeded).
- **Platform revenue:** Institute **subscription plans** (Free trial → Premium → Platinum, admin-editable); seminar sellers **pay-as-you-go % per ticket** (default ~5–6%, admin-editable).
- **Do not confuse:** Platform fee ≠ institute class/tuition fee ≠ student ticket price.
- **Money path now:** bank transfer/deposit + slip; PayHere held.
- **Every seminar:** attendance/check-in.
- Stack: PostgreSQL + Prisma, NestJS 11 Fastify, JWT + tenant guards.

## Related code

- `frontend/src/App.tsx`, `frontend/src/types/index.ts`
- `frontend/src/layouts/DashboardLayout.tsx` (will split/gate by actor)
- `frontend/src/pages/public/CheckoutPages.tsx`
- `backend/src/main.ts`
