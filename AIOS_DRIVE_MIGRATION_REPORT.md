# AIOS Drive Migration Report

Status: **PARTIAL — authorization required**.

Completed: created and verified `Hudson AIOS/Communication`. No files were deleted, overwritten, renamed, or had sharing changed.

Pending reversible moves:

1. Move 7,090-byte architecture file `1UiER...` to `00_AIOS Master/Architecture`.
2. Move 4,899-byte duplicate `1XIvh...` to `99_Archive` after human canonical-version confirmation.
3. Move `chatgpt_grok` to `98_Unknown` pending a communication-retention decision.
4. Move `00 Phase 1 Release` to `99_Archive`.
5. Move `AIOS Knowledge Base — 2026-07-13` to `07_Knowledge Base`.

Google rejected the first move with `403 appNotAuthorizedToFile`. The remaining moves were not retried. Rollback for any future move is to restore its recorded original parent, `Hudson AIOS`.

## EO-006 authorization remediation

Repository remediation completed on 2026-08-06:

- The Apps Script manifest now explicitly requests `https://www.googleapis.com/auth/drive`; the previous manifest declared no explicit OAuth scopes.
- `drive.file` is not used because the service must manage existing files that it did not create or open.
- `script.external_request` is omitted because the implementation performs no outbound HTTP requests.
- No `@OnlyCurrentDoc` annotation is present.
- The service uses `DriveApp`, including `moveTo(destination)` for the approved future My Drive migration. It does not use the Advanced Drive API, so `supportsAllDrives` is not applicable to the current implementation.
- `testDriveMigrationAuthorization` provides a non-destructive check of the configured AIOS root, Communication folder, five configured source files, and their current parents.

External authorization remains pending. The Hudson Drive account must configure the two authorization-test Script Properties, run `testDriveMigrationAuthorization` in the Apps Script editor, approve the expanded Drive scope, and preserve the execution log as evidence. No pending file was moved, renamed, deleted, or modified by this remediation.
