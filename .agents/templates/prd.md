# Product requirements document (PRD)

> Phase 2 · Gate G2 · Decision document, not a novel. Target ≤5 pages.

## Summary

`<one paragraph a busy stakeholder can read>`

## Problem and evidence

`<link to project/01-discovery.md; do not repeat it>`

## Users and jobs

| Segment | Job to be done | Today | Why switch |
|---|---|---|---|
| `<segment>` | `<job>` | `<workaround>` | `<value>` |

## Outcomes and metrics

- **Primary:** `<metric>` — baseline `<value>` → target `<value>`
- **Guardrails:** `<metric>` must not regress
- **Measurement:** `<how and where>`

## Scope

**In scope**
- `<capability>`

**Out of scope**
- `<exclusion>` — `<reason>`

**Deferred**
- `<item>` — revisit when `<condition>`

## User journeys

### J1 — `<name>`

1. `<step>`
2. `<step>`
3. `<success state>`

Failure: `<what happens and what the user sees>`

## Functional requirements

| ID | Requirement | Priority | Acceptance |
|---|---|---|---|
| FR-01 | `<testable behavior>` | Must | `<observable check>` |
| FR-02 | | Should | |

## Non-functional requirements

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-01 | Latency | p95 < `<value>` | benchmark |
| NFR-02 | Availability | `<value>` | monitoring |
| NFR-03 | Accessibility | WCAG `<level>` | audit |
| NFR-04 | Security | `<control>` | test |

## Dependencies and risks

| ID | Item | Impact | Mitigation |
|---|---|---|---|
| RISK-01 | `<risk>` | `<impact>` | `<plan>` |

## Release criteria

- [ ] All Must requirements met.
- [ ] No open P0/P1.
- [ ] `<metric>` verified.
- [ ] Rollback plan exists.

## Open questions

| # | Question | Owner | Default |
|---|---|---|---|
| Q1 | `<question>` | `<name>` | `<default>` |

**Approved by:** `<human>` on `<date>`
