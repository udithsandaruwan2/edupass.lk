# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com), versioning follows [SemVer](https://semver.org).

## [Unreleased]

### Added

- NestJS 11 + Fastify API (`/api`) with Prisma/Postgres tenancy (T-001).
- JWT auth, register student / institution / lecturer, org-scope + entitlement guards (T-001).
- React/Vite frontend API client, login/register, entitlement-gated nav (T-002).
- Seminar catalogue CRUD, publish + `checkInMode` (T-003).
- Bank-slip checkout, tickets, `PlatformFeeLine` commission snapshot (T-004).
- Organiser check-in + attendees; QR admit-once (T-005).
- Admin plans (Free/Premium/Platinum), global ticket %, usage/upgrade + platform invoices (T-006).
- Institute batches, roster, class sessions, `AttendanceRecord` (≠ CheckInEvent) (T-007).
- Tuition fee plans / invoices / cash + slip; student class-fee balance (T-008).
- Optional `streamJoinUrl`, BarcodeDetector camera QR, Playwright bank-path smoke (T-009).
- Netlify staging/production builds force `VITE_USE_MOCKS=false` (T-009).
- SMTP `MailModule` (welcome, slip approve/reject, tuition invoice, password reset) (T-010).
- Forgot/reset password API + FE wire (T-010).
- Admin **Platform fee revenue** UI from live `PlatformFeeLine` + subscription invoices.

### Changed

- Money naming split: Order ≠ TuitionInvoice ≠ PlatformInvoice / PlatformFeeLine.
- Checkout: bank transfer live; card / PayHere remain disabled (Phase F hold).
- Product default is API mode (`VITE_USE_MOCKS=false`); mock dataset offline-only (T-010).
- Seed QA users/seminars optional via `SEED_QA` (plans/bank/categories always) (T-010).
- Organiser revenue analytics uses membership commission % (not hard-coded 5%).

### Security

- Tenant isolation on org-scoped routes; institute routes require `INSTITUTE` entitlement.
- Individual lecturers receive 403 on `/institute/*`.
- Password-reset codes are single-use, 15-minute TTL; forgot-password does not enumerate emails.

## [0.1.0] — 2026-11-10

### Added

- Agent Project Framework (DevOpt) scaffolding and product documentation under `docs/product/`.
