# 07 — Git workflow

**Question this phase answers:** how do we keep history readable, frontend and backend independently deployable, and production changes intentional?

The rules are strict because agents are fast and confident. Git is the safety net; do not cut holes in it.

`GIT_MODEL` in `framework.conf` selects the model. **Products default to promotion tracks.** Trunk-based is the opt-in for a single deployable (including this framework repo when `apps/` does not exist).

---

## Branch model — promotion tracks (default)

Two development tracks, two production tracks, `main` as the phase archive. Frontend and backend never share a long-lived line.

```
feat/frontend/<slug> ──▶ dev/frontend ──(human: go to production)──▶ prod/frontend ──┐
                                                                                ├──(phase)──▶ main
feat/backend/<slug>  ──▶ dev/backend  ──(human: go to production)──▶ prod/backend  ──┘
```

| Branch | Use | Lifetime |
|---|---|---|
| `dev/frontend` | integrate and locally test UI | forever |
| `dev/backend` | integrate and locally test API | forever |
| `prod/frontend` | Netlify production | forever |
| `prod/backend` | API production | forever |
| `main` | phase snapshot of **both** prod tracks | forever |
| `feat/<track>/<slug>` | one feature, many commits OK | days |
| `fix/<track>/<slug>` | bug on the matching track | hours |
| `hotfix/<track>/<slug>` | production emergency, from `prod/<track>` | hours |

Names are set in `framework.conf` (`BRANCH_*`). Do not invent aliases.

### Promotion rules

1. Cut the feature branch from the matching **dev** track, never from `main` or `prod/*`.
2. Several commits on the feature branch are expected. One feature per branch.
3. At feature end: PR into `dev/<track>`. Human reviews. Merge. Test locally on that dev branch.
4. **Do not** promote to `prod/<track>` unless the human says "go to production" (or equivalent).
5. Promote with `./scripts/promote.sh <track> prod` (dry-run) then `--apply` after the words.
6. After a phase is done, and only then: `./scripts/promote.sh phase --apply` merges both prod tracks into `main`.
7. Never commit directly onto `dev/*`, `prod/*`, or `main`.
8. Protect all five long-lived branches. Require PRs into `dev/*`. Require human approval into `prod/*` and `main`.

```bash
./scripts/promote.sh frontend prod          # plan only
./scripts/promote.sh frontend prod --apply  # after "go to production"
./scripts/promote.sh phase --apply          # both prod → main
```

### Trunk opt-in

If `GIT_MODEL=trunk`: `main` is the only long-lived branch; features are `feat/<slug>` off `main`; no `promote.sh`. Use this for a single deployable or this framework source repo.

---

## Mapping to environments

| Git | Environment | Typical host |
|---|---|---|
| feature branch / PR | preview | Netlify preview / ephemeral API |
| `dev/frontend` | local + frontend staging | Netlify draft/dev site |
| `dev/backend` | local + API staging | staging API |
| `prod/frontend` | production UI | Netlify production |
| `prod/backend` | production API | production API |
| `main` | none | archive / next-phase baseline |

---

## Commits

**Conventional Commits**, enforced by `.githooks/commit-msg`:

```
<type>(<scope>): <imperative summary>

<why this change is needed>

Refs: FEAT-001, T-003
```

| Type | Use |
|---|---|
| `feat` | user-visible behavior |
| `fix` | bug fix |
| `docs` | documentation only |
| `refactor` | no behavior change |
| `perf` | performance |
| `test` | tests only |
| `build` | build system, deps |
| `ci` | pipeline |
| `chore` | maintenance |
| `revert` | revert a previous commit |

Rules:

- Summary ≤72 chars, imperative mood ("add", not "added").
- One logical change per commit.
- Body explains **why**, not what. The diff shows what.
- Reference the spec/task ID.
- Never commit generated files, secrets, or unrelated formatting.
- If a commit needs "and" in the summary, it is probably two commits.

Good:

```
feat(notes): add optimistic capture with offline queue

Keeps the UI responsive on flaky networks and preserves drafts
when the tab closes. Queue flushes on reconnect with idempotency key.

Refs: FEAT-001, T-003
```

Bad:

```
update stuff
```

---

## Staging discipline

- `git status` before every commit.
- Stage explicit paths: `git add src/notes/service.ts tests/notes.test.ts`.
- Never `git add .` or `git add -A`; they capture scratch files and secrets.
- Review `git diff --staged` before committing.
- If you see unexpected changes, stop and ask; do not revert someone else's work.

---

## Pull requests

A PR is a unit of review, not a unit of work. Keep it under ~400 changed lines when possible.

### PR template

