# AIOS Google Drive File Service

Apps Script web service constrained to `AIOS_ROOT_FOLDER_ID`. It supports `create`, `read`, `update`, `append`, `rename`, `move`, `search`, `create_folder`, `list_folder`, and `get_info`. It never accepts a root ID from callers and exposes no delete command.

Set `DRIVE_FILE_SERVICE_SECRET` to a random high-entropy value and `AIOS_ROOT_FOLDER_ID` to the Hudson AIOS folder in Apps Script Project Settings. Never commit either value. Deploy as the owner and restrict access to the narrowest account scope supported by the deployment. POST JSON with `secret`, `command`, and the command fields.

The manifest explicitly requests `https://www.googleapis.com/auth/drive` because this private root-scoped service must manage existing files that it did not create. It does not request `drive.file` or `script.external_request`. After a scope change, the deploying Hudson Drive account must run `testDriveMigrationAuthorization` once in the Apps Script editor and approve the new Drive permission.

For the read-only EO-006 authorization check, configure `AIOS_COMMUNICATION_FOLDER_ID` and `AIOS_PENDING_SOURCE_FILE_IDS` (exactly five comma-separated file IDs) as Script Properties. The function reads the root folder, Communication folder, each source file, and their parents; it does not move, rename, delete, or modify anything. Keep these IDs in Script Properties rather than source control.

Deployment: run local tests, use `clasp diff`, create an immutable version, update a test deployment, run the smoke requests in `TEST_PLAN.md`, then promote the existing production deployment only after explicit approval. Roll back by selecting the previous immutable Apps Script version; Drive content is not migrated or deleted by deployment.
