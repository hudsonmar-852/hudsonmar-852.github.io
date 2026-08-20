# AIOS Outstanding Engineering Tasks

Last scanned: 2026-08-20
Mode: Production
Architecture gate: Phase 1 Production Baseline and TASK-20260728-002 are integrated; architecture review `2026-08-14-01` remains the latest review record. The explicit AIOS P0 continuation order authorizes the bounded P0 scope only.

## P0

No build, CI definition, startup or critical data-safety failure was detected.
Phase 1 release validation now executes its control/CAT tests, verifies artifact
integrity and resolves the committed Production manifest. Local tests and
production validation pass.

## P1

### AIOS-OUT-009 — Review and place AIOS PMO governance drafts

- Status: Drafts complete — Hudson approval and Drive placement required
- Drafts: `aios/governance/PRODUCT_BASELINE.md`,
  `aios/governance/DECISION_LOG.md`,
  `aios/governance/REGRESSION_CHECKLIST.md`
- Impact: Repository evidence is consolidated, but governance completeness
  cannot be marked approved.

### AIOS-OUT-010 — Verify TASK-20260728-001 dependency

- Status: PARTIALLY VERIFIED — Hudson mapping confirmation required
- Evidence: Jeffrey PR #7 code, local tests, GitHub validation, merge and Pages
  deployment are verified.
- Missing: original task specification and explicit TASK-20260728-001 mapping.

### AIOS-OUT-011 — Implement authenticated Google Drive adapter

- Status: Proposed — Hudson architecture approval and private server identity required
- Scope: Implement the existing adapter interface with authenticated writes,
  version conflicts, idempotency and persistent audit history.
- Safety: Do not place tokens or private task specifications in GitHub Pages.
- Proposal: `aios/docs/google-drive-write-architecture-proposal.md`

### AIOS-OUT-001 — Approve the next core engineering scope

- Status: Blocked — Phase 1 architecture review and Chief Architect decision required
- Scope candidates: Core Runtime, Execution Engine, Module Registry, Plugin
  Runtime and REST API
- Reason: No approved Engineering Order or tracked implementation contract
  defines which core subsystem should be built next. Implementing one would be
  speculative architecture work.
- Unblocks: Next P1 Engineering Order

## P2

### AIOS-OUT-002 — Expand legacy validator failure-case regression tests

- Status: Ready after Phase 1 architecture review approval
- Scope: Exercise malformed JSON, missing routes and secret-pattern failures in
  isolated fixtures.
- Risk: Low

### AIOS-OUT-003 — Verify Cloudflare Access in production

- Status: Blocked — external account and approved test identities required
- Scope: Test approved, unapproved and logged-out access to `/private-test/`.
- Required result: Keep `pending_external_setup` until all cases are recorded.

### AIOS-OUT-004 — Verify Phase 1 CI on GitHub

- Status: Blocked — external push/CI execution not authorized in this audit
- Scope: Push the Phase 1 maintenance branch and confirm the workflow executes
  legacy tests, Phase 1 tests, operating-context validation and the hardened
  release gate.

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

## Completed during the 2026-08-17 maintenance audit

- Reconciled the Phase 1 Master, Registry, Release Manifest, architecture
  review, Known Issues and outstanding-work records with executable evidence.
- Replaced manifest-asserted test/CAT checks with executable checks.
- Added release-commit provenance, artifact-digest and CI inclusion controls.
- Identified `AIOS_OUTSTANDING_WORK_REGISTER.md` as an EO-006 historical
  snapshot; this file remains the current engineering task authority.
- Built the TASK-20260728-002 Work Items dashboard MVP with a public-safe
  read-only Drive snapshot and local demo status updates.
- Synchronized the AvatarOS public dashboard and system specification with the
  completed Sprint 0 state.
- Re-ran all tests, source safety checks, route checks and syntax validation.
