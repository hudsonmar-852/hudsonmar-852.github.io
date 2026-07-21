# AIOS Private Portal Authentication

## Decision

AIOS private services use Cloudflare Access with Google as the identity provider. AIOS does not create or store usernames or passwords.

## Authentication flow

Atlas bookmark → Cloudflare Access → Continue with Google → Google authentication → Cloudflare policy check → AIOS private portal.

## User control

- Authentication: Google confirms the user's identity.
- Authorization: Cloudflare Access allows or denies the verified email.
- Self-registration: disabled.
- Shared password: disabled.
- AIOS password database: not used.

## Initial roles

### Admin

Only the approved Hudson Google email may access admin routes and deployment controls.

### Private viewer

Individually approved Google emails may access designated private portals or paths.

### Public

Public GitHub Pages content remains outside Cloudflare Access and contains only reviewed, sanitized output.

## Recommended route separation

- Public portal: existing public GitHub Pages URL; no login.
- Private portal: separate Cloudflare Pages project or protected custom hostname.
- Admin portal: separate Access application or stricter path policy.

## Cloudflare dashboard configuration required

1. Create or open the Cloudflare Zero Trust organization.
2. Add Google as an identity provider using OIDC/OAuth.
3. Create a Self-hosted Access application for the private AIOS hostname.
4. Create an Allow policy for specifically approved Google email addresses.
5. Create a separate stricter policy for admin routes or hostname.
6. Set session duration and require re-authentication at an appropriate interval.
7. Test an approved account, an unapproved account, logout, session expiry and revocation.
8. Add the protected URL to Atlas bookmarks after successful testing.

## Security requirements

- Never place Google client secrets, Cloudflare tokens, API keys or webhooks in HTML, JavaScript, JSON or a public repository.
- Store runtime secrets only in Cloudflare encrypted secrets or GitHub Actions Secrets.
- Keep Public Export Gate, secret scanning, human approval, rollback and change logging enabled.
- Do not grant ordinary portal users membership in the Cloudflare administrative account.

## Production status

Repository-side architecture and governance documentation are implemented. Cloudflare account-side identity-provider and Access policy configuration must be completed in the Cloudflare dashboard before the private portal is protected in production.
