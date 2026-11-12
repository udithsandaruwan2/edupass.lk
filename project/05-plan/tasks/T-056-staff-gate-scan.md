# T-056 — Staff Gate shell (scan / verify)

- **Milestone:** M1 (Phase 9)
- **Feature:** `FEAT-029`
- **Size:** L
- **Risk:** medium
- **Depends on:** T-040
- **Status:** todo

## Goal

Institute/seminar staff can pick a seminar, scan or type a ticket code, and see admit/reject from Nest check-in on the phone.

## Context

- `project/09-mobile-student-prd.md` FR-M13…M17
- `POST /organiser/check-in` + attendance APIs
- Phase 8 companion scanner behaviour in `mobile/App.tsx`

## Acceptance

- [ ] SCANNER (and other staff roles) can open Gate shell
- [ ] Camera QR + manual entry call Nest; admit-once enforced
- [ ] Large pass/fail UX; wrong org/seminar fails clearly
- [ ] Student-only accounts never see Gate chrome

## Out of scope

- Slip approve, seminar CRUD, earnings on mobile

## Verification

```bash
# after G4: device — login staff → scan valid ticket → ADMITTED → rescan → reject
./scripts/smoke-product.sh  # API check-in still green
```
