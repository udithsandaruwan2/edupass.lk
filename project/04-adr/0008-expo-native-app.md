# ADR-0008 — Expo native companion app

- **Status:** accepted
- **Date:** `2026-11-12`
- **Deciders:** human (Phase 8 scope C)
- **Supersedes:** none

## Context

Phase 8 requires native apps. Rewriting the Vite SPA is out of scope. Gate scanners and students need mobile QR admit / ticket display.

## Decision

Add an **Expo (React Native)** app at `mobile/` in the monorepo. v1 screens: auth against Nest `/api`, student My Tickets + QR, scanner check-in (camera). Share types via thin API client; do not duplicate Nest business logic. Vite SPA remains the full web product.

## Alternatives

| Option | Why not chosen |
|---|---|
| Capacitor wrap of Vite | Camera/QR and offline UX weaker |
| Flutter | Second language; team is TS |
| PWA only | Explicit native scope from owner |

## Consequences

**Positive**
- One API; fast student/scanner MVP
- Same auth tokens as web

**Negative**
- Extra CI/store pipeline later
- Feature parity lag vs web

**Neutral**
- No offline-first sync in v1

## Revisit if

- Need full organiser seminar CRUD on mobile
- App store policy forces separate OAuth

## References

- Phase 8 FEAT-019
- `.agents/profiles/web-react-vite-netlify.md` (web remains primary)
