# AIOS Outstanding Production Work Register

Audit date: 2026-07-29 HKT

Repository: `hudsonmar-852/hudsonmar-852.github.io`

Audited worktree: `agent/work-item-dashboard`

Baseline at audit start: 28 tests passed, 0 failed, 0 skipped, 0 todo; production and AvatarOS validators passed.

Integration warning: the audited worktree is 2 commits ahead of and 8 commits behind `origin/main`. The two local commits contain the Work Items dashboard and its governance package. The newer default branch contains approved executable-agent-boundary and harness-stage standards. No merge, rebase, push, deployment, or Drive write is authorized by this register.

## Evidence and constraints

- Google Drive `chatgpt_grok` root, `inbox/`, `outbox/`, `shared/`, and the canonical `chatgpt_grok_log.md` were reviewed.
- The latest canonical log entry is Grok's 2026-07-28 channel-cleanup note. No newer architecture amendment was found.
- `outbox/test_workflow_enhancement.md` is an unresolved communication-workflow request.
- Open GitHub evidence at audit time: PRs #1, #13, #14, and #15; issue #16. Listed PR checks pass.
- Recent `main` validation and Pages deployment runs pass, including commit `cea126f`.
- Repository architecture gates remain authoritative: core runtime scope, authenticated Drive writes, AvatarOS feature expansion, and external Cloudflare verification require their recorded approvals or external identities.

## Work register

