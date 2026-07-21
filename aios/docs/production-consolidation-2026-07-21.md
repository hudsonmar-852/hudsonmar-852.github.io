# AIOS Production Consolidation — 2026-07-21

## Objective

Convert approved AIOS decisions into a machine-readable, testable production baseline without treating discussion candidates as merged work.

## Scope

- Public AIOS dashboard repository
- Secret-storage policy after removal of 1Password
- Cloudflare Access / Google OAuth implementation status
- Production, pending-external-setup and deferred work states

## Dependencies

- GitHub Pages public monitor
- Cloudflare Pages Functions for the private test route
- Cloudflare Zero Trust account configuration for Google OAuth

## Risks

- Repository implementation can be mistaken for completed Cloudflare account setup.
- Public metadata can accidentally include secret values or private operational details.
- Deferred Grok testing can be mistaken for a failed or completed test.

## Acceptance Criteria

- No production dependency on 1Password or another paid password manager.
- No secret values, tokens, webhook URLs or private prompts are committed.
- OAuth is reported as `pending_external_setup` until Cloudflare configuration is verified.
- Grok login testing remains `deferred` and does not block this release.
- Validation tests pass using Node.js without third-party packages.

## Deliverables

- Production manifest and security policy
- Vendor-neutral secret inventory template
- Validation script and tests
- Branch manifest, workflow definition and worked example

## Output Files

See `aios/spec/branches/production-consolidation-2026-07-21.json`.

