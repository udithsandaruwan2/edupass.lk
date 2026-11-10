# 06 — Quality

**Question this phase answers:** how do we know the change is correct, and how do we keep it correct?

Quality is a set of cheap, automatic checks plus a small number of human judgments. It is not a coverage number.

---

## The test pyramid (pragmatic)

| Layer | Share | What it proves | Speed |
|---|---|---|---|
| Unit | ~60% | pure logic, edge cases, invariants | ms |
| Integration | ~30% | modules + real boundaries (DB, HTTP) | 100 ms–2 s |
| End-to-end | ~10% | critical user journeys | seconds–minutes |

These are defaults, not dogma. A data pipeline may need more integration tests; a design system may need more visual tests. The rule: **push tests as low as they can go while still proving the behavior.**

---

## What deserves a test

Always test:

- Acceptance criteria from the spec.
- Business invariants (money, permissions, tenancy, state machines).
- Bug regressions (one test per fixed bug).
- Boundary conditions (empty, max, duplicate, malformed, timeout).
- Security-sensitive paths (authz, input validation, rate limits).

Usually skip:

- Framework behavior.
- Trivial getters/setters.
- Private implementation details.
- Exact log strings or CSS classes.

A test that breaks when you rename a private method is a liability.

---

## Mapping acceptance to tests

For each acceptance bullet, write one of:

| Acceptance | Check |
|---|---|
| "Empty note is rejected" | integration test: POST `""` → 400 + message |
| "Draft survives offline" | E2E: go offline, type, reload, draft present |
| "p95 < 300 ms" | benchmark or load test with threshold |
| "Only workspace members can read" | authz test: outsider → 403 |

If an acceptance bullet has no check, it is not done. If a check cannot be automated, write the manual steps and who performs them.

---

## Test design

- **Arrange–Act–Assert** with one behavior per test.
- Name tests as behavior: `rejects_empty_note`, not `test_create_2`.
- Use realistic data builders, not 20-line fixtures.
- Test through the public interface; avoid asserting internal calls.
- One reason to fail per test. If two assertions can fail independently, split.
- Deterministic: no real clock, network, or random without a seed.
- Isolated: each test creates its own state; no order dependence.
- Fast feedback: the unit suite should run in seconds.

### Test data

- Never use production data.
- Use synthetic data that resembles production shape.
- Keep fixtures small and readable.
- For dates, inject a clock; do not freeze global time unless the framework supports it.

---

## Flaky tests

A flaky test is a bug in the test or the system. Treat it as P1.

1. Quarantine it (skip with a linked issue) so it does not hide real failures.
2. Reproduce with the seed/logs.
3. Fix the root cause (race, time, network, shared state).
4. Re-enable only after 20 consecutive green runs.

Never "fix" flakiness with arbitrary sleeps. Use explicit waits on a condition.

---

## Coverage

Coverage is a **signal**, not a target.

- Use it to find untested critical paths, not to chase 100%.
- Set a ratchet: coverage may not decrease on a PR.
- Exclude generated code and wiring from the metric.
- A high-coverage suite with weak assertions is worse than a smaller, meaningful one.

---

## Static analysis and CI gates

Every PR should run, in this order (fail fast):

1. Format check.
2. Lint.
3. Typecheck.
4. Unit tests.
5. Integration tests.
6. Build.
7. Secret scan.
8. Dependency audit (advisory unless critical).

Keep the pipeline under ~10 minutes for the fast path. Move slow E2E to a nightly or pre-release job.

### Quality gates

| Gate | Requirement |
|---|---|
| G5 merge-ready | acceptance met, fast checks green, review approved |
| Release | full suite green, no P0/P1 open, rollback tested |

Do not merge with a red pipeline and "fix it later". That is how trunk breaks.

---

## Code review

Review the **diff**, the **spec**, and the **tests** — in that order.

### Reviewer checklist

- [ ] Does it do what the spec says, no more?
- [ ] Are edge cases and failure paths handled?
- [ ] Is authorization checked server-side?
- [ ] Are inputs validated and outputs encoded?
- [ ] Are secrets absent from code, logs, and errors?
- [ ] Are queries parameterized and bounded?
- [ ] Do tests prove behavior, not implementation?
- [ ] Is the diff small and readable?
- [ ] Are docs and state updated?
- [ ] Is there a rollback path?

### Feedback levels

- **Blocking** — correctness, security, data loss, broken contract.
- **Should fix** — maintainability, performance, missing test.
- **Nit** — style, naming, preference. Do not block on nits.

Reviewers should say *why*, not just *what*. "This can leak tenant data because the query lacks `workspace_id`" beats "fix this".

---

## Bug triage

| Severity | Meaning | Response |
|---|---|---|
| P0 | data loss, outage, security breach | stop everything, hotfix |
| P1 | major feature broken, no workaround | fix this cycle |
| P2 | degraded, workaround exists | next cycle |
| P3 | cosmetic or minor | backlog |

Every bug gets: reproduction, expected vs actual, environment, and a regression test when fixed.

---

## Quality anti-patterns

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| Testing mocks, not behavior | green tests, broken product | test the contract |
| 100% coverage target | games the metric | ratchet + critical paths |
| Sleep-based waits | flaky and slow | wait on conditions |
| Shared mutable fixtures | order-dependent failures | per-test state |
| Manual release checklist only | human error | automate the checks |
| Reviewing style, missing security | false confidence | checklist + threat model |
| Ignoring flaky tests | real failures hidden | quarantine + fix |

---

## Exit checklist

- [ ] Acceptance criteria map to checks.
- [ ] New behavior has tests; bug fix has a regression test.
- [ ] Fast suite is deterministic and under ~10 minutes.
- [ ] CI gates are defined and enforced.
- [ ] Coverage ratchet exists (if used).
- [ ] Review checklist is in the PR template.
- [ ] Flaky-test policy is known.
- [ ] Release gate criteria are explicit.

Next: [07-git-workflow.md](07-git-workflow.md).
