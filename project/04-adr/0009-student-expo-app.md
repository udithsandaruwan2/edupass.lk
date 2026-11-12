# ADR-0009 — Full Student Expo (React Native) app

- **Status:** proposed
- **Date:** `2026-11-12`
- **Deciders:** human (pending G3)
- **Supersedes:** extends ADR-0008 (companion remains origin; this expands scope)

## Context

Phase 8 delivered a thin Expo companion (tickets + scanner). Owner wants a **full student React Native app** with every student feature. Web SPA stays for organisers/admin. Nest `/api` is the source of truth.

## Decision

1. **Evolve `mobile/`** into **EduPass Student** (Expo SDK, TypeScript, **Expo Router** file-based nav).
2. **Student-first IA:** tabs = Home / Explore / Tickets / Learning / Account (exact labels TBD in UI pass).
3. **API:** typed client wrapping Nest (reuse contracts from `frontend/src/api/*` patterns; extract shared package later if duplication hurts).
4. **Auth:** JWT in `expo-secure-store`; same register/login/reset/change-password endpoints.
5. **Media:** `expo-image-picker` / document picker for bank + tuition slips; `expo-camera` only if scanner flavor kept.
6. **Scanner:** demote to optional staff entry or separate build profile — not the student home.
7. **Stores:** internal distribution first; Play/App Store as Phase 9b after G5 mobile.

## Alternatives

| Option | Why not |
|---|---|
| New `apps/student-native` repo | Split monorepo; slower |
| Capacitor wrap of Vite | Weaker native QR/slip UX; owner asked RN |
| Flutter | Second language |
| Include organiser mobile now | XL; web already complete |

## Consequences

**Positive** — one codebase path from ADR-0008; full student journey on device  
**Negative** — larger `mobile/`; store compliance work later  
**Neutral** — web still required for sellers/admin

## Revisit if

- Need organiser mobile within 90 days
- Shared TS package extraction becomes urgent
- Offline-first demanded by institutes

## References

- `project/09-mobile-student-discovery.md`
- `project/09-mobile-student-prd.md`
- ADR-0008
