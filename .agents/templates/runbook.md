# Runbook

> Keep this usable under pressure. Test it quarterly.

## Service overview

- **What it does:** `<one line>`
- **Critical paths:** `<path 1>`, `<path 2>`
- **Dependencies:** `<db>`, `<queue>`, `<third-party>`
- **Owner:** `<team/person>`
- **On-call:** `<rotation/link>`

## Deploy

```bash
<deploy command>
```

Verify:

```bash
<health check>
<smoke test>
```

## Rollback

- **Trigger:** `<error rate / latency / business metric>`
- **Decision owner:** `<name>`
- **Command:**

```bash
<rollback command>
```

- **Expected duration:** `<minutes>`
- **Data impact:** `<none / migration note>`
- **Verify:** `<check>`

## Alerts

| Alert | Meaning | First checks | Action |
|---|---|---|---|
| `<name>` | `<symptom>` | `<logs/metric>` | `<fix/rollback>` |

## Common failures

### `<failure>`

- **Symptom:** `<...>`
- **Cause:** `<...>`
- **Fix:** `<...>`
- **Prevent:** `<...>`

## Backup and restore

```bash
<backup command>
<restore command>
```

Last restore test: `<date>`

## Incident communication

```text
We are investigating <symptom> affecting <scope>. Started <time>.
Next update by <time>. Workaround: <if any>.
```

## Contacts

| Role | Name | Contact |
|---|---|---|
| Owner | `<name>` | `<...>` |
| Escalation | `<name>` | `<...>` |
