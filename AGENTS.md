# AGENTS.md — edupass.lk

Operating manual for AI agents. Read this file fully, once per session. Do not preload the rest of the repo.

**Prime directive:** ship the smallest correct change that satisfies an explicit, testable requirement. Correctness first, tokens second, speed third. Never invent requirements.

---

## 1. Session start (30 seconds)

1. Read `project/STATE.md` — phase, gates, next action.
2. Run `./scripts/context-pack.sh <pack>` and open only those files.
3. If the request is vague, large, or multi-outcome, run `prompt-optimizer` before coding.
4. If the phase is below **G4 Build authorized**, do not write product code. Propose the next document instead.

## 2. Phase model and gates

`0 Intake → 1 Discovery → 2 Product → 3 Architecture → 4 Plan → 5 Build → 6 Release → 7 Operate`

| Gate | Meaning | Required artifacts |
|---|---|---|
| G0 | Brief approved | `project/00-brief.md` |
| G1 | Problem validated | `project/01-discovery.md` |
| G2 | Product baseline | `project/02-prd.md`, `project/02-product-catalog.md` |
| G3 | Architecture approved | `project/03-architecture.md`, ADRs |
| G4 | Plan approved / build authorized | `project/05-plan.md`, task files |
| G5 | Merge-ready | acceptance met, checks green, review done |
| G6 | Release-ready | changelog, version, rollback plan |

**Agents may propose a gate; only the human approves one.** Record approval in `project/STATE.md`. Phase 7 has no gate: feedback loops to G2 or G4.

## 3. Context economy (non-negotiable)

- **Graph before grep.** If `graphify-out/` exists: `graphify query "…"`, then open only named files. Else `rg`/glob, smallest range.
- **Never re-read** a file already read this session unless it changed.
- **One profile, one pack, one spec.** Never load both frontend and backend profiles.
- **No file dumps in chat.** Cite `path:line`. No narration beyond the one-line orientation.
- **Size first.** S = no plan. M = short plan. L = plan + slices. XL = split before starting.
- **Stop and ask** when two sources of truth conflict. Max 3 questions, each with a default.
- **Handoff at ~60%** to `project/handoffs/` and start a fresh session.
- **After code edits:** `graphify update .` (AST, free). Setup: `./scripts/graphify-setup.sh`.

## 4. Work order for non-trivial work

Every M/L task: **Goal · Track (frontend\|backend\|framework) · Context · Constraints · Acceptance · Out of scope · Verification**. Missing pieces → `prompt-optimizer`. Keep it under 300 words.

## 5. Build loop

`spec → failing check → smallest implementation → targeted verify → full verify → self-review → graphify update . → commit`

Done: acceptance met · tests pass · lint/typecheck pass · docs updated · no secrets · diff reviewable in one sitting. Stop after 2 failed attempts and re-read the error. Stop after 3 and ask.

## 6. Git management

Read `GIT_MODEL` in `framework.conf`. Products default to **promotion tracks**:

`feat/<track>/<slug>` → `dev/<track>` → (human: "go to production") `prod/<track>` → (phase) `main`

Tracks: `frontend` and `backend`. Feature branches may have many commits. Test on `dev/*` locally. **Never** promote to `prod/*` or `main` unless the human asks. Use `./scripts/promote.sh` (dry-run default). Framework source (no `apps/`): `feat/<slug>` off `main`. Conventional Commits. Never `git add .`. Never force-push, rebase, or merge a shared branch without approval. One worktree per agent.

## 7. Code standards

Follow existing patterns. Small modules, explicit interfaces, validate at boundaries, typed errors. No dead code or unlinked TODOs. Tests assert behavior. Justify every dependency. Least privilege, no secrets in code or logs. UI: keyboard access, semantic HTML.

## 8. Documentation

`project/` is the source of truth; process depth lives in `docs/`. ADR for irreversible decisions. Spec for behavior. Catalog for scope. Plan for sequence. Docs change in the same PR as the code. Update `project/STATE.md` whenever phase, gate, or next action changes.

## 9. Context map (open only what the task needs)

| Need | Read |
|---|---|
| Where are we? | `project/STATE.md` |
| Exact files to load | `./scripts/context-pack.sh --list` |
| Why this product? | `project/00-brief.md`, `project/01-discovery.md` |
| What are we building? | `project/02-prd.md`, `project/02-product-catalog.md` |
| How is it structured? | `project/03-architecture.md`, `project/04-adr/` |
| Stack conventions | `.agents/profiles/<name>.md` (one) + `.agents/recipes/` |
| Frontend / backend package | `frontend/AGENTS.md` / `backend/AGENTS.md` |
| Cursor path rules | `.cursor/rules/050-stack-*.mdc` (auto on `frontend/**` / `backend/**`) |
| Exact behavior | `project/06-specs/` |
| Code map / deps | `graphify query\|path\|explain` (then named files) |
| Git / promote | `docs/07-git-workflow.md` |
| Process depth | `docs/` (one playbook) |
| Procedures | `.agents/skills/<name>/SKILL.md` |

## 10. Skills

Only `name` + `description` are always visible. Load the body when the trigger matches.

| Skill | Trigger |
|---|---|
| `project-kickoff` | new project, new phase, "start", "kickoff" |
| `prompt-optimizer` | vague/large request, "optimize", "plan this" |
| `spec-writer` | new feature, ambiguous behavior, acceptance |
| `architecture-decisions` | stack, ADR, NFR, data model, threat model |
| `plan-and-slice` | milestone, task breakdown, sequencing |
| `implementation-loop` | writing or changing product code |
| `git-steward` | branch, commit, PR, promote, worktree, tag |
| `code-review` | review a diff or PR, pre-merge check |
| `test-strategy` | test plan, flaky tests, coverage |
| `release-manager` | version, changelog, deploy, rollback, promote |
| `context-auditor` | rules/docs bloated, stale, or contradictory |
| `skill-forge` | add a project-specific skill or rule |

## 11. Project invariants (edit per project, ≤10 bullets)

- Layout: `frontend/` + `backend/` (npm workspaces). Nested `AGENTS.md` in each.
- Frontend profile: `.agents/profiles/web-react-vite-netlify.md`
- Backend profile: `.agents/profiles/api-node-nest.md` (NestJS 11 + Fastify; Prisma planned)
- Product scope: `docs/product/` (two products, multi-tenant, bank-first payments)
- Git: promotion tracks in `framework.conf`; existing integration branch `development` still used until tracks are created. Detail: `docs/07-git-workflow.md`
- Stack summary: `project/rules/stack.md`
- Never touch: `dist/`, `.netlify/`, `.env*`, generated adapters, secrets, `docs/product/` scope without approval
- Data class: education PII (students); deploy: Netlify FE + API host TBD


## 12. When stuck

1. Re-read the failing output, not the whole file.
2. Search the repo (`rg "<symbol>"`).
3. Check `project/04-adr/` and `project/rules/`.
4. Write the smallest reproduction.
5. Ask one precise question with your hypothesis and default.
