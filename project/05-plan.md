# Development plan

> Phase 4 · Gate G4 · Draft · Sequence from `docs/product/09-delivery-roadmap.md` + playbook

## Summary

- **Target:** Staging demo of bank seminar path + tenant isolation; institute Free plan usable
- **Capacity:** TBD (agent-assisted; owner reviews)
- **Critical path:** T-001 → T-002 → T-003 → T-004 → T-005 → T-008

## Milestones

### M1 — Foundation + tenancy (FEAT-001, FEAT-002, FEAT-007 seed)

- **Demo:** Login as institution A, B, and individual lecturer; nav differs by entitlements
- **Exit:** JWT auth; dual-org seed; doctor/tests for guards green
- **Tasks:** `T-001`, `T-002`

### M2 — Seminar Ops + bank slips + attendance (FEAT-003…006, FEAT-011)

- **Demo:** Lecturer publishes → student bank checkout → approve slip → QR → check-in once
- **Exit:** PlatformFeeLine written; card disabled; no PayHere calls
- **Tasks:** `T-003`, `T-004`, `T-005`

### M3 — Plans admin + institute ops + tuition (FEAT-007…010)

- **Demo:** Admin edits %/plans; Free institute hits cap; upgrade path; class attendance + tuition slip
- **Exit:** PlanLimitService enforced; individual 403 on institute
- **Tasks:** `T-006`, `T-007`, `T-008`

### M4 — Polish

- **Demo:** Stream join CTA optional; camera QR optional; Playwright bank smoke
- **Exit:** Mocks off on staging; PayHere still off
- **Tasks:** `T-009`

## Task table

| ID | Task | Size | Depends | Parallel-safe | Status |
|---|---|---|---|---|---|
| T-001 | Prisma foundation + auth + register kinds + seed | L | — | no | done |
| T-002 | FE API client + register/login + entitlement nav | M | T-001 | no | done |
| T-003 | Seminar catalogue/CRUD + checkInMode + FE wire | L | T-001 | partial w/ T-002 | done |
| T-004 | Bank checkout + slips + tickets + PlatformFeeLine | L | T-003 | no | done |
| T-005 | Check-in API + attendees + FE scanner | M | T-004 | no | done |
| T-006 | Admin plans/% + usage/upgrade + PlanLimitService | M | T-001 | after T-004 better | done |
| T-007 | Institute batches/roster/class attendance + FE gated | L | T-006 | no | todo |
| T-008 | Tuition fees cash/slip + FE | M | T-007 | no | todo |
| T-009 | Polish: stream/camera/Playwright/mocks off | M | T-005,T-008 | yes | todo |

## Risks

| ID | Risk | Impact | Mitigation | Owner |
|---|---|---|---|---|
| RISK-001 | Slip UX abandon | high | Clear statuses | human+agent |
| RISK-002 | Isolation bug | fatal | Dual-org tests in T-001/T-005 | agent |
| RISK-004 | Git confusion | med | ADR-0003; ask before new tracks | human |

## Spikes

| ID | Question | Time-box | Decision unblocked | Result |
|---|---|---|---|---|
| S-001 | Slip storage (disk vs S3) for local | 0.5d | T-004 upload | pending |

## Buffers

- Known work: M1–M3 critical path
- Integration/review: +25%
- PayHere: **not started** (Phase F)

## Review and release

- **Reviewer:** human
- **Required checks:** `npm test` workspaces; backend e2e inject; FE vitest; `./scripts/doctor.sh`
- **Release window:** TBD after G4
- **Rollback:** prior deploy + migrate down if needed

## Open questions

| # | Question | Default |
|---|---|---|
| Q1 | Create promotion git tracks now? | No — wait for explicit ask (ADR-0003) |

**Approved by:** human on 2026-11-10

## Task files

See `project/05-plan/tasks/`.
