# AIOS Decision Lifecycle Policy

Status: Draft pending `P-GOV-ALIGN-001` approval

Every important proposal/decision retains a unique ID, title, summary, owner,
proposer, status, impact, dates, both confirmations, review dates, dependencies,
conflicts, risks, rollback, supersession, final decision, execution state, and
evidence. Missing approval evidence means `UNVERIFIED`.

`DRAFT → AWAITING_DIRECTION_CONFIRMATION → DIRECTION_CONFIRMED →
AWAITING_EXECUTION_CONFIRMATION → APPROVED → EXECUTING → IMPLEMENTED →
VERIFIED`. Other terminal states are `REJECTED`, `DEFERRED`, `WITHDRAWN`,
and `SUPERSEDED`. History is append-only.

Pending records never disappear automatically. Daily review highlights overdue
P0/P1 records, high-impact conflicts, and active blockers. Weekly review covers
all pending major decisions and rechecks architecture, repository context,
staleness, supersession, and executive recommendations.

Health values are `FRESH`, `AGING`, `REVALIDATION_REQUIRED`, `STALE`,
`OUTDATED_REVIEW_REQUIRED`, and `SUPERSEDED`. Revalidate after the configured
age or when related architecture, PRs, schemas, paths, dependencies, conflicts,
or implementation context changes. Revalidation never manufactures approval.
