# AIOS Product Baseline

Document version: 0.1.0-draft
Baseline date: 2026-07-28
Owner: Hudson Mar
Prepared by: Codex governance review
Review status: Draft — human approval pending
Public classification: Public-safe engineering metadata only

## Purpose

This document records the verifiable AIOS product baseline at
TASK-20260728-002. It does not replace private product specifications, approve
proposals, or rewrite historical decisions.

Evidence labels used throughout:

- **CONFIRMED** — directly supported by repository, Git or GitHub evidence.
- **INFERRED** — a conclusion supported by evidence but not an original signed
  specification.
- **PROPOSED** — a future decision requiring approval.
- **HUMAN APPROVAL REQUIRED** — not approved by this draft.

## Baseline identity

| Area | Baseline | Evidence status |
| --- | --- | --- |
| AIOS public repository | `hudsonmar-852/hudsonmar-852.github.io` | CONFIRMED |
| Work Items branch | `agent/work-item-dashboard` | CONFIRMED |
| Work Items implementation commit | `e7261d3` | CONFIRMED, local only |
| Work Item | `WI-20260728-002` / `TASK-20260728-002` | CONFIRMED |
| Public production branch at task start | `origin/main` at `97e0f42` | CONFIRMED |
| Jeffrey Curator repository | `hudsonmar-852/Jeffrey` | CONFIRMED |
| Jeffrey Curator PR | PR #7, merge commit `03cfcf3` | CONFIRMED |
| TASK-20260728-001 mapping to PR #7 | Curator scope matches the described dependency | INFERRED; original task record not found |

The Work Items branch is one commit ahead of `origin/main`. It has not been
pushed, merged or deployed as part of TASK-20260728-002.

## Product capabilities

### Public AIOS Project Control

Status: **CONFIRMED**

- Static GitHub Pages dashboard at `/aios/`.
- Data-driven project, status, risk, decision, amendment, discussion,
  watchlist, change-log and production-readiness views.
- Public content is restricted to reviewed metadata.
- Amendment Candidates and Discussion Queue entries are persistent review
  inputs. They are not automatically merged.

Evidence:

- [`aios/index.html`](../index.html)
- [`aios/data/decisions.json`](../data/decisions.json)
- [`aios/workflows/production-consolidation.json`](../workflows/production-consolidation.json)
- `automaticMerge: false` in the production consolidation workflow

### AIOS Work Items MVP

Status: **CONFIRMED IMPLEMENTATION; APPROVED WITH CONDITIONS**

- Additive Work Items route with summary metrics, filters, quick views,
  responsive register and detail dialog.
- Governed lifecycle covering BACKLOG through ARCHIVED.
- Approval, reason and completion gates.
- Local activity history and explicit loading, empty, stale and error states.
- Public-safe `work-items.json` plus human-readable `TASK_INDEX.md`.
- Google Drive source links remain authenticated and raw task content is not
  republished.
- Browser changes are explicitly local demo data and are not operational Drive
  updates.

Evidence:

- Work Items commit `e7261d3`
- [`work-items.json`](../../work-items.json)
- [`TASK_INDEX.md`](../../TASK_INDEX.md)
- [`aios/tests/work-items.test.mjs`](../tests/work-items.test.mjs)
- [`aios/tests/work-items-page.test.mjs`](../tests/work-items-page.test.mjs)
- [`architecture-review-2026-07-28-01.md`](../reviews/architecture-review-2026-07-28-01.md)

### Jeffrey Curator Engine v2

Status: **CONFIRMED DEPLOYED CAPABILITY; TASK-ID LINK PARTIALLY VERIFIED**

- Generates 30–50 internal candidates and exposes exactly five eligible
  customer-facing drafts.
- Archives candidates and excludes old catalogue entries from the board.
- Copies only `customer_text`.
- Contains no per-message approval or confirmation schema after commit
  `ec07bfd`.
- PR #7 was merged to `main` as `03cfcf3`.
- GitHub Actions validation and Pages deployment succeeded for `03cfcf3`.

The original file or register entry named TASK-20260728-001 was not found.
Therefore this baseline does not claim the PR is formally linked to that task.

Evidence:

- [`dependency-20260728-001-evidence.md`](../reviews/dependency-20260728-001-evidence.md)
- Jeffrey PR #7: <https://github.com/hudsonmar-852/Jeffrey/pull/7>
- Validation/deploy run: <https://github.com/hudsonmar-852/Jeffrey/actions/runs/30322506679>

