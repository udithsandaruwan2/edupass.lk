# 04 — Planning

**Question this phase answers:** what is the smallest sequence of shippable slices that proves the product?

Planning is not a Gantt chart. It is the order in which you buy information. Ship the riskiest, thinnest slice first.

**Gate G4:** the plan and the first task are approved; the build loop can start.

---

## Inputs

- PRD and catalog (G2)
- Architecture and ADRs (G3)
- Team capacity and deadline
- Known risks and dependencies

## Output

- `project/05-plan.md` — milestones, slices, sequence, risks
- `project/05-plan/tasks/T-###-*.md` — one file per task
- `project/STATE.md` updated with phase 4 and the next action

---

## Procedure

### 1. Define milestones as outcomes

A milestone is a demonstrable state, not a date.

| Bad | Good |
|---|---|
| "Backend 50% done" | "A user can capture and retrieve a note end-to-end" |
| "Sprint 3" | "Billing works in sandbox with one plan" |

Aim for 3–5 milestones for a v1. Each should be demoable to a human.

Tag every task with a **track**: `frontend`, `backend`, or `framework`. A slice that needs both is two tasks (API contract first, then UI). Parallel agents only when tracks (and files) are disjoint.

### 2. Slice vertically

A vertical slice crosses UI, logic, and data for one user outcome. It is deployable and testable on its own.

```
Milestone M1: capture works
  T-001 Add notes table + migration
  T-002 POST /notes with validation
  T-003 Capture form + optimistic save
  T-004 End-to-end test: empty, valid, offline
```

Avoid horizontal slices ("all models", "all endpoints", "all screens"). They cannot be demoed and they hide integration risk until the end.

### 3. Size tasks

| Size | Files | Time | Planning | Review |
|---|---|---|---|---|
| S | 1–2 | < 30 min | none | diff + targeted check |
| M | 3–8 | 0.5–2 h | 3–8 line plan | diff + tests |
| L | 9–20 | 2–6 h | written plan + slices | full review |
| XL | > 20 | > 1 day | **split first** | not allowed as one task |

An XL task is a planning failure. Split by user outcome or by risk.

### 4. Write task files

Each task uses `.agents/templates/task.md` and contains:

- **Goal** — one sentence.
- **Context** — links to spec, ADR, relevant files.
- **Acceptance** — observable, testable checklist.
- **Out of scope** — what not to touch.
- **Verification** — exact commands.
- **Dependencies** — task IDs.
- **Size / risk** — S/M/L, low/med/high.

Keep task files under one page. If it needs more, split it.

### 5. Sequence by risk, then dependency

Order:

1. **Fatal unknowns** — spikes or proofs first.
2. **Critical path** — what blocks the most work.
3. **Fast feedback** — what lets you test the product soonest.
4. **Polish** — last, never first.

Parallelize only tasks that touch disjoint files. Use one `git worktree` per parallel task.

### 6. Estimate with ranges

Use **T-shirt + confidence**, not false precision:

| Task | Size | Confidence | Notes |
|---|---|---|---|
| T-001 schema | S | high | pattern exists |
| T-003 capture form | M | medium | offline behavior unclear |

If confidence is low, add a spike task before the implementation task.

### 7. Add buffers honestly

- **Known work:** sum of task ranges.
- **Unknown work:** 20–30% for integration and review.
- **Interruptions:** 10–20% for support and bugs.
- **Release:** 1–2 days for docs, changelog, deploy, verification.

Do not hide the buffer in inflated estimates. Show it.

### 8. Define the first slice

The first slice must be:

- End-to-end (even if ugly).
- Deployable to a staging environment.
- Covered by at least one automated test.
- Demoable in under 5 minutes.

If the first slice takes more than 3 tasks, it is not thin enough.

### 9. Plan the review and release

For each milestone, decide:

- Who reviews?
- What checks must be green?
- What is the rollback plan?
- What docs change?

A plan without a release path is only half a plan.

---

## Plan template (compact)

```markdown
## Milestone M1 — Capture works
Outcome: a signed-in user can create and retrieve a note.
Demo: create a note, refresh, see it.
Exit: E2E test green, staging deploy, no P0 bugs.

| ID | Task | Size | Depends | Status |
|---|---|---|---|---|
| T-001 | Notes table + migration | S | — | todo |
| T-002 | POST /notes | S | T-001 | todo |
| T-003 | Capture form | M | T-002 | todo |
| T-004 | E2E + offline test | M | T-003 | todo |

Risks:
- R1 offline conflict handling unclear → spike T-000 first.
```

---

## Planning anti-patterns

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| Horizontal slices | integration risk at the end | vertical slices |
| XL tasks | unreviewable, unbounded | split before starting |
| Estimates as commitments | false precision | ranges + confidence |
| No spike for unknowns | guess becomes architecture | time-boxed spike |
| Parallel agents on shared files | conflicts and rework | worktrees + disjoint scopes |
| Plan without demo | cannot verify value | each milestone is demoable |
| Everything is P0 | no prioritization | MoSCoW or RICE at G2 |

---

## Exit checklist

- [ ] 3–5 outcome-based milestones.
- [ ] Every milestone has a demo and exit criteria.
- [ ] Tasks are S/M/L; no XL.
- [ ] Each task has acceptance, verification, and dependencies.
- [ ] Riskiest unknown has a spike or proof.
- [ ] Critical path is visible.
- [ ] First slice is end-to-end and deployable.
- [ ] Review and release path defined.
- [ ] Human approves G4 in `project/STATE.md`.

Next: [05-development.md](05-development.md).
