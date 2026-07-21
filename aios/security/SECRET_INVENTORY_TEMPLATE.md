# AIOS Secret Inventory Template

> Metadata only. Never paste a real secret, token, password, recovery code, private key, folder ID or webhook URL here.

| Secret ID | Service | Purpose | Environment | Storage Reference | Owner Role | Created | Last Rotated | Next Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| SEC-001 | Example Service | Example purpose | Production | Cloudflare secret or GitHub Actions secret name only | System owner | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | Active |

## Allowed values

- Environment: Development / Test / Production
- Storage Reference: Cloudflare encrypted secret name, GitHub Actions secret name, or protected backend reference
- Status: Active / Expiring / Revoked / Replaced

## Rules

1. Store references and dates only, never the secret value.
2. Do not require 1Password or another paid password manager at the current AIOS stage.
3. Use a stable Secret ID so applications do not depend on vendor-specific names.
4. Rotate immediately after suspected exposure.
5. Remove revoked credentials from every active environment.
6. Review production credentials at least every 90 days.
