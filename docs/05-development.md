# 05 — Development

**Question this phase answers:** how do we make changes that are correct, small, and easy to reverse?

This is the default behavior when the agent writes code. Project-specific rules override it; `AGENTS.md` §11 holds the invariants. Load **one** stack profile via `./scripts/context-pack.sh implement-web` or `implement-api`.

Stay on one **track** per task. Frontend files (`apps/web`) never land on a backend branch, and the reverse.

---

## The change loop

```
1. Read the pack + task + spec + the files you will touch.
2. Write or identify the check that proves success.
3. Make the smallest change that passes.
4. Run targeted checks.
5. Run the full check suite.
6. Review your own diff.
7. Commit one logical change.
```

Do not reverse steps. Do not start with a rewrite.

---

## Change strategy

| Situation | Approach |
|---|---|
| Add a feature | new code behind a clear interface; avoid editing unrelated paths |
| Fix a bug | reproduce first, then the smallest fix |
| Refactor | behavior-preserving, separate commit, tests unchanged |
| Rename | mechanical, isolated commit |
| Dependency upgrade | one dependency, read the changelog, run tests |
| Migration | expand → migrate → contract, never destructive in one step |
| Delete code | search for references, remove tests and docs together |

**Rule of three:** the first time, write it simply. The second time, copy. The third time, extract an abstraction. Do not abstract on speculation.

---

## Code standards

### Naming

- Names describe intent, not implementation: `calculateTax`, not `doStuff`.
- Booleans read as assertions: `isExpired`, `canRetry`.
- Avoid abbreviations except domain-standard ones (`SLA`, `SKU`).
- Keep one term per concept across the codebase.

### Functions and modules

- One reason to change per module.
- Prefer pure functions for logic; isolate I/O at the edges.
- Keep functions short enough to read without scrolling; split by responsibility, not line count.
- Explicit inputs and outputs. Avoid hidden globals and mutable singletons.
- Depend on interfaces you own, not vendor SDKs, at the boundary.

### Errors

- Fail fast at boundaries; recover only where you can act.
- Use typed/structured errors with a code, message, and context.
- Never swallow errors. If you log and continue, say why.
- Do not expose stack traces or internal IDs to users.
- Distinguish **expected** (validation, not found) from **unexpected** (bug, outage).

```ts
// Good: typed, actionable, no secret leakage
class ValidationError extends Error {
  constructor(public field: string, public code: string) {
    super(`Invalid ${field}: ${code}`);
  }
}
```

### Validation

Validate at every trust boundary:

- HTTP input → schema validation.
- Database reads → assume shape, but check invariants.
- Third-party responses → validate before use.
- User-generated content → sanitize for the output context (HTML, SQL, shell, logs).

### Configuration

- Config comes from the environment, never from committed secrets.
- Fail at startup on missing required config; do not default silently.
- Separate config from code; document every variable in `.env.example`.
- Use feature flags for risky rollouts; remove them after the rollout.

### Logging and observability

- Structured logs, one event per line.
- Include request ID, user/tenant ID (hashed if sensitive), and latency.
- Never log secrets, tokens, passwords, full PII, or raw request bodies.
- Log at boundaries and state transitions, not every function.
- Metrics for latency, errors, saturation, and the core business action.

### Dependencies

Before adding a package:

1. Can the standard library or an existing dependency do it?
2. Is it maintained (recent release, responsive issues)?
3. What is the install size and transitive risk?
4. Is the license compatible?
5. Can we remove it later?

Pin versions in a lockfile. Review diffs in lockfiles. Do not add a dependency for a one-line utility.

### Performance

- Set a budget (e.g., p95 < 300 ms, bundle < 200 KB) and measure it.
- Optimize only after measuring; keep the benchmark.
- Avoid N+1 queries; batch or join.
- Stream or paginate large data; never load unbounded lists.
- Cache with an explicit invalidation strategy, not hope.

### Accessibility and UI

- Semantic HTML before ARIA.
- Every interactive element is keyboard reachable and has a visible focus state.
- Labels are associated with inputs; errors are announced.
- Color is never the only signal.
- Respect `prefers-reduced-motion`.
- Test at 200% zoom and on a small viewport.

---

## Working with existing code

1. **Find the pattern.** Search for a sibling feature and follow it.
2. **Read the tests.** They document behavior and constraints.
3. **Check the ADRs.** A "weird" choice may be deliberate.
4. **Keep the diff local.** Do not reformat files you did not need to touch.
5. **Leave it better, not different.** Improve only what the task requires.

If the existing pattern is wrong, propose a separate refactor task. Do not smuggle a rewrite into a feature PR.

---

## Documentation in code

- Explain **why**, not what. The code says what.
- Document non-obvious invariants, trade-offs, and failure modes.
- Keep comments next to the code they describe; stale comments are worse than none.
- Public interfaces get a short contract: inputs, outputs, errors, side effects.
- Do not add a README for every folder. One good README at the boundary is enough.

---

## Agent-specific rules

- **Never** rewrite a whole file when a targeted edit works.
- **Never** change formatting, imports, or unrelated code to "clean up".
- **Never** add speculative abstractions, config, or feature flags.
- **Never** claim a check passed without running it.
- **Never** hide a failure by weakening a test.
- If a test is wrong, fix the test in a separate commit with an explanation.
- If you cannot reproduce a bug, say so and list what you tried.
- Keep the working tree clean before switching tasks.

---

## Definition of done

- [ ] Acceptance criteria are met, one by one.
- [ ] New behavior has a test; fixed bug has a regression test.
- [ ] Targeted checks pass; full suite passes.
- [ ] Lint, typecheck, and build pass.
- [ ] No secrets, debug logs, or dead code.
- [ ] Docs and `project/STATE.md` updated if behavior or status changed.
- [ ] Diff is reviewable in one sitting.
- [ ] Commit message explains why.

---

## Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Drive-by refactor | huge diff, unrelated changes | separate task/commit |
| Premature abstraction | interfaces with one implementation | wait for the third use |
| Silent fallback | bug hidden by `catch {}` | typed error + log + test |
| Magic config | defaults that hide misconfiguration | fail fast at startup |
| Test theater | asserting mocks, not behavior | test the contract |
| Copy-paste drift | two versions of the same logic | extract after the third copy |
| Optimizing blindly | complexity without a benchmark | measure first |
| "It works on my machine" | no reproducible setup | document commands, use CI |

Next: [06-quality.md](06-quality.md).
