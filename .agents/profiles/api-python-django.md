# Profile — Python + Django

Load only when the task touches the API. Git track: **backend**.
This is the **default** backend. Nest and FastAPI are opt-in.
**Do not web-search Django/DRF defaults.** Follow this file, then the recipe.

## Pin

- Python 3.12+ · Django 5.x · Django REST Framework
- `uv` + `uv.lock` (never bare `pip install` / `venv`)
- pytest-django · ruff · factory_boy or model-bakery
- Path: `apps/api/`

## Commands

```bash
cd apps/api
uv sync
uv add <pkg>                          # add deps
uv run python manage.py runserver
uv run python manage.py makemigrations && uv run python manage.py migrate
uv run pytest                         # or: uv run pytest path/to/test_x.py
uv run ruff check . && uv run ruff format --check .
uv run python manage.py check
```

## Shape

```
apps/api/
  manage.py
  config/settings/{base,dev,prod}.py
  config/urls.py
  <app>/                     # one Django app per bounded context
    models.py
    api/{serializers,views,urls}.py
    services.py              # multi-model / side-effect logic
    tests/
  pyproject.toml
  uv.lock
```

## Decisions (stop re-deciding)

| Topic | Choice |
|---|---|
| HTTP API | DRF `ModelViewSet` + `DefaultRouter`. `@api_view` only for non-resources |
| Serializers | Separate Read / Write when shapes differ; validate in serializer |
| Permissions | Explicit `permission_classes` on every viewset. Default `IsAuthenticated` |
| Queryset | Always scope in `get_queryset()` — never bare `Model.objects.all()` for tenants |
| N+1 | `select_related` / `prefetch_related` in `get_queryset` for relations |
| Logic | Fat models / services; thin viewsets. No business logic in serializers |
| Errors | DRF exception handler. No bare `except:` / silent swallow |
| Secrets | Env only (`SECRET_KEY`, DB URL). Never commit `.env*` |
| API prefix | `/api/v1/` |
| Pagination | Global default; never unbounded list querysets |
| Filters | `django-filter` / DRF filter backends — not hand-rolled query params |
| Migrations | New file every change. Never edit a committed migration |
| Zero-downtime | Expand → migrate → contract across releases |

## Do / don’t

| Do | Don’t |
|---|---|
| `uv add` / `uv run` | `pip install`, global packages |
| Model + migration in the **same** commit | Schema change without migration |
| `@transaction.atomic` for multi-step writes | Signals for core business flow (prefer explicit calls) |
| `APIClient` + factories in tests | Huge `setUp` with raw `.objects.create` everywhere |
| Test auth, validation, permissions, happy path | Only status-code asserts |
| Idempotency key on create/payment | Trust role/id from the client body |

## Git / CI

- From `dev/backend` → `feat/backend/<slug>` → merge to `dev/backend`.
- Promote to `prod/backend` only when the human says so.
- Path filter: `apps/api/**`.

## Recipe

New resource CRUD: `.agents/recipes/django-drf-crud.md`

## Never touch

- `.venv/`, `staticfiles/`, frontend (`apps/web/**`) from a backend task
- `uv.lock` unless adding a justified dependency
- Production secret values in the repo
