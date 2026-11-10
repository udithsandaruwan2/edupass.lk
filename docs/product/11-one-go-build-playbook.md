# 11 — One-go build playbook

Pin these before coding. Details: [12-platform-billing-and-tenancy.md](12-platform-billing-and-tenancy.md).

## Golden rules

1. **Multi-tenant:** many institutions + many individual lecturers; isolate by `organisationId`.
2. **Two products:** Seminar Ops ≠ Institute Management.
3. **Three panels:** platform admin · institution · individual lecturer (employed teachers = scoped).
4. **Platform billing ≠ tuition ≠ ticket price.**
5. Institutions: **Free / Premium / Platinum** (admin-editable). Individuals: **% per ticket** (admin-editable, ~5–6% default).
6. Student money MVP = **bank slip only**; PayHere disabled.
7. **Every seminar** has attendance/check-in.

---

## Build checklist

### A. Foundation

- [ ] Prisma models: User, Org (kinds), membership, plans, subscription, settings  
- [ ] Register routes: student / institution / lecturer  
- [ ] Guards: JWT, OrgScope, Entitlement, PlanLimit  
- [ ] Seed plans + 5% commission + platform admin + sample tenants  
- [ ] FE: three register CTAs; `/auth/me` nav  

### B. Seminars

- [ ] CRUD + public catalogue  
- [ ] `checkInMode` required  
- [ ] Checkout bank + commission snapshot fields on Order  
- [ ] Check-in single-use + attendees  
- [ ] FE catalogue, seller, tickets, scanner page  

### C. Slips & platform fee

- [ ] Seller bank accounts; instructions endpoint  
- [ ] Slip upload/approve → tickets + **PlatformFeeLine**  
- [ ] Lecturer earnings UI  
- [ ] Admin fee revenue list  
- [ ] Checkout: card disabled  

### D. Plans

- [ ] Admin CRUD Free/Premium/Platinum  
- [ ] PUT global `ticketCommissionPercent`  
- [ ] Institution usage + upgrade + pay plan by slip to EduPass account  
- [ ] Enforce caps server-side  

### E. Institute + tuition

- [ ] Staff, batches, roster, sessions, AttendanceRecord  
- [ ] Tuition* models/APIs/UI (name clearly)  
- [ ] 403 individual lecturers  

### F. Polish / HOLD

- [ ] Stream, camera, Playwright  
- [ ] **Do not** enable PayHere until Phase F brief  

---

## Confusion review before merge

- [ ] Institution A cannot read B’s students  
- [ ] Individual has no Classes nav  
- [ ] Admin can change % without deploy  
- [ ] Free plan blocks over-limit writes  
- [ ] UI never labels tuition as “platform fee” or vice versa  
- [ ] Seminar attendance ≠ class roll tables  
