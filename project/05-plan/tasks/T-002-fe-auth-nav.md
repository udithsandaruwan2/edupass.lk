# T-002 — FE API client, auth, entitlement nav

- **Milestone:** M1
- **Feature:** FEAT-001, FEAT-002
- **Size:** M
- **Risk:** medium
- **Depends on:** T-001
- **Status:** done

## Goal

SPA talks to Nest auth; three register entry points; DashboardLayout nav gated by entitlements.

## Context

- `docs/product/07-frontend-masterpiece-plan.md`
- `frontend/src/layouts/DashboardLayout.tsx`
- `frontend/src/contexts/AuthContext.tsx`

## Acceptance

- [x] `frontend/src/api/client.ts` with `VITE_API_URL`
- [x] Login/register against API (mocks optional behind flag)
- [x] Individual lecturer sees no Classes/Roster/Fees
- [x] Institution with institute entitlement sees institute nav

## Out of scope

- Full seminar API wire (T-003+)

## Verification

```bash
npm run test --workspace=frontend
npm run typecheck --workspace=frontend
```
