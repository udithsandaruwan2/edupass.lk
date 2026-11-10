# 10 — Token economy

**Question this phase answers:** how do we get the best result per token, without making the agent dumber?

Tokens are not just cost. Context is a finite attention budget. A bloated context causes:
- **lost-in-the-middle** — important instructions get ignored;
- **over-thinking** — the model reasons in circles about irrelevant detail;
- **rework** — ambiguous prompts produce the wrong change, then a second pass;
- **latency** — every token is processed on every turn.

The goal is not "use fewer tokens". It is **load the smallest context that can produce a correct change, then stop.**

---

## The four tiers

| Tier | Loaded | Target | Examples |
|---|---|---|---|
| 0 Always | every session | ≤ 2,000 tokens | `AGENTS.md`, skill descriptions |
| 1 Triggered | when a skill matches | ≤ 2,000 tokens | one `SKILL.md` |
| 2 On demand | when the task needs it | ≤ 5,000 tokens | one playbook, one spec, one ADR |
| 3 Rare | when creating something | any | templates, examples, research |

**Rule:** never load Tier 2 to answer a Tier 0 question. Never load Tier 3 to answer a Tier 1 question.

### Context packs

Do not guess which files to open. Print the list, then open only those:

```bash
./scripts/context-pack.sh --list
./scripts/context-pack.sh implement-web    # or implement-api, git, kickoff, release, architecture, session
```

Packs live in `.agents/packs/<name>.txt`. A pack is an ordered allowlist. Skip missing paths. **Never load both frontend and backend profiles in one session.** Stack conventions live in `.agents/profiles/` (Tier 2), not in `AGENTS.md`.

### Graphify (code map)

Graphify builds a local AST knowledge graph so agents navigate by dependency instead of dumping files. Official CLI: `uv tool install graphifyy`.

```bash
./scripts/graphify-setup.sh          # CLI + ignore + Cursor rule + .githooks wrappers
graphify query "how does promote work?"
graphify path "bootstrap.sh" "sync-adapters.sh"
graphify explain "context-pack"
graphify update .                    # after code edits (AST, free — no LLM)
```

Rules:

- Prefer `graphify query` **before** the first `rg`/Read when `graphify-out/` exists.
- After code edits, run `graphify update .` (git post-* hooks also rebuild in the background).
- Do not commit `graphify-out/`. Do not run `graphify claude install` if `CLAUDE.md` → `AGENTS.md`.
- ADR: `project/04-adr/0004-graphify-knowledge-graph.md`.

---

## Budgets

| Item | Budget | Enforced by |
|---|---|---|
| `AGENTS.md` | ≤ 140 lines (~1,800 tokens) | `doctor.sh` |
| All skill descriptions | ≤ 400 chars each, ~650 tokens for 12 | `token-audit.sh` |
| One `SKILL.md` body | ≤ 200 lines | `doctor.sh` |
| One playbook | ≤ 500 lines | `doctor.sh` |
| Task context | ≤ 20,000 tokens | human/agent judgment |
| Session before handoff | ~60% of window | agent judgment |

Run `./scripts/token-audit.sh` to see the real numbers. Run `--strict` in CI.

---

## The work order

For any M/L task, compress the request into this before coding:

```markdown
## Work Order
Goal: <one observable outcome>
Type/Size/Risk: feature / M / medium

Context:
- project/06-specs/FEAT-001.md (behavior)
- project/04-adr/0002-queue.md (constraint)
- src/notes/service.ts (existing pattern)

Constraints:
- no new dependencies
- preserve the public API
- p95 < 300 ms

Acceptance:
- [ ] empty note returns 400 with "write something"
- [ ] draft survives reload while offline
- [ ] existing note tests still pass

Out of scope:
- sharing, sync conflicts, rich text

Verification:
- pnpm test notes
- pnpm lint && pnpm typecheck
- manual: offline capture, reload

Budget:
- max 5 files
- 3 tool loops before re-plan
- stop and ask if the data model must change

Open questions:
- Q: queue in memory or IndexedDB? Default: IndexedDB (survives reload).
```

The work order is the **contract**. If the agent cannot fill a field from evidence, it asks — it does not invent.

Lint a draft before sending it:

```bash
./scripts/prompt-lint.sh work-order.md
```

It checks required fields, acceptance checkboxes, size, and vague language.

---

## The prompt optimizer

Two passes: **optimize** (remove) then **enrich** (add only what is missing).

### Pass 1 — Optimize

Remove:

- Greetings, thanks, hedging, and apologies.
- Repeated context already in `AGENTS.md` or the spec.
- Vague intensifiers ("really", "very", "robust", "seamless").
- Multiple goals in one request.
- Implementation instructions the agent can derive.
- Speculative "nice to haves".

Convert:

- Prose → imperative bullets.
- Adjectives → measurable criteria.
- "Make it better" → a named behavior and a check.
- A long narrative → Goal + Acceptance + Constraints.

### Pass 2 — Enrich

Add, **from evidence only**:

| Field | Source |
|---|---|
| Relevant files | `rg`, glob, imports |
| Existing pattern | a sibling feature/test |
| Commands | `package.json`, `Makefile`, CI config |
| Constraints | PRD, ADR, `AGENTS.md` §11 |
| Acceptance | spec, issue, or a proposed test |
| Risk | architecture, security notes |
| Unknowns | explicit question with a default |

Do **not** add: background the agent does not need, a full architecture summary, or "context" that is really persuasion.

### Pass 3 — Constrain

- One goal.
- A file/tool budget.
- A stop condition.
- A definition of done.
- A maximum of 3 questions.

### Pass 4 — Verify

