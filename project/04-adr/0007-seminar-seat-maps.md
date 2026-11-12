# ADR-0007 — Seminar seat-map inventory

- **Status:** accepted
- **Date:** `2026-11-12`
- **Deciders:** human (Phase 8 scope C)
- **Supersedes:** none

## Context

TicketType capacity counters alone cannot represent reserved seating. Phase 8 requires optional venue grids with checkout seat selection and no oversell.

## Decision

Add optional `VenueLayout` + `Seat` per seminar (or reusable layout). Checkout creates short-TTL `SeatHold` rows; on bank slip approve / paid, holds convert to `TicketSeat` links. Seminars without a layout keep legacy TicketType.sold/capacity behavior. Holds expire via cleanup job or lazy reclaim on next checkout.

## Alternatives

| Option | Why not chosen |
|---|---|
| Always require seat maps | Breaks current general-admission seminars |
| Soft allocation only in FE | Oversell under concurrency |
| Third-party seating SaaS | Cost and Sri Lanka payment coupling |

## Consequences

**Positive**
- Transactional inventory for reserved seating
- Opt-in per seminar

**Negative**
- More complex checkout path
- Editor UX non-trivial

**Neutral**
- GA seminars unchanged

## Revisit if

- Need section pricing / accessibility seat types as first-class
- Hold TTL conflicts with bank-slip latency (extend TTL or pay-first)

## References

- ADR-0004 bank-slip-first
- Phase 8 FEAT-018
