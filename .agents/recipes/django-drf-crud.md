# Recipe — Django DRF CRUD resource

Use with profile `api-python-django`. One Django app per bounded context.

## Steps

1. Read `apps/api/AGENTS.md` and a sibling app’s `api/` package.
2. Model in `<app>/models.py`. Then:
   ```bash
   uv run python manage.py makemigrations && uv run python manage.py migrate
   ```
3. Serializers: `<Resource>ReadSerializer` + `<Resource>WriteSerializer` when shapes differ.
4. ViewSet: `ModelViewSet` (or mixins). Set `permission_classes`, scoped `get_queryset()`, `select_related`/`prefetch_related`.
5. Register router under `/api/v1/`.
6. Service module if create/update touches multiple models or side effects.
7. Tests with `APIClient` + factory: auth required, validation error, happy create/list/retrieve, permission deny.
8. Run: `uv run pytest <app> && uv run ruff check . && uv run python manage.py check`.

## Acceptance checklist

- [ ] Model + migration same commit
- [ ] No unbounded queryset; pagination on
- [ ] Permissions explicit
- [ ] Backend track only — no `apps/web` edits
