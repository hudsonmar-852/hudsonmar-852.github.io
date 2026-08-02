# AIOS Governance Decision Log

Main-branch scope notice: this remains a draft governance record. References to
the Work Items or Google Drive read-only prototype are retained as review
evidence only; those implementations are paused and excluded from this change.

## Proposed direction: phased AIOS work management

Status: **DIRECTION RECORDED; IMPLEMENTATION PAUSED**

The system direction now separates read-only Drive ingestion, the public-safe
Work Items dashboard and authenticated private write-back. The approved
architecture direction and phase gates are recorded in
`aios/docs/aios-work-management-architecture.md`. Identity, runtime,
authorization, audit, recovery and public-snapshot decisions remain required
before implementation.

Document version: 0.1.0-draft
Date: 2026-07-28
Owner: Hudson Mar
Maintainer: AIOS engineering
Review status: Draft — human approval pending

## Authority and labels

This log consolidates public-safe governance references without replacing the
machine-readable decision registry at
[`aios/data/decisions.json`](../data/decisions.json) or historical ADRs.

- **APPROVED HISTORICAL** — approval is already recorded in repository
  evidence.
- **IMPLEMENTED, REVIEW PENDING** — code exists but the current governance
  package still requires human review.
- **PROPOSED** — no approval or implementation authority.
- **PARTIALLY VERIFIED** — supporting evidence exists but formal traceability is
  incomplete.

Amendment Candidates and Discussion Queue entries are not decisions. They must
not be automatically merged or promoted to approved status.

## Existing approved decisions

| Decision | Status | Evidence |
| --- | --- | --- |
| Maintain public/private two-layer architecture | APPROVED HISTORICAL | `aios/data/decisions.json`, `public-private-separation` |
| Protect Prompt and Grok studios | APPROVED HISTORICAL | `prompt-studio-privacy` |
| Adopt Runtime Reliability v2 | APPROVED HISTORICAL | `runtime-reliability-v2` |
| Adopt one-request evolution workflow | APPROVED HISTORICAL | `one-request-evolution-engine` |
| Persist amendment discussion registry | APPROVED HISTORICAL | `persistent-amendment-registry` |
| Use Cloudflare Access with Google OAuth for private portals | APPROVED HISTORICAL; external setup pending | `AIOS-SEC-003` |
| Use Cloudflare/GitHub encrypted secret stores; no paid password-manager requirement | APPROVED HISTORICAL | `AIOS-SEC-004` |

## D-20260728-001 — Work Items read-only source boundary

Status: **IMPLEMENTED, REVIEW PENDING**

### Problem

The public AIOS dashboard needs task visibility, while Google Drive task
specifications and credentials must remain private.

### Alternatives considered

1. Put Drive OAuth credentials in browser JavaScript.
2. Republish full task specifications as public JSON.
3. Publish a minimal read-only snapshot and keep raw specifications in Drive.

### Decision implemented

Option 3. Google Drive remains the operational source; the public repository
contains only a minimal snapshot and authenticated source link. Browser changes
are labeled local demo data.

### Reasoning

Options 1 and 2 violate the approved public/private boundary. The read-only
fallback is reversible and does not create a false production-write claim.

### Trade-offs

- Operational status can become stale until a governed sync exists.
- Local demo activity is not authoritative or cross-device.

### Impact and rollback

Implemented by commit `e7261d3`. Revert that commit to remove the feature. No
Drive content is changed.

### Approval

Chief Architect engineering assessment: **APPROVED WITH CONDITIONS** for MVP
review. Hudson approval and normal CI/PR review remain required before merge.

## D-20260728-002 — Work item lifecycle and completion gates

Status: **IMPLEMENTED, REVIEW PENDING**

### Decision implemented

Use the lifecycle BACKLOG, READY, IN_PROGRESS, REVIEW,
CHANGES_REQUESTED, BLOCKED, COMPLETED and ARCHIVED. Require:

- recorded authorization for BACKLOG to READY;
- a reason for BLOCKED and CHANGES_REQUESTED;
- complete acceptance criteria or a recorded override for COMPLETED;
- an activity event for each local transition.

### Trade-offs

Client-side validation improves UX but is not a security or integrity boundary.
The same rules must be enforced server-side before production writes are
enabled.

### Evidence

- `aios/work-items/engine.mjs`
- `aios/tests/work-items.test.mjs`
- commit `e7261d3`

## D-20260728-003 — TASK-20260728-001 evidence mapping

Status: **PARTIALLY VERIFIED**

### Finding

Jeffrey Curator Engine v2 PR #7 matches the described Reminder Demo rebuild and
has complete code, test, merge and deployment evidence. No original
TASK-20260728-001 specification or explicit task-ID reference exists in the
searched repositories and branches.

### Decision

Do not silently create the missing formal link. Record the candidate mapping as
PARTIALLY VERIFIED until Hudson confirms it.

### Evidence

[`aios/reviews/dependency-20260728-001-evidence.md`](../reviews/dependency-20260728-001-evidence.md)

## D-20260728-004 — Server-side Google Drive write architecture

Status: **PROPOSED — HUMAN APPROVAL REQUIRED**

### Problem

AIOS needs governed task-status writes without exposing credentials or allowing
unauthorized, duplicate or conflicting updates.

### Alternatives considered

- Google Apps Script Web App
- Cloudflare Worker with Cloudflare Access, Google OAuth and D1 audit state
- controlled backend/API service
- GitHub Actions scheduled synchronization

### Proposed decision

For the personal MVP, use a protected Cloudflare Worker API behind Cloudflare
Access, with encrypted Google OAuth credentials, least-privilege `drive.file`
scope, D1 append-only intent/audit records, idempotency keys and optimistic
version checks. Keep source task documents immutable; update a dedicated Drive
work-item index.

For later multi-user production, move the same API contract to a controlled
backend with a durable relational database, transactional outbox, per-user
authorization and centralized observability.

### Approval state

Not approved. No code, credentials, accounts or production writes may be
created from this proposal.

### Evidence

[`aios/docs/google-drive-write-architecture-proposal.md`](../docs/google-drive-write-architecture-proposal.md)

## D-20260728-005 — Architecture Freeze

Status: **NOT APPROVED**

The Work Items MVP may proceed to human review under the conditions in the
Architecture Review Package. Architecture Freeze and production Drive writes
remain blocked until Hudson resolves the recorded decisions and production
identity/storage controls are validated.

## Decision-change procedure

1. Record a new decision or ADR; do not overwrite historical decisions.
2. Identify affected contracts, tests, migrations and rollback.
3. Keep Amendment Candidates and Discussion Queue items in review state.
4. Obtain human approval where required.
5. Implement on a feature branch.
6. Pass local and CI validation.
7. Merge only through the approved repository workflow.
