# 10 — Progress tracker

Checkboxes · Updated **2026-11-12** · **Canonical beginning→end plan:** [`project/PROGRESS.md`](../../project/PROGRESS.md)

**Scoreboard:** T-001…T-010 **10/10** · Phase 8 T-012…T-034 **23/23** · **G5** approved · **G6** pending human · Phase F held · Branch **`development`**

---

## Build tasks (T-001…T-010)

### M1 — Foundation + tenancy
- [x] **T-001** Prisma + auth + register kinds + seed
- [x] **T-002** FE API client + login/register + entitlement nav

### M2 — Seminar Ops + bank + check-in
- [x] **T-003** Seminar catalogue / CRUD / `checkInMode` + FE wire
- [x] **T-004** Bank checkout + slips + tickets + `PlatformFeeLine`
- [x] **T-005** Check-in API + attendees + FE scanner

### M3 — Plans + institute + tuition
- [x] **T-006** Admin plans / commission % + usage/upgrade + `PlanLimitService`
- [x] **T-007** Institute batches / roster / class attendance + FE gated
- [x] **T-008** Tuition fees (cash/slip) + FE

### M4 — Polish
- [x] **T-009** Stream / camera / Playwright / mocks off on staging

### M5 — Production harden
- [x] **T-010** Demo purge + API-default catalogue + SMTP + self-serve register

### Phase F — PayHere
- [ ] Blocked pending owner finance brief

---

## Phase 8 build tasks (T-012…T-034)

### M1 — Real account surfaces
- [x] **T-012** change-password API + FE
- [x] **T-013** Contact → MailModule; demo scrub
- [x] **T-014** LecturerProfile CRUD + public API/FE
- [x] **T-015** Student/organiser profile GET/PUT

### M2 — Staff roles
- [x] **T-016** StaffRoleGuard + role ACL
- [x] **T-017** FE `/lecturer` + scanner shell
- [x] **T-018** Institute staff invite UI + email

### M3 — Admin CMS
- [x] **T-019** Admin list APIs
- [x] **T-020** CMS Prisma + CRUD
- [x] **T-021** Rewire Admin* to API
- [x] **T-022** Category admin CRUD FE

### M4 — Institute LMS
- [x] **T-023** LMS schema
- [x] **T-024** LMS APIs
- [x] **T-025** LMS FE portals
- [x] **T-026** File storage for LMS

### M5 — Seat maps
- [x] **T-027** Seat schema + holds
- [x] **T-028** Seat-map editor FE
- [x] **T-029** Checkout seat picker + smoke

### M6 — Expo native
- [x] **T-030** Expo workspace + auth
- [x] **T-031** Expo student tickets
- [x] **T-032** Expo scanner

### M7 — Harden
- [x] **T-033** Smoke expand
- [x] **T-034** Docs/STATE/PROGRESS

---

## Phase checklist (product)

### Phase 0 — Documentation
- [x] README + index
- [x] 01 Vision … 12 Platform billing & tenancy

### Phase 1 — Tenancy foundation
- [x] Prisma + auth + register + guards + FE nav

### Phase 2 — Seminar Ops
- [x] Catalogue + checkout snapshot + tickets + check-in

### Phase 3 — Slips + platform fee lines
- [x] Slip approve → tickets + PlatformFeeLine; card disabled; admin fee revenue

### Phase 4 — Plans & upgrades
- [x] Admin plans + usage/upgrade + PlanLimitService

### Phase 5 — Institute ops
- [x] Staff / batches / roster / class attendance + FE

### Phase 6 — Tuition
- [x] TuitionFeePlan / invoices / payments + FE

### Phase 7 — Polish
- [x] Stream / camera / Playwright / mocks off / production harden

### Phase 8 — Complete real product
- [x] Auth/profile/contact, staff roles, admin CMS, LMS, seats, Expo
- [x] Extended smoke green on `development`

### Phase F — PayHere
- [ ] Owner finance brief → live card

---

## What’s left

| Ahead | Work |
|---|---|
| Next | Human QA Phase 8 on `development`; approve G2/G4 deltas |
| Then | Approve **G6** for production |
| Later | PayHere (Phase F) |

Full tick list: **`project/PROGRESS.md`**.
