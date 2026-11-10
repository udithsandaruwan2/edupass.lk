# Profile — Python + FastAPI

Load only when the task touches the FastAPI API. Git track: **backend**.
Opt-in: `BACKEND_PROFILE=api-python` or bootstrap `--backend-fastapi`. Default is Django.
**Do not web-search FastAPI defaults.** Follow this file, then the recipe.

## Pin

- Python 3.12+ · FastAPI · Pydantic v2
- `uv` + `uv.lock`
- pytest · httpx · ruff
- Path: `apps/api/`

## Commands

```bash
cd apps/api
uv sync
uv add <pkg>
uv run uvicorn app.main:app --reload
uv run pytest
uv run ruff check . && uv run ruff format --check .
```

## Shape

```
apps/api/
  app/main.py              # app factory, middleware, exception handlers
  app/api/v1/              # routers (HTTP only)
  app/schemas/             # Pydantic request/response
  app/domain/              # services / use-cases
  app/models/              # persistence
  app/deps.py              # Depends() providers
  tests/
  pyproject.toml
  uv.lock
```

## Decisions (stop re-deciding)

| Topic | Choice |
|---|---|
| Boundary | Pydantic schemas in / out; domain types inside |
| Routers | HTTP + status codes only. No SQL / ORM in routers |
| DI | `Depends()` for db/session/auth. No globals |
| Errors | Typed HTTPException / custom handlers. No bare `except:` |
| Authz | Server-side dependencies. Never trust client role claims |
| API prefix | `/v1` (or `/api/v1` if the repo already uses it) |
| OpenAPI | FastAPI auto schema is the contract for `apps/web` |
| Secrets | Env via settings object. Never commit |
| DB | Parameterized ORM/SQL only. Migrations: expand → migrate → contract |
| Idempotency | Required on create/payment endpoints |

## Do / don’t

| Do | Don’t |
|---|---|
| `uv add` / `uv run` | `pip install` |
| One router module per resource | God-routers |
| Test with `TestClient` / httpx | Skip auth/validation cases |
| Return response schemas | Leak ORM models with secrets |

## Git / CI

- From `dev/backend` → `feat/backend/<slug>` → merge to `dev/backend`.
- Promote to `prod/backend` only when the human says so.

## Recipe

New router: `.agents/recipes/fastapi-router.md`

## Never touch

- `.venv/`, frontend files from a backend task
- `uv.lock` unless adding a justified dependency
