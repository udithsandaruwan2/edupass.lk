# 03 — Architecture

**Question this phase answers:** what structure makes the product cheap to change for the next year?

Architecture is about **decisions and boundaries**, not diagrams for their own sake. Record the few irreversible choices, make the reversible ones cheap, and move on.

**Gate G3:** the architecture note and at least one ADR are approved; the riskiest technical assumption has a spike or proof.

---

## Inputs

- PRD and catalog (G2)
- NFRs: performance, availability, security, compliance, cost
- Team constraints: skills, timeline, existing systems
- Expected scale: users, data volume, write rate, growth

## Output

- `project/03-architecture.md`
- `project/04-adr/NNNN-*.md` for each irreversible decision
- A **spike** result for the riskiest unknown, if any

---

## Procedure

### 1. Pin the constraints

| Constraint | Value | Source |
|---|---|---|
| Users (year 1) | 500 | PRD |
| Peak writes | 20/s | estimate |
| Data retention | 7 years | compliance |
| Latency budget | p95 < 300 ms | NFR-001 |
| Deployment target | single region | ops |
| Team size | 1–3 | human |
| Budget | < $100/mo infra | human |

Constraints are inputs, not negotiable wishes. If a constraint is unknown, write `unknown` and list the decision it blocks.

### 2. Choose the simplest shape

Start with the smallest architecture that satisfies the constraints. For a product in this framework the default is already chosen — load the profiles, do not re-litigate them unless a constraint forbids them:

```
apps/web (React + Vite → Netlify)
    → apps/api (Django + DRF; FastAPI or Nest if BACKEND_PROFILE says so)
        → database
```

Profiles (load one frontend and one backend, never all):

- `.agents/profiles/layout-split-apps.md`
- `.agents/profiles/web-react-vite-netlify.md`
- `.agents/profiles/api-python-django.md` (default). Alts: `api-python.md`, `api-node-nest.md`

```
Client → API → Database
```

Add a component only when a constraint demands it:

| Pressure | Likely response |
|---|---|
| Read-heavy, repeated queries | cache |
| Long-running work | queue + worker |
| Independent deploy cadence | service boundary |
| Offline use | local-first sync |
| Audit/compliance | append-only log |
| Multi-tenant isolation | tenant key + row-level policy |

Every added component must answer: **what constraint does it satisfy, and what does it cost in operability?** "We might need it later" is not a constraint.

### 3. Compare options explicitly

For each major decision (database, hosting, auth, state management, API style), write 2–3 options:

| Criterion (weight) | Option A | Option B | Option C |
|---|---|---|---|
| Meets NFR-001 (30%) | 5 | 3 | 4 |
| Operability (20%) | 4 | 5 | 2 |
| Cost at year 1 (20%) | 3 | 5 | 4 |
| Team familiarity (20%) | 5 | 2 | 4 |
| Exit cost (10%) | 3 | 4 | 2 |
| **Weighted** | **4.1** | **3.8** | **3.4** |

The score is a conversation starter. The ADR records the **decision and the reason**, not the spreadsheet.

### 4. Define boundaries

Use a lightweight C4 model:

- **Context:** who uses the system, what external systems it talks to.
- **Containers:** deployable units (web app, API, worker, database).
- **Components:** modules inside a container with clear responsibilities.

Rules:

- A module owns its data. Other modules call its interface, not its tables.
- Dependencies point inward: UI → application → domain → infrastructure.
- Shared code is a library, not a junk drawer.
- Every boundary has an owner and a reason to exist.

### 5. Model the data

Write the entities, relationships, and invariants before the schema:

```
User 1—* Workspace 1—* Note
Note: id, workspace_id, body, created_at, updated_at, deleted_at
Invariant: a note always belongs to exactly one workspace.
Invariant: soft delete only; no hard delete without an admin audit event.
```

Include:

- Primary keys and tenancy keys.
- Uniqueness constraints.
- Lifecycle and deletion policy.
- Migration strategy (expand → migrate → contract).
- Data classification and retention.

### 6. Specify contracts

For each external or cross-module interface:

- Input schema and validation rules.
- Output schema and error codes.
- Idempotency and retry semantics.
- Versioning and deprecation policy.
- Authn/authz requirements.

An API contract without error behavior is half a contract.

### 7. Threat model (30 minutes)

Use STRIDE-lite:

| Threat | Question | Mitigation |
|---|---|---|
| Spoofing | can someone pretend to be another user? | authn, session binding |
| Tampering | can data be changed in transit/at rest? | TLS, signatures, audit log |
| Repudiation | can an action be denied? | immutable audit events |
| Information disclosure | can one tenant read another's data? | tenancy checks, row policy |
| Denial of service | what breaks under load/abuse? | rate limits, quotas |
| Elevation of privilege | can a user gain admin rights? | server-side authz, least privilege |

Add agent-specific threats: prompt injection via user content, tool abuse, destructive commands, secret exfiltration. See [08-security.md](08-security.md).

### 8. Observability from day one

Decide before building:

- **Logs:** structured JSON, request ID, user/tenant ID, no secrets.
- **Metrics:** latency, error rate, saturation, business metric.
- **Traces:** one trace per request across boundaries.
- **Alerts:** one page-worthy symptom per critical path.
- **Runbook:** what to check when the alert fires.

If you cannot answer "is it working?" you cannot ship.

### 9. Write ADRs

Use `.agents/templates/adr.md`. One decision per ADR, numbered, immutable.

```markdown
# 0001 — Use Postgres for primary storage

Status: accepted
Date: 2026-10-30
Deciders: human

## Context
We need transactional writes, relational queries, and a managed option under $100/mo.

## Decision
Use managed Postgres 16.

## Alternatives
- SQLite: simpler, but no concurrent multi-instance writes.
- DynamoDB: scales, but query patterns are still changing.

## Consequences
+ Strong consistency and familiar tooling.
− Operational overhead; requires migrations.
− Vendor-specific extensions must be avoided.

## Revisit if
Write volume exceeds 5k/s or multi-region becomes a requirement.
```

An ADR is not a design doc. If it takes more than one page, split it.

---

## Architecture anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Resume-driven development | choosing tech for novelty | tie every choice to a constraint |
| Premature microservices | 6 services, 1 user | start with a modular monolith |
| Shared database across modules | hidden coupling | module-owned data + interfaces |
| No ADRs | decisions relitigated weekly | record irreversible choices |
| "We'll add observability later" | blind in production | instrument the first path |
| Big design up front | 60-page spec, no code | time-box to the riskiest decisions |
| Ignoring exit cost | locked into a vendor | state the migration path |

---

## Exit checklist

- [ ] Constraints are explicit, including unknowns.
- [ ] The simplest viable shape is documented.
- [ ] Major options were compared, not assumed.
- [ ] Boundaries and data ownership are clear.
- [ ] Data model invariants are written.
- [ ] Contracts include errors and idempotency.
- [ ] Threat model covers tenancy and agent-specific risks.
- [ ] Observability plan exists.
- [ ] At least one ADR is accepted.
- [ ] Riskiest technical assumption has a spike or proof.
- [ ] Human approves G3 in `project/STATE.md`.

Next: [04-planning.md](04-planning.md).
