# AIOS Content Pipeline P0

## Architecture and single sources of truth

The reusable pipeline is implemented in `aios/content-pipeline/engine.mjs`; workflow order, labels, source authority, stream selection, and QC weights are centralized in `aios/content-pipeline/config.json`. It is additive to the existing media Production Orchestrator and Phase 1 RP001 runtime.

The pipeline contract is:

`Input → Understand → Research / Fact Check → Content Enhancement → Reader Value → Quality Control → Presentation → Sources → Summary → Publish / Store`

Standard prioritizes speed and a three-minute summary. Enhanced adds deep research, verification, comparison, interesting facts, recommendation, advanced QC, and multi-level summaries. `stream: "auto"` or an omitted stream uses the configurable complexity threshold; `standard` or `enhanced` is a manual override.

## Extension points

Each stage accepts an injected async provider. Built-in deterministic behavior covers selection, comparison, reader experience, questions, facts, sources, QC, summaries, and the publication gate. Research/model integrations can be added as providers without changing stage contracts or embedding credentials.

Sources retain title, publisher, URL, publication/update/retrieval dates, type, authority score, and claim relationships. Invalid or unsupported URLs fail closed. Comparison outputs distinguish agreement, contradiction, additional insight, and missing evidence. Equal-strength disagreement remains unresolved.

QC scores accuracy, reader experience, usefulness, content quality, and presentation using configurable weights. Review notes are marked internal and are not included in public content outputs. Unsupported claims fail QC.

## Theme system

`aios/theme/tokens.css` is the dashboard semantic theme source of truth. Ocean Blue remains the page system; category accents distinguish Intelligence, Workflow, Knowledge, Report, Action, Review, Risk, and System. Report and Risk use different accent families, borders, and hierarchy rather than text alone. Contrast and reduced-motion preferences are supported.

## Test, deployment, and rollback

Run `node --test aios/tests/*.test.mjs aios/phase1/tests/*.test.mjs avataros/tests/*.test.mjs functions/private-test/index.test.mjs`, followed by repository validators in the root README. GitHub Pages deployment needs no build step. External publishing, Drive operations, and credentials remain outside P0 authorization.

Rollback by reverting the P0 commits. The feature has no database migration and does not mutate Drive or external systems.

## P1 contract and provider foundation

P1 promotes the runtime output to schema version `1.1.0`. JSON Schemas in `aios/content-pipeline/schemas/` define external input, structured source, and output contracts. `contracts.mjs` provides dependency-free runtime validation so local and CI behavior does not rely on an unapproved package.

`provider-registry.mjs` registers credential-free providers by declared stage capability and priority. A `providerRouting` override can select a specific registered provider per stage. If no provider is registered, existing built-in behavior remains the backward-compatible fallback. Provider failures stop the workflow, attach sanitized FAILED runtime evidence, and never reach the publication stage.

Every completed run includes a unique run ID and per-stage evidence. Source policy now evaluates domain-neutral age limits by source type and reports claim-to-source coverage. These controls report weak evidence without inventing citations. Live vendor adapters remain intentionally unimplemented until a provider, credential mechanism, cost policy, and data-processing boundary are approved.
