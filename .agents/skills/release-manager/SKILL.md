---
name: release-manager
description: Use when preparing a release, promoting a track to production, updating changelog or version, deploying, writing a rollback plan, or handling a hotfix.
---

# Release Manager

A release is a reversible change with a verification plan, not a push.

## Inputs

- Milestone completion and green checks
- `CHANGELOG.md`, version, migrations
- `project/07-runbook.md` and `project/08-metrics.md`

## Procedure

### 1. Confirm readiness

- [ ] Milestone acceptance met.
- [ ] Full suite green; no P0/P1.
- [ ] Lint, typecheck, build green.
- [ ] Security checks: secrets, authz, dependencies.
- [ ] Migrations tested and reversible (or forward-only with backup).
- [ ] Feature flags set for the rollout.
- [ ] Dashboards/alerts cover the new path.
- [ ] Rollback plan written.
- [ ] Changelog/version updated.
- [ ] Human approves G6.

If any item is missing, stop. Do not release on hope.

Promotion-track products: production is `prod/frontend` and/or `prod/backend`, not `main`. Dry-run first:

```bash
./scripts/promote.sh frontend prod
./scripts/promote.sh backend prod
```

`--apply` only after the human says "go to production". End of phase: `./scripts/promote.sh phase`.

### 2. Choose the version

Semantic versioning:

- **MAJOR** — breaking change.
- **MINOR** — backward-compatible feature.
- **PATCH** — backward-compatible fix.
- Pre-release: `1.2.0-rc.1`.

### 3. Write the changelog

Group by Added / Fixed / Changed / Security. Write for users. Link feature IDs.

```markdown
## [1.2.0] — 2026-10-30
### Added
- Quick capture from the command palette (FEAT-001)
### Fixed
- Draft no longer lost on refresh (FEAT-004)
### Security
- Session idle timeout reduced to 30 minutes
```

### 4. Plan the migration

Use expand → migrate → contract:

1. Add nullable column/table.
2. Backfill in idempotent batches; verify counts.
3. Switch reads/writes.
4. Remove the old path in a later release.

Never drop or rename in the same release that stops using the old path. Every migration needs a rollback or forward-fix.

### 5. Plan the rollout

| Strategy | Use when |
|---|---|
| Rolling | stateless service |
| Blue/green | instant rollback needed |
| Canary | measurable traffic split |
| Feature flag | risky behavior, decoupled release |

Deploy and release are separate. Ship dark, then enable for a small cohort.

### 6. Write the rollback plan

- Trigger: error rate, latency, business metric.
- Decision owner.
- Command/button.
- Expected duration.
- Data impact.
- Verification after rollback.

If a migration ran, `git revert` may not be enough; decide the forward fix.

### 7. Deploy and verify

1. Deploy to staging; run smoke tests.
2. Deploy to production.
3. Watch for 30–60 minutes:
   - error rate, p50/p95/p99 latency;
   - saturation (CPU, memory, connections, queue);
   - business metric;
   - new error codes in logs.
4. Record the result in `project/08-metrics.md`.

### 8. Announce and close

- User-facing release notes.
- Update catalog status to `shipped`.
- Update `project/STATE.md`.
- Schedule a retro or postmortem.
- Remove temporary feature flags after the rollout.

### 9. Hotfix

```bash
git switch main && git pull
git switch -c hotfix/<slug>
# smallest fix + regression test
# checks, approval, merge
git tag -a v1.2.1 -m "v1.2.1"
```

Afterward: postmortem, regression test, process fix.

## Guardrails

- Do not release with a red pipeline.
- Do not skip the rollback plan.
- Do not run an untested migration.
- Do not tag from a feature branch.
- Do not leave feature flags forever.
- Do not announce before verification.
- Human-only: tag, production deploy approval, rollback decision.

## Output contract

```markdown
## Release
Version: v<semver>
Changelog: <path>
Migration: <none | expand/migrate/contract>
Rollout: <strategy>
Rollback: <trigger + command>
Verified: <metrics + window>
Status: released | rolled back | blocked
Next: <one action>
```

## References

- `docs/09-release-ops.md`
- `docs/07-git-workflow.md`
- `.agents/templates/runbook.md`
