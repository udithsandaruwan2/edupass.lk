# ADR-0009 — EduPass Expo app (Student shell + Staff gate)

- **Status:** proposed
- **Date:** `2026-11-12`
- **Deciders:** human (pending G3)
- **Supersedes:** extends ADR-0008

## Context

Owner requires both a **student** mobile experience and an **institute/seminar staff** experience to **scan and verify** QR tickets. Web remains the full organiser/admin product. Nest check-in and student APIs already exist.

## Decision

1. **One Expo app** at `mobile/` (Expo Router, TypeScript).
2. **Two shells** after `/auth/me`:
   - **Student** — tab IA: Home / Explore / Tickets / Learning / Account
   - **Staff Gate** — seminar picker + camera/manual check-in + result feed
3. Shell choice: default Student if no staff membership; default Gate if `SCANNER` (or only staff roles); others with both roles get a switcher.
4. Staff mobile **does not** include seminar CRUD, slip approve, or billing — web only.
5. Auth JWT in `expo-secure-store`; check-in via existing `POST /organiser/check-in`.
6. Optional later: EAS build flavors (`student` / `staff`) with same codebase; v1 = runtime shells.

## Alternatives

| Option | Why not |
|---|---|
| Two separate apps | Double store listing / auth maintenance |
| Staff-only companion + student web | Owner asked student app too |
| Full organiser mobile | XL; out of Phase 9 |

## Consequences

**Positive** — door staff and students share one install; roles already in Nest  
**Negative** — larger IA; camera permission copy must cover both use cases  
**Neutral** — web still required for selling/admin

## Revisit if

- Institutes demand slip-approve on phone
- Store policies force separate staff APK

## References

- `project/09-mobile-student-discovery.md`
- `project/09-mobile-student-prd.md`
- ADR-0008, StaffRole enum
