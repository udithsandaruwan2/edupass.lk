# Development plan — Phase 9 EduPass mobile (Student + Staff gate)

> Gate G4 proposed · Updated 2026-11-12 · No product code until G4 approve

## Summary

- **Target:** One Expo app — **Student shell** (web parity) + **Staff Gate shell** (QR scan/verify)
- **Critical path:** T-040 → T-041 → T-056 → T-042…T-045 → T-046…T-048 → T-049…T-051 → T-052…T-055
- **Stack:** Expo Router + SecureStore · Nest `/api` · bank-first

## Parity matrix

| Capability | Shell | Milestone | Priority |
|---|---|---|---|
| Login / register / reset / change-pw | Both | M1 | Must |
| Role → Student vs Staff Gate shell | Both | M1 | Must |
| Staff: seminar pick + camera/manual check-in | Staff | M1 | Must |
| My tickets + QR | Student | M1 | Must |
| Explore + detail | Student | M2 | Must |
| Cart + bank checkout + seats + slip | Student | M2 | Must |
| Bookings / refund | Student | M3 | Should |
| Tuition + LMS | Student | M3 | Must |
| Profile / notifications / support | Student | M4 | Must |
| Device smoke both shells | Both | M5 | Must |
| PayHere | — | — | Phase F |

## Milestones

### M1 — Shells + auth + gate + tickets
- T-040 Expo Router + SecureStore session
- T-041 Auth screens (register/reset/change-pw)
- T-056 Staff Gate shell (seminar list, camera, manual code, admit UI)
- T-042 Student tickets + QR polish

### M2 — Student discover + buy
- T-043 Catalogue + seminar detail
- T-044 Cart + bank checkout + seats
- T-045 Slip upload + order status

### M3 — Student institute
- T-046 Bookings / history / refund
- T-047 Tuition
- T-048 LMS

### M4 — Account + polish
- T-049 Profile / settings / contact
- T-050 Notifications + saved
- T-051 UI polish + a11y (esp. gate result)

### M5 — Harden
- T-052 Device smoke (student buy path + staff admit-once)
- T-053 EAS / env profiles
- T-054 Docs + PROGRESS
- T-055 Parity sign-off / G5 propose

## Task table

| ID | Task | Size | Depends | Status |
|---|---|---|---|---|
| T-040 | Expo Router shell + SecureStore | L | G4 | todo |
| T-041 | Auth screens | M | T-040 | todo |
| T-056 | Staff Gate: scan/verify check-in | L | T-040 | todo |
| T-042 | Student tickets + QR | M | T-040 | todo |
| T-043 | Catalogue + detail | L | T-040 | todo |
| T-044 | Cart + checkout + seats | L | T-043 | todo |
| T-045 | Slip upload + order status | M | T-044 | todo |
| T-046 | Bookings / refunds | M | T-045 | todo |
| T-047 | Tuition | M | T-040 | todo |
| T-048 | LMS | L | T-040 | todo |
| T-049 | Profile / support | M | T-041 | todo |
| T-050 | Notifications + saved | M | T-040 | todo |
| T-051 | Visual polish + gate a11y | M | M1–M4 | todo |
| T-052 | Device smoke both shells | M | T-056, M3 | todo |
| T-053 | EAS / env | M | T-040 | todo |
| T-054 | Docs / PROGRESS | S | T-052 | todo |
| T-055 | Parity sign-off | S | T-054 | todo |

## Open questions (defaults)

| # | Question | Default |
|---|---|---|
| Q1 | One app or two store listings? | **One app**, two shells |
| Q2 | Staff slip-approve on mobile? | **No** — web only |
| Q3 | Push notifications? | In-app list first |

**G4 Phase-9 proposed:** 2026-11-12 — awaiting human approve

## First build slice (after G4)

T-040 → T-041 → T-056 → T-042 (auth + **staff verify** + student tickets), then M2 buy path.
