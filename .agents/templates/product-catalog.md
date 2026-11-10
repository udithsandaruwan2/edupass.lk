# Product catalog

> Phase 2+ · Living index. IDs never change. One row per capability/feature.
> Status: `idea → specified → planned → in-progress → shipped → deprecated` (or `dropped`).

## Capabilities

| ID | Capability | Outcome | Owner | Status |
|---|---|---|---|---|
| CAP-001 | `<area>` | `<user outcome>` | `<name>` | active |

## Features

| ID | Capability | Feature | Priority | Status | Spec | Release |
|---|---|---|---|---|---|---|
| FEAT-001 | CAP-001 | `<user-visible behavior>` | Must | idea | `06-specs/FEAT-001-*.md` | v0.1 |
| FEAT-002 | CAP-001 | | Should | idea | | |

## Non-functional requirements

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-001 | `<latency/security/a11y>` | `<value>` | active |

## Risks

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| RISK-001 | `<risk>` | `<impact>` | `<plan>` | open |

## Dropped / deferred

| ID | Item | Reason | Revisit when |
|---|---|---|---|
| FEAT-003 | `<item>` | `<reason>` | `<condition>` |

## Rules

- Every spec, task, commit, and changelog entry references a `FEAT-###`.
- Do not reuse IDs.
- Do not add a feature without a priority and a status.
- The catalog is scope; the plan is sequence; the tracker is execution.
