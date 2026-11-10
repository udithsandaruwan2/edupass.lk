# 07 — Runbook (pre-PayHere)

Usable under pressure. PayHere / card is **out of scope** until Phase F.

## Service overview

| Piece | Role |
|---|---|
| `frontend/` | Vite React SPA → Netlify |
| `backend/` | Nest 11 + Fastify `/api` → host TBD |
| Postgres | Prisma schema in `backend/prisma/` |

Critical paths: register → publish seminar → bank checkout → slip approve → ticket QR → check-in; institute tuition cash/slip.

## Deploy

### Frontend (Netlify)

```bash
# Linked site; base directory frontend (see frontend/netlify.toml)
# Build sets VITE_USE_MOCKS=false for production / preview / branch deploys.
npm run build --workspace=frontend
```

Required env: `VITE_API_URL` (Nest `/api` origin).

### Backend

```bash
cd backend
npx prisma migrate deploy   # or db push in non-prod only
npm run build
npm run start:prod
```

Required env: `DATABASE_URL`, `JWT_SECRET`, `PORT` (default 3000). Never commit `.env*`.

## Smoke after deploy

```bash
curl -sf "$API/health"
npm run test:playwright --workspace=frontend   # API_BASE_URL=$API_ORIGIN
```

Manual: student bank checkout → organiser approve slip → ticket appears → check-in once.

## Rollback

| Layer | Action | Duration | Data |
|---|---|---|---|
| Frontend | Netlify → previous production deploy | ~1–2 min | none |
| Backend | Redeploy prior image/commit; keep DB | ~5 min | none if schema compatible |
| Schema | Prefer forward-fix; restore DB snapshot only if migration broke reads | snapshot RPO | education PII — treat carefully |

**Trigger:** checkout/check-in error spike, auth outage, or wrong money lines (tuition vs platform).
**Owner:** human on-call.
**Verify after rollback:** health + one bank-path smoke + one institute tuition cash if institute was live.

## Common failures

| Symptom | First check |
|---|---|
| FE shows demo data on staging | `VITE_USE_MOCKS` must be `false`; rebuild |
| 401 on API | JWT secret mismatch / expired token |
| 403 on `/institute/*` | Org missing `INSTITUTE` entitlement (lecturer vs institution) |
| Card checkout | Expected 501 / disabled until Phase F |
| Slip stuck pending | Organiser payments review path |

## Contacts

- Product / gate approvals: human (see `project/STATE.md`)
- Phase F PayHere: blocked pending owner finance brief
