# Test Plan

Run `node --test aios/tests/drive-file-service.test.mjs`. In a test folder, verify the create/read/update/append/rename/move/search lifecycle, duplicate rejection, outside-root rejection, invalid secret rejection, and content-size limit. Confirm the health GET contains no folder IDs or secrets. Production deployment and shared-secret rotation require human approval.
