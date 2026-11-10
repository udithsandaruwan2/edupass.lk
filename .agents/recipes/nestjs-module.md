# Recipe — NestJS domain module

Use with profile `api-node-nest`.

## Steps

1. Read `apps/api/AGENTS.md` and a sibling module under `src/`.
2. Scaffold:
   ```
   src/<domain>/
     <domain>.module.ts
     <domain>.controller.ts
     <domain>.service.ts
     dto/create-<domain>.dto.ts
     dto/update-<domain>.dto.ts
     dto/<domain>-response.dto.ts
     <domain>.spec.ts
   ```
3. DTOs = classes + class-validator. Global ValidationPipe already on — do not add another.
4. Register controller + providers in the module; export only what others need.
5. Import the module in `AppModule`.
6. Map entities → response DTO in the service/controller. Never return the entity raw.
7. Unit test the service; e2e for the HTTP path if the feature is user-facing.
8. Run: `pnpm test -- <domain>.spec.ts && pnpm lint && pnpm typecheck`.

## Acceptance checklist

- [ ] Provider registered; no circular imports
- [ ] Guards/authz on mutating routes
- [ ] Backend track only — no `apps/web` edits
