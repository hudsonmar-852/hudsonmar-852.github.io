# AIOS Security Center Lite v1

Status: Active
Scope: Lightweight governance for public repositories

## Storage model

### Password manager
Use 1Password or Bitwarden as the source of truth for:
- API keys
- access tokens
- webhook secrets
- production credentials
- recovery codes
- sensitive personal records

### GitHub Actions Secrets
Use only for credentials required by CI/CD. Do not use GitHub Secrets as the complete vault or long-term inventory.

### Public repository
Store only:
- secret names or IDs
- owner role
- environment
- review and rotation dates
- public-safe procedures

Never store real secret values.

## Minimum workflow

1. Create the credential in the service provider.
2. Save the value directly into the password manager.
3. Record metadata in the private Secret Inventory.
4. Add only the required CI/CD value to GitHub Actions Secrets.
5. Reference it in code through an environment variable.
6. Validate that no value appears in files, commit messages, logs or screenshots.
7. Rotate and revoke immediately after suspected exposure.

## Publication Gate

Before every public push, confirm:

- [ ] No API key, token, password or private key
- [ ] No webhook URL or endpoint containing a secret
- [ ] No `.env` or exported vault file
- [ ] No personal identity or private relationship data
- [ ] No production system prompt or private workflow detail
- [ ] No credential in screenshots, logs, examples or commit messages
- [ ] Only public-safe metadata is included

## Naming standard

Environment variables:

```text
SERVICE_PURPOSE_ENV
OPENAI_CONTENT_PROD
GITHUB_DEPLOY_PROD
GOOGLE_DRIVE_AUTOMATION_TEST
```

GitHub Actions secret names should identify service, purpose and environment without exposing the value.

## Incident response

When exposure is suspected:

1. Revoke or rotate the credential first.
2. Stop affected automation.
3. Remove the value from current files and logs.
4. Purge it from Git history where required.
5. Review access and recent activity.
6. Record the incident without recording the leaked value.

## Boundary

ChatGPT may help design inventories, checklists, naming, migration and review procedures. ChatGPT must not be treated as the storage location for secret values.
