---
name: skill-forge
description: Use when adding a project-specific skill or rule, capturing a repeated workflow, adapting this framework to a team convention, or deciding whether something belongs in AGENTS.md, a skill, a doc, or a template.
---

# Skill Forge

Capture repeated procedural knowledge once, in the right place, at the right size.

## Decide the home

| Knowledge | Home | Loaded |
|---|---|---|
| A rule that changes behavior every session | `AGENTS.md` §11 or a short invariant | always |
| A project fact that matters only in some tasks | `project/rules/<topic>.md` | on demand |
| A repeatable procedure with steps | `.agents/skills/<name>/SKILL.md` | on trigger |
| Depth, rationale, examples | `docs/` | on demand |
| A document or plan shape | `.agents/templates/` | on creation |
| Stack conventions (React, Django, FastAPI, Nest, layout) | `.agents/profiles/` | one profile per task |
| Ordered files to open | `.agents/packs/` | `context-pack.sh` |
| State, decisions, specs | `project/` | on demand |

Do not create a skill for a one-time task. Do not put a procedure in `AGENTS.md`; it will be paid for every session.

## Procedure

### 1. Name it

- Lowercase, hyphens, verb-noun: `invoice-import`, `deploy-preview`.
- Unique and specific; avoid `helpers`, `utils`, `misc`.
- The folder name must match the frontmatter `name`.

### 2. Write the description as a trigger

Formula:

> Use when `<concrete situation>`, `<second situation>`, or `<third situation>`.

Bad: "Helps with invoices."
Good: "Use when importing invoices from CSV or OFX, reconciling line items, or debugging duplicate imports."

The description is the only text always visible. Make it earn its tokens.

### 3. Write the body

Recommended structure:

```markdown
# <Title>

<One sentence: what this procedure produces.>

## Inputs
- ...

## Procedure
### 1. ...
### 2. ...

## Guardrails
- ...

## Output contract
<exact shape>

## References
- <one-level-deep links>
```

Rules:

- ≤200 lines. Move depth to `docs/` or a `reference.md` next to `SKILL.md`.
- Imperative steps, not essays.
- One output contract, copy-pasteable.
- Concrete commands and paths.
- No duplicated global rules; link to `AGENTS.md`.

### 4. Add references (optional)

```
.agents/skills/<name>/
  SKILL.md
  reference.md      # long detail, loaded only if needed
  scripts/          # deterministic helpers
  assets/           # templates
```

Keep references one level deep. Do not build a nested tree.

### 5. Test the trigger

Ask an agent, without naming the skill:

> I need to reconcile a CSV of invoices against the ledger. What would you do?

It should load `invoice-import`. If it does not, the description is too weak.

### 6. Register

- Add the folder under `.agents/skills/`.
- Add a row to `AGENTS.md` §10 if it is broadly useful.
- Run `./scripts/sync-adapters.sh`.
- Run `./scripts/doctor.sh`.

No other registration is needed; adapters discover the folder.

### 7. Version it

- Skills are code: review changes like code.
- Note breaking changes in the PR/commit.
- Keep the description stable; changing it changes when the skill loads.

## Project rules

For a rule that applies only to this project:

```markdown
# project/rules/billing.md
- Money is integer cents; never floats.
- Every mutation writes an audit event.
- Prices are server-side; the client never sends a price.
- Refunds require an idempotency key.
```

Rules should be:

- Short (≤20 bullets).
- Testable or enforceable.
- Linked from the relevant task/spec.
- Added to `AGENTS.md` §11 only if breaking them is catastrophic.

## Example: a good skill description

```yaml
name: invoice-import
description: Use when importing invoices from CSV or OFX, mapping columns to the ledger schema, reconciling duplicates, or debugging import failures.
```

Why it works: three concrete triggers, domain nouns, no vague verbs.

## Guardrails

- No skill without a real repeated workflow.
- No skill over 200 lines.
- No duplicated rules.
- No secrets, customer data, or internal URLs in a skill.
- No auto-generated descriptions; they are the trigger.
- Do not edit generated adapter files.

## Output contract

```markdown
## Skill added
Name: <name>
Path: .agents/skills/<name>/SKILL.md
Trigger tested: yes/no
Lines: <n>
Registered in AGENTS.md: yes/no
Adapters synced: yes/no
Doctor: pass/fail
```

## References

- `docs/11-agent-adapters.md`
- `docs/10-token-economy.md`
- `.agents/templates/skill.md`
- <https://agentskills.io/specification>
