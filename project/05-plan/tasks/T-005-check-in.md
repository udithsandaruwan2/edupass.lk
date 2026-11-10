# T-005 — Seminar check-in + attendees UI

- **Milestone:** M2
- **Feature:** FEAT-005
- **Size:** M
- **Risk:** medium
- **Depends on:** T-004
- **Status:** done

## Goal

Gate scanner admits valid tickets once; attendees list shows check-in state; cross-tenant codes rejected.

## Context

- `docs/product/06-user-flows.md`
- organiser check-in page

## Acceptance

- [x] POST check-in success/duplicate/wrong seminar
- [x] CheckInEvent audit written
- [x] FE check-in + attendees wired
- [x] Other org ticket rejected

## Out of scope

- Camera barcode (T-009)

## Verification

```bash
npm run test:e2e --workspace=backend
```
