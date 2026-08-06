# AIOS Alignment Migration Plan

Status: Draft only; no Drive migration, merge, or deployment authorized

## Sequence

1. Hudson reviews this package and provides direction confirmation.
2. Revalidate open conflicts and publish an updated impact review.
3. Obtain exact execution confirmation: `APPROVE P-GOV-ALIGN-001`.
4. Merge the approved repository package through normal review; do not resume
   feature work until Hudson separately lifts the freeze.
5. Create a Drive migration manifest containing exact file IDs, old/new parent
   IDs, permission impact, checksum/content comparison, successor, rollback,
   and reviewer.
6. Resolve the duplicate storage-architecture group `ARCH-001`; preserve all
   copies, label supersession, and move only after approval.
7. Decide whether private `My Drive/AIOS PMO` remains private or is copied as
   an executive mirror; never change its sharing implicitly.
8. Review unmigrated daily reports, prompt records, tool databases, and
   `DriveWebhook`. Do not move active Apps Script until dependencies, secrets,
   triggers, owner, and rollback are verified.
9. Reconcile legacy approval claims and dashboard/status data in separate,
   approved changes.

## Rollback

Before repository merge: close the draft PR. After merge: revert the alignment
commit by PR; retained historical evidence remains. Each later Drive move must
restore the exact verified parent IDs and permissions. No bulk or destructive
rollback is permitted.

## Manual actions

- Hudson: review conflicts, privacy boundaries, duplicate canonical candidate,
  and approval evidence.
- Drive owner: confirm permission blockers and active Apps Script dependencies.
- Governance reviewer: verify proposal-specific approvals and stale decisions.
- Repository administrator: confirm branch protection and no auto-merge/deploy
  is added by this package.
