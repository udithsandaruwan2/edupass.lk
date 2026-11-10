# 12 — FAQ

### Do I need every phase for a tiny script?

No. Scale the process to the risk:

| Work | Phases |
|---|---|
| One-off script, no users | 0 brief (5 lines) → 5 build |
| Internal tool, one user | 0 → 2 → 4 → 5 |
| Product with users | 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 |
| Regulated / irreversible | all phases, plus security review |

The gates exist to prevent expensive mistakes. If a mistake is cheap to reverse, skip the gate and say why in `STATE.md`.

### Can I apply this to an existing repository?

Yes. Run:

```bash
./scripts/bootstrap.sh /path/to/repo "Existing App" --force --copy
```

It adds the framework files and adapters without touching your code. Review the diff: it may overwrite `.gitignore`, `.editorconfig`, or `Makefile`. Then fill `AGENTS.md` §11 and write a one-page `project/00-brief.md` describing the current state. For an existing product, start at phase 2 (product baseline) or phase 5 (build), not phase 0.

### How do I upgrade an existing DevOpt project to a new release?

Do **not** re-run the Setup one-shot. Prefer selective copy of framework layers (`scripts/`, `.agents/`, `docs/`, new changelog files), merge `AGENTS.md` while keeping §11, then run any new `scripts/*-setup.sh` (e.g. `graphify-setup.sh`).

Portal: [Update guide + upgrade agent prompt](https://devopt.udithsandaruwan.com/update.html) · raw prompt: `site/update-prompt.txt`.

Full refresh only if many versions behind: `bootstrap.sh … --force --copy`, then restore product `project/` and customized §11 from git.

### The agent ignores `AGENTS.md`. What now?

1. Confirm the file is the one your tool reads (see [11-agent-adapters.md](11-agent-adapters.md)).
2. Start a new session; some tools cache instructions.
3. Make the first instruction explicit: "Read `AGENTS.md` fully, then `project/STATE.md`. Do not read other files yet."
4. If it still ignores the rules, the file is too long. Trim it with `context-auditor`.
5. For a hard requirement, repeat it in the task file as an acceptance criterion.

### How do I stop the agent from reading the whole repo?

The context map in `AGENTS.md` §9 plus a precise task file. In the prompt, name the files:

> Read only `project/STATE.md`, `project/06-specs/FEAT-001.md`, and `src/notes/service.ts`.

If it still explores, the task is probably underspecified. Run `prompt-optimizer`.

### How do I add a project-specific rule?

Create `project/rules/<topic>.md` with a short, testable rule. Add it to `AGENTS.md` §11 only if it is critical enough to load every session. Otherwise, reference it from the relevant skill or task.

Example:

```markdown
# project/rules/billing.md
- Money is stored in integer cents, never floats.
- Every billing mutation writes an audit event.
- Prices are server-side; the client never sends a price.
```

### How do I add a project-specific skill?

```bash
./scripts/new.sh skill invoice-import
```

Then fill the `description` with concrete triggers ("Use when importing invoices from CSV or OFX"). Run `./scripts/sync-adapters.sh`. See the `skill-forge` skill for the full guide.

### Why four long-lived branches instead of trunk-based?

Frontend (Netlify) and backend (API host) ship on different cadences. A feature is developed on `feat/<track>/<slug>`, merged to `dev/<track>`, tested locally, and promoted to `prod/<track>` only when a human says "go to production". After a phase, both prod tracks merge to `main`. Set `GIT_MODEL=trunk` if you have a single deployable.

```bash
./scripts/promote.sh frontend prod          # dry-run
./scripts/promote.sh frontend prod --apply  # after the words
./scripts/promote.sh phase --apply          # both prod → main
```

### Does this work with multiple agents at once?

Yes, with isolation:

- One `git worktree` per agent.
- Disjoint file scopes.
- Separate ports, databases, and env files.
- One human review queue.
- Merge order decided before starting.

See [07-git-workflow.md](07-git-workflow.md).

### How do I keep `AGENTS.md` from growing forever?

- Rules that apply always → `AGENTS.md`, but only if they change behavior.
- Procedures and checklists → skills.
- Depth, examples, rationale → docs.
- Project facts → `project/rules/` or `project/`.
- Delete anything that is already obvious to a competent engineer.

Run `./scripts/token-audit.sh --strict` and `context-auditor` quarterly.

### What if the agent wants to skip a gate?

It may propose. It may not approve. The human updates `project/STATE.md`:

```yaml
gates:
  G2: approved 2026-10-30 by human
```

If you are solo, still write the approval. The act of writing it forces a check.

### How do I handle a change that touches many files?

Split by user outcome or by risk, not by layer. If it cannot be split, write a short design note, get approval, and use a single branch with a sequence of commits:

1. mechanical rename/refactor (no behavior change)
2. schema/migration
3. behavior with tests
4. cleanup

Each commit should build and pass tests.

### What about documentation drift?

Docs change in the same commit as the code. `project/STATE.md` changes at every gate. The `context-auditor` skill finds stale links and contradictions. CI runs `doctor.sh` to catch broken links and budget violations.

### Can I rename the framework or change its structure?

Yes. Change `FRAMEWORK_NAME` in `framework.conf`, update the title in `AGENTS.md`, and run `sync-adapters.sh`. If you move directories, update the context map and the scripts. Keep `AGENTS.md` the only mandatory read.

### Why not put everything in one big prompt?

Because every session pays for it, and models attend unevenly to long contexts. A 10,000-token instruction file makes the agent slower, more expensive, and often less accurate. Progressive disclosure exists because *when* context arrives matters as much as *what* it contains.

### How do I measure whether this is working?

Track tokens per merged task, clarification turns, rework rate, and time to first correct diff. The framework's own `token-audit.sh` measures the context baseline. See [10-token-economy.md](10-token-economy.md).

### Is this compatible with Spec Kit, Kiro, or other workflows?

Yes. The phase model maps to spec-driven development: brief/discovery → `specify`, architecture/plan → `plan`, tasks → `tasks`, build → `implement`. If you already use Spec Kit, keep its commands and use APF's `AGENTS.md`, catalog, token rules, and git discipline around them.

### Is the product catalog a commerce catalog?

No. In APF, the product catalog is an inventory of **capabilities and features** with stable IDs, priority, status, and spec links. It answers “what is in scope?”. If you are building a commerce product, your domain’s product/SKU catalog is a separate data model inside the app; do not confuse the two.

### Where do I put research and spikes?

`project/06-specs/` for product research if it informs a feature; `project/04-adr/` for technical decisions; a scratch note under `project/handoffs/` for time-boxed spikes. Do not create a parallel `research/` tree without a reason.

Next: [13-research-notes.md](13-research-notes.md).
