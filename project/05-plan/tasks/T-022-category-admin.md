# T-022 — category-admin

- **Milestone:** M3
- **Feature:** `FEAT-012`
- **Size:** M
- **Risk:** medium
- **Depends on:** see `project/05-plan.md`
- **Status:** done

## Goal

Deliver category-admin as specified in Phase 8 plan.

## Acceptance

- [ ] Behavior works in API mode (mocks off)
- [ ] Automated check or smoke step covers happy path
- [ ] No secrets committed

## Verification

```bash
npm test --workspaces --if-present
./scripts/smoke-product.sh
```
