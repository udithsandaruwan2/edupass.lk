# 05 — API surface

Base: `/api`. Bearer JWT unless public.  
`403` entitlement/plan; `402` optional for plan upgrade required; `409` inventory/check-in conflict.

## Auth & registration

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register/student` | |
| POST | `/auth/register/institution` | Org INSTITUTE + Free plan subscription |
| POST | `/auth/register/lecturer` | Org INDIVIDUAL_LECTURER + seminars entitlement |
| POST | `/auth/login` | Returns user, memberships, entitlements, **plan**, **commissionPercent** |
| POST | `/auth/refresh` \| `/auth/logout` | |
| POST | `/auth/forgot-password` … | OTP reset |
| GET | `/auth/me` | Full actor context for nav |

## Catalogue (public)

`GET /categories`, `/seminars`, `/seminars/:slug`, `/lecturers`, `/organisations/:slug`, `/cms/*`

## Student commerce (bank-first)

| Method | Path | Notes |
|---|---|---|
| POST | `/checkout` | Bank only; snapshot commission % onto order |
| GET | `/checkout/:orderId/bank-instructions` | Seller tenant bank details |
| POST | `/payments/slips` | Order slip |
| GET | `/orders`, `/orders/:id`, `/tickets`, `/tickets/:id` | |
| POST/GET | `/refunds` | |
| GET/PUT | `/student/profile` | |

PayHere: stub/`501` while disabled.

## Seller — seminars (institution or individual)

Prefix `/organiser` (tenant-scoped).

| Method | Path | Notes |
|---|---|---|
| CRUD | `/organiser/seminars`, ticket-types, publish/cancel | |
| GET/PUT | `/organiser/bank-accounts` | |
| GET | `/organiser/bookings`, `/organiser/attendees` | |
| GET | `/organiser/earnings` | Sales − platform fees |
| GET | `/organiser/payments/pending-slips` | |
| PATCH | `/organiser/payments/slips/:id` | approve/reject |
| POST | `/organiser/check-in` | Seminar attendance |
| GET | `/organiser/seminars/:id/attendance` | |
| GET/POST | `/organiser/lecturers` | Profiles / invites |

## Institution — management (`institute` + plan)

| Method | Path | Notes |
|---|---|---|
| GET | `/institute/billing/usage` | Counts vs plan limits |
| GET/POST | … batches, enrollments, import, sessions, attendance | |
| Tuition | fee-plans, invoices, payments, slip approve | |
| GET/POST | `/institute/staff` | |
| GET | `/institute/billing/subscription` | Current plan |
| POST | `/institute/billing/upgrade` | Select plan → PlatformInvoice |
| POST | `/institute/billing/slips` | Pay EduPass for Premium/Platinum |

## Platform admin

| Method | Path | Notes |
|---|---|---|
| CRUD | `/admin/plans` | Free / Premium / Platinum |
| GET/PUT | `/admin/settings` | Includes `ticketCommissionPercent` |
| GET/PATCH | `/admin/organisations/:id` | Status |
| PUT | `/admin/organisations/:id/subscription` | Assign plan / trial |
| GET | `/admin/revenue/platform-fees` | Fee lines |
| GET | `/admin/revenue/subscriptions` | |
| GET/PATCH | `/admin/payments/slips` | Global override |
| Refunds, CMS, categories, settings | as before | |

## Student — institute portal

`GET /student/enrollments`, `/student/attendance`, `/student/invoices`, pay tuition slip.

## Health

`GET /health`, `GET /`
