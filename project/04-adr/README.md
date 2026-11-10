# Architecture decision records

One decision per file. Numbered, immutable, short.

## Naming

`NNNN-<kebab-title>.md` — e.g. `0001-use-postgres.md`.

## Lifecycle

`proposed → accepted → superseded`

Never edit an accepted ADR to change its decision. Write a new ADR that supersedes it.

## Create one

```bash
./scripts/new.sh adr "Use Postgres for primary storage"
```

Or copy `.agents/templates/adr.md`.

## Index

| ADR | Decision | Status | Date |
|---|---|---|---|
| 0001 | Promotion-track git | accepted | 2026-10-30 |
| 0002 | Django default; stack profiles | accepted | 2026-10-30 |
| 0003 | Context packs as the load allowlist | accepted | 2026-10-30 |
