# T-008 — Tuition fees

- **Milestone:** M3
- **Feature:** FEAT-010
- **Size:** M
- **Risk:** medium
- **Depends on:** T-007
- **Status:** done

## Goal

TuitionFeePlan / Invoice / Payment (cash + bank slip); student fee balance; naming never confuses with platform fee.

## Context

- `docs/product/03-domain-model.md`

## Acceptance

- [x] Cash and slip paths work
- [x] UI labels “tuition” / “class fees”, not “platform fee”
- [x] Student sees outstanding balance

## Out of scope

- Platform subscription invoices (T-006)

## Verification

```bash
npm run test --workspace=backend
```
