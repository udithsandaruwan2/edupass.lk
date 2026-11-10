# 08 — Backend NestJS plan

Stack: NestJS 11 + Fastify + Prisma + PostgreSQL.

## Scaffold today

`backend/src/main.ts` — Fastify, `api` prefix, health only.

## Bootstrap order

1. Prisma + Config (`PAYHERE_ENABLED=false`, JWT, QR secret).
2. Auth + Users + StudentProfile.
3. Organisations + StaffMembership + tenant kinds + BankAccount.
4. **BillingModule:** SubscriptionPlan, OrganisationSubscription, PlatformSettings.commission, PlatformFeeLine, PlatformInvoice.
5. Catalogue + Seminars + TicketTypes + checkInMode.
6. Checkout (bank) + slips + tickets on approve + fee line write.
7. Check-in + attendees.
8. Refunds + Admin CMS + admin plans/% APIs.
9. Institute + tuition fees (plan-gated).
10. Notifications.
11. Phase F: PayHere.

## Naming

- Use `TuitionFeePlan` / `TuitionInvoice` in Prisma to avoid clashing with `SubscriptionPlan` / platform fees.
- `PlatformFeeLine` only for EduPass commission.

## Critical services

| Service | Responsibility |
|---|---|
| `CommissionService` | Resolve % (org override → plan → global); snapshot on checkout |
| `PlanLimitService` | Enforce Free/Premium/Platinum caps |
| `SlipService` | Approve paths for ORDER / TUITION / PLATFORM_SUBSCRIPTION |
| `CheckInService` | Tenant-safe single-use admit |

## Seed

- Plans: Free, Premium, Platinum with sample limits.
- Global commission **5%** (or 6% — set one; admin can edit).
- Orgs: institution on Free; individual lecturer; dual-product Premium sample.
- Platform admin user; EduPass bank account for plan payments.
- Demo seminars with `checkInMode=qr_gate`.

## Module folders

```
backend/src/
  prisma/ auth/ users/ organisations/ billing/
  catalogue/ seminars/ checkout/ tickets/ check-in/
  payments/ refunds/ cms/ institute/ tuition/ admin/ notifications/
  common/   # OrgScope, Entitlement, PlanFeature guards
```

## Tests

- Commission snapshot immutable after checkout.
- Plan limit blocks batch #N+1 on Free.
- Individual lecturer 403 on `/institute`.
- Slip approve creates tickets + PlatformFeeLine.
- Check-in rejects other tenant’s ticket.
