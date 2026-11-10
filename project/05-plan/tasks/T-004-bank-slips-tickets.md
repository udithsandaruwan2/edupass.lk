# T-004 — Bank checkout, slips, tickets, PlatformFeeLine

- **Milestone:** M2
- **Feature:** FEAT-004, FEAT-006, FEAT-011
- **Size:** L
- **Risk:** high
- **Depends on:** T-003
- **Status:** done

## Goal

Student bank checkout → slip → seller/admin approve → valid tickets + PlatformFeeLine; card disabled; PayHere stub only.

## Context

- ADR-0004
- `docs/product/06-user-flows.md`
- `frontend/src/pages/public/CheckoutPages.tsx`

## Acceptance

- [x] Default method bank; card disabled UI + API reject
- [x] Approve slip transactional: paid + tickets valid + fee line
- [x] Commission % snapshotted at checkout
- [x] Reject slip allows re-upload with reason
- [x] Refund path voids tickets (Should)

## Out of scope

- Live PayHere

## Verification

```bash
npm run test:e2e --workspace=backend
# manual: checkout → upload → approve → ticket QR
```
