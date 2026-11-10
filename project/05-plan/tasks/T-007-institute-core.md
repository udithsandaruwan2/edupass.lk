# T-007 — Institute batches, roster, class attendance

- **Milestone:** M3
- **Feature:** FEAT-009
- **Size:** L
- **Risk:** medium
- **Depends on:** T-006
- **Status:** done

## Goal

Entitlement-gated institute modules: staff, batches, enrollments, sessions, AttendanceRecord; FE institute nav only when allowed.

## Context

- `docs/product/05-api-surface.md`
- ADR attendance split

## Acceptance

- [x] Individual lecturer 403 on `/institute/*`
- [x] Class attendance ≠ CheckInEvent
- [x] FE gated pages work for entitled org

## Out of scope

- Tuition (T-008)

## Verification

```bash
npm run test --workspace=backend
npm run typecheck --workspace=frontend
```
