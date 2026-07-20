# AIOS Change Log

Change ID: AIOS-CHG-20260720-02
Date: 2026-07-20
Title: One-request Evolution and Architecture Review Engine
Status: Approved for implementation
Change type: Merge + Refactor + Extend

## Original request

Allow a new AIOS idea and the AI-proposed enhancement to be analysed, documented and prepared for governed implementation in one ChatGPT request, including all related logs and files.

## Reason for merge

The existing AIOS controls define change governance, runtime reliability, provenance and rollback, but they were not yet organised as one explicit orchestration workflow for idea-to-change-package execution. This change connects those controls so a single request can produce a consistent, auditable result without manually requesting each document.

## Improvements added during review

- separated analysis completion from external-system write capability
- retained human approval for production-impacting changes
- introduced explicit decision modes: merge, extend, refactor, replace, experiment, defer and reject
- prohibited unmeasured pseudo-scientific confidence scores
- made targeted backup references mandatory before affected asset changes
- kept public repository records free of private prompts, credentials and personal context

## Affected modules

- Change Governance Standard
- architecture review workflow
- backlog and implementation workflow
- release documentation
- QA and rollback workflow
- AI Content Provenance
- public decision metadata

## New assets

- `aios/docs/evolution-architecture-review-engine.md`
- `aios/adr/ADR-004-one-request-evolution-engine.md`
- `aios/backups/2026-07-20-evolution-engine-backup-manifest.md`
- this change log
- updated `aios/data/decisions.json`

## Assets protected before merge

- `aios/data/decisions.json` at blob `6cd273159abd7d2c3e33f838556a0edfa115aacb`
- AIOS main baseline commit `168ac6c5cb8587b40bed4cee8dc0f4e001f63aef`
- Runtime Reliability v2 documents and existing public dashboard behaviour remain unchanged

## Compatibility

Backward compatible. This change adds an orchestration standard and public-safe records; it does not remove or rename existing dashboard data fields, routes or runtime controls.

## Risks

- excessive document generation for trivial changes
- publishing private design details in a public repository
- treating generated documentation as proof that an external implementation occurred
- adding overlapping governance layers

## Mitigation

- use materiality thresholds for full change packages
- publish only public-safe summaries and metadata
- record implementation status separately from design status
- orchestrate existing controls instead of duplicating them

## QA performed

- verified repository public/private boundary
- verified no credentials, private prompts or personal data are included
- verified existing decisions JSON schema remains unchanged
- verified all new paths are documentation-only
- verified rollback can restore the baseline commit or previous decisions blob

## Rollback

Revert the merge commit or restore `aios/data/decisions.json` from blob `6cd273159abd7d2c3e33f838556a0edfa115aacb`. Delete the four new public-safe documentation records if a full rollback is required.
