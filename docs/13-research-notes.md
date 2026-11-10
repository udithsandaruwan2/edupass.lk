# 13 — Research notes

This framework is a synthesis, not an invention. It borrows proven formats and adds the pieces that are usually missing when agents work on real projects: phase gates, token budgets, and project-specific customization.

Research reviewed in October 2026. Updated 2026-10-30 for promotion-track git, stack profiles, and context packs.

---

## 1. AGENTS.md is the cross-tool standard

**Sources**

- <https://agents.md> — the open format, stewarded by the Agentic AI Foundation under the Linux Foundation.
- <https://opencode.ai/docs/rules/> — OpenCode reads `AGENTS.md`, falls back to `CLAUDE.md`.
- <https://www.morphllm.com/agents-md-guide> — comparison of `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, Copilot instructions.

**Adopted**

- `AGENTS.md` at the repo root as the single always-on file.
- Plain Markdown, no required schema.
- Nearest file wins in monorepos.
- A hard size discipline: the standard is intentionally minimal, and Codex truncates around 32 KiB. We target ~140 lines, far below the limit.

**Rejected**

- Putting the whole methodology in `AGENTS.md`. That makes every session pay for process it may not need.

---

## 2. Agent Skills and progressive disclosure

**Sources**

- <https://agentskills.io/specification> — `SKILL.md` format, required `name` and `description`, body guidance, one-level-deep references.
- <https://code.claude.com/docs/en/skills> — Claude Code skill behavior and frontmatter.
- <https://www.anthropic.com/research/effective-context-engineering-for-ai-agents> — context engineering as the successor to prompt engineering.
- <https://codemyspec.com/blog/progressive-disclosure> — measured token reductions from loading tools and skills on demand.

**Adopted**

- Every procedure is a skill with a trigger-focused `description`.
- Bodies stay under ~200 lines; long detail moves to `docs/`.
- Only name + description are always visible.
- Skills are the unit of project customization.

**Rejected**

- One skill per phase artifact. Too many tiny skills increase trigger ambiguity. We group by activity (e.g., `spec-writer`, `plan-and-slice`).

---

## 3. Spec-driven development

**Sources**

- GitHub Spec Kit workflow (`/specify`, `/plan`, `/tasks`, `/implement`) — <https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit>
- Addy Osmani, "How to write a good spec for AI agents" — <https://addyosmani.com/blog/good-spec>
- Allegro, "Spec-Driven Development best practices" — <https://blog.allegro.tech/2026/06/spec-driven-development-best-practices.html>
- "Spec-Driven Development: From Code to Contract" — <https://arxiv.org/html/2602.00180v1>

**Adopted**

- The spec is the source of truth, and code is generated against it.
- A constitution-like file (`AGENTS.md`) that every change must respect.
- Four artifacts: spec, plan, tasks, implementation.
- Specs are living documents, updated after every change.
- Validation gates before implementation.

**Adapted**

- Spec Kit's four commands are powerful but heavyweight for small changes. APF scales: S tasks skip the ceremony, M/L tasks use the work order, XL tasks are split.
- We add a product catalog because specs alone do not answer "what is in scope across the product?"

---

## 4. Context engineering and token efficiency

**Sources**

- Anthropic, "Effective context engineering for AI agents" — <https://www.anthropic.com/research/effective-context-engineering-for-ai-agents>
- "On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents" — <https://arxiv.org/html/2601.20404v2> (reports faster completion and lower output tokens with an `AGENTS.md`).
- NeuralTrust, "Prompt Compression" — <https://neuraltrust.ai/blog/prompt-compression-guide> (manual compression of system prompts by 20–40% without quality loss).
- IBM, "Token optimization" — <https://developer.ibm.com/articles/awb-token-optimization-backbone-of-effective-prompt-engineering>
- "A practitioner's guide to getting more value out of AI coding" — <https://dev.to/webmaxru/a-practitioners-guide-to-getting-more-value-out-of-ai-coding-agent-quality-token-optimization-3n7j>

**Adopted**

- Tiered context (always / triggered / on demand / rare).
- Hard budgets enforced by `token-audit.sh`.
- Work orders that convert vague prose into checkable fields.
- Task sizing to avoid over-thinking on small work.
- Session handoffs instead of relying on compaction.
- Output discipline: diffs and citations, not narration or file dumps.
- Measurement in tokens per merged task, not tokens per request.