```markdown
## What
One paragraph.

## Why
Link to FEAT-### / T-### / issue.

## How
Key decisions and trade-offs.

## Verification
- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual: <steps>

## Risk and rollback
What can break, and how to undo it.

## Screenshots
Before/after for UI changes.
```

### Review rules

- At least one human approval for shared branches.
- Author resolves comments; reviewer re-checks only changed parts.
- No self-merge without approval, even if CI is green.
- Feature → `dev/<track>`: merge commit (keep the feature's commits).
- `dev` → `prod` and `prod` → `main`: `promote.sh`, human-only.
- Rebase on the **target track** (usually `origin/dev/<track>`) before merge.

---

## Parallel agents and worktrees

One agent per worktree, one branch per worktree, one task per branch.

```bash
# Frontend agent
git worktree add ../my-app-web-notes -b feat/frontend/notes dev/frontend
# Backend agent
git worktree add ../my-app-api-notes -b feat/backend/notes-api dev/backend
```

Rules:

- Never run two agents in the same working directory.
- Give each agent a disjoint file scope; overlapping scopes cause conflicts.
- Baseline check before handing the worktree to an agent: `install && test` must be green.
- After the agent finishes: run the same checks, review the diff, then merge.
- Remove the worktree after merge:

```bash
git worktree remove ../my-app-web-notes
git branch -d feat/frontend/notes
git worktree prune
```

### Parallelization checklist

- [ ] Tasks touch disjoint files.
- [ ] No shared migration or lockfile edits.
- [ ] Each worktree has its own env/DB/port.
- [ ] Merge order is known.
- [ ] One owner reviews all agent diffs together.

---

## Conflicts

1. Understand both sides; do not blindly accept "ours" or "theirs".
2. Prefer the version that preserves both intents; if impossible, ask.
3. Re-run tests after resolution.
4. Never commit conflict markers.
5. If a conflict is large, split the branch or rebase in smaller steps.

```bash
git fetch origin
git rebase origin/dev/frontend   # or origin/dev/backend
# resolve, then
git add <resolved-files>
git rebase --continue
```

Never rebase a branch someone else is working on without coordination.

---

## Releases and tags

- Semantic versioning: `MAJOR.MINOR.PATCH`.
- Annotated tags: `git tag -a v1.2.0 -m "v1.2.0"`.
- Tag the production track that actually shipped (`prod/frontend` and/or `prod/backend`), then record the same version when those tracks reach `main`.
- Changelog entry required before tagging.
- Hotfix: branch from `prod/<track>`, fix, tag a patch, merge back to that prod track **and** to `dev/<track>`.

---

## Emergency hotfix

```bash
git switch prod/backend && git pull --ff-only
git switch -c hotfix/backend/session-expiry
# smallest fix + regression test
git commit -m "fix(auth): expire sessions after 30m idle"
# PR into prod/backend, tag, then merge the same commit into dev/backend
```

After the hotfix: write a short postmortem, add the regression test, and fix the process gap.

---

## Recovery

| Situation | Command | Caution |
|---|---|---|
| Undo last commit, keep changes | `git reset --soft HEAD~1` | local only |
| Discard unstaged changes | `git restore <file>` | destructive |
| Recover a lost commit | `git reflog` → `git cherry-pick <sha>` | safe |
| Undo a pushed commit | `git revert <sha>` | never force-push shared |
| Stash before switching | `git stash push -m "wip: notes"` | do not forget it |
| See what changed | `git diff`, `git diff --staged` | read before commit |

**Never** run `git reset --hard`, `git clean -fd`, or `git push --force` on shared branches without explicit human approval.

---

## Agent permissions

| Action | Default |
|---|---|
| Read history, diff, status | allowed |
| Create branch/worktree | allowed |
| Stage explicit paths | allowed |
| Commit on a feature branch | allowed when checks pass |
| Push feature branch | only when asked |
| Open PR | only when asked |
| Merge to `dev/<track>` | when asked (PR) |
| Promote to `prod/<track>` or `main` | human said so; `promote.sh --apply` |
| Merge to `main` (trunk model) | human only |
| Rebase/force-push shared branch | human only |
| Tag/release | human only |
| Delete branch/worktree | allowed after merge, confirm first |

If the agent is unsure whether a file is someone else's work, it must stop and ask.

---

## Exit checklist

- [ ] Target track is green (`dev/<track>` after a feature, `prod/<track>` after promote).
- [ ] Branch name includes the track (`feat/frontend/...`).
- [ ] Commits are atomic and Conventional.
- [ ] PR has what/why/how/verification/risk.
- [ ] Checks pass locally and in CI.
- [ ] Review approved; no unresolved blocking comments.
- [ ] Worktree/branch cleaned up after merge.
- [ ] Release tagged with changelog and rollback plan.

Next: [08-security.md](08-security.md).
