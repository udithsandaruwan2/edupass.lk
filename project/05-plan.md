# Development plan

> Phase 8 · Gate G4-delta **approved 2026-11-12 by human** · Continuous build on `development` (no G6 freeze)

## Summary

- **Target:** Real admin/CMS, staff roles, LMS, seat maps, Expo companion on `development`
- **Capacity:** agent-assisted; owner reviews
- **Critical path:** G2-delta → T-012…T-015 → T-016…T-018 → T-019…T-022 → T-023…T-026 → T-027…T-029 → T-030…T-032 → T-033

## Milestones

### M1 — Kill demo surfaces (FEAT-015, FEAT-020)
- **Demo:** Change password; contact SMTP; lecturer profiles persist
- **Tasks:** T-012…T-015

### M2 — Staff roles (FEAT-016)
- **Demo:** TEACHER `/lecturer`; SCANNER check-in only
- **Tasks:** T-016…T-018

### M3 — Admin CMS (FEAT-012, FEAT-021)
- **Demo:** Admin lists/orders/CMS from Nest
- **Tasks:** T-019…T-022

### M4 — Institute LMS (FEAT-017)
- **Demo:** Material → assignment → submit → grade
- **Tasks:** T-023…T-026

### M5 — Seat maps (FEAT-018)
- **Demo:** Seat pick at checkout; no oversell
- **Tasks:** T-027…T-029

### M6 — Expo native (FEAT-019)
- **Demo:** Mobile tickets + scanner
- **Tasks:** T-030…T-032

### M7 — Harden
- **Tasks:** T-033, T-034

## Task table

| ID | Task | Size | Depends | Status |
|---|---|---|---|---|
| T-012 | change-password API + FE | M | — | done |
| T-013 | Contact → MailModule; demo scrub | S | — | done |
| T-014 | LecturerProfile CRUD + public API/FE | L | — | done |
| T-015 | Student/organiser profile GET/PUT | M | — | done |
| T-016 | StaffRoleGuard + JWT role claims | M | T-012 | done |
| T-017 | FE `/lecturer` + scanner shell | L | T-016 | done |
| T-018 | Institute staff invite UI + email | M | T-016 | done |
| T-019 | Admin list APIs | L | — | done |
| T-020 | CMS Prisma + CRUD | L | — | done |
| T-021 | Rewire Admin* to API | L | T-019,T-020 | done |
| T-022 | Category admin CRUD FE | M | T-019 | done |
| T-023 | LMS schema | L | T-016 | done |
| T-024 | LMS APIs | L | T-023 | done |
| T-025 | LMS FE portals | L | T-024 | done |
| T-026 | File storage for LMS | M | T-023 | done |
| T-027 | Seat schema + holds | L | — | done |
| T-028 | Seat-map editor FE | L | T-027 | done |
| T-029 | Checkout seat picker + e2e | L | T-027 | done |
| T-030 | Expo workspace + auth | L | — | done |
| T-031 | Expo student tickets | M | T-030 | done |
| T-032 | Expo scanner | M | T-030 | done |
| T-033 | Smoke/Playwright expand | M | M1–M6 | done |
| T-034 | Docs/STATE Phase 8 RC | S | T-033 | done |

Progress checklist (beginning → end): `project/PROGRESS.md`

## ADRs

- ADR-0006 LMS · ADR-0007 seats · ADR-0008 Expo

## Open questions

| # | Question | Default |
|---|---|---|
| Q1 | Blob store | Local `uploads/` + env path; Netlify Blobs when FE host needs it |
| Q2 | G6 | Human when ready; does not block Phase 8 |

**G4 Phase-8 approved by:** human on 2026-11-12
