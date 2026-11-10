# Start here

This is the human guide. Agents should read `AGENTS.md` instead.

## The problem this solves

An AI agent starts every session with no memory of your project. Without structure, it does the most expensive thing possible: explores the repo, guesses the requirements, writes a large diff, and discovers the mismatch in review. You pay for the exploration, the wrong code, and the rework.

APF replaces that with a repeatable path:

```
idea → brief → discovery → PRD + catalog → architecture → plan → build → release → operate
```

Each arrow is a gate with a small, named artifact. The agent always knows what to read next, and you always know what is missing.

## The 15-minute setup

1. **Bootstrap** into your project folder:

   ```bash
   ./scripts/bootstrap.sh ~/projects/my-app "My App"
   cd ~/projects/my-app
   git init && ./scripts/install-hooks.sh   # if it is a new repo
   # bootstrap also runs graphify-setup.sh (knowledge graph / token reducer)
   ```

2. **Apply stack + git profiles** (React/Vite/Netlify + Django, promotion-track git; Nest/FastAPI are opt-in):

   ```bash
   ./scripts/apply-profile.sh --write-apps
   ```

   Fill `AGENTS.md` §11 from `project/rules/stack.md`. Commands stay in `apps/web/AGENTS.md` and `apps/api/AGENTS.md` so the root file stays cheap.

3. **Open the project in your agent** and say:

   > Read AGENTS.md and `project/STATE.md`. Run the `project-kickoff` skill for phase 0. Ask me at most 3 questions at a time.

4. **Approve G0** when the brief is accurate. The agent updates `project/STATE.md` and moves to discovery.

5. **Repeat one phase per session.** Do not let the agent jump to code before G4.

## What good looks like

- `project/STATE.md` is always current. If it is stale, nothing else can be trusted.
- Every feature has an ID (`FEAT-###`) in the catalog and a spec in `project/06-specs/`.
- Every task is small enough to review in one sitting and has explicit acceptance criteria.
- Every irreversible choice has an ADR.
- Every commit tells you *why*, not just *what*.
- The agent asks fewer questions over time because the answers live in the repo.

## Roles

| Role | Owns | Approves |
|---|---|---|
| Human | Intent, priorities, risk | All gates, merges to shared branches, releases |
| Agent | Research, drafting, implementation, verification | Nothing irreversible |
| `project/STATE.md` | The current truth | — |

## Phase cheat sheet

| Phase | Goal | Artifact | Gate question |
|---|---|---|---|
| 0 Intake | Capture the idea and constraints | `00-brief.md` | Is the problem worth solving? |
| 1 Discovery | Validate the problem and users | `01-discovery.md` | Do we believe the evidence? |
| 2 Product | Define scope and behavior | `02-prd.md`, `02-product-catalog.md` | Is the scope small and testable? |
| 3 Architecture | Choose structure and trade-offs | `03-architecture.md`, ADRs | Can this survive real usage? |
| 4 Plan | Sequence the work | `05-plan.md`, tasks | Is the first slice shippable? |
| 5 Build | Implement and verify | specs, code, tests | Is the diff correct and reviewable? |
| 6 Release | Ship safely | changelog, runbook | Can we roll back? |
| 7 Operate | Learn and iterate | metrics, retro | What do we change next? |

## Token discipline in one page

- **Tier 0** is `AGENTS.md`. It should stay under ~2,000 tokens.
- **Tier 1** is skill descriptions. They cost ~650 tokens for all twelve.
- **Tier 2** is one playbook, one spec, **one** stack profile. Load via `./scripts/context-pack.sh`.
- **Tier 3** is templates and examples. Load only when creating something.
- If a request is vague, the `prompt-optimizer` skill turns it into a **work order** before any code is written.
- If a task is S, skip planning. If it is XL, split it.

Full detail: [10-token-economy.md](10-token-economy.md).

## Common mistakes

| Mistake | Fix |
|---|---|
| Letting the agent "explore the repo" first | Send it to `project/STATE.md` and the task file |
| Writing code before G4 | Propose the missing document instead |
| One giant PR | One task, one branch, one commit series |
| Repeating rules in five files | Put them in `AGENTS.md` once; link from elsewhere |
| Keeping a 2,000-line `AGENTS.md` | Move procedures to skills, depth to docs |
| Using a new session for a half-done task | Write a handoff, then start fresh |
| Trusting a stale state file | Update it at every gate and handoff |

## Next reads

- [01-discovery.md](01-discovery.md) — problem validation
- [02-product-definition.md](02-product-definition.md) — PRD and product catalog
- [07-git-workflow.md](07-git-workflow.md) — branches, commits, worktrees
- [10-token-economy.md](10-token-economy.md) — the context model
- [11-agent-adapters.md](11-agent-adapters.md) — per-tool setup
- [13-research-notes.md](13-research-notes.md) — sources and rationale
