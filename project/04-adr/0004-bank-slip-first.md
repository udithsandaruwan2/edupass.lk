# ADR-0004 — Bank transfer/deposit first; PayHere held

- **Status:** accepted
- **Date:** 2026-11-10
- **Deciders:** human (chat + product docs)
- **Supersedes:** none

## Context

Owner deferred card gateway. FE already shows card + bank_transfer. Platform still needs fee lines and plan invoices.

## Decision

Live student and plan payments via **bank transfer/deposit + slip upload + approve**. Keep card/PayHere in domain and UI as **disabled**. `PAYHERE_ENABLED=false`. Phase F unlocks gateway when owner briefs finance.

## Alternatives

| Option | Why not chosen |
|---|---|
| PayHere MVP | Explicitly held |
| Cash-only | Insufficient for remote seminar sales |

## Consequences

**Positive:** Shippable money path without merchant integration.  
**Negative:** Approval latency; manual refunds.  

## Revisit if

- Owner starts Phase F / finance stage.

## References

- `docs/product/12-platform-billing-and-tenancy.md`
- `docs/product/06-user-flows.md`
