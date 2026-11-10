# Product requirements document (PRD)

> Phase 2 · Gate G2 · Draft · Sourced from `docs/product/` · Target ≤5 pages.

## Summary

**edupass.lk** is a multi-tenant SaaS for Sri Lanka’s O/L & A/L market: many institutions and individual lecturers on one platform. Two products — **Seminar Ops** (tickets, bank slips, QR attendance) and **Institute Management** (staff, classes, tuition) — gated by entitlements/plans. EduPass revenue = subscription plans + per-ticket commission. Student card/PayHere is deferred; bank transfer/deposit is the live path.

## Problem and evidence

See `project/01-discovery.md` and `docs/product/02-research-current-state.md`. FE seminar demo is localStorage-only; Nest API is health-only; institute product and platform billing exist only in docs.

## Users and jobs

| Segment | Job to be done | Today | Why switch |
|---|---|---|---|
| Student | Buy seminar ticket, attend with QR | Demo SPA | Real valid tickets after bank slip |
| Individual lecturer | Sell seminars without institute suite | Demo organiser | Isolated tenant + earnings − % |
| Institution admin | Staff, classes, tuition ± seminars | Labels only | One platform, plan-gated |
| Platform admin | Plans, %, tenants, CMS | Mock admin | Live commercial controls |
| Teacher / scanner | Class roll / gate admit | Partial mock | Scoped real attendance |

## Outcomes and metrics

- **Primary:** Bank path browse → checkout → slip approve → QR → check-in works on staging API — baseline mock-only → target green e2e
- **Guardrails:** Cross-tenant reads = 0; individual/seminars-only tenants see no institute nav
- **Measurement:** e2e/Playwright + manual dual-org check; admin % change → order snapshot

## Scope

**In scope (v1 / roadmap Phases 1–7)**

- Multi-tenant register: student, institution, individual lecturer
- Seminar Ops + attendance every seminar
- Bank slip payments + refunds (offline)
- PlatformFeeLine + Free/Premium/Platinum + admin-editable commission %
- Institute Management + tuition (cash/slip), plan limits
- Three admin surfaces in one SPA

**Out of scope**

- Live PayHere/card, ez_cash/koko live — Phase F
- Full LMS, seat maps, multi-currency, native apps
- Django or rewrite of Vite SPA

**Deferred**

- Camera QR, live stream join — polish
- Automatic payouts to sellers — ledger first

## User journeys

### J1 — Individual lecturer sells + gate

1. Register as lecturer → solo tenant  
2. Set bank account, publish seminar with `checkInMode`  
3. Student pays bank transfer, uploads slip  
4. Lecturer approves → tickets valid + PlatformFeeLine  
5. Gate check-in admits once  

Failure: rejected slip → student re-uploads with reason; duplicate scan → 409.

### J2 — Institution on Free → upgrade

1. Register institution → Free plan  
2. Create batches until limit  
3. Upgrade to Premium/Platinum → pay EduPass via bank slip  
4. Caps lift; optional seminars under same tenant  

Failure: over-limit create → 402/403 with upgrade CTA.

### J3 — Platform admin sets commerce

1. Edit plans and global `ticketCommissionPercent`  
2. Next checkout snapshots new %  

## Functional requirements

| ID | Requirement | Priority | Acceptance |
|---|---|---|---|
| FR-01 | Register student / institution / lecturer creates correct tenant + defaults | Must | Seeded paths; lecturer has no institute entitlement |
| FR-02 | Public catalogue lists published seminars across tenants | Must | Unpublished/other-tenant drafts hidden |
| FR-03 | Checkout accepts bank_transfer/deposit only; card disabled | Must | Card submit rejected/disabled in UI+API |
| FR-04 | Slip approve issues/validates tickets and writes PlatformFeeLine | Must | Student sees QR; fee line matches snapshot % |
| FR-05 | Check-in single-use, seminar-scoped, tenant-safe | Must | Duplicate/wrong seminar/other-org → reject |
| FR-06 | Every seminar has `checkInMode` | Must | Cannot publish without mode |
| FR-07 | Entitlement/plan gates institute APIs and nav | Must | Individual 403 on `/institute/*` |
| FR-08 | Admin CRUD plans + edit global commission % | Must | No deploy required for % change |
| FR-09 | PlanLimitService enforces Free/Premium/Platinum caps | Must | Over-limit write blocked |
| FR-10 | Tuition FeePlan/Invoice/Payment separate from platform billing | Must | Distinct names/UI |
| FR-11 | Refunds void tickets, restore seats, adjust platform fee | Should | Offline refund note |
| FR-12 | PayHere endpoints stubbed/feature-flagged off | Must | `PAYHERE_ENABLED=false` |

## Non-functional requirements

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-01 | Check-in latency | p95 &lt; 2s | timed e2e |
| NFR-02 | Tenant isolation | Zero cross-tenant data in tests | authz suite |
| NFR-03 | Inventory | No oversell under concurrent checkout | transactional test |
| NFR-04 | Secrets | No secrets in FE bundle / logs | review |
| NFR-05 | A11y | Check-in + money dialogs keyboardable | manual |
| NFR-06 | API prefix | `/api` (existing Nest) | health |

## Dependencies and risks

| ID | Item | Impact | Mitigation |
|---|---|---|---|
| RISK-01 | Bank-slip latency abandons checkout | High | Clear under-review UX; PayHere later |
| RISK-02 | Tenant leak | Fatal | OrgScope guards + dual-org tests |
| RISK-03 | Confusing tuition vs platform fee | Med | Naming + UI copy review |
| RISK-04 | Git track mismatch (development vs promotion) | Med | ADR-0003; don’t rewrite history without ask |

## Release criteria

- [ ] All Must FRs met on staging  
- [ ] No open P0/P1 on money or isolation  
- [ ] Bank e2e verified  
- [ ] PayHere still disabled  
- [ ] Rollback: redeploy previous FE/BE; DB migrate down if needed  

## Open questions

| # | Question | Owner | Default |
|---|---|---|---|
| Q1 | Exact Free plan numeric caps | human | Seed sensible defaults; admin-editable |
| Q2 | Production API host | human | TBD at release; local Docker/Neon for build |
| Q3 | When to create promotion git tracks | human | Keep `development` until G4+; create tracks when asked |

**Approved by:** human on 2026-11-10

## Source

- `docs/product/01-product-vision.md`, `05-api-surface.md`, `06-user-flows.md`, `09-delivery-roadmap.md`, `12-platform-billing-and-tenancy.md`
