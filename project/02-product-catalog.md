# Product catalog

> Phase 2+ · Living index · IDs stable · Scope from `docs/product/`

## Capabilities

| ID | Capability | Outcome | Owner | Status |
|---|---|---|---|---|
| CAP-001 | Platform identity & tenancy | Isolated orgs; register paths; JWT | platform | active |
| CAP-002 | Seminar Ops | Sell tickets; bank slips; QR attendance | seminars | active |
| CAP-003 | Platform billing | Plans + ticket % + fee lines | platform | active |
| CAP-004 | Institute Management | Staff, batches, class attendance | institute | active |
| CAP-005 | Tuition collection | Institute invoices cash/slip | institute | active |
| CAP-006 | Platform admin CMS | Categories, banners, settings | platform | active |

## Features

| ID | Capability | Feature | Priority | Status | Spec | Release |
|---|---|---|---|---|---|---|
| FEAT-001 | CAP-001 | Auth register/login student·institution·lecturer | Must | specified | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-002 | CAP-001 | OrganisationEntitlement + StaffMembership + OrgScope | Must | specified | `docs/product/03-domain-model.md` | v0.1 |
| FEAT-003 | CAP-002 | Public seminar catalogue + seller CRUD + ticket types | Must | specified | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-004 | CAP-002 | Bank checkout + slip upload/approve + tickets/QR | Must | specified | `docs/product/06-user-flows.md` | v0.1 |
| FEAT-005 | CAP-002 | Seminar check-in attendance (every seminar) | Must | specified | `docs/product/03-domain-model.md` | v0.1 |
| FEAT-006 | CAP-003 | PlatformFeeLine + commission snapshot | Must | specified | `docs/product/12-platform-billing-and-tenancy.md` | v0.1 |
| FEAT-007 | CAP-003 | SubscriptionPlan Free/Premium/Platinum + limits | Must | specified | `docs/product/12-platform-billing-and-tenancy.md` | v0.1 |
| FEAT-008 | CAP-003 | Admin edit global ticketCommissionPercent | Must | specified | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-009 | CAP-004 | Batches, enrollments, sessions, AttendanceRecord | Must | specified | `docs/product/05-api-surface.md` | v0.2 |
| FEAT-010 | CAP-005 | TuitionFeePlan / Invoice / Payment | Must | specified | `docs/product/03-domain-model.md` | v0.2 |
| FEAT-011 | CAP-002 | Seminar refunds (offline settlement) | Should | specified | `docs/product/06-user-flows.md` | v0.1 |
| FEAT-012 | CAP-006 | CMS banners/FAQ/settings | Should | idea | `docs/product/05-api-surface.md` | v0.2 |
| FEAT-013 | CAP-002 | Camera QR + stream join | Could | idea | `docs/product/09-delivery-roadmap.md` | v0.3 |
| FEAT-014 | CAP-003 | PayHere card checkout | Must later | deferred | Phase F | — |

## Non-functional requirements

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-001 | Check-in p95 | &lt; 2s | active |
| NFR-002 | Tenant isolation | zero leaks | active |
| NFR-003 | No inventory oversell | transactional | active |
| NFR-004 | PAYHERE_ENABLED | false until Phase F | active |

## Risks

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| RISK-001 | Bank-slip abandon | high | UX status + later PayHere | open |
| RISK-002 | Tenant data leak | fatal | guards + dual-org tests | open |
| RISK-003 | Money concept confusion | med | Tuition* vs Platform* naming | open |

## Dropped / deferred

| ID | Item | Reason | Revisit when |
|---|---|---|---|
| FEAT-014 | PayHere live | Owner hold | Finance stage brief |
| — | ez_cash / koko live | Not in MVP | After card |
| — | Full LMS | Non-goal | Never for v1 |

## Rules

- Every task/commit references a `FEAT-###`.
- Do not reuse IDs.
- Catalog = scope; `05-plan.md` = sequence; `docs/product/10-progress-tracker.md` = execution mirror.
