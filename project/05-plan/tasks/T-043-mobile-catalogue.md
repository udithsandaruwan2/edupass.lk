# T-043 — mobile-catalogue

- **Milestone:** M2 (Phase 9)
- **Feature:** `FEAT-023`
- **Size:** M
- **Risk:** medium
- **Depends on:** see `project/05-plan-phase9-mobile.md`
- **Status:** todo

## Goal

Deliver `mobile-catalogue` for EduPass Student mobile (Expo).

## Context

- `project/09-mobile-student-prd.md`
- `project/04-adr/0009-student-expo-app.md`
- Existing `mobile/` companion and Nest `/api`

## Acceptance

- [ ] Works against Nest API (mocks not required)
- [ ] Secure token handling where auth involved
- [ ] Covered by device smoke or manual checklist row

## Out of scope

- Organiser/admin mobile; PayHere

## Verification

```bash
# after G4: expo start + Nest on :3000
./scripts/smoke-product.sh  # API still green
```
