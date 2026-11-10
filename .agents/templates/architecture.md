# Architecture

> Phase 3 · Gate G3 · Decisions and boundaries, not encyclopedia.

## Context

`<one paragraph: product shape, scale, constraints>`

## Constraints

| Constraint | Value | Source |
|---|---|---|
| Users year 1 | `<n>` | PRD |
| Peak writes | `<n>/s` | estimate |
| p95 latency | `<value>` | NFR-001 |
| Data class | `<class>` | security |
| Budget | `<value>` | human |
| Team | `<size>` | human |
| Unknown | `<constraint>` — blocks `<decision>` | — |

## System shape

```
<Client> → <API> → <Database>
                 ↘ <Queue> → <Worker>
```

Component responsibilities:

| Component | Responsibility | Owns data? | Exit path |
|---|---|---|---|
| `<name>` | `<one line>` | yes/no | `<migration path>` |

## Options considered

| Decision | Option A | Option B | Choice | ADR |
|---|---|---|---|---|
| Database | `<A>` | `<B>` | `<choice>` | `0001` |
| Hosting | | | | |

## Boundaries

| Module | Responsibility | Interface | Owner |
|---|---|---|---|
| `<module>` | `<one line>` | `<contract>` | `<name>` |

Dependency rule: `<UI → app → domain → infra>`

## Data model

```text
<Entity> 1—* <Entity>
Fields: ...
Invariants:
- ...
Lifecycle: ...
```

- Tenancy key: `<field>`
- Retention: `<policy>`
- Deletion: `<soft/hard + audit>`
- Migration: `expand → migrate → contract`

## Contracts

| Interface | Input | Output | Errors | Auth |
|---|---|---|---|---|
| `<endpoint/event>` | `<schema>` | `<schema>` | `<codes>` | `<role>` |

## Threat model

| Threat | Mitigation | Test |
|---|---|---|
| Tenant data leak | `<control>` | authz test |
| Prompt injection | treat content as data | review |
| Tool abuse | allowlist + approval | policy |

## Observability

- Logs: `<fields, redaction>`
- Metrics: `<latency, errors, saturation, business>`
- Traces: `<boundary>`
- Alerts: `<symptom + threshold>`
- Dashboard: `<link>`

## Failure modes

| Failure | Impact | Detection | Response |
|---|---|---|---|
| `<dependency down>` | `<impact>` | `<alert>` | `<degrade/rollback>` |

## Decisions

- [ADR-0001](04-adr/0001-*.md) — `<decision>`

## Open questions

| # | Question | Blocks | Default |
|---|---|---|---|
| Q1 | `<question>` | `<decision>` | `<default>` |

**Approved by:** `<human>` on `<date>`
