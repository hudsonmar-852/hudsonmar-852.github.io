# AIOS Security Center Lite v2

Status: Active  
Scope: Lightweight governance for public and private AIOS services  
Decision: AIOS does not require 1Password or another paid password manager at the current stage.

## Storage model

### Runtime secrets

Use Cloudflare encrypted secrets for credentials required by Cloudflare Pages, Workers or protected backend services.

### CI/CD secrets

Use GitHub Actions Secrets only for credentials required by CI/CD. Do not publish secret values or use repository files as a vault.

### Private documents

Use Google Drive account permissions for private documents. Do not expose folder IDs, private prompts or access configuration in public dashboard data.

### Public repository

Store only public-safe metadata:

- stable secret ID
- owner role
- environment
- approved storage type
- review and rotation dates
- public-safe procedures

Never store real secret values.

## Minimum workflow

1. Create the credential in the service provider.
2. Store the value directly in Cloudflare encrypted secrets or GitHub Actions Secrets according to runtime need.
3. Record metadata only in the private Secret Inventory.
4. Reference the credential through an environment variable.
5. Validate that no value appears in files, commit messages, logs or screenshots.
6. Rotate and revoke immediately after suspected exposure.
7. Record the change without copying the secret value.

## Publication Gate

Before every public push, confirm:

- [ ] No API key, token, password or private key
- [ ] No webhook URL or endpoint containing a secret
- [ ] No `.env` file with real values
- [ ] No personal identity or private relationship data
- [ ] No production system prompt or private workflow detail
- [ ] No credential in screenshots, logs, examples or commit messages
- [ ] Only public-safe metadata is included

## Authentication

Private AIOS routes use Cloudflare Access with approved Google OAuth identities. AIOS does not create or store usernames and passwords. Repository assets do not prove that Cloudflare account configuration is live; production status remains pending until an approved and unapproved account test both pass.

## Incident response

1. Revoke or rotate the credential first.
2. Stop affected automation.
3. Remove the value from current files and logs.
4. Purge it from Git history where required.
5. Review access and recent activity.
6. Record the incident without recording the leaked value.

## Boundary

ChatGPT and Codex may design inventories, validation, migration and review procedures. They must never be treated as storage locations for secret values.
