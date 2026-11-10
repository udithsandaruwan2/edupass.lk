# Profile — React + Vite + Netlify

Load only when the task touches the frontend. Git track: **frontend**.
**Do not web-search React/Vite defaults.** Follow this file, then the matching recipe.

## Pin

- React 19 + TypeScript (`strict`)
- Vite (dev + build)
- pnpm (never npm/yarn unless the lockfile already is)
- Vitest + React Testing Library; Playwright for named user flows
- Netlify for `dev/frontend` preview and `prod/frontend`
- Path: `apps/web/` (nested `AGENTS.md`)

## Commands

```bash
cd apps/web
pnpm install
pnpm dev
pnpm test          # Vitest — prefer a single file: pnpm test src/x.test.tsx
pnpm test:e2e      # Playwright, only for the flow in the spec
pnpm lint && pnpm typecheck && pnpm build
```

## Layout

```
apps/web/
  src/
    features/<name>/     # feature-first: ui, hooks, api, types
    components/ui/       # shared primitives only
    lib/                 # api client, env, utils
    routes/ or pages/    # follow what the repo already uses
  public/
  index.html
  vite.config.ts
  netlify.toml
  AGENTS.md
```

## Decisions (stop re-deciding)

| Topic | Choice |
|---|---|
| Components | Function components only. No class components. |
| Props / types | `interface` for objects; no `any`; prefer `unknown` + narrow |
| Server state | Follow existing fetch pattern. If none: TanStack Query (`useQuery` / `useMutation`) |
| Client state | Local `useState` first. Context/Zustand only if ≥3 distant consumers |
| Forms | Controlled inputs or the repo’s form lib. Validate before submit |
| Styling | Match the repo (CSS modules / existing tokens). No new CSS-in-JS |
| Routing | Match the repo (React Router or Vite SPA routes) |
| API types | From OpenAPI / shared contract — never invent response shapes |
| Env | `import.meta.env.VITE_*` only. No secrets in the client bundle |
| Imports | Alias `@/` if configured; otherwise relative. Named exports preferred |

## Do / don’t

| Do | Don’t |
|---|---|
| Colocate `*.test.tsx` next to the file | Enzyme, snapshot-only tests |
| Test user behavior (RTL `userEvent`) | Assert internal state/hooks implementation |
| Keyboard + semantic HTML + visible focus | `div` buttons, icon-only without labels |
| Mobile-first; check ~360px | Desktop-only layout for new UI |
| Small diffs on `feat/frontend/<slug>` | Touch `apps/api/**` in a frontend task |
| Invalidate query keys after mutations | Ad-hoc `fetch` in every component |

## Netlify

- `netlify.toml`: build, SPA `/* → /index.html` **200**, headers.
- Functions: `Netlify.env.get("VAR")` — never `process.env` there; never hardcode secrets.
- Ignore `.netlify/`. Prefer framework adapter; add Functions only when needed.
- Images: Netlify Image CDN. Uploads: Functions + Blobs.

## Git / CI

- From `dev/frontend` → `feat/frontend/<slug>` → merge to `dev/frontend`.
- Promote to `prod/frontend` only when the human says so.
- Path filter: `apps/web/**`, `netlify.toml`.

## Recipe

Creating a screen or feature: `.agents/recipes/react-vite-feature.md`

## Never touch

- `dist/`, `.netlify/`, `pnpm-lock.yaml` unless adding a justified dependency
- Backend files (`apps/api/**`) from a frontend task
