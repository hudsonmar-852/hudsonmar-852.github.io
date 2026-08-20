# Test Plan

Run `node --test aios/tests/drive-file-service.test.mjs`. In a test folder, verify the create/read/update/append/rename/move/search lifecycle, duplicate rejection, outside-root rejection, invalid secret rejection, and content-size limit. Confirm the health GET contains no folder IDs or secrets. Production deployment and shared-secret rotation require human approval.

Authorization smoke test: configure `AIOS_ROOT_FOLDER_ID`, `AIOS_COMMUNICATION_FOLDER_ID`, and exactly five comma-separated IDs in `AIOS_PENDING_SOURCE_FILE_IDS`; select `testDriveMigrationAuthorization` in the Apps Script editor and run it as the Hudson account that owns or can manage the AIOS content. Re-authorize the full Google Drive scope when prompted. Success requires `ok: true`, accessible root and Communication folders, five accessible sources, and no `403`. This test is read-only. Do not execute a move command as part of authorization testing.
