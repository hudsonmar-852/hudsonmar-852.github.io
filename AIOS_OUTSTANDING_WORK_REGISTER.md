# AIOS Outstanding Work Register — EO-006

Evidence date: 2026-08-06. Baseline: `origin/main` at `cb3ae91`.

## P0

No local build, startup, data-loss, or secret-exposure failure detected.

## P1

- Drive migration authorization — existing Drive items return `403 appNotAuthorizedToFile`; grant the Google Drive app write access and execute the five moves in `AIOS_DRIVE_MIGRATION_REPORT.md`.
- Release review — run CI for the EO-006 draft PR and obtain mandatory architecture, security, visual QA, and human release approval.

## P2

- Reconcile or close seven legacy draft PRs; PRs 1, 13, 14, 15, and 20 are reported non-mergeable against current `main`.
- Deploy and smoke-test the Apps Script Drive File Service using an immutable version and rotated shared secret.
- Connect durable Mission Manager storage; the MVP currently uses an injectable in-memory store boundary.
- Replace orchestrator mock providers when approved provider credentials and runtime boundaries exist.

## P3

- Add browser visual regression coverage for the Executive Dashboard.
- Increase negative and concurrency testing for plugin events, mission persistence, and Apps Script quotas.

## Inventory findings

- Open PRs: 7, all draft.
- Open issues: 1 (`#16`, Jeffrey reminder logic; outside EO-006 core scope).
- Remote branches observed: 26 including `main`.
- TODO/FIXME scan: no executable core placeholders found; legacy AvatarOS dashboard text still describes an historical placeholder milestone.
