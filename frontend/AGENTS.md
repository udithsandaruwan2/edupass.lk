# AGENTS.md — frontend

> Nested instructions for `frontend/`. Keep under 40 lines. Closest file wins.

## Scope

This file applies to `frontend`. Git track: **frontend**.

## Commands

```bash
# from repo root
npm install
npm run dev --workspace=frontend
npm run test --workspace=frontend
npm run lint --workspace=frontend
npm run typecheck --workspace=frontend
npm run build --workspace=frontend
```

Preferred local port: **5174** (Vite falls back +1 if busy).

## Local invariants

- React 19 + Vite 6 + React Router 7 + Tailwind 4. Profile: `.agents/profiles/web-react-vite-netlify.md`
- Netlify hosting (`frontend/netlify.toml`). No secrets in the client bundle.
- Product UI scope: `docs/product/` (Seminar Ops + Institute Management; entitlement-aware nav).
- Branch from `dev/frontend` when promotion tracks exist. Until then follow repo `development` workflow.

## Differences from the root

- Do not edit `backend/` from a frontend-only worktree.

## Context

- Root: `../AGENTS.md`
- Pack: `./scripts/context-pack.sh implement-web`
- Product docs: `docs/product/`
