# T-001 — Prisma foundation, auth, register, seed

- **Milestone:** M1
- **Feature:** FEAT-001, FEAT-002, FEAT-007
- **Size:** L
- **Risk:** high
- **Depends on:** none
- **Status:** done

## Goal

Backend authenticates users; creates student/institution/lecturer tenants; seeds Free/Premium/Platinum + 5% commission + dual sample orgs.

## Context

- `docs/product/08-backend-nestjs-plan.md`
- `docs/product/03-domain-model.md`
- `docs/product/12-platform-billing-and-tenancy.md`
- `backend/src/main.ts`

## Acceptance

- [x] Prisma migrate applies User, Organisation, membership, plans, subscription, settings
- [x] Register three kinds; lecturer lacks institute entitlement
- [x] JWT login + `/auth/me` returns entitlements + plan + commissionPercent
- [x] Seed: two institutions + one individual; platform admin
- [x] OrgScope rejects cross-tenant read in a unit/e2e test

## Out of scope

- Seminar CRUD, slips, PayHere

## Verification

```bash
npm run start:dev --workspace=backend
npm run test --workspace=backend
npm run test:e2e --workspace=backend
```
