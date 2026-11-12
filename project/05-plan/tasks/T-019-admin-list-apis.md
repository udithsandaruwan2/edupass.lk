# T-019 — admin-list-apis

- **Milestone:** M3
- **Feature:** `FEAT-021`
- **Size:** M
- **Risk:** medium
- **Depends on:** see `project/05-plan.md`
- **Status:** done

## Goal

Deliver admin-list-apis as specified in Phase 8 plan.

## Acceptance

- [ ] Behavior works in API mode (mocks off)
- [ ] Automated check or smoke step covers happy path
- [ ] No secrets committed

## Verification

```bash
npm test --workspaces --if-present
./scripts/smoke-product.sh
```
