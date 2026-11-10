# Stack profiles

On-demand conventions. **Load one profile, never all of them.**
Cursor auto-attaches the matching profile rule when you open files under `apps/web` or `apps/api` (see `.cursor/rules/050-stack-*.mdc`).

Pick from `FRONTEND_PROFILE` / `BACKEND_PROFILE` in `framework.conf`. Apply with:

```bash
./scripts/apply-profile.sh
./scripts/context-pack.sh implement-web          # React
./scripts/context-pack.sh implement-api          # Django (default)
./scripts/context-pack.sh implement-api-python   # FastAPI
./scripts/context-pack.sh implement-api-nest     # NestJS
```

| Profile | Use when | Recipe |
|---|---|---|
| `web-react-vite-netlify` | React UI, Vite, Netlify | `recipes/react-vite-feature.md` |
| `api-python-django` | **Default** Python API: Django + DRF (`uv`) | `recipes/django-drf-crud.md` |
| `api-python` | FastAPI opt-in | `recipes/fastapi-router.md` |
| `api-node-nest` | NestJS opt-in | `recipes/nestjs-module.md` |
| `layout-split-apps` | `apps/web` + `apps/api` monorepo | — |

**Token rule:** do not research stack defaults that are already decided here. If two sources conflict, stop and ask.

Git promotion tracks: `docs/07-git-workflow.md`.
