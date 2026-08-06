# AIOS Governance Index

Status: Draft — pending two confirmations for `P-GOV-ALIGN-001`
Owner and final authority: Hudson

## Required reading order

1. This index.
2. [Major Change Approval Policy](AIOS-MAJOR-CHANGE-APPROVAL-POLICY.md).
3. [Decision Lifecycle Policy](AIOS-DECISION-LIFECYCLE-POLICY.md).
4. [Single Source of Truth Policy](AIOS-SINGLE-SOURCE-OF-TRUTH-POLICY.md).
5. `aios/data/governance-proposals.json` and `aios/data/decisions.json`.
6. `aios/data/pending-decisions.json` and `aios/data/decision-conflicts.json`.
7. Applicable Engineering Order, ADR, workflow, and approval evidence.

Missing, invalid, inaccessible, or contradictory sources require:
`BLOCKED — GOVERNANCE SOURCE NOT VERIFIED`.

## Canonical governance records

| Record | Canonical path |
|---|---|
| Governance index | `aios/governance/AIOS-GOVERNANCE-INDEX.md` |
| Major-change policy | `aios/governance/AIOS-MAJOR-CHANGE-APPROVAL-POLICY.md` |
| Decision lifecycle | `aios/governance/AIOS-DECISION-LIFECYCLE-POLICY.md` |
| Source-of-truth policy | `aios/governance/AIOS-SINGLE-SOURCE-OF-TRUTH-POLICY.md` |
| Proposals | `aios/data/governance-proposals.json` |
| Decisions | `aios/data/decisions.json` |
| Approvals | `aios/data/approval-registry.json` |
| Pending decisions | `aios/data/pending-decisions.json` |
| Conflicts | `aios/data/decision-conflicts.json` |
| Canonical map | `aios/data/canonical-records.json` |

Legacy controls `AIOS-GOV-010`, `AIOS-GOV-019`, and `AIOS-WF-013` are
supporting evidence, but do not supply the complete two-confirmation model.
Legacy approval claims without durable evidence remain `UNVERIFIED`.

The startup canary records loaded sources and commit, registry checks, scope,
merge/deploy permission, completion definition, unknown handling, and PASS/FAIL.
Emergency action is limited to minimum reversible containment of active data
loss, credential exposure, security incident, or production damage.
