# Product catalog

> Phase 2+ · Living index · IDs stable · Phase 8 delta 2026-11-12

## Capabilities

| ID | Capability | Outcome | Owner | Status |
|---|---|---|---|---|
| CAP-001 | Platform identity & tenancy | Isolated orgs; register paths; JWT | platform | active |
| CAP-002 | Seminar Ops | Sell tickets; bank slips; QR attendance | seminars | active |
| CAP-003 | Platform billing | Plans + ticket % + fee lines | platform | active |
| CAP-004 | Institute Management | Staff, batches, class attendance | institute | active |
| CAP-005 | Tuition collection | Institute invoices cash/slip | institute | active |
| CAP-006 | Platform admin CMS | Categories, banners, settings | platform | active |
| CAP-007 | Institute LMS | Materials, assignments, grades | institute | active |
| CAP-008 | Seat maps | Optional reserved seating | seminars | active |
| CAP-009 | Native companion | Expo tickets + scanner | platform | active |

## Features

| ID | Capability | Feature | Priority | Status | Spec | Release |
|---|---|---|---|---|---|---|
| FEAT-001 | CAP-001 | Auth register/login student·institution·lecturer | Must | shipped | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-002 | CAP-001 | OrganisationEntitlement + StaffMembership + OrgScope | Must | shipped | `docs/product/03-domain-model.md` | v0.1 |
| FEAT-003 | CAP-002 | Public seminar catalogue + seller CRUD + ticket types | Must | shipped | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-004 | CAP-002 | Bank checkout + slip upload/approve + tickets/QR | Must | shipped | `docs/product/06-user-flows.md` | v0.1 |
| FEAT-005 | CAP-002 | Seminar check-in attendance (every seminar) | Must | shipped | `docs/product/03-domain-model.md` | v0.1 |
| FEAT-006 | CAP-003 | PlatformFeeLine + commission snapshot | Must | shipped | `docs/product/12-platform-billing-and-tenancy.md` | v0.1 |
| FEAT-007 | CAP-003 | SubscriptionPlan Free/Premium/Platinum + limits | Must | shipped | `docs/product/12-platform-billing-and-tenancy.md` | v0.1 |
| FEAT-008 | CAP-003 | Admin edit global ticketCommissionPercent | Must | shipped | `docs/product/05-api-surface.md` | v0.1 |
| FEAT-009 | CAP-004 | Batches, enrollments, sessions, AttendanceRecord | Must | shipped | `docs/product/05-api-surface.md` | v0.2 |
| FEAT-010 | CAP-005 | TuitionFeePlan / Invoice / Payment | Must | shipped | `docs/product/03-domain-model.md` | v0.2 |
| FEAT-011 | CAP-002 | Seminar refunds (offline settlement) | Should | shipped | `docs/product/06-user-flows.md` | v0.1 |
| FEAT-012 | CAP-006 | CMS banners/FAQ/settings | Must | shipped | ADR + T-020 | v0.3 |
| FEAT-013 | CAP-002 | Camera QR + stream join | Could | shipped | polish | v0.2 |
| FEAT-014 | CAP-003 | PayHere card checkout | Must later | deferred | Phase F | — |
| FEAT-015 | CAP-001 | In-app change-password + profile APIs | Must | shipped | T-012, T-015 | v0.3 |
| FEAT-016 | CAP-001 | StaffRole ACL + lecturer/scanner FE | Must | shipped | T-016…T-018 | v0.3 |
| FEAT-017 | CAP-007 | Institute LMS modules/assignments/grades | Must | shipped | ADR-0006 | v0.3 |
| FEAT-018 | CAP-008 | Seminar seat maps + checkout holds | Must | shipped | ADR-0007 | v0.3 |
| FEAT-019 | CAP-009 | Expo native tickets + scanner | Must | shipped | ADR-0008 | v0.3 |
| FEAT-020 | CAP-002 | LecturerProfile CRUD + public pages | Must | shipped | T-014 | v0.3 |
| FEAT-021 | CAP-006 | Admin people/catalogue/sales list APIs | Must | shipped | T-019…T-021 | v0.3 |

## Non-functional requirements

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-001 | Check-in p95 | &lt; 2s | active |
| NFR-002 | Tenant isolation | zero leaks | active |
| NFR-003 | No inventory oversell | transactional | active |
| NFR-004 | PAYHERE_ENABLED | false until Phase F | active |
| NFR-005 | Seat hold TTL | 15m default | planned |
| NFR-006 | LMS upload cap | 10MB | planned |

## Risks

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| RISK-001 | Bank-slip abandon | high | UX status + later PayHere | open |
| RISK-002 | Tenant data leak | fatal | guards + dual-org tests | open |
| RISK-003 | Money concept confusion | med | Tuition* vs Platform* naming | open |
| RISK-004 | Seat hold vs bank latency | high | 15m TTL + reclaim; ADR-0007 | open |
| RISK-005 | LMS file cost | med | Size caps; blob store ADR | open |

## Dropped / deferred

| ID | Item | Reason | Revisit when |
|---|---|---|---|
| FEAT-014 | PayHere live | Owner hold | Finance stage brief |
| — | ez_cash / koko live | Not in MVP | After card |
| — | Quizzes / SCORM / forums | Non-goal thin LMS | After FEAT-017 ships |
| — | Multi-currency | Non-goal | Explicit ask |

## Rules

- Every task/commit references a `FEAT-###`.
- Do not reuse IDs.
- Catalog = scope; `05-plan.md` = sequence.
