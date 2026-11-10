# Profile — split apps (monorepo)

One repo, two deployables, four git tracks. Load when the task crosses `apps/web` and `apps/api`, or when bootstrapping.

## Layout

```
apps/web/     # React + Vite → Netlify
apps/api/     # Django (default); FastAPI or Nest opt-in → API host
project/      # product truth
.agents/      # skills, profiles, packs
```

Root `AGENTS.md` is global. Each app has a nested `AGENTS.md` (≤40 lines) with commands.

## Contract

- Backend owns the HTTP/JSON contract (OpenAPI).
- Frontend types are generated or copied from that contract, not invented.
- A task that changes the contract is **two slices**: API first (merged to `dev/backend`), then web (merged to `dev/frontend`).
- Do not share a database with the frontend. Do not import API modules into web.

## CI

| Branch | Builds | Deploys |
|---|---|---|
| `dev/frontend` | `apps/web` | Netlify preview/dev |
| `prod/frontend` | `apps/web` | Netlify production |
| `dev/backend` | `apps/api` | API staging |
| `prod/backend` | `apps/api` | API production |
| `main` | both (verify) | none — phase archive |

Path filters so a frontend push does not build the API.

## Parallel agents

- Frontend agent: worktree on `feat/frontend/<slug>`, files under `apps/web`.
- Backend agent: worktree on `feat/backend/<slug>`, files under `apps/api`.
- Overlap only at the contract file; serialize that change.