## Approved architecture boundaries

Status: **CONFIRMED**

1. GitHub Pages is the public monitoring and demonstration layer.
2. Private prompts, credentials, administrative controls and task
   specifications remain outside the public repository.
3. Cloudflare Access with Google identity is the approved private-route
   authentication direction; account-side setup is still recorded as pending.
4. Runtime secrets belong in Cloudflare encrypted secrets. CI/CD secrets belong
   in GitHub Actions Secrets.
5. Browser JavaScript must not receive Google refresh tokens, service-account
   keys or unrestricted Drive credentials.
6. Automatic merge remains disabled. Human review is required for governed
   amendments and production changes.

Evidence:

- [`cloudflare-access-google-oauth.md`](../security/cloudflare-access-google-oauth.md)
- [`security-storage-policy.json`](../config/security-storage-policy.json)
- [`decisions.json`](../data/decisions.json)
- [`AGENTS.md`](../../AGENTS.md)

## Validation baseline

### TASK-20260728-002

Status: **CONFIRMED**

- 28/28 Node tests passed.
- 37 JSON files parsed.
- 108 public source files passed secret-pattern scanning after governance
  preparation.
- 20 public assets and 15 local links passed validation.
- AvatarOS regression validation passed.
- Three Playwright scenarios passed on desktop and mobile.
- Desktop and mobile scenarios were re-run after the governance warning update
  and both passed.

### Jeffrey Curator candidate for TASK-20260728-001

Status: **CONFIRMED**

- 4/4 Python tests passed locally during this governance review.
- 12/12 Node tests passed locally.
- Production data and provenance validators passed.
- GitHub PR validation passed.
- Post-merge validation and Pages deployment passed.
- A separate legacy workflow named `fix-bible-render.yml` reported failure
  without creating a job; it did not block the successful Curator validation
  and deployment, but remains maintenance debt.

## Known gaps

### AIOS Daily Job Match v1

Status: **IMPLEMENTED LOCALLY; REVIEW PENDING**

- Additive `/aios/job-match/` route for ranked alert review and direct
  application links.
- Deterministic normalized intake, deduplication, weighted profile matching,
  preference exclusions and daily selection capped at 30.
- Markdown and JSON daily outputs with Favourite, Applied and Not Suitable
  decisions stored locally in the public demo.
- Gmail/job-alert collection and the real career profile remain private-runtime
  responsibilities. The public repository contains fictional examples only.
- No job-site scraping, account automation, credential storage or production
  Google Drive write is introduced.

Evidence:

- [`aios/job-match/README.md`](../job-match/README.md)
- [`aios/job-match/engine.mjs`](../job-match/engine.mjs)
- [`aios/tests/job-match.test.mjs`](../tests/job-match.test.mjs)

| Gap | Classification | Effect |
| --- | --- | --- |
| Original TASK-20260728-001 specification absent | CONFIRMED | Formal task-to-PR traceability remains incomplete |
| Governance documents are new drafts | CONFIRMED | Human approval is still required |
| Drive operational writes are unavailable | CONFIRMED | Work Items updates remain local demo only |
| Cloudflare Access account setup unverified | CONFIRMED | Private write API cannot be treated as production-ready |
| Drive write architecture | PROPOSED | No implementation or production enablement allowed |
| Architecture Freeze | HUMAN APPROVAL REQUIRED | Remains not approved |
| Private Gmail alert adapter not connected | CONFIRMED | Daily production input requires a separately authorized private runtime |
| Real career profile not configured | CONFIRMED | Public board remains fictional demo data |

## Rollback implications

- Governance drafts can be reverted as one local governance commit without
  changing production.
- Reverting Work Items commit `e7261d3` removes only the local task branch
  feature and its documentation; it does not alter Google Drive.
- Jeffrey Curator rollback is documented in its repository at
  `docs/CURATOR_ENGINE_V2_PRODUCTION_UPDATE.md`. No Jeffrey rollback is
  authorized by this document.
- Never delete historical ADRs, task evidence or Drive source documents during
  rollback.

## Approval record

This document is not an approval record.

Human approval required from Hudson:

1. Accept or amend this baseline.
2. Confirm whether Jeffrey PR #7 is the authoritative implementation of
   TASK-20260728-001.
3. Confirm that the Work Items MVP may be pushed for CI review.
4. Decide whether to authorize a separate Drive write architecture EO.
