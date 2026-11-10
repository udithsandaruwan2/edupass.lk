# Recipe — FastAPI router

Use with profile `api-python`.

## Steps

1. Read `apps/api/AGENTS.md` and an existing router under `app/api/v1/`.
2. Add Pydantic schemas in `app/schemas/` (request + response).
3. Add domain service in `app/domain/` (no HTTP types).
4. Add router in `app/api/v1/<resource>.py` — Depends for db/auth only.
5. Include router in the v1 API router / `main.py`.
6. Tests with TestClient/httpx: validation, auth, happy path.
7. Run: `uv run pytest && uv run ruff check .`.

## Acceptance checklist

- [ ] No ORM models returned raw from the router
- [ ] Secrets from settings/env
- [ ] Backend track only