| Work ID | Title | Component | Description | Evidence | Requirement source | Current state | Priority | Risk | Complexity | Execution disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AIOS-PROD-001 | Reconcile the divergent Work Items branch | Git / integration | Preserve the two local Work Items commits while integrating eight newer `main` commits and resolving governance-file conflicts. | `git rev-list --left-right --count HEAD...origin/main` = `2 8`; material overlap in `ENGINEERING_LOG.md`, `OUTSTANDING_TASKS.md`, CI, and dashboard assets. | User production integration objective; AIOS-GOV-010; AIOS-WF-013 | Blocked pending explicit branch integration/PR direction | P0 | R3 | M | Do not merge or rebase automatically |
| AIOS-PROD-002 | Approve the next core runtime Engineering Order | Core Runtime / Execution Engine / Registry / Plugin Runtime / REST API | Select and approve the public contracts and bounded implementation scope. These production components are not implemented in this repository. | `aios/OUTSTANDING_TASKS.md` AIOS-OUT-001; no matching runtime, registry, SDK, orchestrator, or API modules found. | Repository architecture gate | Blocked on Chief Architect decision | P1 | R3 | XL | Register only; speculative implementation prohibited |
| AIOS-PROD-003 | Implement authenticated Drive writes | Work Items / Google Drive File Service | Add the approved private identity, conflict handling, idempotency, audit persistence, and reconciliation adapter after architecture decisions. | `aios/work-items/adapters.mjs`; `aios/docs/google-drive-write-architecture-proposal.md`; AIOS-OUT-011. | Work Items architecture review | Blocked on eight architecture decisions and private server identity | P1 | R3 | L | Keep production writes disabled |
| AIOS-PROD-004 | Harden public secret detection | Production validator / security | Detect additional high-confidence credential formats and sensitive key files with isolated failure-case tests. | `aios/scripts/secret-scan.mjs`; `aios/tests/secret-scan.test.mjs`; full suite 34/34 passed. | Public/private boundary; AIOS-ENG-004 | Implemented locally; independent review pending | P1 | R1 | S | Conflict-safe maintenance stream |
| AIOS-PROD-005 | Enforce published AvatarOS contracts | Image Engine validation | Reject unknown properties and align `ageRange` runtime validation with the published schema. | `avataros/scripts/validate-avataros.mjs`; `avataros/tests/validation.test.mjs`; full suite 34/34 passed. | ADR-005 and EO-IMG-001 version 1.0.0 contracts | Implemented locally; independent review pending | P1 | R1 | S | Conflict-safe contract maintenance |
| AIOS-PROD-006 | Complete and enforce Work Items snapshot validation | Work Items schema / adapter | Complete the under-specified schema, validate fetched/cached snapshots before rendering, and reject malformed or private source data. | `aios/schemas/work-items.schema.json`; `aios/work-items/adapters.mjs`; validator subset checks. | Work Items v1 architecture | Blocked on contract approval and branch reconciliation | P1 | R2 | M | Prepare as next governed EO/maintenance plan |
| AIOS-PROD-007 | Reconcile local overrides safely | Work Items adapter | Overlay only local workflow metadata so source title, criteria, URLs, and governance fields cannot be masked indefinitely. | `aios/work-items/adapters.mjs` stores and replaces whole items. | Google Drive authoritative-source rule | Blocked on Work Items branch integration and adapter contract approval | P2 | R2 | M | Add source-refresh and corrupt-cache tests when approved |
| AIOS-PROD-008 | Verify Cloudflare Access externally | Private dashboard security | Test logged-out, approved, and denied identities and retain `pending_external_setup` until evidence exists. | `functions/private-test/index.js`; `aios/data/production-manifest.json`; AIOS-OUT-003. | ADR/security documentation | Blocked on external account and approved test identities | P1 | R3 | S | Human/external action required |
| AIOS-PROD-009 | Add Image approval and Visual QA evidence | AvatarOS approval gate / QA | Define an immutable approval record tied to the prompt-pack hash and a required QA rubric before export. | `pending_human_review` compiler output; runbook manual instruction; project board QA Engine pending. | Future AvatarOS Engineering Order | Blocked on architecture approval | P2 | R2 | M | Do not invent public contracts |
| AIOS-PROD-010 | Validate all production Image assets | AvatarOS validator | Discover all registered characters/jobs, reject duplicates and malformed files, and prove expected asset coverage rather than checking two hard-coded samples. | `avataros/scripts/validate-avataros.mjs` hard-coded example paths. | EO-IMG-001 malformed/incomplete asset detection | Ready after review gate | P2 | R1 | M | Suitable bounded follow-up |
| AIOS-PROD-011 | Pin CI actions and broaden syntax coverage | GitHub Actions | Pin third-party actions to reviewed commit SHAs and ensure new JS/MJS files cannot silently evade syntax checks. | `.github/workflows/aios-validation.yml`. | Supply-chain and CI maintenance | Ready after branch reconciliation | P2 | R1 | S | Separate CI-only change |
| AIOS-PROD-012 | Resolve documentation drift | README / AvatarOS status | Make local validation commands match CI and align AvatarOS directory/sprint claims with repository evidence. | Root `README.md`; `avataros/README.md`; `avataros/project-board.md`. | Deliverable documentation standard | Ready after branch reconciliation | P3 | R0 | S | Documentation-only stream |
| AIOS-PROD-013 | Triage active PRs and issue #16 | GitHub backlog | Decide whether four stale/open draft PRs and the Jeffrey reminder-card issue should merge, close, or be superseded. | GitHub PRs #1, #13, #14, #15 and issue #16. | User branch/PR/issue audit requirement | Human product/integration decision required | P2 | R2 | M | No mutation performed |
| AIOS-PROD-014 | Close the ChatGPT-Grok workflow test | Official communication | Produce the requested three workflow improvements, write the response to `inbox/`, and prepend the canonical log using a concurrency-safe update. | Drive `outbox/test_workflow_enhancement.md`; canonical log. | Grok 2026-07-28 request | Pending; independent of code release | P3 | R1 | S | Requires explicit external writes with canonical-log preservation |

## Maximum safe workforce plan

| Stream | Scope | Allowed outputs | Conflict boundary |
| --- | --- | --- | --- |
| Runtime contract maintenance | AIOS-PROD-005 | AvatarOS validator and validator tests | No governance, Work Items, Git, or CI edits |
| Security validation maintenance | AIOS-PROD-004 | Production validator and isolated tests | No AvatarOS runtime or governance edits |
| Governance and integration audit | AIOS-PROD-001/002/003/006-014 | Evidence and this register only | No production implementation |
| Lead integration and review | Diff review, full tests, register/log updates | Documentation and verified integration edits | No merge, rebase, push, deploy, or Drive mutation |

## Acceptance and stop conditions

- Maintenance fixes must preserve published contracts, include regression tests, and pass the complete local validation suite.
- No completion claim may rely only on an implementer's report; the integrated diff and tests require independent review.
- Any material scope change returns to planning.
- Branch integration, production publication, permissions, authenticated Drive writes, and external identity tests remain stopped until their recorded authority is supplied.
