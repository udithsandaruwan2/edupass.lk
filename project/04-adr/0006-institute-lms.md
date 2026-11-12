# ADR-0006 — Institute LMS on batches

- **Status:** accepted
- **Date:** `2026-11-12`
- **Deciders:** human (Phase 8 scope C)
- **Supersedes:** none

## Context

Phase 8 expands product scope to a real LMS for institutions. Existing institute domain already has Batch, Enrollment, ClassSession, AttendanceRecord. A full Moodle clone is out of scope; we need materials, assignments, submissions, and grades without forking the stack.

## Decision

Build a **thin institute LMS** hanging off `Batch` / `InstituteEnrollment`: `CourseModule`, `Material`, `Assignment`, `Submission`, `Grade`. APIs under `/institute/lms/*` and student `/student/lms/*`, gated by INSTITUTE entitlement + plan. Teachers (StaffRole.TEACHER|ADMIN|OWNER) manage content for assigned batches; students access via enrollment.

## Alternatives

| Option | Why not chosen |
|---|---|
| Separate LMS microservice | Unnecessary ops cost for v0.2 |
| Moodle/Canvas embed | Heavy, multi-currency/SSO complexity |
| Seminar-only materials | Does not serve institute class portal |

## Consequences

**Positive**
- Reuses tenancy, staff roles, enrollments
- Demoable vertical slice without quiz engines

**Negative**
- File storage required for materials/submissions
- Plan limits may need LMS feature flags later

**Neutral**
- No SCORM/quizzes/forums in this ADR

## Revisit if

- Institutions demand quizzes/SCORM
- File egress costs exceed budget

## References

- `docs/product/03-domain-model.md`
- Phase 8 plan FEAT-017
