# 02 — Research: current state

Audit date: **2026-11-10**. Code references are relative to the monorepo root.

## Stack today

| Layer | Location | Reality |
|---|---|---|
| Frontend SPA | `frontend/` | React 19, Vite 6, React Router 7, Tailwind 4 |
| Demo data | `frontend/src/contexts/DataContext.tsx` + `frontend/src/data/mock/*` | Entire domain in **localStorage** (`edupass-demo-data-v1`) |
| Auth | `frontend/src/contexts/AuthContext.tsx` | Simulated role switch; **no passwords/tokens** |
| Backend | `backend/` | NestJS 11 + Fastify; `GET /api` + `GET /api/health` only |
| Deploy configs | `frontend/netlify.toml`, `frontend/vercel.json` | SPA rewrites; Netlify base = `frontend` |

## Roles and navigation

Defined in `frontend/src/types/index.ts` as `Role = 'student' | 'organiser' | 'admin'`.

Dashboard nav: `frontend/src/layouts/DashboardLayout.tsx`.

| Role | Strengths already in UI |
|---|---|
| Student | Bookings, tickets, saved, refund request, profile |
| Organiser | Seminars CRUD-ish, ticket types, bookings, attendees, **QR check-in**, lecturers, insights |
| Admin | Users/organisers, seminars/categories, bookings/tickets/payments/refunds, CMS, settings |

## Seminar marketplace — what exists

### Public catalogue

Routes in `frontend/src/App.tsx`: `/`, `/seminars`, filters, search, categories, featured, upcoming, lecturer/organiser profiles.

`Seminar` already models `mode: physical | online | hybrid`, ticket types, capacity/sold, district, venue, status draft/published/cancelled.

### Commerce

- Cart: `CartContext`
- Checkout + confirmation/failed: `pages/public/CheckoutPages.tsx`
- Orders, tickets issued client-side via `DataContext.placeOrder`
- Payment methods enum: `card | bank_transfer | ez_cash | koko`
- Platform booking fee % in `PlatformSettings`

### Tickets & check-in

- `Ticket` with `code`, status `valid | checked_in | cancelled`
- `TicketQR` encodes demo payload `EDUPASS-DEMO:{code}`
- Organiser check-in: typed code + simulate scan (`/organiser/check-in`)
- Single-use check-in locally; seminar mismatch handled in UI logic

### Gaps for production seminars

| Gap | Detail |
|---|---|
| No HTTP API client | All mutations are localStorage |
| No real auth | OTP/password forms are fake |
| No inventory locks | Concurrent oversell possible in theory when API exists |
| No real payments | Methods are labels only — **target MVP: bank_transfer + slip**; card/PayHere stays disabled until finance stage |
| No signed QR | Codes are predictable demo strings |
| No camera scanner | Manual / simulate only |
| Live stream access | FAQ promises unlock + recording; **no** `streamUrl` / join CTA on types or UI |
| Online attendance | Still QR-shaped; no “join = check-in” |

## Institute operations — what exists

Almost nothing beyond naming:

- `Organiser.type` includes `'Institute'`
- Mock organisers like “Lumina Academy” with tuition-flavored copy
- Lecturers linked to organiser for **seminar** assignment
- “Attendance” in insights = % of seminar tickets checked in

### Completely missing

| Capability | Status |
|---|---|
| Batch / class / programme | Absent |
| Enrollment / roster / bulk import | Absent |
| Class session + roll-call attendance | Absent (ticket check-in only) |
| Recurring tuition / invoices / arrears | Absent (only one-shot `Order.fee`) |
| Staff roles (cashier, teacher permissions) | Absent |
| Student “my classes / fee balance” | Absent |

## Backend research

[backend/src/main.ts](../backend/src/main.ts):

- Fastify adapter, global prefix `api`, CORS open, port fallback helper
- Controllers: hello + health only
- No Prisma, no modules for auth/seminars/institute

## Implications for the masterpiece build

1. **Do not rewrite the seminar UI** — replace `DataContext` with Nest APIs.
2. **Multi-tenant SaaS:** many institutions + individual lecturers; isolate by organisation; public catalogue is the cross-tenant read.
3. **Two products:** Seminar Ops vs Institute Management — gate by entitlement/plan; seminars work alone.
4. **Three panels:** platform admin (plans, ticket %, CMS), institution admin, individual lecturer — evolve `DashboardLayout` from `/auth/me`.
5. **Platform billing** (doc 12): Free/Premium/Platinum for institutes; configurable % per ticket for seminar sellers — distinct from tuition and ticket face price. Today’s `PlatformSettings` booking fee % should be redesigned into commission + optional display fee.
6. **Register paths** must split: institution vs lecturer vs student (FE today is mostly role-switch demo).
7. **Two attendance systems:** CheckInEvent vs class AttendanceRecord.
8. **CheckoutPages.tsx:** default bank; disable card until PayHere.
