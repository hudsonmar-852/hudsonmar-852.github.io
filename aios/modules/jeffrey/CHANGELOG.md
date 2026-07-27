# Jeffrey AIOS Module Changelog

## 2026-07-27 — v1.1.0

### Added
- Stored-record Daily Context collector with deterministic source priority.
- Weather, news, trend and transport freshness/confidence rejection.
- Conflict-safe topic and audience selection.
- Append-only catalogue generator with five new drafts per existing category.
- Exactly ten context drafts only when validated context supports them; otherwise zero.
- Cross-history duplicate protection and automated QA with one rewrite pass.
- Dashboard adapter, scheduler workflow, feature flag, schema, execution report and rollback documentation.

### Safety
- No external weather request exists in the Jeffrey generator.
- Historical reminders remain unchanged and all new reminders require human approval.
- The 2026-07-27 record used evergreen fallback because the stored weather record was stale.

### Rollback
Set `AIOS_DAILY_CONTEXT_V1=false`, revert the v1.1 implementation commit, preserve date records for audit, and do not clear production browser storage.

## 2026-07-21 — v1.0.0

### Decision
Approved and merged as AIOS amendment `JHRE-KB-003`.

### Added
- Stable identity profile separated from writing style.
- Hong Kong Cantonese voice profile with controlled colloquial and English-mix levels.
- Derived internal output-state schema that excludes raw private notes.
- Client relationship profile schema using closeness, relationship stage, consent and privacy class.
- Intent-based conversation structures instead of fixed canned sentences.
- Safety transformation rules and mandatory human approval.
- Quality rubric with Jeffrey Voice, Warm Heart, Reply Likelihood and AI Smell gates.
- Cross-model knowledge-loading contract.

### Modified from external proposals
- Capped colloquial level at 7 and English mixing at 3.
- Replaced `warmth_score` for relationship with `closeness_score`.
- Converted raw internal state into non-sensitive derived controls.
- Kept templates structural rather than sentence-based.
- Restricted emoji use to the approved set and zero to two per message.

### Rejected
- Automatic use of sickness or private struggle stories.
- Hardcoded “warm guy” or “fitness guy” persona labels.
- Automatic empathy boost inferred from illness.
- Raw private notes in prompts or public repository files.
- Mass-produced complete-sentence templates.

### Deferred
- RAG and vector database.
- Automated emotion analysis.
- Churn prediction.
- Multi-model routing.
- Video automation.
- Reinforcement learning from likes and dislikes.

### Reason
The merge improves voice consistency and human warmth while preserving privacy, keeping the current static-site architecture maintainable, and avoiding premature technical complexity.

### Backup and rollback
This change is additive and does not replace existing reminder data or production assets. Rollback can be performed by reverting the merge commit or removing `aios/modules/jeffrey/`.
