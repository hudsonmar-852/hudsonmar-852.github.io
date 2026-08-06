# AIOS Work Items Reconciliation Proposal

Proposal ID: `P-WORK-ITEMS-RECON-001`
Impact: 3 — Major
Status: Awaiting Direction Confirmation
Owner and final authority: Hudson

## Problem statement

The clean `agent/work-item-dashboard` branch diverges from `origin/main`: it
contains five audited commits that remain useful, while newer mainline work
adds governance, Job Match, Jeffrey, operating-context and validation changes.
A direct merge or rebase risks losing current behavior or corrupting shared
governance and CI files.

## Reviewed baselines

- Source worktree: `/Users/hudsonmar/AIOS/AIOS-work-items`
- Source branch: `agent/work-item-dashboard`
- Source HEAD: `e9cb4300ef4f3626aed71bfd70e98a6d1c4007d8`
- Verified `origin/main`: `cb3ae9100e496307706ca64f7c1194b62d1d5741`
- Strategy: `CREATE_NEW_CLEAN_BRANCH_AND_CHERRY_PICK`

Any change to the source HEAD, source cleanliness, reviewed `origin/main`,
source commit identities, target branch/worktree, allowed actions, prohibited
actions or validation requirements invalidates approval and returns the
proposal to review.

## Audited source commits

1. `e7261d328c91da09f820b13af9f88b9386f4b528` — Work Item dashboard
2. `2a62429fcc1de52bbcdab9cc086286db1bddf0f8` — Governance review package
3. `5af6f43df768a3508ebb95cb52ca354ad8127836` — Secret-scanning implementation
4. `e69b0f03756229eb6c7223b411b2b6d61533bd03` — AvatarOS schema boundaries
5. `e9cb4300ef4f3626aed71bfd70e98a6d1c4007d8` — Production backlog audit

No other source commit is in scope.

## Exact proposed scope

1. Create `codex/work-items-reconciliation-v1` from the reviewed main baseline.
2. Create `/Users/hudsonmar/AIOS/AIOS-work-items-reconciliation` as a separate worktree.
3. Preserve the source branch, source worktree and source HEAD unchanged.
4. Selectively integrate only the five audited commits.
5. Manually reconstruct shared integration files instead of choosing one side wholesale.
6. Preserve current main behavior, including Job Match.
7. Preserve and extend existing CI validation.
8. Run the complete repository validation suite.
9. Push only the reconciliation branch.
10. Create only a Draft PR targeting `main`.
11. Require human review before any later state transition.

## Shared integration files

- `.github/workflows/aios-validation.yml`
- `README.md`
- `aios/ENGINEERING_LOG.md`
- `aios/data/change-log.json`
- `aios/index.html`

Conflict resolution must retain all current-main checks and navigation, add
Work Items and secret scanning without duplication, preserve newer engineering
history, and keep JSON valid with unique identifiers.

## Explicitly prohibited

- Direct merge or rebase of `agent/work-item-dashboard`
- Force push, reset, deletion or modification of the source branch/worktree
- Modification of PR #28 or `codex/eo-006-enterprise`
- Modification of Jeffrey repositories or worktrees
- Bypassing or weakening tests and governance controls
- General feature-development permission
- Marking the proposed PR ready for review
- Merging the proposed PR
- Deleting any production file as a conflict-resolution shortcut

## Validation requirements

- All available Node tests
- JSON parsing and identifier-uniqueness checks
- JavaScript syntax checks
- Secret scanning with no committed secrets, tokens, passwords, credentials or real Drive IDs
- Local-link validation
- Agent Operating Context validation
- AvatarOS validation
- Work Items and Job Match presence/regression checks
- `git diff --check`
- Final verification that the source branch/worktree remains unchanged

Failure of any required validation blocks push and Draft PR creation unless a
new reviewed proposal scope explicitly addresses the failure.

## Rollback

Before merge, close the Draft PR and remove only the new reconciliation branch
and worktree through separately approved Git-native cleanup. The source branch
and worktree remain the immutable recovery source. No force deletion, source
reset, remote-branch deletion or main rewrite is permitted.

## Approval and expiry

Development permission remains closed until both durable confirmations exist.
Direction confirmation permits review/preparation only. Execution requires the
exact proposal-specific phrase required by policy. Merge remains prohibited
and requires a separate future human decision outside this proposal.

This proposal expires or returns to review if any reviewed SHA or scope changes,
if the proposal becomes stale under the lifecycle policy, if a conflicting PR
lands, if validation requirements change, or if Hudson pauses, rejects,
withdraws, defers or supersedes it.

Required direction confirmation:

`APPROVE DIRECTION P-WORK-ITEMS-RECON-001`

Required execution confirmation after the updated final impact review:

`APPROVE P-WORK-ITEMS-RECON-001`

## Current decision

`READY FOR DIRECTION CONFIRMATION`
