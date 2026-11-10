---
project: "edupass.lk"
phase: 5-build
phase_name: "Build"
status: authorized
updated: "2026-11-10"
owner: "human"
gates:
  G0: approved 2026-11-10 by human
  G1: approved 2026-11-10 by human
  G2: approved 2026-11-10 by human
  G3: approved 2026-11-10 by human
  G4: approved 2026-11-10 by human
  G5: approved 2026-11-10 by human
  G6: pending
next_action: "Merged to development for local test. G6 / production / PayHere still held."
---

# Project state

> Product: **edupass.lk**. Scope: `docs/product/`. Gates G0–G5 approved. Framework: **DevOpt 1.4.1**. On `development` for local QA.

## Current focus

**T-001…T-009 complete. G5 approved** (human: finalize development + local test). G6 / Phase F held.

## Gate log

| Gate | Status | Date | Approved by | Notes |
|---|---|---|---|---|
| G0 Brief | approved | 2026-11-10 | human | `00-brief.md` |
| G1 Discovery | approved | 2026-11-10 | human | `01-discovery.md` |
| G2 Product | approved | 2026-11-10 | human | `02-prd.md`, `02-product-catalog.md` |
| G3 Architecture | approved | 2026-11-10 | human | `03-architecture.md`, ADR 0001–0004 |
| G4 Plan / build | approved | 2026-11-10 | human | `05-plan.md`, T-001…T-009 |
| G5 Merge | approved | 2026-11-10 | human | Finalize → development + local QA |
| G6 Release | pending | | | After staging smoke / explicit ask |

## Blockers

- none (paused by human until implement asked)

## Recent decisions

| Date | Decision | ADR |
|---|---|---|
| 2026-11-10 | Nest+Fastify not Django | `04-adr/0001-nestjs-fastify-stack.md` |
| 2026-11-10 | Shared DB + organisationId | `04-adr/0002-shared-db-tenancy.md` |
| 2026-11-10 | Promotion conf; keep existing branches until asked | `04-adr/0003-git-tracks.md` |
| 2026-11-10 | Bank slip first; PayHere hold | `04-adr/0004-bank-slip-first.md` |

## Next action

See frontmatter. First build task when resumed: `05-plan/tasks/T-001-foundation-auth.md`.

## Links

- PRD / Catalog: `02-prd.md`, `02-product-catalog.md`
- Architecture: `03-architecture.md`, `04-adr/`
- Plan: `05-plan.md`, `05-plan/tasks/`
- Product docs: `../docs/product/README.md`

## Rules for updating this file

- Never mark a gate `approved` without human approval.
- Update on every phase/gate/blocker/handoff.
