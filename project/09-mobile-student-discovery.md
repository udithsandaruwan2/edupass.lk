# Discovery — Phase 9 EduPass mobile (Student + Staff gate)

> Phase 9 · Gate G1 proposed · Updated 2026-11-12 · Evidence from web + ADR-0008 companion

## Problem

1. **Students** need the full phone journey: browse → bank buy → QR at the door, plus class fees and LMS — not only a browser SPA.
2. **Institute / seminar staff** need a phone app to **scan and verify** ticket QR at the gate (and optionally class contexts), without opening the full web organiser panel.

Phase 8 Expo companion only covers thin tickets + scanner; student journeys still force web.

## Evidence

| # | Source | Type | What it shows |
|---|---|---|---|
| E1 | `StudentRoutes.tsx` | Code | Full student web surface |
| E2 | Flow C + check-in API | Product | Student shows QR; staff `POST /organiser/check-in` |
| E3 | `StaffRole` SCANNER/TEACHER/… | Schema | Gate roles already exist |
| E4 | ADR-0008 + `mobile/` | Code | Same Nest auth already drives tickets + scan |
| E5 | Owner ask 2026-11-12 | Requirement | App must have **student version** and **staff scan/verify version** |

## Users and jobs

| Segment | Job to be done | Trigger | Success |
|---|---|---|---|
| Student | Buy + show QR + fees/LMS | Seminar / class day | Same Nest outcomes as web |
| Seminar / institute staff (OWNER, ADMIN, TEACHER, SCANNER, …) | Scan QR → admit/reject once | Gate | Large pass/fail; tenant-safe |
| Platform admin | — | — | Web only (non-goal on mobile) |

## Assumptions

| # | Assumption | Confidence | Default |
|---|---|---|---|
| A1 | **One Expo app**, two shells after login by `/auth/me` role | high | Locked |
| A2 | Staff mobile = **gate verify only** (not full seminar CRUD) | high | Locked |
| A3 | Nest `/api` only; bank-first; PayHere held | high | Locked |
| A4 | Evolve `mobile/` (no second RN repo) | high | Locked |

## Non-goals (Phase 9)

- Full organiser seminar CRUD / slip approve / earnings on mobile (web)
- Admin CMS / plans on mobile
- Moodle quizzes / offline-first sync / Flutter

## Recommendation

Ship **EduPass** mobile with:

- **Student shell** — full student parity (catalogue → checkout → tickets → LMS/fees)
- **Staff shell** — seminar picker + camera/manual code → check-in verify

Propose G2 → G3 → G4, then build.
