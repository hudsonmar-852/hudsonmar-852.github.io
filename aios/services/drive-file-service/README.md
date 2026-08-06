# AIOS Google Drive File Service

Apps Script web service constrained to `AIOS_ROOT_FOLDER_ID`. It supports `create`, `read`, `update`, `append`, `rename`, `move`, `search`, `create_folder`, `list_folder`, and `get_info`. It never accepts a root ID from callers and exposes no delete command.

Set `DRIVE_FILE_SERVICE_SECRET` to a random high-entropy value and `AIOS_ROOT_FOLDER_ID` to the Hudson AIOS folder in Apps Script Project Settings. Never commit either value. Deploy as the owner and restrict access to the narrowest account scope supported by the deployment. POST JSON with `secret`, `command`, and the command fields.

Deployment: run local tests, use `clasp diff`, create an immutable version, update a test deployment, run the smoke requests in `TEST_PLAN.md`, then promote the existing production deployment only after explicit approval. Roll back by selecting the previous immutable Apps Script version; Drive content is not migrated or deleted by deployment.
