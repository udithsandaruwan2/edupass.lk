# T-003 — Seminar catalogue, CRUD, checkInMode

- **Milestone:** M2
- **Feature:** FEAT-003, FEAT-005
- **Size:** L
- **Risk:** medium
- **Depends on:** T-001
- **Status:** done

## Goal

Published seminars in public catalogue; sellers CRUD with required `checkInMode`; FE catalogue/organiser seminars use API.

## Context

- `docs/product/05-api-surface.md`
- `frontend/src/App.tsx` public routes

## Acceptance

- [x] Public GET seminars filters work
- [x] Publish requires checkInMode
- [x] Seller only mutates own org seminars
- [x] FE list/detail/organiser forms on API when mocks off

## Out of scope

- Checkout/slips (T-004)

## Verification

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```
