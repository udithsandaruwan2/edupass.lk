# edupass.lk

Frontend for Sri Lanka O/L & A/L **seminar passes** plus **institute tuition** tools (classes, attendance, monthly fees). Built with TanStack Start, React 19, Tailwind, and typed mock services (API-ready).

## Quick start

```sh
npm install
npm run dev
```

Open the app, then append `?dev=1` once to show the **Dev role** toolbar (role switcher + reset data).

## Demo accounts

Any password works.

| Email                   | Role                  |
| ----------------------- | --------------------- |
| student@example.com     | Student (Amaya Silva) |
| nimal@example.com       | Student               |
| admin@edupass.lk        | Platform admin        |
| scan@edupass.lk         | Gate scanner          |
| organizer@lankavidya.lk | Institute organizer   |
| k.perera@edupass.lk     | Lecturer              |

New signups use verification code **123456**.

## Main flows

1. **Browse** `/seminars` or `/lecturers` → seminar detail with countdown → `/checkout/:id`
2. **Pay** by card (instant pass) or bank slip (admin approves at `/admin/payments`)
3. **Pass** lives in `/account/passes` with a real QR payload
4. **Scan** at `/scan` with the pass code to mark attendance
5. **Institute** console at `/institute` — classes, roster, attendance, fees, fee-slip approval

## Stack notes

- Mock store: `src/mocks/store.ts` (localStorage)
- Domain types: `src/domain/types.ts`
- Services: `src/services/api.ts`
- Brand: teal/emerald paper theme — **edupass.lk**

This project syncs with [Lovable](https://lovable.dev). Prefer feature branches; do not force-push rewritten history on the connected branch.
