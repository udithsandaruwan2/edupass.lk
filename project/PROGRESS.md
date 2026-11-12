# EduPass — progress plan (beginning → end)

> **Canonical checklist.** Updated **2026-11-12**.  
> Detail: `project/05-plan.md` · tasks: `project/05-plan/tasks/` · product: `docs/product/` · live state: `project/STATE.md`  
> Branch tip: **`development`**

**Scoreboard**

| Wave | Done | Open |
|---|---|---|
| Gates G0–G5 (v0.1) | 6/6 | — |
| G6 production cut | — | 1 (human) |
| Build T-001…T-010 | 10/10 | — |
| Phase 8 T-012…T-034 | 23/23 | — |
| Phase F PayHere | — | 1 (held) |

Legend: `[x]` done · `[ ]` open · `[~]` proposed / awaiting human

---

## 0. Gates (process)

- [x] **G0** Brief approved — `project/00-brief.md` (2026-11-10)
- [x] **G1** Discovery approved — `project/01-discovery.md` (2026-11-10)
- [x] **G2** Product baseline — `02-prd.md`, `02-product-catalog.md` (2026-11-10)
- [~] **G2-delta** Phase 8 scope C (LMS / seats / native) — proposed 2026-11-12
- [x] **G3** Architecture + ADR-0001…0004 (2026-11-10)
- [~] **G3-delta** ADR-0006 LMS · 0007 seats · 0008 Expo — proposed 2026-11-12
- [x] **G4** Plan / build authorized T-001…T-010 (2026-11-10)
- [~] **G4-delta** Phase 8 plan T-012…T-034 — proposed 2026-11-12
- [x] **G5** Merge-ready v0.1 (2026-11-10)
- [ ] **G6** Release to production — human only (does **not** freeze Phase 8)

---

## 1. Phase 0 — Documentation

- [x] Product vision, research, domain, architecture
- [x] API surface, user flows, FE/BE plans, roadmap
- [x] Progress tracker + one-go playbook + platform billing doc
- [x] Framework: `AGENTS.md`, ADRs, runbook

---

## 2. Phase 1 — Foundation + tenancy (T-001…T-002)

- [x] **T-001** Prisma + JWT auth + register student / institution / lecturer + seed
- [x] **T-002** FE API client + login/register + entitlement-aware nav
- [x] OrgScope + entitlement guards; Free plan seed; dual-org isolation

---

## 3. Phase 2–3 — Seminar Ops + bank slips + attendance (T-003…T-005)

- [x] **T-003** Seminar catalogue / CRUD / `checkInMode` + FE
- [x] **T-004** Bank checkout + slip upload/approve + tickets + `PlatformFeeLine`
- [x] **T-005** Check-in API + attendees + FE scanner (admit once)
- [x] Card / PayHere disabled by design

---

## 4. Phase 4–6 — Plans, institute, tuition (T-006…T-008)

- [x] **T-006** Admin plans + global ticket % + usage/upgrade + `PlanLimitService`
- [x] **T-007** Institute batches / roster / class attendance + gated FE
- [x] **T-008** Tuition fee plans / invoices / cash+slip + student FE

---

## 5. Phase 7 — Polish + production harden (T-009…T-010)

- [x] **T-009** Stream join URL, camera QR, Playwright, Netlify mocks off
- [x] **T-010** Demo purge, API-default catalogue, SMTP, self-serve register, `SEED_QA`
- [x] Student tickets / organiser orders hydrate from API
- [x] Organiser bank-account GET/PUT + payout settings
- [x] `scripts/smoke-product.sh` bank path green

---

## 6. Phase 8 — Complete real product (T-012…T-034)

### 6.1 M1 — Kill demo / real account surfaces

- [x] **T-012** `POST /auth/change-password` + FE
- [x] **T-013** Contact → MailModule; demo copy scrub
- [x] **T-014** LecturerProfile CRUD + public lecturers
- [x] **T-015** Profile GET/PUT APIs + FE save

### 6.2 M2 — Teacher / scanner scoped product

