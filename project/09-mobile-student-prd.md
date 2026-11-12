# PRD addendum — Phase 9 EduPass mobile (Student + Staff gate)

> Gate G2 proposed · Updated 2026-11-12 · Complements `project/02-prd.md`

## Summary

Ship one **Expo / React Native** app with **two versions (shells)** after login:

1. **Student** — every student web journey (discover, bank buy, seats, slips, tickets/QR, bookings, tuition, LMS, profile, support).
2. **Staff (institute / seminar)** — gate mode: select seminar → scan or type ticket code → **verify admit/reject** via Nest check-in (role-scoped).

Organiser admin CRUD and platform admin stay on web. PayHere held.

## Outcomes

- Student completes Flow C entirely on phone
- Staff at the door verifies QR without a laptop
- Wrong-tenant / duplicate scan rejected with clear UX
- Same Nest `/api`; no duplicate business rules

## Scope

### Student shell (Must)

| Area | Include |
|---|---|
| Auth | Login, register student, forgot/reset, change password, SecureStore |
| Discover | Seminars list/detail, categories, search, seat map |
| Commerce | Cart, bank checkout, seat holds, slip upload, order status |
| Tickets | List/detail, large QR for gate |
| Institute | Class fees + LMS |
| Account | Profile, settings, notifications, support |
| Bookings | History / refund (Should) |

### Staff shell — gate verify (Must)

| Area | Include |
|---|---|
| Auth | Same login; membership role from `/auth/me` |
| Entry | If role ∈ {OWNER, ADMIN, TEACHER, SCANNER, CASHIER} with org → offer **Staff / Gate** home |
| Seminar | Pick published seminar for active organisation |
| Scan | Camera QR + manual code entry |
| Verify | `POST /organiser/check-in` → large Admitted / Not admitted + reason |
| History | Recent scans on device (session list) |
| Switch | If user is also a student, allow switch to Student shell |

### Out of scope

- Staff: seminar create/edit, slip approve, earnings, institute billing on mobile
- Platform admin mobile
- Live PayHere card
- Push provider (in-app list first)

## Journeys

### J-M1 — Student buy and attend
Browse → cart → bank (+ seats) → slip → tickets → show QR

### J-M2 — Staff gate
Login as staff → Gate → choose seminar → scan → admit once / reject

### J-M3 — Student class portal
Class fees + LMS submit/grades

### J-M4 — Account
Profile · password · support

## Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-M01…M11 | Student Must/Should from prior list | as before |
| FR-M12 | Card checkout | Must later (Phase F) |
| FR-M13 | Role-based shell: Student vs Staff Gate after login | Must |
| FR-M14 | Staff seminar list scoped to membership org | Must |
| FR-M15 | Camera + manual check-in against Nest | Must |
| FR-M16 | Duplicate / wrong seminar / other-tenant → clear fail | Must |
| FR-M17 | SCANNER role lands on Gate by default (no student chrome) | Must |

## NFRs

| ID | Target |
|---|---|
| NFR-M01 | Cold start &lt; 3s mid Android |
| NFR-M02 | Student QR readable; staff camera works in hall lighting |
| NFR-M03 | Tokens in SecureStore only |
| NFR-M04 | Gate result usable at arm’s length (large type/color) |

## Release criteria

- [ ] Student Must path green on device
- [ ] Staff scan admit-once green on device
- [ ] Device smoke covers both shells
- [ ] PayHere still off
- [ ] G4 Phase-9 approved before build

**G2 Phase-9 proposed:** 2026-11-12 (dual shell) — awaiting human approve
