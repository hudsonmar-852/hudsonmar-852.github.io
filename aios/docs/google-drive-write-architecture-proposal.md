# Proposed Google Drive Write Architecture

Document version: 0.1.0-proposal
Date: 2026-07-28
Owner: Hudson Mar
Prepared by: AIOS Chief Architect review
Decision status: **PROPOSED — NOT APPROVED OR IMPLEMENTED**

## Scope and non-goals

This document proposes a server-side write architecture for the AIOS Work Items
register. It does not authorize account creation, OAuth consent, secret
storage, deployment, data migration or production writes.

Non-goals:

- do not modify raw task specification documents;
- do not place a Google token or service-account key in browser code;
- do not make GitHub Pages an operational database;
- do not treat client-side validation as authorization;
- do not enable automatic merge or architecture approval.

## Required guarantees

Any production write implementation must provide:

1. authenticated server-side execution;
2. explicit role-based authorization;
3. least-privilege Google Drive access;
4. server-side schema and lifecycle validation;
5. idempotency and duplicate-write protection;
6. optimistic concurrency and conflict responses;
7. append-only audit events;
8. recovery and reconciliation for partial failures;
9. backup and rollback;
10. encrypted secret storage and rotation;
11. safe logs that exclude tokens and private task content;
12. testable failure, revocation and stale-version behavior.

## Options

| Option | Security | Cost/free tier | OAuth and permissions | Audit/reliability | Maintenance | Fit |
| --- | --- | --- | --- | --- | --- | --- |
| Google Apps Script Web App | Medium | Strong for a personal prototype; subject to per-user quotas | Simple owner execution, but execution identity and access configuration require care | Script properties/logs are insufficient alone for authoritative audit and concurrency | Low initially, rising with controls | Prototype only |
| Cloudflare Worker + Access + Google OAuth + D1 | High when JWT validation and least privilege are implemented | Strong personal MVP fit; Workers Free currently documents 100,000 requests/day and D1 free allocations | Moderate OAuth complexity; aligns with existing Cloudflare Access decision | Strong: D1 intent/audit state, conflict and reconciliation support | Medium | **Recommended MVP** |
| Controlled backend/API + relational database | Highest control | May require billing and operations | Full per-user OAuth/service identity flexibility | Strongest transactions, audit, queues and observability | High | **Recommended scalable future** |
| GitHub Actions scheduled sync | Good for scheduled service writes, poor for interactive user authorization | Often low incremental cost | Secrets are supported, but user-level interactive identity is weak | Good run logs; weak interactive conflict UX and higher latency | Medium | Scheduled export/reconciliation only |

## Option notes

### Google Apps Script Web App

Benefits:

- native Drive integration;
- fast personal prototype;
- web apps can execute as the owner or accessing user.

Risks:

- owner-executed scripts concentrate authority;
- per-user quotas can stop execution when exceeded;
- user-level authorization, CSRF, idempotency, immutable audit and concurrency
  controls still need custom implementation;
- public/static browser integration can create complex origin and identity
  behavior.

Conclusion: acceptable for an isolated prototype against a non-production
register, not the recommended authoritative AIOS write path.

Official references:

- <https://developers.google.com/apps-script/guides/web>
- <https://developers.google.com/apps-script/guides/services/quotas>

### Cloudflare Worker

Benefits:

- matches the approved Cloudflare Access private-route direction;
- encrypted Worker secrets;
- validated user identity can be carried by the Access JWT;
- D1 can store idempotency, transition intents and append-only audit metadata;
- low personal-MVP cost and operational footprint.

Risks:

- Access headers must not be trusted without signature, issuer and audience
  validation;
- Google OAuth refresh-token lifecycle and revocation require careful handling;
- D1 and Drive cannot share one atomic transaction, so reconciliation is
  mandatory;
- a public GitHub Pages origin should not directly receive write credentials.

Conclusion: recommended personal AIOS MVP after explicit approval and
non-production testing.

Official references:

- <https://developers.cloudflare.com/workers/platform/limits/>
- <https://developers.cloudflare.com/workers/configuration/secrets/>
- <https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/>
- <https://developers.cloudflare.com/d1/platform/limits/>

### Controlled backend/API service

Benefits:

- durable relational transactions and richer authorization;
- queue/outbox processing and centralized observability;
- best fit for multiple users, roles, tenants and higher write volume.

Risks:

- highest cost and maintenance;
- requires deployment, patching, monitoring and incident response;
- premature for the current single-owner MVP.

Conclusion: recommended future architecture when AIOS becomes multi-user or
Drive ceases to be the practical operational store.

### GitHub Actions synchronization

Benefits:

- encrypted repository/environment secrets;
- reproducible scheduled runs and logs;
- useful for periodic public-safe snapshot export and reconciliation.

Risks:

- not an interactive API;
- weak user-level authorization;
- schedule latency and concurrency need explicit controls;
- workflows can expose data through logs/artifacts if carelessly configured.

