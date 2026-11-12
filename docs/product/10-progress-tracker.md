# 10 — Progress tracker

Checkboxes · Updated **2026-11-11** · Source of truth also: `project/05-plan.md` + `project/05-plan/tasks/`

**Scoreboard:** **10 / 10** build tasks done · **M1–M5 complete (pre-PayHere)** · **G5 approved** · **G6 pending human** · Phase F held

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

## Phase checklist (product)

### Phase 0 — Documentation
- [x] README + index
- [x] 01 Vision
- [x] 02 Research
- [x] 03 Domain
- [x] 04 Architecture
- [x] 05 API
- [x] 06 Flows
- [x] 07 Frontend
- [x] 08 Backend
- [x] 09 Roadmap
- [x] 10 Tracker
- [x] 11 Playbook
- [x] 12 Platform billing & tenancy

### Phase 1 — Tenancy foundation
- [x] Prisma + auth
- [x] Register institution / lecturer / student
- [x] Tenant isolation guards
- [x] Seed Free/Premium/Platinum + commission %
- [x] FE actor-aware nav

### Phase 2 — Seminar Ops
- [x] Catalogue + CRUD + checkInMode
- [x] Checkout + commission snapshot
- [x] Tickets + check-in attendance
- [x] FE seller + student paths

### Phase 3 — Slips + platform fee lines
- [x] Slip approve → tickets + PlatformFeeLine
- [x] Card disabled / PayHere stub
- [x] Earnings + refund fee adjust *(refund voids tickets + fee line; organiser % from membership)*
- [x] Admin view fee revenue *(PlatformFeeLine + subscription invoices)*

### Phase 4 — Plans & upgrades
- [x] Admin plans CRUD + edit global %
- [x] Usage meter + upgrade + platform invoice slip
- [x] PlanLimitService

### Phase 5 — Institute ops
- [x] Staff / batches / roster / class attendance
- [x] FE gated institute panel

### Phase 6 — Tuition
- [x] TuitionFeePlan / invoices / payments
- [x] FE tuition UI (named distinctly)

### Phase 7 — Polish
- [x] Stream / camera / Playwright / mocks off
- [x] Production harden (demo purge, SMTP, self-register)

---

## What’s left (rough)

| Ahead | Work |
|---|---|
| Next | Human smoke on `development` → approve **G6** |
| Later | PayHere (Phase F) |

Branch tip: **`development`** (T-010 + fee revenue).

## Notes

| Date | Note |
|---|---|
| 2026-11-10 | Platform fees = plans + ticket %; multi-institution + individual lecturers; tuition separate. |
| 2026-11-10 | M2 demo path works in API: publish → bank checkout → slip approve → QR → check-in once. |
| 2026-11-10 | T-007: institute batches/roster/AttendanceRecord gated; lecturer 403; ≠ CheckInEvent. |
| 2026-11-10 | T-008: TuitionFeePlan/Invoice/Payment cash+slip; student balance; labels “class fees”. |
| 2026-11-10 | T-009: streamJoinUrl, BarcodeDetector camera QR, Playwright bank-path smoke, Netlify VITE_USE_MOCKS=false. |
| 2026-11-11 | T-010: API-default (VITE_USE_MOCKS=false), empty catalogue, SMTP welcome/slip/tuition/reset, self-register, SEED_QA gate. |
| 2026-11-12 | Admin PlatformFeeLine revenue UI + organiser commission % polish; G6 changelog/rollback ready. |
| 2026-11-12 | FE wire: student tickets/orders + organiser orders from API; full smoke-product.sh green. |