- [x] **T-016** `StaffRoleGuard` + role ACL
- [x] **T-017** FE `/lecturer/*` + scanner shell
- [x] **T-018** Institute staff invite UI + email

### 6.3 M3 — Admin people / catalogue / sales / CMS

- [x] **T-019** Admin list APIs (users, orgs, seminars, orders, tickets, refunds)
- [x] **T-020** CMS Prisma (Banner / Faq / Announcement) + CRUD
- [x] **T-021** Rewire Admin* pages off `DataContext` in API mode
- [x] **T-022** Category admin CRUD + FE

### 6.4 M4 — Institute LMS (thin)

- [x] **T-023** LMS schema (modules, materials, assignments, submissions, grades)
- [x] **T-024** LMS APIs (`/institute/lms`, `/student/lms`)
- [x] **T-025** Teacher + student LMS FE portals
- [x] **T-026** Local file storage helper for LMS

### 6.5 M5 — Seminar seat maps

- [x] **T-027** VenueLayout / Seat / SeatHold schema + APIs
- [x] **T-028** Organiser seat-map / layout on seminar form
- [x] **T-029** Checkout seat picker + holds (smoke covered)

### 6.6 M6 — Expo native companion

- [x] **T-030** `mobile/` Expo workspace + auth against Nest
- [x] **T-031** Student tickets + on-device QR
- [x] **T-032** Scanner check-in (camera)

### 6.7 M7 — Harden

- [x] **T-033** Extended smoke (auth, CMS, LMS, seats)
- [x] **T-034** Docs / STATE / CHANGELOG / this progress plan

---

## 7. Features catalog (FEAT)

| ID | Feature | Status |
|---|---|---|
| FEAT-001…011, 013 | v0.1 / v0.2 core | [x] shipped |
| FEAT-012 | CMS banners/FAQ | [x] shipped (Phase 8) |
| FEAT-014 | PayHere card | [ ] deferred Phase F |
| FEAT-015 | Change-password + profile | [x] shipped |
| FEAT-016 | StaffRole ACL + lecturer/scanner FE | [x] shipped |
| FEAT-017 | Institute LMS | [x] shipped |
| FEAT-018 | Seat maps | [x] shipped |
| FEAT-019 | Expo native | [x] shipped |
| FEAT-020 | LecturerProfile CRUD | [x] shipped |
| FEAT-021 | Admin list APIs | [x] shipped |

---

## 8. Still open (endgame)

### Human / ops

- [ ] Approve **G2/G4 Phase-8 deltas** (docs already proposed)
- [ ] Human smoke QA on `development` (bank path + LMS + seats + admin CMS + Expo)
- [ ] Approve **G6** → production cut (`main` only when you say so)
- [ ] Production API host + SMTP secrets on host (not in repo)

### Phase F — PayHere (held)

- [ ] Owner finance brief
- [ ] Enable `PAYHERE_ENABLED` + card checkout
- [ ] Optional auto plan billing

### Explicit non-goals (not planned)

- [ ] Moodle parity (quizzes / SCORM / forums)
- [ ] Multi-currency
- [ ] Automatic seller payouts
- [ ] Rewrite Vite SPA → native-only

---

## 9. Timeline (how we got here)

```text
Intake → Discovery → PRD/Catalog → Architecture
    → Plan T-001…T-010 → Build bank-first v0.1 → G5
    → Harden + smoke → Phase 8 (LMS/seats/admin/Expo) on development
    → [you] G6 production    → [later] Phase F PayHere
```

| Date | Milestone |
|---|---|
| 2026-11-10 | G0–G5; Nest stack; bank path; institute; tuition |
| 2026-11-11 | T-010 production harden + SMTP |
| 2026-11-12 | Tickets/orders hydrate; bank payout API; Phase 8 full ship to `development` |

---

## 10. Quick links

| Need | Path |
|---|---|
| This checklist | `project/PROGRESS.md` |
| Live phase/gate | `project/STATE.md` |
| Task files | `project/05-plan/tasks/` |
| Product roadmap | `docs/product/09-delivery-roadmap.md` |
| Mirror tracker | `docs/product/10-progress-tracker.md` |
| Rollback | `project/07-runbook.md` |
