# Discovery note

> Phase 1 · Gate G1 · Draft for approval · Evidence from repo audit + owner-locked product docs (no invented interviews).

## Problem

Sri Lankan O/L & A/L institutes and individual lecturers need one platform that can (a) sell and attend seminars and (b) optionally run institute ops — without forcing both products on every tenant — while EduPass earns via plans and ticket commission. Today the repo has a complete **mock** seminar UI and a Nest **scaffold** only.

## Evidence

| # | Source | Type | What it shows | Link |
|---|---|---|---|---|
| E1 | Frontend audit | Code | Seminar marketplace UI exists; domain in localStorage `edupass-demo-data-v1`; auth is role-switch | `docs/product/02-research-current-state.md`, `frontend/src/contexts/DataContext.tsx` |
| E2 | Backend audit | Code | NestJS 11 + Fastify; only `/api` + `/api/health` | `backend/src/main.ts` |
| E3 | Product vision | Owner docs | Multi-tenant; two products; three admin surfaces; bank-first; PayHere hold | `docs/product/01-product-vision.md` |
| E4 | Platform billing | Owner docs | Free/Premium/Platinum + configurable ticket %; ≠ tuition | `docs/product/12-platform-billing-and-tenancy.md` |
| E5 | Roadmap | Owner docs | Phases 1–7 build order; Phase F PayHere blocked | `docs/product/09-delivery-roadmap.md` |
| E6 | Checkout UI | Code | Methods include `card` and `bank_transfer` — target: bank default, card disabled | `frontend/src/pages/public/CheckoutPages.tsx` |

## Current alternatives

| Segment | Today | Pain | Switching cost |
|---|---|---|---|
| Student | Demo SPA / ad-hoc WhatsApp + bank | No real ticket validity; no durable QR | Low if bank path familiar |
| Individual lecturer | Demo organiser / offline lists | No inventory lock, no platform fee ledger | Med — need bank account + slip habit |
| Institution | Spreadsheets / other school software | No isolated tenant on edupass yet | Med–high if roster migration |
| Platform | Manual | No plans/% admin | Low at MVP |

## Users and jobs

| Segment | Job to be done | Trigger | Success |
|---|---|---|---|
| Student | Buy ticket, prove entry | Seminar announced | Valid QR after slip approved; gate admits once |
| Individual lecturer | Sell seminar without institute suite | Has a revision class to sell | Publish → bank sales → check-in; sees earnings − % |
| Institution admin | Run classes ± seminars in isolation | Needs roster/attendance/tuition | Free plan limits clear; upgrade unlocks |
| Platform admin | Set commercial rules | Launch / change pricing | Edit plans and commission % in `/admin` |
| Scanner / teacher | Admit or mark roll | Event day / class day | Fast QR; class roll separate from ticket scan |

## Assumptions

| # | Assumption | Confidence | Impact if wrong | Test | Result |
|---|---|---|---|---|---|
| A1 | Bank slip latency is acceptable for v1 ticket sales | med | high | First real seller pilot; measure abandon after “awaiting approval” | pending |
| A2 | Individual lecturers will register without institute features | high | med | Seed solo tenant; verify nav has no Classes | pending (build) |
| A3 | Tenant isolation via `organisationId` is enough (single DB) | med | fatal if leak | Dual-org e2e: cannot read other roster/tickets | pending |
| A4 | Existing seminar UI can be API-wired without rewrite | high | med | Feature-flag mocks off after Phase 2–3 | pending |

## Constraints

- Stack locked: React+Vite+Netlify · Nest+Fastify · Prisma/Postgres planned (not Django)
- Money path: bank transfer/deposit + slip; card/PayHere disabled until Phase F
- Scope source of truth: `docs/product/` — do not invent features
- DevOpt installed for delivery gates; product code only after G4

## Non-goals

- Live card gateway, ez_cash/koko live
- Full LMS, seat maps, multi-currency, native apps
- Rewriting frontend from scratch
- Merging seminar CheckInEvent with class AttendanceRecord

## Success metrics

- **Primary:** End-to-end bank seminar path (checkout → slip approve → QR → check-in) on staging — baseline: mock-only → target: real API green
- **Guardrail:** Cross-tenant data leak count = 0; seminars-only tenants see 0 institute nav items
- **Secondary:** Platform admin changes `ticketCommissionPercent` → next order snapshots new rate

## Recommendation

- [x] Proceed (draft) — evidence and owner docs are sufficient to validate the problem and approach for G1
- [ ] Pivot
- [ ] Stop

## Open questions

None blocking G0/G1 — remaining items are build/finance (PayHere timing, exact Free plan numeric caps, production API host). Marked TBD for later gates, not invented here.

**Approved by:** human on 2026-11-10

## Source links

- `docs/product/02-research-current-state.md`
- `docs/product/01-product-vision.md`
- `docs/product/03-domain-model.md`
- `docs/product/11-one-go-build-playbook.md`
