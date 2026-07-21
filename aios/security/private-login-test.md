# AIOS Private Login Test

## Test route

`/private-test/`

This route is implemented as a Cloudflare Pages Function and is intended to sit behind Cloudflare Access.

## Required Cloudflare Access configuration

1. Create or open the Cloudflare Zero Trust organisation.
2. Add Google as the identity provider.
3. Create a Self-hosted Access application for the Pages hostname.
4. Protect the path `/private-test/*`.
5. Create an Allow policy using Hudson's approved Google email.
6. Add Jeffrey's Google email only when testing his access.
7. Set the session duration to a short test value first, then extend it after verification.

## Expected test results

### Approved user

- Opening `/private-test/` redirects to Cloudflare Access.
- The user selects Continue with Google.
- After successful authentication, the private test page opens.
- The page displays the authenticated email supplied by Cloudflare.
- The Sign out link ends the Access session.

### Unapproved user

- The user may authenticate with Google.
- Cloudflare rejects access because the email is not in the Allow policy.
- The Pages Function and private content are not served.

### Public visitor

- `/aios/` remains public unless a separate Access policy is later added.
- `/private-test/` must remain protected.

## Security notes

- Do not place secrets, tokens, private prompts or personal client data on the test page.
- Do not rely on the displayed email alone for application-level edit permissions.
- Cloudflare Access controls entry to the route. Future editor/admin roles should use separate paths or verified Access claims.
- Keep `cache-control: no-store` and `x-robots-tag: noindex, nofollow` enabled.

## Production decision

After the test succeeds, either:

- keep `/private-test/` as a health-check page with Hudson-only access; or
- replace it with the real private dashboard route and apply separate Admin and Viewer policies.
