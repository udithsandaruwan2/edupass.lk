# Development plan — Phase 9 Student mobile

> Gate G4 proposed · 2026-11-12 · Depends on G2/G3 Phase-9 approve · No product code until G4

## Summary

- **Target:** EduPass Student on Expo with Must parity vs web student journeys
- **Critical path:** T-040 → T-041 → T-042…T-045 → T-046…T-048 → T-049…T-051 → T-052…T-054 → T-055
- **Stack:** Expo + Expo Router + SecureStore · Nest `/api` unchanged (bank-first)

## Parity matrix (web → mobile)

| Web route / capability | Milestone | Priority |
|---|---|---|
| Login / register / forgot-reset | M1 | Must |
| Change password / profile | M1 | Must |
| Explore seminars + detail | M2 | Must |
| Cart + bank checkout + slip | M2 | Must |
| Seat picker | M2 | Must |
| My tickets + QR | M1 (exists) → polish M2 | Must |
| Bookings / upcoming / past / history | M3 | Should |
| Refund request | M3 | Should |
| Class fees | M3 | Must |
| LMS learning | M3 | Must |
| Saved seminars | M4 | Should |
| Notifications | M4 | Should |
| Support / contact | M4 | Must |
| Deep links | M5 | Could |
| Store listing | M5 | Could |
| Card / PayHere | — | Phase F |

## Milestones

### M1 — App shell + auth (demo: sign in, see tickets)
- T-040 Expo Router shell + SecureStore auth session
- T-041 Register / forgot / reset / change-password screens
- T-042 Ticket list/detail QR polish (upgrade companion)

### M2 — Discover + buy (demo: bank buy on device)
- T-043 Catalogue + seminar detail
- T-044 Cart + checkout bank + seat holds
- T-045 Slip upload (image picker) + order status

### M3 — Institute student (demo: fees + LMS submit)
- T-046 Bookings / history / refund
- T-047 Tuition balance + slip
- T-048 LMS modules / submit / grades

### M4 — Account + polish
- T-049 Profile + settings + contact
- T-050 Notifications + saved
- T-051 Design system / empty / error states

### M5 — Harden + ship candidate
- T-052 Maestro/Detox or scripted device smoke
- T-053 Env configs (dev/staging), EAS profile draft
- T-054 Docs: mobile runbook + PROGRESS update
- T-055 Parity matrix sign-off + G5 mobile propose

## Task table

| ID | Task | Size | Depends | Status |
|---|---|---|---|---|
| T-040 | Expo Router shell + SecureStore session | L | G4 | todo |
| T-041 | Auth screens (register/reset/change-pw) | M | T-040 | todo |
| T-042 | Tickets + QR polish | M | T-040 | todo |
| T-043 | Catalogue + seminar detail | L | T-040 | todo |
| T-044 | Cart + bank checkout + seats | L | T-043 | todo |
| T-045 | Slip image upload + order status | M | T-044 | todo |
| T-046 | Bookings / history / refund | M | T-045 | todo |
| T-047 | Tuition FE | M | T-040 | todo |
| T-048 | LMS FE | L | T-040 | todo |
| T-049 | Profile / settings / contact | M | T-041 | todo |
| T-050 | Notifications + saved | M | T-040 | todo |
| T-051 | Visual polish + a11y | M | M2–M4 | todo |
| T-052 | Device smoke automation | M | M3 | todo |
| T-053 | EAS / env profiles | M | T-040 | todo |
| T-054 | Mobile runbook + PROGRESS | S | T-052 | todo |
| T-055 | Parity sign-off / G5 propose | S | T-054 | todo |

## Spikes

| ID | Question | Time-box | Unblocks |
|---|---|---|---|
| S-M01 | Shared `packages/api-client` vs copy patterns | 0.5d | T-040 |
| S-M02 | Slip upload multipart vs base64 on Nest | 0.5d | T-045 |

## Buffers

- Known: M1–M3 critical path
- Integration: +25%
- Store: after G5 mobile (not in M1–M4)

## Open questions (defaults)

| # | Question | Default |
|---|---|---|
| Q1 | Include scanner in same app? | Hidden staff mode behind role; student tabs default |
| Q2 | Push notifications? | In-app list only in Phase 9; FCM later |
| Q3 | Extract shared API package now? | No — copy/adapt until duplication hurts (S-M01) |

**G4 Phase-9 proposed:** 2026-11-12 — awaiting human approve

## First build slice (after G4)

T-040 → T-041 → T-042 (auth + tickets), then T-043…T-045 (buy path).
