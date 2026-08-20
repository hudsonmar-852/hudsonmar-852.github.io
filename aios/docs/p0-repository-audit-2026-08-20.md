# AIOS P0 Repository and Architecture Audit

Date: 2026-08-20  
Authoritative worktree: `/Users/hudsonmar/AIOS/AIOS-integrated`  
Branch: `codex/phase1-release-evidence-hardening`

## Repository finding

`/Users/hudsonmar/AIOS` is a workspace containing multiple Git worktrees, not a Git repository. `AIOS-integrated` was selected because it was clean and contained the EO-006 core, Drive service, Phase 1 runtime/evidence, and the newest integrated local history. It was reconciled with `origin/main`, which added the Work Items dashboard, validation hardening, share-library changes, and Video Engine. No parallel AIOS project was created.

## Existing architecture retained

- Core runtime: `aios/core/` owns Mission Manager, Decision Engine, Production Orchestrator, Plugin SDK, and Visual QA.
- Phase 1 runtime/evidence: `aios/phase1/` owns RP001/AT001, prompt assembly, context controls, schemas, UAT, and release evidence.
- Workflow definitions: `aios/workflows/` and versioned feature configuration remain authoritative for their workflows.
- Public dashboard state: `aios/data/*.json`; dashboard presentation: `aios/index.html` and `aios/theme/`.
- Public knowledge assets: `share/` and `share/_registry.json`.
- Work management: `work-items.json`, `TASK_INDEX.md`, and `aios/work-items/`.
- Drive integration: `aios/services/drive-file-service/`; deployment/authorization remains an external human action.
- GitHub validation: `.github/workflows/aios-validation.yml`.

## P0 implementation matrix

| Component | Existing | Audit status | Gap | Action |
|---|---|---|---|---|
| Workflow Engine | Mission Manager, Production Orchestrator, RP001 | Partial | Content pipeline was not reusable or dual-stream | Extend additively with `aios/content-pipeline/` |
| Reader Workflow | Share authoring guidance | Partial | No executable reader-value stage | Add shared structured stage |
| Research Workflow | RP001 source ranking | Partial | No configurable deep stream | Add Enhanced stream using common stages |
| Content Enhancement | Prompt pipeline concepts | Partial | No content-pipeline contract | Add structured stage hook |
| Interesting Facts | None found | Missing | Verification and deduplication | Add optional verified-only stage |
| Friend/Reader Questions | Share guidance | Partial | Personal wording and no reusable output | Add configurable `readerQuestions` label/output |
| QC | RP001 QA, Visual QA | Partial | Content dimensions/scoring absent | Add configurable internal QC model |
| Sources | RP001 fixtures | Partial | Metadata normalization absent | Add normalized authoritative source records |
| Summary | RP001 artifact summary | Partial | Only generic summary behavior | Add Quick, 3-minute, multi-level, comparison modes |
| Theme Engine | Inline Ocean Blue variables | Partial | No semantic category tokens | Add centralized semantic token layer |
| Dashboard | Data-driven AIOS and Work Items dashboards | Working | Functional cards visually similar | Apply semantic category treatments incrementally |
| Visual QA | Image QA and existing dashboard screenshots | Partial | No semantic-theme regression checks | Add structural theme QA plus browser evidence |
| AI Search Comparison | Source ranking only | Missing | Disagreements not normalized | Add claim-level comparison and unresolved state |

## Duplicates, obsolete assets, and constraints

- Multiple workspace worktrees represent branches of the same GitHub repository; they are not separate products and were left untouched.
- `AIOS_OUTSTANDING_WORK_REGISTER.md` is a historical EO-006 snapshot; `aios/OUTSTANDING_TASKS.md` is the active engineering record.
- The existing Production Orchestrator is media-production-specific. Rewriting it for content would break its contract; the content pipeline is an additive feature module and reuses the repository's structured-stage pattern.
- Phase 1 external scheduling/publication and Drive authorization remain simulated or human-gated. P0 does not weaken those boundaries.

## P0 plan and risk controls

Implement the bounded content pipeline, tests, semantic theme, integration coverage, documentation, and architecture review. Preserve external publication as approval-gated. Rollback is by reverting the logical P0 commits; no data migration or external deployment is required.