**Caveat**

Token savings are a consequence of better context, not the goal. A smaller prompt that causes rework is a net loss. The framework optimizes for **tokens per correct, merged change**.

---

## 5. Git and parallel agents

**Sources**

- Nimbalyst, "Best Git Worktree Tools for AI Coding in 2026" — <https://nimbalyst.com/blog/best-git-worktree-tools-ai-coding-2026>
- Augment Code, "How to Use Git Worktrees for Parallel AI Agent Execution" — <https://www.augmentcode.com/guides/git-worktrees-parallel-ai-agent-execution>
- Nx, "How Git Worktrees Changed My AI Agent Workflow" — <https://nx.dev/blog/git-worktrees-ai-agents>
- Conventional Commits — <https://www.conventionalcommits.org>

**Adopted**

- **Promotion tracks** as the product default: independent `dev`/`prod` lines for frontend and backend, `main` as the phase archive. Matches split deployables (Netlify vs API host) and a human production gate.
- One worktree per parallel agent, disjoint by track (`apps/web` vs `apps/api`).
- Conventional Commits enforced by a local hook.
- Explicit staging; never `git add .`.
- `promote.sh` dry-run by default; `--apply` only after the human says so.
- Human-only merge to `prod/*` and `main`, tag, and force-push.

**Rejected**

- A single long-lived `develop` that mixes UI and API. Independent cadence is the point of four tracks.
- Agent self-promote to production. Tests-green is not permission.
- Trunk-based as the *only* model. It remains the opt-in (`GIT_MODEL=trunk`) for a single deployable.

**Sources (promotion)**

- AWS Prescriptive Guidance, Gitflow environment branches — <https://docs.aws.amazon.com/prescriptive-guidance/latest/choosing-git-branch-approach/branches-in-a-gitflow-strategy.html>
- Gearset, environment + promotion branches — <https://docs.gearset.com/en/articles/6115722-the-gearset-pipelines-expanded-branching-model>

---

## 6. Quality and security

**Sources**

- OWASP Top 10 and ASVS — <https://owasp.org/www-project-top-ten/>
- Google's "Code Review Developer Guide" — <https://google.github.io/eng-practices/review/>
- DORA metrics — <https://dora.dev>

**Adopted**

- Acceptance criteria mapped to checks.
- Review levels: blocking / should-fix / nit.
- Expand → migrate → contract for schema changes.
- STRIDE-lite threat modeling.
- Agent-specific threats: prompt injection, tool abuse, secret exfiltration.
- Rollback as a first-class release artifact.

---

## 7. What is new here

Most public guidance covers one layer: prompts, or specs, or git, or skills. APF connects them with three mechanisms:

1. **A phase/gate state machine** (`project/STATE.md`) that tells any agent where the project is and what artifact is missing.
2. **A product catalog with stable IDs** that prevents scope drift across specs, plans, tasks, and releases.
3. **Token budgets with scripts** (`token-audit.sh`, `doctor.sh`) so context discipline is enforced, not aspirational.
4. **Graphify knowledge graph** (`graphifyy` CLI) so agents query a local AST map before broad reads; see ADR 0004.

The combination is the contribution. Each individual practice has prior art.

---

## 8. Design trade-offs

| Decision | Benefit | Cost |
|---|---|---|
| Many small files | progressive disclosure, cheap loading | more navigation |
| Human gate approval | prevents runaway work | adds a checkpoint |
| Strict git rules | safe parallel agents | less improvisation |
| Generated adapters | one source of truth | must re-run sync |
| Bash scripts | portable, no runtime deps | less rich than a CLI |
| Product catalog | scope clarity | one more artifact to maintain |

If a trade-off does not fit your team, change it in `framework.conf` and document why in `project/04-adr/`.

---

## 9. Further reading

- AGENTS.md examples: <https://github.com/search?q=path%3AAGENTS.md+NOT+is%3Afork+NOT+is%3Aarchived&type=code>
- Agent Skills repository: <https://github.com/anthropics/skills>
- GitHub Spec Kit: <https://github.com/github/spec-kit>
- Conventional Commits: <https://www.conventionalcommits.org>
- Keep a Changelog: <https://keepachangelog.com>
- Semantic Versioning: <https://semver.org>
- Architecture Decision Records: <https://adr.github.io>
