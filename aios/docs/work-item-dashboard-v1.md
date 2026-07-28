# AIOS Work Item Dashboard v1

Status: Implementation complete; pending Chief Architect review  
Task: WI-20260728-002 / TASK-20260728-002  
Date: 2026-07-28

## Objective

Provide a governed operational view of AIOS engineering work without turning
the public GitHub Pages repository into a database or exposing private Google
Drive task specifications.

## Architecture review and impact analysis

The existing AIOS Project Control dashboard is a static, data-driven GitHub
Pages application. It has no authenticated server runtime or credential store
that can safely update Google Drive. Existing Cloudflare code only proves an
Access boundary at `/private-test/`; it is not a Drive integration.

The implementation therefore uses the task specification's safe first-phase
fallback:

1. Google Drive remains the authoritative operational source.
2. `work-items.json` is a public-safe, read-only snapshot/index.
3. The full source specification is linked but never copied into the public
   repository.
4. Browser changes use an explicit local demo adapter and `localStorage`.
5. The UI never claims a demo transition was written to Drive.

This is additive. The current dashboard, production readiness, Jeffrey,
AvatarOS, public registries and existing navigation remain intact.

## Components

- `/aios/work-items/` — responsive task register, filters, quick views, detail
  dialog, activity history and status actions.
- `/work-items.json` — versioned machine-readable operational snapshot.
- `/TASK_INDEX.md` — human-readable public-safe index.
- `aios/work-items/engine.mjs` — status machine, priority ordering, filters,
  parser, conflict detection and command generation.
- `aios/work-items/adapters.mjs` — read-only snapshot and local demo adapters.
- `aios/schemas/work-items.schema.json` — published data contract.

The adapter surface implements:

- `listWorkItems`
- `getWorkItem`
- `updateWorkItem`
- `createWorkItem`
- `sync`
- `getGovernanceDocument`

The first four are available through the local demo adapter. Drive update and
create operations deliberately return `READ_ONLY_DRIVE`.

## Workflow rules

Supported states:

`BACKLOG → READY → IN_PROGRESS → REVIEW → COMPLETED → ARCHIVED`

Additional governed paths:

- `REVIEW → CHANGES_REQUESTED → IN_PROGRESS`
- Any active status may move to `BLOCKED`.
- `BLOCKED → READY` or `BLOCKED → IN_PROGRESS`.

Controls:

- `BACKLOG → READY` requires recorded approval.
- `BLOCKED` and `CHANGES_REQUESTED` require a reason.
- `COMPLETED` requires all acceptance criteria, or a recorded override reason.
- Completion and archive actions require browser confirmation.
- Every local transition appends actor, time, reason, from/to status and mode
  to the activity record.

## Loading, error and stale behavior

- The page shows skeleton metrics and a loading state during sync.
- Non-2xx snapshot responses produce an explicit error state.
- An empty filter result is distinct from a fetch failure.
- Cache age is compared with `freshForMinutes`; stale data is labeled.
- Missing governance documents are shown as a warning, not hidden.
- Private raw task content is never used as a fallback.

## Security and privacy

- No Google credentials, OAuth tokens, task text or private API endpoints are
  present in browser code.
- Source links are HTTPS and require the user's existing Drive authorization.
- Dynamic values are HTML escaped before rendering.
- The snapshot declares `authenticated_private` source access and
  `contentPublished: false`; production validation enforces both.
- A server-side adapter must use encrypted platform secrets and authenticated
  requests. It must never ship a refresh token to the browser.

## Migration

No data migration is required for the current static dashboard.

To enable real Drive writes later:

1. Obtain Hudson approval for the repository governance drafts and place the
   approved versions under `AIOS PMO/00_Governance`.
2. Confirm whether Jeffrey PR #7 is TASK-20260728-001 and register the result.
3. Approve a server runtime and identity model.
4. Implement the same adapter contract on the server.
5. Add idempotency, conflict/version checks and append-only audit persistence.
6. Run the integration suite against a non-production Drive folder.
7. Change `updateMode` only after production write/read verification.

## Rollback

Revert the TASK-20260728-002 commit. This removes:

- the `/aios/work-items/` route,
- the additive Project Control link,
- the snapshot, schema and index,
- tests and documentation.

No Drive data is changed, so Drive rollback is unnecessary. Browser demo data
can also be removed with **Reset local changes**.

## Known limitations and risks

- Drive writes are not configured.
- Governance documents exist as repository drafts but are not approved or
  present in AIOS PMO.
- TASK-20260728-001 is PARTIALLY VERIFIED; the matching implementation evidence
  exists, but the original task record and formal mapping are missing.
- The read-only snapshot is refreshed by an engineering update, not an
  automated authenticated job.
- Public metadata must remain deliberately minimal as new work items are added.

## Test strategy

Automated coverage includes:

- every status gate and invalid transition;
- approval, reason and completion requirements;
- priority sort, summary counts, filters and search;
- task header parsing and source/index conflict detection;
- Codex command generation;
- read-only Drive failure and missing governance behavior;
- local demo persistence and audit history;
- privacy assertions and stale-cache inputs;
- page navigation, accessibility surfaces, copy behavior and UI states;
- existing repository JSON, asset, local link and secret validation.

Browser checks cover desktop and mobile layout, filter behavior, dialog
interaction, clipboard actions, status changes and local reset.

## Before and after screenshots

- [Before — AIOS Project Control without Work Items](./assets/work-item-dashboard-before.png)
- [After — Work Items desktop register](./assets/work-item-dashboard-after-desktop.png)
- [After — Work Items mobile detail](./assets/work-item-dashboard-after-mobile.png)

## Success criteria

The module is ready for MVP use when automated and browser validation pass.
Production Drive update capability remains a separate architecture-approved
task and must not be inferred from this release.