Conclusion: use only as a secondary scheduled exporter/reconciler, not the
interactive source of truth.

Official references:

- <https://docs.github.com/en/actions/concepts/security/secrets>
- <https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency>

## Recommended personal MVP

### Components

```text
Private admin browser
        ↓ HTTPS
Cloudflare Access
        ↓ signed Cf-Access-Jwt-Assertion
Cloudflare Worker API
        ├─ schema + lifecycle + role validation
        ├─ CSRF/origin check
        ├─ idempotency + expected-version check
        ├─ D1 intent/audit/reconciliation state
        └─ Google Drive API
                ↓
Dedicated AIOS operational work-items file
```

The public GitHub Pages dashboard remains read-only. Write controls live only
on a protected private hostname or application.

### Authentication and authorization

1. Cloudflare Access authenticates the Google identity.
2. Worker validates the JWT signature, issuer, audience, timestamps and type.
3. Worker derives actor identity from the validated token, never request JSON.
4. An explicit server-side role map permits Hudson/admin write operations.
5. Viewer roles remain read-only.
6. CSRF token and strict allowed-origin checks protect browser writes.

Cloudflare documents that merely reading an Access header is insufficient;
signature validation is required.

### Google authorization

For the personal MVP:

- use a Hudson-authorized server-side OAuth client;
- request `drive.file`, not broad `drive`, wherever the dedicated operational
  file can be created by or shared with the application;
- store the refresh token only as an encrypted Worker secret;
- keep file identifiers as server configuration, not public browser state;
- provide explicit revocation and rotation procedures.

Google recommends the narrowest practical scope and identifies `drive.file` as
the safer per-file option. Long-lived server access requires secure refresh
token storage.

Official references:

- <https://developers.google.com/workspace/drive/api/guides/api-specific-auth>
- <https://developers.google.com/identity/protocols/oauth2/web-server>

### Data model

Keep raw task specifications immutable. Write only to a dedicated operational
work-item file containing:

- work item ID and legacy IDs;
- status and expected source version;
- acceptance-state summary;
- owner/assignee identifiers;
- blockers and public-safe reason;
- updated timestamp and audit correlation ID.

Do not store raw private specification text in D1 logs.

### Write protocol

1. Client sends command, expected version and idempotency key.
2. Worker authenticates and authorizes the user.
3. Worker validates schema and transition.
4. D1 transaction inserts a unique `PENDING` intent and audit event.
5. Worker reads current Drive operational file and compares version/hash.
6. On mismatch, mark intent `CONFLICT` and return HTTP 409.
7. Worker applies the minimal status patch to Drive.
8. Worker records returned Drive version/hash and marks intent `COMMITTED`.
9. Response returns sanitized work item and audit correlation ID.
10. A scheduled reconciler retries or alerts on stranded `PENDING` intents.

Repeated idempotency keys return the original result and never repeat a Drive
write.

### Audit

Server-generated fields:

- immutable event ID;
- validated actor ID/email;
- request correlation ID;
- idempotency key;
- item ID;
- from/to status;
- reason/override classification;
- expected and committed source version/hash;
- timestamp;
- outcome and sanitized error code.

Audit events are append-only. Ordinary API roles cannot edit or delete them.

### Rollback

1. Disable the write route or Access policy.
2. Revoke/rotate the Google refresh token.
3. Stop reconciliation.
4. Select a known-good Drive version or apply a reviewed inverse status patch.
5. Append a rollback audit event; never delete the failed event.
6. Re-export a read-only snapshot.
7. Run consistency checks before re-enabling writes.

The first production exercise must use a non-production Drive register and
include forced conflict, duplicate, token-revocation and partial-failure tests.

## Recommended future scalable architecture

Move the same external API and lifecycle contract to a controlled backend with:

- managed relational database as authoritative operational state;
- transactional outbox and queue;
- Drive as a governed document/export destination rather than transactional
  source of truth;
- per-user OAuth connections or workload identity;
- granular RBAC;
- centralized audit retention, metrics, tracing and alerting;
- backup, point-in-time recovery and disaster-recovery drills.

This change would alter the source-of-truth architecture and requires a
separate ADR and migration approval.

## Decisions required from Hudson

1. Approve or reject Cloudflare Worker as the MVP private write runtime.
2. Confirm whether the dedicated Drive operational index may be app-managed
   while raw specifications remain immutable.
3. Choose Hudson OAuth with `drive.file` versus an explicitly shared
   service-account file; default recommendation is Hudson OAuth for personal
   Drive.
4. Approve Cloudflare D1 for operational intent/audit metadata.
5. Confirm the only initial writer identity and any read-only identities.
6. Approve a non-production Drive folder/file for integration testing.
7. Approve retention periods for audit records and Drive versions.
8. Approve the incident/rollback owner.

Until all eight are decided, production writes remain disabled.
