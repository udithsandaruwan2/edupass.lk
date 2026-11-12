# EduPass mobile (Expo)

Companion app for **student tickets + QR** and **scanner check-in** against Nest `/api` (ADR-0008).

## Setup

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:3000/api npm start
```

Use a device/emulator that can reach the API host (not `localhost` from a physical phone — use your LAN IP).

## Screens

1. Sign in → `POST /auth/login`
2. My tickets → `GET /tickets` + on-device QR
3. Scanner (staff) → camera → `POST /organiser/check-in`

Web SPA remains the full product; this app is intentionally thin.
