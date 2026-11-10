# Pull request

## Track

`frontend` | `backend` | `framework` — target branch: `dev/<track>` (not `main`, not `prod/*`)

## What

`<one paragraph describing the change>`

## Why

`<link to FEAT-### / T-### / issue>`

## How

`<key decisions and trade-offs>`

## Verification

- [ ] `<test command>`
- [ ] `<lint command>`
- [ ] `<typecheck command>`
- [ ] `<build command>`
- [ ] Manual: `<steps>`

## Risk and rollback

`<what can break, and how to undo it>`

## Screenshots

`<before/after for UI changes>`

## Checklist

- [ ] Scope matches the task; no unrelated changes.
- [ ] Acceptance criteria met.
- [ ] Tests cover new behavior and the failure path.
- [ ] No secrets, debug logs, or dead code.
- [ ] Docs and `project/STATE.md` updated if needed.
- [ ] Commit messages follow Conventional Commits.
- [ ] Stays on one track; no accidental `apps/web` + `apps/api` mix.
- [ ] Does not promote to `prod/*` or `main`.
