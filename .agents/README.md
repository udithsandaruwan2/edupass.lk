# Skill catalog

Skills are on-demand procedures. Only `name` and `description` are always visible; the body loads when the trigger matches.

| Skill | Use when |
|---|---|
| `project-kickoff` | starting a project or moving to a new phase/gate |
| `prompt-optimizer` | a request is vague, large, multi-outcome, or token-expensive |
| `spec-writer` | defining a feature or writing acceptance criteria |
| `architecture-decisions` | choosing stack/data model, writing an ADR, threat modeling |
| `plan-and-slice` | breaking work into tasks, sequencing, estimating |
| `implementation-loop` | writing or changing product code |
| `git-steward` | branches, commits, PRs, worktrees, conflicts, tags |
| `code-review` | reviewing a diff or PR before merge |
| `test-strategy` | test plan, flaky tests, coverage |
| `release-manager` | version, changelog, deploy, rollback |
| `context-auditor` | rules/docs are bloated, stale, or contradictory |
| `skill-forge` | adding a project-specific skill or rule |

Stack conventions are **profiles**, not skills: `.agents/profiles/`. File allowlists are **packs**: `.agents/packs/`. Load with `./scripts/context-pack.sh`.

## Adding a skill

```bash
./scripts/new.sh skill <name>
# edit .agents/skills/<name>/SKILL.md
./scripts/sync-adapters.sh
./scripts/doctor.sh
```

Use `skill-forge` for the full guide. Keep `SKILL.md` ≤200 lines and put long detail in `reference.md`.

## Adding a project rule

Create `project/rules/<topic>.md` from `.agents/templates/rule.md`. Link it from the task/spec that needs it. Add it to `AGENTS.md` §11 only if it must be known every session.

## Format

```yaml
---
name: lowercase-hyphen-name
description: Use when <trigger 1>, <trigger 2>, or <trigger 3>.
---
```

The folder name must match `name`. The description is the trigger; make it specific.
