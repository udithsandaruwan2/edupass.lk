# G5 — Merge-ready proposal (pre-PayHere)

**Status:** proposed by agent — **human must approve** before merge/release.
**Date:** 2026-11-10
**Scope:** T-001…T-009 on working tree / branch tip `feat/frontend/t009-polish` (includes prior feat backends in the same uncommitted migration).

## Acceptance vs plan

| Milestone | Tasks | Met |
|---|---|---|
| M1 Foundation | T-001, T-002 | yes |
| M2 Seminar + bank + check-in | T-003…T-005 | yes |
| M3 Plans + institute + tuition | T-006…T-008 | yes |
| M4 Polish | T-009 | yes |
| Phase F PayHere | — | held (out of scope) |

## Checks (last run)

- [x] `npm run typecheck --workspace=frontend`
- [x] `npm run test --workspace=frontend` (vitest; e2e/ excluded)
- [x] `npm run build --workspace=frontend`
- [x] `npm test --workspace=backend`
- [x] `npm run test:e2e --workspace=backend`
- [x] `npm run test:playwright --workspace=frontend` (Nest on :3000)
- [x] `./scripts/doctor.sh` pass
- [x] `graphify update .` after code edits

## Artifacts

- Changelog: `CHANGELOG.md` [Unreleased] filled
- Runbook: `project/07-runbook.md` deploy + rollback
- Tracker: `docs/product/10-progress-tracker.md` 9/9
- PayHere still disabled in checkout + API

## Suggested merge path (after human “commit / ship”)

1. Commit on feature branch(es) — **do not** commit until human asks.
2. Push feature branch; open PR into `development` (existing integration branch; promotion tracks not created yet per ADR-0003).
3. Human reviews → merge to `development` only.
4. **Do not** merge to `main` / promote prod until human says so (G6).

## Risks / follow-ups (non-blocking for G5)

- Admin “platform fee revenue” UI still thin (API exists).
- Earnings UI later; refund voids tickets + fee line already.
- Entire Lovable→monorepo history may land as one large first commit — prefer reviewable chunking if human wants.

## Ask of human

1. **Approve G5?** (default: yes if checks above still green)
2. **Commit + PR to `development`?** (default: yes, one squashed or conventional multi-commit on current tip)
3. Hold G6 / production until staging smoke signed off.
