---
name: project-kickoff
description: Use when starting a new project, initializing this framework, or moving a project to its next phase or gate. Guides intake, discovery, product definition, architecture, and planning without writing product code.
---

# Project Kickoff

Run the project from idea to build authorization, one phase per session. You are a facilitator, not an autopilot: ask, draft, propose, and stop at every gate.

## Inputs

- `project/STATE.md` (always)
- The human's idea, constraints, and any existing notes
- `.agents/templates/` for the artifact being created
- Pack: `./scripts/context-pack.sh kickoff`

## Procedure

### 1. Orient

Read `project/STATE.md`. Report in one line:

> Phase `<n>` (`<name>`), gate `<G>`, next action: `<next_action>`.

If the state file is missing, create it from `project/STATE.md` before anything else.

### 2. Select the phase

| Current phase | Create | Gate to propose |
|---|---|---|
| 0 Intake | `project/00-brief.md` | G0 |
| 1 Discovery | `project/01-discovery.md` | G1 |
| 2 Product | `project/02-prd.md`, `project/02-product-catalog.md` | G2 |
| 3 Architecture | `project/03-architecture.md`, ADRs | G3 |
| 4 Plan | `project/05-plan.md`, task files | G4 |
| 5 Build | hand off to `implementation-loop` | G5 per task |
| 6 Release | hand off to `release-manager` | G6 |
| 7 Operate | retro + next bet | back to 2 or 4 |

Do not skip ahead. If the human asks to code before G4, explain the missing artifact and offer to draft it in this session.

### 3. Ask the minimum questions

Ask at most **3 at a time**. Each question comes with a recommended default.

**Phase 0 — Intake**

1. What problem, for whom, and what happens if it is not solved?
2. What is the smallest observable outcome that would count as success?
3. Constraints: deadline, budget, stack, compliance, team size?
4. What is explicitly out of scope?
5. What would make you stop this project?

**Phase 1 — Discovery**

1. What evidence do we already have (tickets, interviews, analytics)?
2. Who are the 3–5 people we can talk to this week?
3. What is the riskiest assumption, and what cheap test could falsify it?

**Phase 2 — Product**

1. Which capabilities are must-have for v1?
2. What is the primary metric and its current baseline?
3. What are we deliberately not building this cycle?

**Phase 3 — Architecture**

1. What NFRs are non-negotiable (latency, scale, compliance, cost)?
2. Frontend React+Vite+Netlify, backend Django? Default: Django. Nest or FastAPI only if the human asks.
3. What is the riskiest technical unknown?

**Phase 4 — Plan**

1. What is the first demoable outcome?
2. Who reviews, and what checks must be green?
3. What is the target release window?

### 4. Draft the artifact

- Use the matching template from `.agents/templates/`.
- Fill only what the human confirmed or what evidence supports.
- Mark unknowns as `TBD` with the decision they block.
- Keep it under 5 pages. Link to existing docs instead of repeating.
- For products, assign stable IDs (`FEAT-###`, `NFR-###`, `RISK-###`).

### 5. Run the gate check

Present a short gate checklist:

```markdown
## G2 check — Product baseline
- [x] PRD summary and evidence linked
- [x] Every requirement numbered and testable
- [x] Out-of-scope list explicit
- [x] Primary metric, baseline, guardrails
- [ ] Catalog: FEAT-003 missing acceptance
- [ ] Human approval

Proposed next action: resolve FEAT-003, then approve G2.
```

Ask: **"Approve G<n>, or change something first?"**

Only after explicit approval, update `project/STATE.md`:

```yaml
phase: 3-architecture
gates:
  G2: approved 2026-10-30 by human
next_action: "Run architecture-decisions for storage and sync"
```

### 6. Stop cleanly

End the session with:

- The artifact path.
- The gate status.
- The single next action.
- Any open questions.

Do not start the next phase in the same session unless the human asks. Context accumulates; a fresh session is cheaper and clearer.

## Guardrails

- Never write product code before G4.
- Never invent evidence, users, metrics, or constraints.
- Never approve a gate on the human's behalf.
- Never create a second source of truth; update `project/`.
- Never ask more than 3 questions at once.
- If the human is unsure, offer 2–3 concrete options with a recommendation.
- If the project is small, say so and compress the phases (see `docs/12-faq.md`).

## Output contract

```markdown
## Phase <n> — <name>
Artifact: <path>
Status: draft | ready for gate
Gate: <G> — pending | approved
Next: <one action>
Open questions: <max 3, with defaults>
```

## References

- `docs/00-start-here.md`
- `docs/01-discovery.md` … `docs/04-planning.md`
- `.agents/templates/`
- `project/STATE.md`
