---
name: context-auditor
description: Use when AGENTS.md, skills, or docs feel bloated, repetitive, stale, or contradictory; when token usage is rising; or when running a quarterly context and documentation audit.
---

# Context Auditor

Find and remove context that costs tokens without changing behavior. Keep the source of truth accurate.

## Inputs

- `AGENTS.md`
- `.agents/skills/*/SKILL.md`
- `docs/*.md`
- `project/` artifacts
- `./scripts/token-audit.sh` and `./scripts/doctor.sh` output

## Procedure

### 1. Measure first

```bash
./scripts/token-audit.sh
./scripts/doctor.sh
```

Record:

- Baseline tokens (Tier 0).
- Largest files.
- Skills over budget.
- Broken links or frontmatter.
- Adapters out of sync.

Do not edit before measuring; you will not know what improved.

### 2. Inventory

For each file, note:

| File | Tier | Tokens | Last updated | Owner |
|---|---|---|---|---|

Flag:

- Tier 0 files over budget.
- Tier 2 docs that are loaded every session.
- Files not updated in 6+ months.

### 3. Find duplication

Look for the same rule in multiple places:

- `AGENTS.md` vs a skill vs a doc.
- A template repeating its parent doc.
- An adapter hand-edited instead of generated.
- The same command in five files.

Keep the **most specific** location. Replace the others with a link.

### 4. Find contradictions

Common conflicts:

- "Always write tests" vs "skip tests for small changes".
- Two different branch naming schemes.
- Two different definitions of done.
- A doc that says phase 3 while `STATE.md` says phase 5.

Ask the human which version wins. Do not silently choose.

### 5. Find staleness

- Commands that no longer exist.
- Paths that moved.
- Versions and dates.
- References to decisions that were superseded.
- Skills whose trigger no longer matches the work.

Mark stale content as `SUPERSEDED by <link>` or delete it with approval.

### 6. Find bloat

Cut:

- Restated obvious engineering practice ("write clean code").
- Long introductions and motivation.
- Examples that repeat the same point.
- Checklists nobody uses.
- Rules that do not change agent behavior.
- Duplicated frontmatter.

Keep:

- Non-obvious project facts.
- Hard constraints.
- Exact commands.
- Acceptance criteria.
- Failure modes and rollback.

### 7. Check trigger quality

For each skill description:

- Does it start with "Use when..."?
- Does it name concrete situations?
- Is it distinct from the other skills?
- Would an agent match it to the right task?

Rewrite weak descriptions before changing bodies.

### 8. Propose a patch

Never mass-delete. Produce a table:

```markdown
| File | Action | Saved tokens | Risk |
|---|---|---|---|
| AGENTS.md §7 | move UI rules to docs/05 | 180 | low |
| skill X | merge into skill Y | 220 | medium |
| docs/03 | delete stale diagram | 90 | low |
```

Get approval for medium/high-risk changes.

### 9. Re-measure and sync

```bash
./scripts/token-audit.sh --strict
./scripts/doctor.sh
./scripts/sync-adapters.sh
```

Report the before/after baseline.

## Targets

| Metric | Target |
|---|---|
| Baseline (AGENTS.md + skill descriptions) | ≤ 3,500 tokens |
| AGENTS.md | ≤ 140 lines |
| One skill body | ≤ 200 lines |
| One playbook | ≤ 500 lines |
| Duplicate rules | 0 |
| Known contradictions | 0 |
| Broken links | 0 |

## Guardrails

- Do not delete project history or decisions.
- Do not remove a rule because it seems obvious to you; check whether it changed agent behavior.
- Do not edit generated adapters.
- Do not "optimize" by making instructions vague.
- Do not change a gate or phase without updating `STATE.md` and the docs together.
- Ask before removing anything medium/high risk.

## Output contract

```markdown
## Context audit — <date>
Baseline: <before> → <after> tokens
Largest files: <top 3>
Duplication: <n> found, <n> removed
Contradictions: <n> found, <n> resolved
Stale: <n> fixed
Skills over budget: <n>
Adapters synced: yes/no
Open decisions: <max 3>
```

## References

- `docs/10-token-economy.md`
- `scripts/token-audit.sh`
- `scripts/doctor.sh`
