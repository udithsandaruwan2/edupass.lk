# PRD addendum — Phase 9 Student React Native

> Gate G2 proposed · 2026-11-12 · Complements `project/02-prd.md` (does not replace v0.1/Phase 8)

## Summary

Ship an **EduPass Student** mobile app (Expo / React Native) that covers **every student-facing journey** already live on the web API: auth, catalogue, cart/checkout (bank + seats), slips, tickets/QR, bookings/refunds, tuition, LMS, profile/settings, notifications, support. Organiser/admin remain web-only. PayHere stays held.

## Outcomes

- Student completes Flow C (buy → slip → QR) entirely on phone
- Enrolled student pays class fees and uses LMS on phone
- Parity checklist vs web `StudentRoutes` is green for Must items
- Same Nest `/api`; no duplicate business logic

## Scope

**In scope (student mobile)**

| Area | Must include |
|---|---|
| Auth | Login, register student, forgot/reset, change password, secure token store |
| Discover | Public seminars list/detail, categories, search/filter, seat map view |
| Commerce | Cart, bank checkout, seat holds, slip upload, order status |
| Attendance | My tickets, ticket detail, offline-displayable QR |
| Account | Profile, settings, notifications inbox, support/contact |
| Institute | Class-fees balance + slip; LMS modules/assignments/submit/grades |
| Bookings | Upcoming/past, history, refund request |
| Saved | Saved seminars (if API/local persistence exists on web) |

**Out of scope**

- Organiser / teacher / scanner-as-primary / admin (scanner may remain a hidden staff mode or separate build flavor later)
- Live PayHere card
- Push notifications provider (design hook; ship in-app list first)
- Multi-account family profiles

## Journeys

### J-M1 — Buy and attend
Register/login → browse → add to cart → bank checkout (+ seats if any) → upload slip → tickets → show QR at gate

### J-M2 — Class portal
Login → class fees → upload tuition slip → learning → submit assignment → see grade

### J-M3 — Account hygiene
Profile edit · change password · notifications · contact support

## Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-M01 | Auth against Nest; tokens in SecureStore | Must |
| FR-M02 | Catalogue + seminar detail from public API | Must |
| FR-M03 | Cart + bank checkout + slip upload | Must |
| FR-M04 | Tickets list/detail + QR render | Must |
| FR-M05 | Seat picker when layout exists | Must |
| FR-M06 | Tuition balance + slip | Must |
| FR-M07 | LMS list/submit/grades | Must |
| FR-M08 | Bookings/history + refund request | Should |
| FR-M09 | Profile + change-password + contact | Must |
| FR-M10 | Notifications list (API or client inbox) | Should |
| FR-M11 | Deep link to ticket / seminar | Could |
| FR-M12 | Card checkout | Must later (Phase F) |

## NFRs

| ID | Target |
|---|---|
| NFR-M01 | Cold start to home &lt; 3s on mid Android |
| NFR-M02 | QR readable on gate camera in daylight |
| NFR-M03 | No secrets in JS bundle; API base via env |
| NFR-M04 | A11y: large check-in ticket contrast; form labels |

## Release criteria (Phase 9)

- [ ] Must FRs demoable on device/emulator against staging/local Nest
- [ ] Student parity matrix Must rows green
- [ ] Automated smoke or Detox/Maestro critical path
- [ ] PayHere still off
- [ ] Human G4 Phase-9 approved before build; G5 when merge-ready

**G2 Phase-9 proposed:** 2026-11-12 — awaiting human approve
