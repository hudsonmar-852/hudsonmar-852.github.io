# ADR-005: Freeze the AvatarOS Image Engine v1 production contracts

- Status: Accepted
- Date: 2026-07-23
- Decision owners: Chief Architect and AIOS engineering
- Scope: Cycle 2 / EO-IMG-001

## Context

AvatarOS needs a repeatable image-production path that reduces manual prompt
assembly without changing the approved provider architecture. Production inputs
must preserve character identity, reject malformed jobs and retain human control
over generated outputs.

## Decision

1. **Grok Imagine remains the image generation provider.**
   The deterministic prompt compiler targets the provider already recorded in
   `avataros.config.json`. Switching or adding providers requires a separate
   architecture decision.
2. **Human approval is mandatory.**
   Character and Image Job contracts require `humanApprovalRequired: true`.
   Compiled prompt packs remain `pending_human_review`; no image is accepted or
   published automatically.
3. **Character Bible Contract v1.0.0 is frozen.**
   The contract defines stable identity traits, wardrobe rules, negative
   prompts and generation approval.
4. **Image Job Contract v1.0.0 is frozen.**
   The contract defines the approved character reference, objective, render
   settings, scene and approval state.
5. **Cycle 2 makes no architectural change.**
   Work is limited to schemas, examples, validation, deterministic prompt
   compilation, tests, CI and documentation inside the existing named engines
   and manual tool boundaries.

## Consequences

- Invalid or unapproved production inputs fail before an external tool is
  opened.
- Prompt generation is repeatable and testable.
- Visual generation, selection and downstream export still require a human.
- Removal or semantic modification of v1.0.0 fields requires architecture
  approval and a versioned migration.
- Provider expansion, automatic image acceptance and direct publication remain
  out of scope.

## Validation

- Checked-in examples validate against the enforced v1 baseline.
- The reference prompt pack must exactly match compiler output.
- CI runs AvatarOS validation, unit tests and syntax checks.
