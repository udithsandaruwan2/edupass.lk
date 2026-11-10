# project/

The living truth of the project. Agents read this, not a parallel docs tree.

| Path | Answers | Gate |
|---|---|---|
| `STATE.md` | Where are we? What is next? | all |
| `00-brief.md` | Why this project? | G0 |
| `01-discovery.md` | Is the problem real? | G1 |
| `02-prd.md` | What are we building? | G2 |
| `02-product-catalog.md` | What is in scope? | G2 |
| `03-architecture.md` | How is it structured? | G3 |
| `04-adr/` | Why did we choose this? | G3 |
| `05-plan.md` | In what order? | G4 |
| `05-plan/tasks/` | What is the next unit of work? | G4 |
| `06-specs/` | Exact behavior | G4+ |
| `07-runbook.md` | How do we operate it? | G6 |
| `08-metrics.md` | Is it working? | G6+ |
| `rules/` | Project-only constraints | on demand |
| `handoffs/` | Previous session | on demand |

## Rules

- One source of truth. Do not duplicate these docs elsewhere.
- Update in the same commit as the change they describe.
- Keep `STATE.md` current; a stale state file is worse than none.
- Use stable IDs (`FEAT-###`, `T-###`, `ADR-####`).
- Prefer links over repetition.
