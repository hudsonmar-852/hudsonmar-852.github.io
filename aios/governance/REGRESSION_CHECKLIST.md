# AIOS Regression Checklist

Document version: 0.1.0-draft
Date: 2026-07-28
Owner: Hudson Mar
Maintainer: AIOS engineering
Review status: Draft — human approval pending
Applies to: TASK-20260728-002 and future Work Items changes

## Evidence notation

- `[x]` verified by the cited local or GitHub evidence.
- `[ ]` required before the next applicable release.
- `N/A` does not apply to the current read-only implementation.

Checking an item records evidence only. It does not create human approval.

## Repository and scope

- [x] Correct repository and feature branch identified:
  `agent/work-item-dashboard`.
- [x] Worktree was clean before implementation.
- [x] Changes are isolated from Jeffrey development branches.
- [x] Existing AIOS routes and project registries remain present.
- [x] No core module, public contract or plugin interface was renamed.
- [x] No unrelated user changes were included.

## Public/private boundary

- [x] No Google OAuth token, refresh token, service-account key or API secret is
  present in public assets.
- [x] Raw Drive task specification is not published.
- [x] Source link is marked authenticated/private.
- [x] `contentPublished` remains `false`.
- [x] Public source secret-pattern scan passed.
- [x] Browser-local changes are visibly marked demo-only.
- [x] Read-only adapter rejects create/update calls.
- [ ] Re-run repository and GitHub secret scanning before any future push.
- [ ] Verify Cloudflare Access with approved, unapproved and logged-out users
  before a private write API is treated as production.

## Work item data integrity

- [x] Work item IDs and approved status values are validated.
- [x] Priority ordering and status counts are tested.
- [x] Search and status/priority/owner/module filters are tested.
- [x] Source/index conflict detection is tested.
- [x] Stale cache inputs are present and stale UI behavior is tested.
- [x] Non-2xx sync failure produces an explicit error.
- [x] Missing governance references produce an explicit warning.
- [x] Local transition does not mutate the source snapshot.
- [ ] Production server must enforce schema validation independently of the
  browser.
- [ ] Production server must reject stale expected versions with HTTP 409.
- [ ] Production server must enforce unique idempotency keys.

## Lifecycle governance

- [x] BACKLOG to READY requires recorded authorization.
- [x] BLOCKED and CHANGES_REQUESTED require a reason.
- [x] COMPLETED requires passed criteria or a recorded override reason.
- [x] Invalid transitions are rejected.
- [x] Completion/archive actions request confirmation.
- [x] Local activity records actor, timestamp, reason, mode and from/to status.
- [ ] Production authorization must be based on a validated identity and role,
  not client-supplied actor text.
- [ ] Production audit history must be append-only and server-generated.

## UI, mobile and accessibility

- [x] Loading, empty, error and stale states exist.
- [x] Desktop Work Items workflow passed Playwright verification.
- [x] Mobile detail flow passed at 390 × 844.
- [x] No mobile horizontal overflow was detected.
- [x] No console or page errors were detected.
- [x] Keyboard skip link, labels, table headers, dialog title and live-region
  status are present.
- [x] Reduced-motion preference is respected.
- [ ] Perform human keyboard-only and screen-reader review before production
  write controls are introduced.
- [ ] Re-run color-contrast audit after any design-token change.

## Existing AIOS regressions

- [x] Existing AIOS production-consolidation tests passed.
- [x] AvatarOS prompt and validation tests passed.
- [x] Cloudflare private-test handler tests passed.
- [x] All repository JSON parsed.
- [x] Required assets and local links resolved.
- [x] Changed JavaScript passed syntax checks.
- [x] Git whitespace check passed.
- [ ] GitHub Actions must pass after an authorized push.

## Amendment and review governance

- [x] `automaticMerge` remains `false`.
- [x] Amendment Candidates remain review inputs.
- [x] Discussion Queue entries remain review inputs.
- [x] No draft governance proposal is labeled human-approved.
- [x] Historical ADRs and evidence are retained.
- [ ] Hudson must approve or amend the three governance drafts.
- [ ] Architecture Freeze must be a separate explicit human decision.

## TASK-20260728-001 dependency evidence

- [x] Candidate Jeffrey branch and commits located.
- [x] Local Curator tests and validators passed.
- [x] PR #7 validation passed.
- [x] PR #7 merged to `main`.
- [x] Post-merge validation and Pages deployment passed.
- [x] Before/after screenshots exist in the Jeffrey repository.
- [ ] Original TASK-20260728-001 specification located.
- [ ] Hudson confirms PR #7 is the formal TASK-20260728-001 implementation.
- [ ] Legacy `fix-bible-render.yml` no-job failure is retired or documented as
  intentionally non-blocking.

## Google Drive production-write gate

Current result: **BLOCKED / NOT ENABLED**

- [ ] Architecture proposal approved by Hudson.
- [ ] Private server runtime selected.
- [ ] Cloudflare Access JWT signature, issuer and audience validation tested.
- [ ] Admin email/role authorization tested server-side.
- [ ] CSRF and origin controls tested.
- [ ] `drive.file` or narrower effective access confirmed.
- [ ] Refresh token stored only in encrypted server secret storage.
- [ ] Schema, transition and reason rules enforced server-side.
- [ ] Idempotency and concurrency conflict tests pass.
- [ ] Append-only audit and reconciliation tests pass.
- [ ] Backup and rollback drill passes in a non-production Drive register.
- [ ] Credential revocation and rotation drill recorded.
- [ ] No private task content appears in logs or browser responses.

## Scoped feature review

## WI-20260805-001 Daily Job Match

- [x] Job Match is an additive route; Work Items and all prior AIOS routes remain present.
- [x] Normalized jobs require a title and application URL.
- [x] Tracking parameters are removed from application URLs.
- [x] Source-ID and canonical-URL duplicates are excluded.
- [x] Scoring weights total 100 and return explainable reasons and risks.
- [x] Minimum score and 30-item maximum are enforced.
- [x] Applied, Not Suitable, Rejected and Expired history is excluded from later runs.
- [x] Favourite, Applied and Not Suitable decisions persist in local storage.
- [x] Direct application links open safely with `noopener noreferrer`.
- [x] Loading, empty and retryable error states exist.
- [x] Mobile layout and keyboard skip target are implemented.
- [x] Example alerts, companies and profile are explicitly fictional/public-safe.
- [x] No CV, email body, OAuth token, API secret or job-site login is committed.
- [x] No scraping or production Gmail/Drive write is claimed.
- [ ] Configure and authorize a private Gmail-label exporter before production use.
- [ ] Store the real career profile and run history outside the public repository.
- [ ] Perform human relevance review on the first five private daily runs.

Release state: **LOCAL IMPLEMENTATION COMPLETE; PRIVATE INTAKE NOT DEPLOYED**

## Release decision

Current scoped decision:

- Work Items read-only/local-demo MVP: **APPROVED WITH CONDITIONS**
- Push/merge/deploy: **NOT AUTHORIZED BY THIS CHECKLIST**
- Production Google Drive writes: **NOT APPROVED**
- Architecture Freeze: **NOT APPROVED**

## Rollback checklist

- [x] Work Items changes are contained in commit `e7261d3`.
- [x] Governance preparation will be contained in a separate local commit.
- [x] No Drive data migration or write requires reversal.
- [x] No production configuration was modified.
- [ ] If later merged, revert the relevant commit through a reviewed PR.
- [ ] Preserve evidence documents and historical decisions during rollback.
