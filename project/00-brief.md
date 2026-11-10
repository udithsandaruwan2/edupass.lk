# Project brief

> Phase 0 · Gate G0 · Draft for approval · Sourced from `docs/product/` (no invented scope).

## Identity

- **Project:** edupass.lk
- **Owner:** human (product owner)
- **Date:** 2026-11-10
- **One-liner:** Multi-tenant education SaaS for Sri Lanka O/L & A/L — Seminar Ops and Institute Management on one platform, with platform billing (plans + per-ticket %).

## Problem

Institutes and individual lecturers struggle to sell seminar tickets with reliable check-in and (separately) run day-to-day class ops (roster, attendance, tuition) when tools are fragmented or demo-only, which costs lost sales, gate chaos, and manual fee tracking.

## Outcome

When this works, a seller can register (institution or individual lecturer), publish seminars, collect via bank deposit/slip, issue QR tickets, and run gate attendance; an institution on a plan can also run isolated classes/tuition. We will know because: (1) second institution onboards without seeing the first’s data; (2) bank path browse → slip → approve → QR → check-in works end-to-end; (3) platform admin can change ticket commission % and plans without a deploy.

## Users

| Segment | Job to be done | Current workaround |
|---|---|---|
| Student | Find seminars, pay, keep e-ticket, attend | Demo SPA localStorage; no real payments |
| Individual lecturer | Publish seminars, approve slips, scan attendance | Demo organiser role; no real tenant |
| Institution admin | Own staff/students/classes ± seminars | UI labels only; no institute product |
| Platform admin | Configure plans, %, tenants, CMS, slip override | Admin mock screens only |
| Employed teacher / scanner | Mark class roll / gate QR | Partial mock check-in |

## Scope

**In scope for v1** (per `docs/product/09-delivery-roadmap.md` Phases 1–7; PayHere HOLD)

- Multi-tenant orgs: institutions + individual lecturers; entitlement-gated products
- Seminar Ops: catalogue, tickets, bank transfer/deposit + slip approve, QR attendance every seminar, refunds (offline)
- Platform billing: Free/Premium/Platinum (admin-editable); ticket commission % (admin-editable, ~5–6% default)
- Institute Management: staff, batches, roster, class attendance, tuition fees (cash + slip)
- Three panels: platform admin, institution, individual lecturer
- Stack as built: React+Vite+Netlify frontend; NestJS 11 + Fastify backend; PostgreSQL + Prisma planned

**Out of scope**

- Live PayHere / card capture — until finance stage (Phase F)
- Full LMS (assignments, hosted courses, grading)
- Seat maps / multi-currency / native apps
- Changing product scope away from `docs/product/`

## Constraints

- Deadline: none stated
- Budget: none stated
- Stack: **locked** — `frontend/` React 19 Vite 6; `backend/` NestJS 11 Fastify; Netlify FE; Prisma/Postgres planned — do **not** switch to Django
- Compliance: education PII (students); exact regulation TBD
- Team: owner + AI agents via DevOpt
- Git: DevOpt promotion tracks configured; existing repo also uses `development` integration — reconcile at architecture/plan gates

## Success and stop conditions

- **Success:** Bank-path seminar sale + check-in on real API; tenant isolation proven; plans/% configurable in admin
- **Guardrail:** Seminars-only / individual tenants never forced into institute UI; tuition ≠ platform fee in schema/UI
- **Stop if:** Owner redirects away from education marketplace/institute ops, or requires live card gateway before bank MVP

## Riskiest assumption

Sellers (lecturers/institutes) will accept bank deposit + slip approval latency instead of instant card pay — confidence **med**, impact if wrong **high** (checkout abandonment). Mitigated by keeping PayHere as disabled option for later.

## Decision

- [x] Proceed to discovery (G1 draft also ready in same session)
- [ ] Pivot: `<new hypothesis>`
- [ ] Stop: `<reason>`

**Approved by:** human on 2026-11-10

## Source links

- `docs/product/README.md`
- `docs/product/01-product-vision.md`
- `docs/product/12-platform-billing-and-tenancy.md`
- `docs/product/09-delivery-roadmap.md`
