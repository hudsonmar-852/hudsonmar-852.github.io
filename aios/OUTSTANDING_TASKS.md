# AIOS Outstanding Engineering Tasks

Last scanned: 2026-07-23
Mode: Production
Architecture gate: EO-IMG-001 complete; Cycle 2 review pending

## P0

No build, CI definition, startup or critical data-safety failure was detected.
Local tests and production validation pass.

## P1

### AIOS-OUT-001 — Approve the next core engineering scope

- Status: Blocked — Chief Architect decision required
- Scope candidates: Core Runtime, Execution Engine, Module Registry, Plugin
  Runtime and REST API
- Reason: No approved Engineering Order or tracked implementation contract
  defines which core subsystem should be built next. Implementing one would be
  speculative architecture work.
- Unblocks: Next P1 Engineering Order

## P2

### AIOS-OUT-002 — Add validator failure-case regression tests

- Status: Ready after architecture review approval
- Scope: Exercise malformed JSON, missing routes and secret-pattern failures in
  isolated fixtures.
- Risk: Low

### AIOS-OUT-003 — Verify Cloudflare Access in production

- Status: Blocked — external account and approved test identities required
- Scope: Test approved, unapproved and logged-out access to `/private-test/`.
- Required result: Keep `pending_external_setup` until all cases are recorded.

### AIOS-OUT-004 — Verify CI on GitHub

- Status: Blocked — commit and push authorization required
- Scope: Split the working tree into logical commits, push a feature branch and
  confirm the AIOS validation workflow passes.

### AIOS-OUT-005 — Add external project link monitoring

- Status: Ready after architecture review approval
- Scope: Validate separately deployed public projects without adding private
  endpoints or credentials.
- Risk: Low

## P3

### AIOS-OUT-006 — Begin AvatarOS Sprint 2

- Status: Blocked — approved Engineering Order or architecture specification
  required
- Scope: Prompt Engine template library based on the approved version 1.0.0
  Character Bible and Image Job contracts.
- Reason: EO-IMG-001 introduced the contracts and compiler; the next template
  scope requires Cycle 2 architecture approval.

### AIOS-OUT-007 — Resolve the persistent amendment discussion

- Status: Blocked — product and governance decision required
- Scope: Retention policy and dashboard presentation for the amendment
  registry.

## P4

### AIOS-OUT-008 — Refactor large single-file public pages

- Status: Deferred
- Scope: Extract repeated styles and scripts only after baseline commits and
  browser regression coverage exist.
- Reason: Cleanup is lower priority than validation and approved runtime work.

## Completed during this Production Mode run

- Synchronized the AvatarOS public dashboard and system specification with the
  completed Sprint 0 state.
- Re-ran all tests, source safety checks, route checks and syntax validation.
