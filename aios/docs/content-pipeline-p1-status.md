# AIOS Content Pipeline P1 Status

Date: 2026-08-20  
Status: Foundation complete; live provider integration blocked on product/security selection

## Completed

- Draft 2020-12 JSON Schemas for input, source, and output contracts.
- Dependency-free executable validation matching the schema boundary.
- Provider manifest validation, capability routing, priority selection, and manual override.
- Backward-compatible built-in stage fallback.
- Sanitized per-stage runtime evidence for completed and failed runs.
- Configurable freshness by source type and claim-to-source coverage metrics.
- CI syntax and regression coverage.

## Authoritative locations

- Pipeline behavior: `aios/content-pipeline/engine.mjs`
- Workflow and evidence policy: `aios/content-pipeline/config.json`
- Public contracts: `aios/content-pipeline/schemas/`
- Runtime contract checks: `aios/content-pipeline/contracts.mjs`
- Provider lifecycle/routing: `aios/content-pipeline/provider-registry.mjs`

## Live adapter decision gate

No vendor-specific adapter was guessed. Before implementation, the Chief Architect must approve the provider, permitted data classes, authentication/secret store, retention policy, request budget, latency timeout, retry policy, and fallback order. The adapter must expose only the existing provider `execute` contract and must not embed credentials or modify workflow definitions.

## Rollback

Revert the P1 provider/schema commits. Existing P0 built-in processing remains recoverable because no external data, deployment, or database migration is involved.
