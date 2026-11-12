# T-017 — lecturer-scanner-fe

- **Milestone:** M2
- **Feature:** `FEAT-016`
- **Size:** M
- **Risk:** medium
- **Depends on:** see `project/05-plan.md`
- **Status:** done

## Goal

Deliver lecturer-scanner-fe as specified in Phase 8 plan.

## Acceptance

- [ ] Behavior works in API mode (mocks off)
- [ ] Automated check or smoke step covers happy path
- [ ] No secrets committed

## Verification

```bash
npm test --workspaces --if-present
./scripts/smoke-product.sh
```
