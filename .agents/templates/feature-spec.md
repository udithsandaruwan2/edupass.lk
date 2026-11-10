# FEAT-<###> — <feature name>

> Phase 4+ · Spec is the contract. Target ≤300 lines.

## Summary

`<who, what, why in one paragraph>`

## Status

- **Catalog:** `FEAT-###`
- **Priority:** Must | Should | Could
- **Status:** draft | specified | planned | in-progress | shipped
- **Owner:** `<name>`

## Non-goals

- `<exclusion>` — `<reason>`

## User story

As a `<role>`, I want `<capability>`, so that `<outcome>`.

## Acceptance criteria

- [ ] Given `<context>`, when `<action>`, then `<observable result>`.
- [ ] Given `<failure context>`, when `<action>`, then `<error + recovery>`.
- [ ] `<NFR: p95 < value>`.

## Behavior

### Happy path

1. `<step>`
2. `<step>`
3. `<result>`

### Edge cases

| Case | Expected |
|---|---|
| empty / first use | `<behavior>` |
| invalid input | `<error>` |
| permission denied | `<403 + message>` |
| timeout | `<retry/restore>` |
| repeated submit | `<idempotency>` |
| limit exceeded | `<behavior>` |

## Data and state

- Entities: `<entity>`
- Fields: `<field: type, constraints>`
- State machine: `<state> → <state>`
- Idempotency: `<key + behavior>`
- Deletion: `<policy>`

## Interfaces

### `POST /<resource>`

Request:

```json
{ "<field>": "<value>" }
```

Response `201`:

```json
{ "id": "<id>", "<field>": "<value>" }
```

Errors:

| Code | Status | Message |
|---|---|---|
| `<CODE>` | 400 | `<user message>` |
| `<CODE>` | 403 | `<user message>` |

Auth: `<role/permission>`

## Test mapping

| Acceptance | Test | Layer |
|---|---|---|
| `<criterion>` | `<test name>` | unit/integration/e2e |

## Rollout

- Feature flag: `<name or none>`
- Migration: `<none or plan>`
- Rollback: `<plan>`

## Open questions

| # | Question | Default |
|---|---|---|
| Q1 | `<question>` | `<default>` |
