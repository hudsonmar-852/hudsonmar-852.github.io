# AIOS Targeted Backup Manifest

Backup ID: AIOS-BKP-20260720-02
Date: 2026-07-20
Change: AIOS-CHG-20260720-02

## Baseline

- Repository: `hudsonmar-852/hudsonmar-852.github.io`
- Baseline branch: `main`
- Baseline commit: `168ac6c5cb8587b40bed4cee8dc0f4e001f63aef`
- Change branch: `aios/evolution-review-engine-20260720`

## Existing assets that may be changed

### Public decision registry

- Path: `aios/data/decisions.json`
- Pre-change blob: `6cd273159abd7d2c3e33f838556a0edfa115aacb`
- Protection method: Git object history plus explicit blob reference
- Restore method: replace the current file with the content from the recorded blob or revert the merge commit

## Existing assets intentionally not modified

- `aios/index.html`
- Runtime Reliability v2 documentation
- dashboard schema and rendering logic
- private prompts, credentials, personal context and automation controls

## New assets created by this change

- `aios/docs/evolution-architecture-review-engine.md`
- `aios/changelog/2026-07-20-evolution-review-engine.md`
- `aios/adr/ADR-004-one-request-evolution-engine.md`
- this backup manifest

## Rollback scope

A complete rollback restores `aios/data/decisions.json` to its pre-change blob and removes the four new files. No migration of runtime data is required.

## Integrity note

The repository remains a public monitoring and approved-documentation layer. Sensitive implementation assets must be backed up in their authorised private storage and referenced here only through non-sensitive identifiers.