Before sending, ask:

- Could two competent engineers interpret this differently?
- Is every acceptance item observable?
- Is anything here already in `AGENTS.md`?
- What is the smallest diff that could satisfy this?
- What would make me reject the result?

If the answer is unclear, fix the work order — not the model.

---

## Before / after

### Before (238 words, ambiguous)

> Hey, I want to improve the notes app. Right now it feels a bit clunky and I think users are getting confused. Can you make the capture flow better and maybe add offline support? It should be really fast and work well on mobile. Also I saw some errors in the console, maybe fix those. We want to ship this week so keep it simple but production-ready. Use best practices and make sure the tests pass. Thanks!

**Problems:** multiple goals, no acceptance, "clunky" is not observable, "production-ready" is undefined, no scope, no file budget.

### After (96 words, executable)

```markdown
## Work Order
Goal: capture a note in ≤3 actions, with drafts preserved offline.
Type/Size/Risk: feature / M / medium

Context: project/06-specs/FEAT-001.md; src/notes/*; tests/notes.*
Constraints: no new deps; keep current API; mobile viewport ≥360px.
Acceptance:
- [ ] capture form submits with Enter and button
- [ ] empty submit shows inline error, no request
- [ ] draft persists in IndexedDB and restores after reload
- [ ] console has no errors during the flow
Verification: pnpm test notes; pnpm lint; manual offline reload.
Out of scope: rich text, sharing, conflict resolution.
Budget: ≤5 files; 3 loops; ask before schema changes.
```

The second is not just shorter. It is **checkable**. That is what reduces tokens: fewer clarification turns, fewer wrong diffs, fewer reviews.

---

## Task sizing and thinking budget

| Size | Signals | Planning | Reasoning | Tool loops |
|---|---|---|---|---|
| S | 1–2 files, clear change | none | minimal | ≤3 |
| M | 3–8 files, one behavior | 3–8 lines | normal | ≤6 |
| L | 9–20 files, cross-module | written plan + slices | deep on design, shallow on edits | checkpoint each slice |
| XL | >20 files or unclear scope | **split** | do not start | — |

**Over-thinking is a symptom of missing constraints.** If the model loops, the work order is underspecified. Add acceptance and a stop condition; do not add more prose.

---

## Session hygiene

- **One task per session.** A session that drifts across tasks accumulates stale context.
- **Start clean** for unrelated work. A new session is free; a bloated one is not.
- **Handoff at ~60%.** Write `project/handoffs/YYYY-MM-DD-<task>.md` with state, decisions, next step, and open questions. Start a new session from it.
- **Do not compact** a session with unresolved exploration; summarize deliberately instead.
- **Close the loop.** Update `STATE.md` and the task file so the next session does not rediscover.

### Handoff template

```markdown
# Handoff — <task>
State: <branch, commit, what works>
Decisions: <what we chose and why>
Next: <the single next action>
Open: <questions/blockers>
Files: <only the ones that matter>
```

---

## Output discipline

| Do | Don't |
|---|---|
| Show the diff or the changed lines | Paste the whole file |
| Cite `path:line` | Describe the file from memory |
| State what you verified and how | Claim "tests pass" without running |
| Ask one precise question | Ask five open-ended ones |
| Stop when acceptance is met | Add unrequested polish |
| Use tables for options | Write a 10-paragraph essay |

A good final message is 5–15 lines: what changed, why, verification, risk, next step.

---

## Model routing

Use the cheapest model that can do the job:

| Work | Model class |
|---|---|
| Search, summarize, format, rename | fast/cheap |
| Routine feature within a clear spec | mid |
| Architecture, hard debugging, security review | strong |
| High-volume classification | cheap, batched |

Rules:

- Do not use a strong model to run `rg`.
- Do not use a cheap model for an irreversible decision.
- Route by **task risk**, not by habit.
- Measure: tokens per merged task, not tokens per request.

---

## Measuring

Track a small set:

| Metric | Target signal |
|---|---|
| Tokens per merged task | decreasing |
| Clarification turns per task | ≤1 |
| Rework rate (PRs changed after review) | decreasing |
| Time to first correct diff | decreasing |
| Context baseline (`token-audit.sh`) | under budget |
| Handoffs per completed task | 1 for L, 0–1 for S/M |

Do not optimize token count alone. A 30% token reduction with 2× rework is a loss.

---

## Anti-patterns

| Anti-pattern | Cost | Fix |
|---|---|---|
| Loading the whole repo "for context" | huge, mostly irrelevant | search + read ranges |
| Re-reading the same file every turn | linear waste | remember or summarize |
| A 2,000-line `AGENTS.md` | every session pays | move to skills/docs |
| Duplicating rules in 5 files | drift + tokens | one source, generated adapters |
| Vague prompts | rework, clarification loops | work order |
| "Let me think step by step" on S tasks | latency, no quality gain | task sizing |
| Full-file rewrites | review burden, merge conflicts | targeted edits |
| Keeping a session alive across tasks | stale context | handoff + new session |
| Compaction as a substitute for scope | information loss | smaller tasks |
| Measuring tokens per request | rewards cheap wrong answers | tokens per merged task |

---

## The one-screen summary

1. Read `AGENTS.md` and `STATE.md`. Nothing else by default.
2. Turn the request into a work order.
3. Size it. S → act; M → plan; L → slice; XL → split.
4. `graphify query` (if graph exists), then one doc / skill / spec.
5. Verify against acceptance, not against effort.
6. `graphify update .` after code edits; handoff at 60%.
7. Measure tokens per merged task.

Next: [11-agent-adapters.md](11-agent-adapters.md).
