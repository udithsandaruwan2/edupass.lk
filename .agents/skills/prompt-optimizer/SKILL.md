---
name: prompt-optimizer
description: Use when a request is vague, large, multi-outcome, or likely to cause rework, and when the user asks to optimize a prompt, plan a task, reduce tokens, or turn an idea into an executable work order.
---

# Prompt Optimizer

Turn a raw request into the smallest **executable** work order: one goal, evidence-based context, observable acceptance, explicit scope, and a stop condition.

The goal is not a shorter prompt. It is **fewer turns and fewer wrong diffs**.

## Inputs

- The raw request (chat, issue, voice note, PR comment)
- `AGENTS.md` and `project/STATE.md`
- Access to the repo for evidence

## Procedure

### 1. Extract the real outcome

Answer in one sentence: *what observable state will be true when this is done?*

If you find more than one outcome, split them. Propose the split before writing the work order:

> This contains three outcomes: (a) offline drafts, (b) mobile layout, (c) console errors. I recommend doing (a) first because it blocks the others.

### 2. Classify

```yaml
type: question | feature | bug | refactor | docs | ops | research
size: S | M | L | XL
risk: low | medium | high
```

- **S**: 1–2 files, clear change, reversible. Skip the written plan.
- **M**: 3–8 files, one behavior. Short plan.
- **L**: 9–20 files or cross-module. Written plan + slices.
- **XL**: >20 files or unclear scope. **Do not start.** Split first.

If risk is high (data, money, auth, irreversible), treat it as L even if the diff is small.

### 3. Strip

Remove:

- Greetings, thanks, hedging, apologies.
- Context already in `AGENTS.md` or the spec.
- Vague intensifiers: "robust", "seamless", "production-ready", "best practices".
- Repeated requirements.
- Multiple goals.
- Implementation instructions the agent can derive.
- Speculative "while you're at it" items.

### 4. Structure

Fill the work order. Use `TBD` only with a default and a question.

```markdown
## Work Order
Goal: <one observable outcome>
Track: frontend | backend | framework

Type/Size/Risk: <type> / <size> / <risk>

Context:
- <path> — <why it matters>
- <path> — <existing pattern to follow>

Constraints:
- <technical / product / compliance>
- <what must not change>

Acceptance:
- [ ] <observable check 1>
- [ ] <observable check 2>
- [ ] <regression check>

Out of scope:
- <explicit non-goal>

Verification:
- <exact command 1>
- <exact command 2>
- <manual step>

Budget:
- max <n> files
- <n> tool loops before re-plan
- stop and ask if <condition>

Open questions:
- Q: <question>? Default: <choice> because <reason>.
```

### 5. Enrich from evidence only

| Field | Where to look |
|---|---|
| Relevant files | `rg "<symbol>"`, glob, imports |
| Existing pattern | a sibling feature or test |
| Commands | `package.json`, `Makefile`, CI config |
| Constraints | PRD, ADR, `AGENTS.md` §11 |
| Acceptance | spec/issue, or propose a test |
| Risk | architecture and security docs |

Do not add background the agent does not need. Do not summarize the whole architecture. Do not include persuasion.

**Never invent** a requirement, metric, file path, or API contract. If the evidence is missing, ask.

### 6. Compress language

- Imperative verbs: "add", "remove", "return", "reject".
- Concrete nouns and numbers: "p95 < 300 ms", not "fast".
- One idea per bullet.
- No adjectives that cannot be tested.
- Prefer a table for options; prefer a checklist for acceptance.

### 7. Add a stop condition

Every work order must say when to stop:

- "Stop when the three acceptance checks pass and the full suite is green."
- "Stop after 3 failed attempts and report the error."
- "Stop and ask if a schema change is required."

Without a stop condition, agents over-engineer.

### 8. Decide whether to show it

- **M/L/XL or high risk**: show the work order and get a go-ahead.
- **S and low risk**: use it internally, then execute; show only a one-line plan.
- If the user says "just do it", execute for S/M, but still write the acceptance internally.

## Examples

### Vague request

> Can you improve the dashboard? It feels slow and cluttered. Maybe add filters and make it look better.

**Extract:** one outcome is not present. There are three: performance, information architecture, visual design.

**Response:**

> This is three outcomes. I recommend (1) measure and fix the slow query, (2) remove or group the 6 least-used widgets, (3) visual polish. Here is the work order for (1). Should I proceed with (1) only?

### Compressed work order

```markdown
## Work Order
Goal: dashboard p95 load < 1s for 10k rows.
Type/Size/Risk: perf / M / medium

Context:
- src/dashboard/query.ts — current query
- src/dashboard/__tests__/perf.test.ts — benchmark harness
- project/04-adr/0003-read-model.md — denormalization allowed

Constraints:
- no schema change in this task
- keep the existing API shape
- cache allowed only with explicit invalidation

Acceptance:
- [ ] benchmark shows p95 < 1s on the 10k fixture
- [ ] result set identical to the current query
- [ ] no N+1 queries in the request path

Out of scope:
- visual redesign, new filters, pagination

Verification:
- pnpm test dashboard/perf
- pnpm test dashboard
- manual: load 10k fixture, check timing

Budget: ≤4 files; 3 loops; stop if an index migration is needed.
Open questions: none.
```

## Guardrails

- Do not turn a small, clear request into a planning ceremony.
- Do not add requirements the user did not ask for.
- Do not hide uncertainty; mark it and give a default.
- Do not use this skill to avoid reading the code; evidence still comes from the repo.
- Do not produce a work order longer than the change it describes.
- If the request is already precise, say "already executable" and proceed.

## Output contract

Either:

1. **Executable**: the work order + "Ready to execute." + the first action.
2. **Needs input**: the work order with `TBD` fields + max 3 questions, each with a default.
3. **Must split**: the proposed slices + a recommendation for the first.
## References

- `docs/10-token-economy.md`
- `.agents/templates/work-order.md`
