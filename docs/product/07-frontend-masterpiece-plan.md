# 07 — Frontend masterpiece plan

Production SPA from the Vite demo: **multi-tenant**, three admin surfaces, bank-first checkout, platform billing UX, institute UI only when planned.

## Principles

1. Keep router/`App.tsx`; evolve `DashboardLayout` into actor-aware nav (or thin layout variants).
2. Replace `DataContext` via API + `VITE_USE_MOCKS`.
3. Never show institute chrome to individual lecturers or Free users without institute feature.
4. Label money clearly: ticket price vs platform fee % vs tuition vs plan subscription.
5. Preserve visual tokens in `frontend/src/styles/index.css`.

## Surfaces to implement

| Surface | Work |
|---|---|
| Public + student | Catalogue, cart, bank checkout, tickets, refunds |
| Individual lecturer panel | Seminars, check-in, slips, bank account, **earnings** (gross − %) |
| Institution panel | Staff, students, classes, tuition, optional seminars, **plan usage + upgrade** |
| Platform admin | Plans CRUD, commission %, tenants, revenue, CMS, slips, refunds |

## Workstreams

### 1. API client + auth

- `api/client.ts` + modules including `billing.ts`.
- Register CTAs: Student | Institution | Lecturer (three entry points).
- `/auth/me` drives nav: `tenantKind`, `plan`, `entitlements`, `commissionPercent`.

### 2. Checkout (`CheckoutPages.tsx`)

- Default `bank_transfer`; disable card (“Coming soon”); hide ez_cash/koko for MVP.
- Optional receipt line: platform service included in seller settlement (student-facing copy keep simple).
- Post-pay: “Awaiting approval” until slip approved.

### 3. Seminar Ops

- Catalogue + seller CRUD + QR tickets + check-in/attendance for every seminar.
- Camera scanner in polish phase.

### 4. Platform billing UI

- Admin: plans table (Free/Premium/Platinum), edit limits/prices, edit global %.
- Institution: “You’re on Free — X/Y batches”; upgrade wizard + slip to EduPass.
- Lecturer: settings card “Platform fee: 5% per ticket” (read-only from API).

### 5. Institute Management

- Gated routes `RequireEntitlement('institute')` + plan feature.
- Pages under `pages/organiser/institute/*` (tuition named clearly, not “platform fee”).

### 6. Polish

- Empty/loading/error; DemoBanner off when mocks off; Playwright bank path + plan limit message.

## Non-rewrites

No new meta-framework; no second repo; mocks until seminar bank path + registration kinds work.
