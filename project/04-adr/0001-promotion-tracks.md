# 0001 — Promotion-track git

Status: accepted
Date: 2026-10-30
Deciders: human

## Context

This team ships frontend (Netlify) and backend (API) independently. Features accumulate several commits, merge to a development line, are tested locally, and reach production only when a human says so. After a phase, both production lines archive onto `main`.

## Decision

Default `GIT_MODEL=promotion` with five long-lived branches: `dev/frontend`, `dev/backend`, `prod/frontend`, `prod/backend`, `main`. Feature branches are `feat/<track>/<slug>` off the matching dev track. `scripts/promote.sh` dry-runs; `--apply` is human-gated.

## Alternatives

- Trunk-based only: cheaper merges, but one line cannot express independent FE/BE deploys or a production gate separate from merge-to-main.
- Single `develop`: mixes UI and API cadence.

## Consequences

+ Matches how this team already works; agents cannot "helpfully" ship to prod.
− Four long-lived branches need protection and back-merges on hotfix.

## Revisit if

The product becomes a single deployable, or promotion lag causes chronic merge pain. Then set `GIT_MODEL=trunk`.
