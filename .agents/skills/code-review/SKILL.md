---
name: code-review
description: Use when reviewing a diff, branch, or pull request before merge, checking a change against its spec, or auditing code for correctness, security, tests, and scope creep.
---

# Code Review

Review the diff, the spec, and the tests — in that order. The goal is to find the change that breaks in production, not to rewrite the author's style.

## Inputs

- The diff (`git diff origin/dev/frontend...HEAD` or `origin/dev/backend...HEAD`, or the PR)
- The linked spec/task
- Test results and CI status

## Procedure

### 1. Read the contract first

Read the spec/task acceptance. Without it, you cannot judge scope.

State the intended change in one line:

> This adds offline draft persistence for note capture, with retry on reconnect.

If the diff does more than that, flag scope creep.

### 2. Review in layers

| Layer | Questions |
|---|---|
| Correctness | Does it do what the spec says? Edge cases? |
| Data | Invariants, tenancy, migrations, idempotency |
| Security | Authz, validation, encoding, secrets, rate limits |
| Failure | Timeouts, retries, partial failure, rollback |
| Performance | N+1, unbounded lists, blocking work |
| Tests | Behavior, edge cases, regression, determinism |
| Readability | Names, boundaries, duplication, dead code |
| Operations | Logs, metrics, config, deploy impact |
| Docs | Spec, ADR, state, changelog |

### 3. Check the high-risk paths first

1. Authn/authz on every new endpoint or query.
2. Tenant/ownership filters.
3. Input validation and output encoding.
4. Money, dates, and state transitions.
5. Migrations and data deletion.
6. Retries and idempotency.
7. Secrets in code, logs, or errors.

Most production incidents live here, not in naming.

### 4. Verify the tests

- Do they assert behavior or implementation?
- Is there a test for each acceptance item?
- Is the failure path tested?
- Are they deterministic and isolated?
- Would they fail if the feature were removed?

If you are unsure, run the tests and mutate the code mentally: which test would catch it?

### 5. Classify feedback

| Level | Meaning | Examples |
|---|---|---|
| **Blocking** | correctness, security, data loss, broken contract | missing authz, SQL injection, lost writes |
| **Should fix** | maintainability, performance, missing test | N+1, duplicated logic, no error path |
| **Nit** | style, naming, preference | formatting, wording |

Do not block on nits. Do not approve with blocking issues.

### 6. Write actionable comments

Use `path:line`, the problem, and the fix:

```markdown
**Blocking** `src/notes/service.ts:42`
The query filters by `id` but not `workspace_id`, so any authenticated
user can read another workspace's note. Add `and workspace_id = $2`
and a test where an outsider receives 403.
```

Bad: "This is wrong." Good: names the failure, the fix, and the test.

### 7. Check the whole change

- [ ] Scope matches the task.
- [ ] Acceptance met.
- [ ] No unrelated refactor or formatting.
- [ ] No secrets or debug output.
- [ ] Error paths handled.
- [ ] Authz server-side.
- [ ] Queries bounded and parameterized.
- [ ] Tests meaningful and green.
- [ ] Docs/state updated.
- [ ] Rollback possible.

### 8. Give a verdict

```markdown
## Review — <task>
Verdict: approve | approve with nits | request changes | block

Blocking: <n>
Should fix: <n>
Nits: <n>

Top risk: <one line>
```

## Review sizes

| Diff | Approach |
|---|---|
| <50 lines | full read, fast |
| 50–400 lines | full read, focus on high-risk paths |
| 400–1,000 lines | request a split or review by commit |
| >1,000 lines | block; split before review |

A diff nobody can review is not ready.

## Guardrails

- Do not rewrite the change in review; request a focused fix.
- Do not approve because CI is green; CI does not check intent.
- Do not block on personal preference.
- Do not review generated files line by line; check the generator.
- Do not ignore a failing test or a skipped test without an issue link.
- If the spec is wrong, say so; do not force the code to match a bad spec.

## Output contract

```markdown
## Review
Verdict: ...
Blocking: <file:line — problem — fix>
Should fix: ...
Nits: ...
Tests: <what is missing>
Risk: <note>
```

## References

- `docs/06-quality.md`
- `docs/08-security.md`
- `docs/07-git-workflow.md`
