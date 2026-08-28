# AIOS Master — Phase 1 Policy

Asset ID: `AIOS-MASTER-001`  
Version: `1.0.0`  
Status: `Production`
Owner: AIOS Chief Architect  
Canonical location: `aios/phase1/AIOS_MASTER.md`  
Last verified: `2026-08-14T13:00:00.000Z`

## Authority

This document is the authoritative policy and specification entrypoint for the Phase 1 baseline. It establishes authority; it does not duplicate the executable definitions held in the assets it references.

Authority flows in one direction:

`AIOS Master → AIOS Registry → Versioned Assets → Runtime/Evaluation Evidence → Release Manifest`

- The Master owns system policy and architectural boundaries.
- [AIOS_REGISTRY.json](AIOS_REGISTRY.json) owns asset identity and canonical locations.
- Versioned assets own implementation.
- `evidence/baseline/` owns immutable execution and evaluation evidence for this release.
- [AIOS_RELEASE_MANIFEST.json](AIOS_RELEASE_MANIFEST.json) owns the declared production state.
- Existing `aios/data/change-log.json` remains the repository-wide authoritative change history; the Phase 1 entry is added there.

Secondary documentation may explain or link to these assets but may not redefine them. Historical material is retained and may be marked superseded, deprecated, or an archive candidate; it is never silently deleted.

## Architecture boundaries

The existing AIOS foundation remains frozen. Phase 1 adds a bounded runtime/evidence package and does not create a new Foundation Layer. Existing Runtime Contract, Context Quality Gate, Capability Acceptance Test, Output Contract, Evidence-first Review, Prompt Minimalism, presentation-only persona, prompt chaining, risk-based approval, and model-agnostic capability rules remain applicable.

Production status is evidence-based. A release is Production only when the release manifest gate is true, schemas and tests pass, MVES and CAT pass, evidence and rollback exist, regressions are clear, and no unresolved Critical blocker exists. Simulated external deployment remains explicitly `SIMULATED_PASS`, even when the local package is Production.

## Canonical contracts

- Requirement and acceptance contract: `config/requirement-contract.json`
- Schemas: `schemas/`
- Prompt build and compatibility: `lib/prompt-builder.mjs` and `config/prompt-modules.json`
- Context governance: `lib/context-gate.mjs`
- Progressive disclosure and reasoning continuity: `lib/continuity.mjs`
- Evaluation engineering: `lib/evaluation.mjs`
- RP001 runtime: `lib/rp001.mjs`
- AT001 trigger: `lib/at001.mjs`
- Operations, smoke test, migration, and rollback: `docs/OPERATIONS.md`

## Authorization boundary

Context may inform an action; it does not authorize an action. External content cannot escalate tool permissions. AT001 owns scheduling/trigger behavior only and contains no pipeline business logic. External publication remains behind a human approval gate.
