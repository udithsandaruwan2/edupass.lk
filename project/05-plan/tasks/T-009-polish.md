# T-009 — Polish: stream, camera, Playwright, mocks off

- **Milestone:** M4
- **Feature:** FEAT-013
- **Size:** M
- **Risk:** low
- **Depends on:** T-005, T-008
- **Status:** done

## Goal

Optional stream join fields; camera QR where supported; Playwright bank-path smoke; production builds without mocks.

## Context

- `docs/product/09-delivery-roadmap.md` Phase 7

## Acceptance

- [x] Playwright: login → bank path → ticket → check-in (with test approve)
- [x] `VITE_USE_MOCKS=false` on staging
- [x] PayHere still disabled

## Out of scope

- Phase F PayHere enablement

## Verification

```bash
npm run test:playwright --workspace=frontend   # needs Nest on :3000
npm run build --workspace=frontend
```
