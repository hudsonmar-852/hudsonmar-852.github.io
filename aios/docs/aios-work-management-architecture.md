# AIOS Work Management Architecture

Status: Approved direction; phased implementation paused pending phase gates  
Date: 2026-07-29  
Owner: Hudson Mar  
Classification: Public-safe architecture

## Purpose

AIOS work management is one system with three separately deployable modules:

1. read-only ingestion from the private Google Drive task register
2. a public-safe GitHub Pages Work Items dashboard
3. authenticated write-back through a private service

Google Drive remains the operational source of truth. GitHub contains only
public-safe code, schemas, documentation and generated snapshots. A browser
must never receive Google credentials or private task content.

## End-to-end model

```text
Human or approved AI request
  -> private API authenticates identity and validates intent
  -> policy engine authorizes the exact transition
  -> version and idempotency checks run
  -> Google Drive record is updated
  -> immutable audit event is recorded
  -> snapshot builder redacts private fields
  -> versioned public-safe snapshot is published
  -> dashboard displays the new version and sync state
```

The read path and write path remain separate. Failure of public snapshot
publication must not roll back an already-audited Drive update; reconciliation
must restore consistency.

## Module 1 — Read-only ingestion

### Responsibility

- read the approved private task register with least privilege
- validate source records against a versioned schema
- remove private text, identifiers, credentials and internal notes
- produce a deterministic public-safe snapshot
- attach snapshot version, source version, generated time and freshness state
- retain recoverable prior snapshots

### Safe degradation

When Drive or snapshot generation fails, the dashboard may display the most
recent verified snapshot only when it is visibly marked stale. It must never
silently present cached data as current.

### Refresh model

Use scheduled or event-triggered refresh with idempotent rebuilds. A webhook
may request a refresh but must authenticate the sender, validate replay
protection and enqueue work; it must not accept arbitrary snapshot contents.

Incremental reads are an optimization, not the integrity boundary. Every
published snapshot must still pass complete schema and privacy validation.

## Module 2 — Work Items dashboard

### Responsibility

- show summary counts and sync health
- search and filter by public-safe fields
- show dependencies, blockers and acceptance criteria approved for publication
- provide copyable task IDs and governed execution-command templates
- support keyboard access, responsive layout and explicit loading, empty,
  stale and error states

### Local demonstration mode

Until authenticated write-back is approved, state changes are browser-local
demonstrations. The interface must label them as local, keep them visually
separate from the source snapshot and provide clear reset/export controls.

The dashboard must not imply that a local transition changed Google Drive.

### Future authenticated mode

An authenticated action submits only a typed intent to the private API. The
browser does not write Drive records directly and does not decide whether a
transition is authorized.

## Module 3 — Secure write-back

### Required request contract

Each mutation includes:

- work item ID
- requested transition or field patch
- expected source version
- idempotency key
- human-readable reason
- actor session and approved role
- correlation ID

### Required controls

- private server-side Google authentication
- user authentication and field-level authorization
- server-side lifecycle and acceptance-gate enforcement
- optimistic concurrency checks
- idempotency and replay protection
- append-only audit events containing before/after hashes and reasons
- bounded retry with dead-letter or reconciliation handling
- redacted operational logging
- tested backup and rollback procedures

Completion, blocking, approval and override actions always require attributable
identity and a reason.

## AI assistant integration

Grok and ChatGPT may read or write only through explicitly granted connector or
API capabilities. Shared access to a Drive folder is not itself authorization
for every task mutation.

The safe default is:

```text
AI proposes typed intent
  -> system shows exact before/after change
  -> human confirms high-impact action
  -> private API authenticates and authorizes
  -> mutation and audit event commit
```

Low-risk operations may later use pre-approved policy rules. Approval,
completion overrides, permission changes, deletion and publication remain
human-gated.

## Deployment boundaries

### Suitable uses of GitHub

- GitHub Pages: public-safe dashboard and snapshots
- GitHub Actions: scheduled snapshot builds, validation, deployment and
  reconciliation jobs using protected environments and short-lived identity

### Unsuitable use

GitHub Actions is not an interactive low-latency backend for dashboard writes.
Workflow dispatch has queue latency, weak interactive session semantics and an
inappropriate authorization surface for immediate user mutations.

Interactive write-back should use a private API runtime such as Cloud Run,
Cloudflare Workers/Pages Functions or another approved service. GitHub Actions
may process asynchronous maintenance jobs after the write.

## Decisions required before implementation

1. authoritative task storage format and versioned schema
2. Google identity model: service account, delegated identity or user OAuth
3. private API runtime and regional/data-retention requirements
4. user and AI role matrix, including field-level permissions
5. audit store, retention, export and tamper-evidence requirements
6. conflict, retry, reconciliation and disaster-recovery policies
7. public snapshot allowlist and freshness service-level objective
8. confirmation rules for each action-risk class

## Delivery phases and gates

### Phase 0 — Documentation and contracts

- approve the eight decisions
- define source, public snapshot, mutation-intent and audit-event schemas
- complete threat model and rollback plan

Gate: architecture and security review.

### Phase 1 — Read-only ingestion

- build redaction and deterministic snapshot pipeline
- add freshness, version and rollback evidence
- keep the dashboard strictly read-only

Gate: privacy fixtures, failure tests and human review of published fields.

### Phase 2 — Dashboard

- publish search, filters, details and sync health
- retain clearly labelled local demonstration transitions only

Gate: accessibility, browser regression and no-write verification.

### Phase 3 — Private write-back

- implement typed intents, authentication, authorization, concurrency,
  idempotency and append-only audit
- test against a non-production Drive register

Gate: security review, approved/denied identity tests and recovery exercise.

### Phase 4 — AI-assisted operations

- allow assistants to propose typed intents
- require risk-based human confirmation
- add quotas, anomaly monitoring and emergency disable controls

Gate: adversarial testing and explicit production approval.

## Current decision

This document approves the direction and phased gates only. It does not enable
the paused Work Items dashboard, Drive ingestion or Drive write-back code.
Implementation begins only after the Phase 0 decisions and review are complete.

