# ADR-0003 — Git model: promotion tracks configured, existing branches preserved

- **Status:** accepted
- **Date:** 2026-11-10
- **Deciders:** human / DevOpt install
- **Supersedes:** none

## Context

DevOpt sets `GIT_MODEL=promotion` (`dev/frontend`, `dev/backend`, `prod/*`, `main`). Repo historically uses `feat/*` → `development` → `main` (Cursor rule).

## Decision

Keep `framework.conf` promotion model for DevOpt scripts. **Do not** force-create or rewrite branches until human asks. Until then, continue shipping via existing `development` integration when committing. Agents follow human’s explicit git instructions per session.

## Alternatives

| Option | Why not chosen |
|---|---|
| Immediately create all promotion branches | Unasked; may confuse ongoing workflow |
| Switch GIT_MODEL=trunk | Conflicts with DevOpt product default install |

## Consequences

**Positive:** No surprise branch explosion.  
**Negative:** Two documented models until tracks exist — STATE must stay clear.  

## Revisit if

- Human says “create promotion tracks” or “use trunk only”.

## References

- `docs/07-git-workflow.md`
- `.cursor/rules/git-development-workflow.mdc`
