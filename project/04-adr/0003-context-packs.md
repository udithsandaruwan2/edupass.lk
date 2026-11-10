# 0003 — Context packs as the load allowlist

Status: accepted
Date: 2026-10-30
Deciders: human

## Context

Progressive disclosure fails when the agent still glob-reads "for context". Pointers in `AGENTS.md` are necessary but not sufficient.

## Decision

`.agents/packs/<name>.txt` lists the exact files to open. `scripts/context-pack.sh` prints them in order and skips missing paths. Session start: `session` pack. Implementation: `implement-web` or `implement-api`.

## Alternatives

- Trust the model to follow the context map (status quo; expensive when it does not).
- Hierarchical skills-of-skills (research: extra routing depth does not help).

## Consequences

+ Deterministic, auditable load list.
− Packs must be kept in sync when files move (`doctor.sh` checks they exist).

## Revisit if

Agents ignore the pack output; then add the pack contents as the first lines of the matching skill.
