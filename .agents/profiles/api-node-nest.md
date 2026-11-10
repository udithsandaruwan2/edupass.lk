# Profile — Node + NestJS

Load only when the task touches the Nest API. Git track: **backend**.
Opt-in: `BACKEND_PROFILE=api-node-nest` or bootstrap `--backend-nest`. Default is Django.
**Do not web-search Nest defaults.** Follow this file, then the recipe.

## Pin

- Node LTS + TypeScript (`strict`, no `any`)
- NestJS modules / controllers / providers
- pnpm
- class-validator + class-transformer
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- `@nestjs/config` for env
- Jest unit + e2e (supertest)
- Path: `apps/api/`

## Commands

```bash
cd apps/api
pnpm install
pnpm start:dev
pnpm test                 # prefer: pnpm test -- <name>.spec.ts
pnpm test:e2e
pnpm lint && pnpm typecheck && pnpm build
```

## Module shape

```
apps/api/src/
  main.ts                 # bootstrap + global pipes/filters
  app.module.ts
  common/                 # filters, guards, interceptors (no feature imports)
  <domain>/
    <domain>.module.ts
    <domain>.controller.ts
    <domain>.service.ts
    dto/
    entities/ or persistence/
    <domain>.spec.ts
```

## Decisions (stop re-deciding)

| Topic | Choice |
|---|---|
| Organization | Feature modules, not layer folders |
| DI | Constructor injection only (`private readonly`). No `new Service()` |
| Controllers | HTTP only. Logic in services |
| DTOs | **Classes** with class-validator. Interfaces do not validate |
| Validation | One global pipe in `main.ts`. Do not stack duplicates |
| Responses | Map to response DTOs — never return ORM/Prisma entities raw |
| Cross-module | Export the provider; import the module. Avoid `forwardRef` unless confirmed |
| Config | `ConfigService` / validated env schema — no hardcoded secrets |
| API prefix | `/v1` |
| Authz | Guards + server checks. Never trust role from body |
| OpenAPI | Nest Swagger is the contract for `apps/web` |
| Data access | In services/repos only. Parameterized queries |
| Migrations | Expand → migrate → contract |
| Idempotency | Required on create/payment |

## Do / don’t

| Do | Don’t |
|---|---|
| Register new providers in the module | Forget `providers` / `exports` arrays |
| Update specs when DTOs/entities change | Skip tests for new endpoints |
| One domain folder per bounded context | Circular module imports |
| `pnpm` + lockfile discipline | npm/yarn unless lockfile already is |

## Git / CI

- From `dev/backend` → `feat/backend/<slug>` → merge to `dev/backend`.
- Promote to `prod/backend` only when the human says so.
- Path filter: `apps/api/**`.

## Recipe

New domain module: `.agents/recipes/nestjs-module.md`

## Never touch

- `dist/`, frontend (`apps/web/**`) from a backend task
- `pnpm-lock.yaml` unless adding a justified dependency
