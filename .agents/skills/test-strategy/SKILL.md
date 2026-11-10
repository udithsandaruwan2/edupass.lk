---
name: test-strategy
description: Use when deciding what to test, writing a test plan, fixing flaky tests, interpreting coverage, or mapping acceptance criteria to automated checks.
---

# Test Strategy

Choose the cheapest test that proves the behavior. Coverage is a signal, not a goal.

## Inputs

- Spec acceptance criteria
- Existing test suite and commands
- Risk profile (money, auth, data loss)

## Procedure

### 1. Map acceptance to checks

```markdown
| Acceptance | Check | Layer |
|---|---|---|
| empty note rejected | POST "" → 400 | integration |
| draft survives reload | offline → type → reload | E2E |
| non-member forbidden | outsider → 403 | integration |
| p95 < 300 ms | benchmark 10k rows | perf |
```

Every acceptance item needs a check or a documented manual test. If a check cannot be automated, write the steps and the owner.

### 2. Choose the lowest layer that proves it

| Behavior | Layer |
|---|---|
| pure logic, validation, calculations | unit |
| module + database/HTTP boundary | integration |
| critical user journey | E2E |
| latency/throughput | benchmark/load |
| accessibility | automated + manual |
| security authz | integration/authz matrix |

Push down when possible. A unit test is faster and more precise than an E2E test.

### 3. Design the cases

For each behavior, cover:

- Happy path.
- Empty / first use.
- Boundary (min, max, just over).
- Invalid input.
- Permission denied.
- Timeout / dependency failure.
- Duplicate / retry.
- Concurrency, if relevant.

Do not test the framework. Do not assert private methods.

### 4. Write maintainable tests

- Arrange–Act–Assert; one behavior per test.
- Name as behavior: `rejects_empty_note`.
- Build data with factories, not 30-line fixtures.
- Test through the public interface.
- One reason to fail.
- Deterministic: inject clock/random/network.
- Isolated: no order dependence, no shared mutable state.

### 5. Use realistic data

- Never production data.
- Synthetic but production-shaped (unicode, long strings, nulls, timezones).
- Small fixtures; generate variations in code.
- Keep secrets and PII out of fixtures.

### 6. Handle flakiness

A flaky test is P1.

1. Quarantine with a linked issue (skip, not delete).
2. Reproduce with the seed/logs.
3. Fix the root cause: race, time, network, shared state.
4. Re-enable after 20 consecutive green runs.

Never add arbitrary sleeps. Wait on a condition.

### 7. Set coverage policy

- Ratchet: coverage may not decrease on a PR.
- Exclude generated code and wiring.
- Focus on critical paths, not 100%.
- Review uncovered lines in high-risk modules.

### 8. Define the pipeline

Fast path (every PR, <10 min):

```bash
format --check
lint
typecheck
unit
integration
build
secret scan
```

Slow path (nightly/pre-release):

```bash
e2e
load
dependency audit
accessibility
```

Fail fast: run the cheapest checks first.

### 9. Report results honestly

- Exact command and result.
- Skips with reasons.
- Pre-existing failures separated from new ones.
- No "should pass" claims.

## Guardrails

- Do not weaken a test to make it pass.
- Do not delete a failing test without understanding it.
- Do not mock the thing under test.
- Do not chase coverage numbers.
- Do not add E2E tests for logic a unit test can prove.
- Do not use sleeps for synchronization.

## Output contract

```markdown
## Test plan
Acceptance mapped: <n>/<n>
New tests: <list>
Layer split: unit <n>, integration <n>, e2e <n>
Commands: <exact>
Flaky/quarantined: <list or none>
Coverage delta: <+/−>
Gaps: <known>
```

## References

- `docs/06-quality.md`
- `docs/05-development.md`
