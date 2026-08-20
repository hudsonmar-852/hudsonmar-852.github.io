# AIOS Phase 1 Operations, Migration, and Rollback

## Prerequisites

Use Node.js 20 or newer from the repository root. No third-party dependency or secret is required. The canonical entrypoint is `aios/phase1/AIOS_MASTER.md`; original chat history is not required.

## Operate and verify

```sh
node aios/phase1/scripts/run-baseline.mjs
node --test aios/phase1/tests/*.test.mjs
node aios/phase1/scripts/run-uat.mjs
node aios/phase1/scripts/validate-release.mjs
```

The first command executes the deterministic RP001 simulation through AT001 and refreshes runtime/evaluation evidence. The second is the component, security-boundary, CAT, and integration test suite. The third writes UAT-001–010 evidence. The last independently evaluates the release gate.

Success requires `PRODUCTION GATE PASS`. External publish remains `SIMULATED_PASS`; these commands do not access a network or publish anything.

## Failure handling

Classify the failure, retain the failing evidence, identify one component, apply one controlled fix, rerun only its relevant test, then run the full regression gate. AT001 retries at most once and only after a classified repairable environment/tool failure; otherwise it logs and stops.

## Migration

This is an additive, reversible package under `aios/phase1/`. Existing foundation code and repository-wide production records are unchanged. Consumers migrate by resolving assets through `AIOS_REGISTRY.json` and treating `AIOS_RELEASE_MANIFEST.json` as the Phase 1 production-state authority. Secondary documents should link to the canonical assets rather than copying definitions.

## Rollback

Before merge, close or discard the feature branch. After merge, revert the Phase 1 commit(s) and remove only the associated registry/change-log entry through that revert. Generated Phase 1 evidence should be archived before a later replacement. Do not delete historical runtime or evaluation records. No database, credential, external integration, or pre-existing production asset is modified by this baseline.

## Real-integration promotion

A future real AT001 scheduler/publisher promotion requires approved credentials and permission scope, a real run, a new versioned Runtime Record, smoke evidence, and an updated Release Manifest. It must not overwrite this simulated evidence.
