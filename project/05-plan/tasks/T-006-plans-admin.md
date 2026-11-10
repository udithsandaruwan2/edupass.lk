# T-006 — Plans admin, commission %, PlanLimitService

- **Milestone:** M3
- **Feature:** FEAT-007, FEAT-008
- **Size:** M
- **Risk:** medium
- **Depends on:** T-001
- **Status:** done

## Goal

Platform admin CRUD Free/Premium/Platinum; edit global ticket %; institution usage meter + upgrade invoice slip; enforce caps server-side.

## Context

- `docs/product/12-platform-billing-and-tenancy.md`

## Acceptance

- [x] Admin changes % without deploy; next order uses new snapshot
- [x] Free org blocked at batch/student cap
- [x] Upgrade + platform subscription slip path works

## Out of scope

- PayHere for subscriptions

## Verification

```bash
npm run test --workspace=backend
```
