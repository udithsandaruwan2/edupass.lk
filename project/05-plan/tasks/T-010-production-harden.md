# T-010 — Production harden (demo purge + SMTP)

- **Milestone:** M5 — Production polish
- **Size:** L (sliced)
- **Risk:** high (auth + email + money copy)
- **Depends on:** T-009
- **Status:** done

## Goal

Observable: with `VITE_USE_MOCKS=false`, the public site and dashboards show **only API/DB data** (empty when none); users **self-register**; transactional email goes out over **SMTP** for signup and key payment/ticket events. No demo accounts, demo OTP, or “sample data” copy in product UI.

## Slices

| ID | Slice | Acceptance |
|---|---|---|
| T-010a | Remove demo UX (login chooser, switchRole, reset demo, demo badges, DEMO OTP) | No “demo” strings in auth/nav settings |
| T-010b | Catalogue empty-by-default when mocks off; no mock seminar flash | Home/seminars empty until API data |
| T-010c | Nest MailModule (SMTP) + welcome on register + slip-approved + tuition invoice issued | Emails queued/sent when SMTP configured; no-op log when not |
| T-010d | Seed = platform plans/settings/bank only (no required demo users for product) | Register paths work without seed users |
| T-010e | Ticket QR drop DEMO prefix in API mode; copy polish | QR uses real ticket code |

## Out of scope

- PayHere / card enablement (Phase F)
- Full i18n
- Marketing email campaigns
- Deleting Prisma seed entirely (keep ops seed for plans)

## Constraints

- Bank-first payments stay
- Never commit SMTP secrets
- Human-only G6

## Verification

```bash
npm run typecheck --workspace=frontend
npm test --workspace=backend
npm run test:e2e --workspace=backend
```
