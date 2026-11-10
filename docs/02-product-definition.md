# 02 — Product definition

**Question this phase answers:** what exactly are we building, for whom, and what is explicitly out of scope?

Two artifacts come out of this phase:

- **PRD** — the behavior, users, outcomes, and constraints.
- **Product catalog** — the inventory of capabilities and features with stable IDs, status, and links.

The catalog is the antidote to scope creep. If it is not in the catalog, it is not in scope.

**Gate G2:** PRD and catalog are baselined; every in-scope feature has an ID and acceptance criteria.

---

## The PRD

Use `.agents/templates/prd.md`. Keep it under 5 pages. A PRD is a decision document, not a novel.

### Required sections

1. **Summary** — one paragraph a busy stakeholder can read.
2. **Problem and evidence** — link to discovery; do not repeat it.
3. **Users and jobs** — 1–3 segments, each with a job-to-be-done.
4. **Outcomes and metrics** — primary metric, guardrails, baseline.
5. **Scope** — in scope, out of scope, deferred.
6. **User journeys** — 3–7 numbered flows, happy path + key failure.
7. **Functional requirements** — numbered, testable (`FR-01`, `FR-02`).
8. **Non-functional requirements** — performance, security, accessibility, reliability, compliance.
9. **Dependencies and risks** — external systems, assumptions, open questions.
10. **Release criteria** — what must be true to ship v1.

### Requirement quality

A requirement is testable when someone can write a pass/fail check without asking you.

| Bad | Good |
|---|---|
| "Fast search" | `p95 search latency < 300 ms for 10k records` |
| "Secure login" | `sessions expire after 30 min idle; MFA available for admins` |
| "Easy to use" | `a new user completes capture in ≤3 actions without docs` |
| "Handle errors" | `network failure shows retry + preserves draft locally` |

Use **Given / When / Then** for behavior:

> Given a signed-in user with 0 notes, when they submit an empty note, then the app shows "Write something first" and does not create a record.

---

## The product catalog

Use `.agents/templates/product-catalog.md`. This is a living index, not a backlog dump.

### ID scheme

| Prefix | Meaning | Example |
|---|---|---|
| `CAP-###` | Capability (a durable area of the product) | `CAP-001 Capture` |
| `FEAT-###` | Feature (user-visible behavior) | `FEAT-001 Quick capture` |
| `NFR-###` | Non-functional requirement | `NFR-001 p95 < 300ms` |
| `RISK-###` | Product or delivery risk | `RISK-001 Vendor rate limit` |

IDs never change. If a feature is cut, mark it `dropped`; do not reuse the ID.

### Status lifecycle

`idea → specified → planned → in-progress → shipped → deprecated` (or `dropped`)

### Catalog columns

| ID | Capability | Feature | Priority | Status | Spec | Release | Owner |
|---|---|---|---|---|---|---|---|
| FEAT-001 | Capture | Quick capture from anywhere | P0 | specified | `06-specs/FEAT-001.md` | v0.1 | human |

### Prioritization

Pick one method and stay consistent. For small teams, **MoSCoW** is enough:

- **Must** — v1 cannot ship without it.
- **Should** — important, but a workaround exists.
- **Could** — nice to have.
- **Won't** — explicitly out of scope this cycle.

For larger bets, use **RICE**:

`score = (reach × impact × confidence) / effort`

Do not average two methods. Do not let a scoring model override a strategic decision; it is an input, not an oracle.

### Scope discipline

Write the **out of scope** list with the same care as the in-scope list. For each exclusion, add one line: why now is not the time. This prevents the agent from "helpfully" adding it later.

---

## Splitting features

A feature is too big if any of these are true:

- More than one user journey.
- More than one data model change.
- Cannot be demoed in one sitting.
- Acceptance criteria exceed 10 bullets.
- Estimated at more than 3 agent tasks.

Split by **user outcome**, not by technical layer. "Create note" and "list notes" are better slices than "database layer" and "UI layer", because each slice is demonstrable.

---

## Product catalog vs. backlog vs. roadmap

| Artifact | Answers | Owner |
|---|---|---|
| PRD | Why and what | product |
| Catalog | What exists / is planned, with IDs | product |
| Plan (`05-plan.md`) | In what order, by when | engineering |
| Backlog (issues) | What to pick up next | engineering |
| Roadmap | Themes over time | product/leadership |

Do not duplicate the catalog into the backlog. The catalog holds identity and status; the tracker holds execution detail.

---

## Exit checklist

- [ ] PRD has a one-paragraph summary and linked evidence.
- [ ] Every requirement is numbered and testable.
- [ ] Out-of-scope list is explicit.
- [ ] Primary metric, baseline, and guardrails are defined.
- [ ] Every feature has a `FEAT-###`, priority, status, and spec path.
- [ ] No two features overlap without a stated relationship.
- [ ] Human approves G2 in `project/STATE.md`.

Next: [03-architecture.md](03-architecture.md).
