# 09 — Release and operations

**Question this phase answers:** can we ship this change safely, know it worked, and undo it quickly?

A release is not `git push`. It is a reversible change with a verification plan.

---

## Environments

| Environment | Git | Purpose | Data |
|---|---|---|---|
| Local | feature branch | development | synthetic |
| Preview/PR | feature PR | review | synthetic |
| Frontend staging | `dev/frontend` | UI rehearsal | synthetic |
| API staging | `dev/backend` | API rehearsal | synthetic/anonymized |
| Production UI | `prod/frontend` | Netlify production | real |
| Production API | `prod/backend` | API production | real |
| Phase archive | `main` | both prod tracks after a phase | — |

Promote only with `./scripts/promote.sh` after the human says "go to production". Do not treat `main` as a deploy source.

Rules:

- Staging must resemble production in configuration, not scale.
- Never test with production data unless it is masked and approved.
- Preview environments are ephemeral; destroy them after merge.
- Production access is audited and time-bound.

---

## Versioning

Semantic versioning: `MAJOR.MINOR.PATCH`.

- **MAJOR** — breaking change for users or API consumers.
- **MINOR** — backward-compatible feature.
- **PATCH** — backward-compatible fix.
- Pre-release: `1.2.0-rc.1`.
- Build metadata: `1.2.0+20261030`.

Tag the production track that shipped, then record the version when it reaches `main`:

```bash
git tag -a v1.2.0 -m "v1.2.0"
git push origin v1.2.0
```

---

## Changelog

Keep `CHANGELOG.md` human-readable, grouped by version:

```markdown
## [1.2.0] — 2026-10-30
### Added
- Quick capture from the command palette (FEAT-001)
### Fixed
- Draft no longer lost on refresh (FEAT-004)
### Changed
- Search results now rank by recency (FEAT-007)
### Security
- Session idle timeout reduced to 30 minutes
```

Rules:

- Write for users, not committers.
- Link feature IDs.
- Call out breaking changes and migration steps.
- Do not include internal chores unless they affect users.

---

## Pre-release checklist

- [ ] All acceptance criteria for the milestone are met.
- [ ] Full test suite green; no known P0/P1.
- [ ] Lint, typecheck, build green.
- [ ] Security checks: secrets, authz, dependencies.
- [ ] Migrations are reversible or forward-only with a backup.
- [ ] Feature flags are set correctly for the rollout.
- [ ] Observability: dashboards and alerts cover the new path.
- [ ] Runbook updated with the new failure modes.
- [ ] Rollback plan written and tested in staging.
- [ ] Changelog and version updated.
- [ ] Human approves G6.

---

## Deployment strategies

| Strategy | Use when | Risk |
|---|---|---|
| Recreate | small internal app, downtime OK | brief outage |
| Rolling | stateless services | mixed versions during rollout |
| Blue/green | need instant rollback | double infrastructure |
| Canary | high-traffic, measurable | slower rollout |
| Feature flag | risky behavior, decoupled from deploy | flag debt |

Default for small teams: **rolling + feature flag** for risky behavior. Deploy and release are separate events.

---

## Database migrations

Use **expand → migrate → contract**:

1. **Expand:** add the new column/table, nullable, with dual writes if needed.
2. **Migrate:** backfill in batches; verify counts.
3. **Switch:** read from the new path; keep the old path until verified.
4. **Contract:** remove the old column/code in a later release.

Rules:

- Never drop or rename a column in the same release that stops using it.
- Every migration has a rollback or a forward-fix plan.
- Backfills are idempotent, batched, and observable.
- Test migrations against a production-like snapshot.
- Lock-heavy migrations run in a maintenance window or online tool.

---

## Rollback

A rollback plan answers:

- What is the trigger? (error rate, latency, business metric)
- Who decides?
- What is the command or button?
- How long does it take?
- What data is affected?
- How do we verify recovery?

Rollback is not always `git revert`. If a migration ran, you may need a forward fix or a restore. Decide before deploying.

---

## Observability after release

Watch for 30–60 minutes:

- Error rate and latency (p50/p95/p99).
- Saturation: CPU, memory, connections, queue depth.
- Business metric: signups, captures, payments.
- Logs for new error codes.
- User reports.

Define one **release health dashboard** and one **page-worthy alert**. If everything is green, record the release in `project/08-metrics.md`.

---

## Runbook

`project/07-runbook.md` should cover:

- Service overview and dependencies.
- Deploy and rollback commands.
- Common alerts and first checks.
- Known failure modes and fixes.
- Escalation contacts.
- Backup/restore procedure.
- Incident communication template.

Keep it short enough to use under pressure. Test it once per quarter.

---

## Post-release

- Announce the change with user-facing notes.
- Monitor for 24–48 hours.
- Collect feedback and bugs.
- Update the catalog status to `shipped`.
- Write a short retro: what worked, what surprised us, what to change.
- If an incident occurred, write a blameless postmortem with owners and dates.

---

## Operations metrics

Track, at minimum:

| Metric | Why |
|---|---|
| Deployment frequency | throughput |
| Lead time for change | flow |
| Change failure rate | quality |
| Time to restore | resilience |
| Error budget burn | reliability |
| Cost per environment | sustainability |

Do not optimize all four DORA metrics at once. Pick the constraint.

---

## Exit checklist

- [ ] Version and changelog updated.
- [ ] Pre-release checklist complete.
- [ ] Migration plan is safe and tested.
- [ ] Rollback plan is written and rehearsed.
- [ ] Dashboards and alerts cover the change.
- [ ] Runbook updated.
- [ ] Release health verified for 30–60 minutes.
- [ ] Catalog and metrics updated.
- [ ] Retro or postmortem scheduled.

Next: [10-token-economy.md](10-token-economy.md).
