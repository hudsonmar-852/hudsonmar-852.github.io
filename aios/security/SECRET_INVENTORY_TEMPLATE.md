# AIOS Secret Inventory Template

> This file records metadata only. Never paste a real secret, token, password, recovery code, private key or webhook URL here.

| Secret ID | Service | Purpose | Environment | Storage Location | Owner | Created | Last Rotated | Next Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| SEC-001 | Example Service | Example purpose | Production | 1Password / Bitwarden item name only | Owner role | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | Active |

## Allowed values

- Environment: Development / Test / Production
- Storage Location: password manager item name, GitHub Actions secret name, or protected backend reference
- Status: Active / Expiring / Revoked / Replaced

## Rules

1. Store only references and dates, never the secret value.
2. Use a stable Secret ID so applications do not depend on vendor-specific names.
3. Rotate immediately after suspected exposure.
4. Remove revoked credentials from all active environments.
5. Review production credentials at least every 90 days.
