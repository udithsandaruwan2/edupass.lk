# Discovery — Phase 9 Student React Native app

> Phase 9 · Gate G1 proposed · Evidence from web product + ADR-0008 companion · 2026-11-12

## Problem

Students need EduPass on the phone for **browse → bank buy → QR at the door**, class fees, and LMS — without relying on the Vite SPA in a browser. The Phase 8 Expo companion (`mobile/`) only covers tickets + scanner; full student journeys still force web.

## Evidence

| # | Source | Type | What it shows |
|---|---|---|---|
| E1 | `frontend/src/pages/student/StudentRoutes.tsx` | Code | Student web surface: overview, bookings, upcoming/past, history, tickets, class-fees, learning, saved, notifications, profile, settings, support |
| E2 | `docs/product/06-user-flows.md` Flow C | Product | Bank checkout → slip → tickets → QR is the money path |
| E3 | ADR-0008 + `mobile/` | Code | Thin Expo already hits Nest `/api` for login, tickets, check-in |
| E4 | `project/PROGRESS.md` | Status | Web Phase 8 complete on `development`; PayHere held |
| E5 | Vision personas | Doc | Student = discover seminars, tickets, optional class portal |

## Current alternatives

| Segment | Today | Pain | Switching cost |
|---|---|---|---|
| Student | Mobile browser / PWA-ish Vite | Weak QR gate UX; no store install; cart/slip awkward on phone | Learn one app |
| Student | Phase 8 Expo companion | Tickets only — no catalogue/checkout/LMS/tuition | Expand same Expo app |
| Organiser/admin | Web SPA | Not this phase | — |

## Users and jobs

| Segment | Job to be done | Trigger | Success |
|---|---|---|---|
| Student | Find seminar, buy with bank slip, show QR | Exam season / seminar day | Same Nest outcomes as web |
| Student | Pay class fees / submit LMS work | Institute enrollment | Balance + grades on phone |
| Gate staff | (out of Phase 9 primary) | Door | Keep thin scanner; optional later |

## Assumptions

| # | Assumption | Confidence | Impact if wrong | Test |
|---|---|---|---|---|
| A1 | Nest `/api` is sufficient; no BFF | high | med | Reuse web API client contracts |
| A2 | Expo + Expo Router is the stack (extend ADR-0008) | high | med | Spike navigation + secure store |
| A3 | Student-only app first (not organiser) | high | low | Catalog non-goals |
| A4 | Bank-first remains; card stays Phase F | high | fatal if ignored | Mirror web disabled card |
| A5 | Store listing (Play/App Store) is post-MVP | med | med | Internal TestFlight/APK first |

## Constraints

- NestJS API + JWT; no second backend
- Education PII (students) — secure token storage, no secrets in app binary
- Monorepo: evolve `mobile/` (do not fork a second RN project)
- Web SPA remains full product for organisers/admin
- PayHere / card out until Phase F

## Non-goals (Phase 9)

- Organiser seminar CRUD, admin CMS, institute billing on mobile
- Full offline-first sync / local DB replication
- Moodle quizzes / SCORM
- Flutter rewrite
- Replacing web

## Risks

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Store policy / camera permission friction | Expo Camera docs; clear purpose strings |
| R2 | Slip upload on mobile flaky | Image picker + retry; same slip API as web |
| R3 | Feature parity lag forever | Milestone parity matrix vs `StudentRoutes` |
| R4 | Token theft on device | `expo-secure-store`; short-lived JWT; logout |

## Recommendation

**Expand `mobile/` into the EduPass Student app** (Expo React Native): parity with student web journeys against Nest, bank-first. Keep organiser/admin on web. Propose **G2 → G3 → G4** for Phase 9, then build.

**Proposed next:** human approve discovery (G1 Phase-9), then product catalog FEATs + ADR-0009 + plan T-040+.
