# AIOS Daily Knowledge Base — 2026-08-23

## Scope
Delta-only consolidation for AIOS knowledge created or materially changed on 2026-08-23. Existing canon is referenced rather than duplicated.

## Verified Repository Delta
- Commit `1308f60f31cb5eac7509151a253a865beca84432` added `docs/aios/place-hunting-2026-08-23.md`.
- The document defines a temporary-accommodation objective, a weighted scoring model, verified leads, a required-data contract, ranking logic and a next-action verification loop.

## Long-term Retention

### 1. Total-Cost-First Decision Rule — LONG-TERM
Do not rank options by headline monthly price alone. Rank by true decision-period cost, including mandatory fees, utilities, service charges, deposits where relevant, and cancellation/early-termination exposure.

Canonical rule:
`Headline Price -> Normalize Mandatory Costs -> Decision-Period Total -> Service/Flexibility Adjustment -> Score -> Rank`

### 2. Decision-Period Normalization — LONG-TERM
When the actual need is temporary, normalize every option to the intended stay period before comparing. For the current use case this is 90 nights / approximately 3 months, but the method is domain-neutral.

### 3. Required Data Contract Before Ranking — LONG-TERM
A comparison is not decision-ready until every shortlisted option has the minimum comparable fields required for an apples-to-apples decision. Missing fields must be marked as unknown and should reduce confidence rather than be guessed.

Reusable fields for temporary accommodation:
- exact product/room type
- usable area
- decision-period total cost
- mandatory charges and utilities
- included services
- deposit/prepayment
- cancellation/early-termination terms
- availability / earliest start
- payment constraints
- location convenience
- latest visual evidence

### 4. Freshness-before-Commitment Rule — LONG-TERM
Time-sensitive offers, availability and promotional rates require a fresh re-check immediately before final ranking or booking. Cached research is reference evidence, not booking evidence.

### 5. Weighted Multi-Criteria Scoring — REUSABLE
Current place-hunting score /100:
- total monthly cost incl. mandatory fees/utilities: 25
- room size & comfort: 20
- included services: 15
- lease flexibility / short-stay suitability: 15
- MTR & daily convenience: 10
- room quality / photos / condition: 10
- booking friction, deposit & cancellation: 5

This score is a project profile, not a global AIOS constant. The reusable knowledge is the weighted-scoring pattern plus explicit criteria ownership.

## Key Decisions
1. Preserve flexibility during a transition rather than optimizing for the cheapest long fixed lease.
2. Compare true 90-day cost rather than headline monthly rent.
3. Keep the final shortlist small after verification; default target is Top 3.
4. Missing or contradictory source details must remain explicit verification items.
5. Personal/project preferences belong in the project profile; the comparison engine remains generic.

## Prompt Delta
NEW candidate:
- `Place_Hunting_Comparison_and_Rerank_Prompt.md`

Purpose: normalize fresh quotes, calculate comparable total cost, score options, identify missing evidence and output a Top-3 shortlist.

## Workflow Delta
NEW candidate:
- `Place_Hunting_Verification_and_Rerank_Workflow.md`

Canonical workflow:
`Collect -> Verify Freshness -> Normalize -> Resolve/Maintain Unknowns -> Calculate Decision-Period Cost -> Score -> Rank -> Top 3 -> Human Decision`

## Automation Candidates
- P1 Place Hunting Freshness Revalidator
- P1 Quote / Availability Collector
- P1 Decision-Period Cost Normalizer
- P1 Missing-Field Evidence Gate
- P2 Price-Change / Availability Watcher

Status: candidates only; inclusion here does not mean implemented.

## Deduplication
Do not duplicate the full verified-lead list from `docs/aios/place-hunting-2026-08-23.md` inside core knowledge. The daily KB retains only reusable rules, contracts and workflow deltas.

Reference-only existing canon:
- Evidence-first Governance
- Delta-only Consolidation
- Requirements Contract
- Persistent Work Ledger
- Capability-first Routing
- Human Gate for consequential actions

## Synchronization State
GitHub source evidence exists for the place-hunting document. Daily KB, prompt and workflow are synchronized on branch `aios/daily-kb-2026-08-23` pending any later merge decision. Google Drive daily KB is synchronized separately when available.
