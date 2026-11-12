# Product requirements document (PRD)

> Phase 2 · Gate G2 · **Phase 8 delta 2026-11-12** · Sourced from `docs/product/` + owner scope C

## Summary

**edupass.lk** is a multi-tenant SaaS for Sri Lanka’s O/L & A/L market: many institutions and individual lecturers on one platform. Two products — **Seminar Ops** (tickets, bank slips, QR attendance, optional seat maps) and **Institute Management** (staff, classes, tuition, thin LMS) — gated by entitlements/plans. EduPass revenue = subscription plans + per-ticket commission. Student card/PayHere remains deferred; bank transfer/deposit is the live path. Phase 8 adds real admin/CMS APIs, staff-scoped panels, institute LMS, seat maps, and an Expo companion app — **no G6 freeze** on ongoing `development` work.

## Problem and evidence

See `project/01-discovery.md`. Pre-PayHere bank path ships on `development`. Remaining gaps: mock admin/CMS UIs, demo lecturer invites, toast-only password change, no teacher/scanner FE, no LMS/seat maps/native.

## Users and jobs

| Segment | Job to be done | Today | Why switch |
|---|---|---|---|
| Student | Buy ticket, attend with QR; class LMS | Bank path live; LMS absent | Real seats + class portal |
| Individual lecturer | Sell seminars | Live bank path | Profiles, seat maps |
| Institution admin | Staff, classes, tuition, LMS | Partial API | Full real surfaces |
| Platform admin | Plans, %, tenants, CMS | Plans live; CMS mock | Live CMS/people/sales |
| Teacher / scanner | Class LMS / gate admit | API partial | Scoped real panels |
| Mobile user | Ticket QR / scan | Web only | Expo companion |

## Outcomes and metrics

- **Primary:** All Phase 8 Must FEATs demoable on `development` with API mode (mocks off)
- **Guardrails:** Cross-tenant reads = 0; role ACL for TEACHER/SCANNER; seat oversell = 0
- **Measurement:** extended smoke + e2e; dual-org + role tests

## Scope

**In scope (v0.1 complete + Phase 8)**

- Everything from Phases 1–7 (bank seminar path, plans, institute, tuition)
- Real admin people/catalogue/sales/CMS (no mock DataContext in API mode)
- Organiser lecturer profiles/invites; in-app password change; contact → SMTP
- Teacher- and scanner-scoped login/nav
- Institute LMS: modules, materials, assignments, submissions, grades
- Optional seminar seat maps + checkout holds
- Expo native: student tickets + scanner check-in

**Out of scope**

- Live PayHere/card, ez_cash/koko — Phase F
- Multi-currency; automatic seller payouts
- Moodle parity (quizzes/SCORM/forums)
- Django or rewrite of Vite SPA to native-only

## User journeys

### J1–J3

Unchanged from v0.1 (lecturer sells, institute upgrade, admin commission).

### J4 — Teacher LMS

1. Institution invites TEACHER  
2. Teacher logs in → `/lecturer` sees assigned batches  
3. Posts material + assignment  
4. Student submits; teacher grades  

### J5 — Seat map checkout

1. Organiser attaches venue layout to seminar  
2. Student selects seats at checkout  
3. Holds convert on slip approve; capacity cannot oversell  

### J6 — Native scanner

1. Scanner logs in on Expo app  
2. Scans ticket QR → same check-in API as web  

## Functional requirements

| ID | Requirement | Priority | Acceptance |
|---|---|---|---|
| FR-01…FR-12 | Prior Must FRs remain | Must | Existing smoke green |
| FR-13 | `POST /auth/change-password` with current password | Must | Hash updated; wrong current → 401 |
| FR-14 | Contact form sends via MailModule | Must | SMTP or dry-run log |
| FR-15 | LecturerProfile CRUD + public list/detail | Must | Persisted; no demo toast-only |
| FR-16 | StaffRole ACL: TEACHER/SCANNER scoped | Must | Billing/admin routes forbidden |
| FR-17 | Admin list users/orgs/orders/tickets + CMS CRUD | Must | API mode pages non-empty from Nest |
| FR-18 | LMS materials/assignments/submissions/grades | Must | Enrolled student + teacher path |
| FR-19 | Optional seat map hold + convert | Must | Concurrent oversell blocked |
| FR-20 | Expo auth + tickets + check-in | Must | Hits Nest `/api` |

## Non-functional requirements

Prior NFR-01…06 plus:

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-07 | Seat hold TTL | Configurable (default 15m) | expire reclaim test |
| NFR-08 | LMS file size | Cap per upload (e.g. 10MB) | API reject |

## Release criteria (Phase 8)

- [ ] FEAT-015…020 Must paths green on `development`  
- [ ] No open P0 on money, isolation, or seat inventory  
- [ ] PayHere still disabled  
- [ ] G6 production cut remains human-gated (does not block this work)  

**G2-delta proposed:** human 2026-11-12 (scope C). Prior G2 approval 2026-11-10 retained for v0.1 baseline.

## Source

- `docs/product/*`, Phase 8 plan, ADR-0006…0008
