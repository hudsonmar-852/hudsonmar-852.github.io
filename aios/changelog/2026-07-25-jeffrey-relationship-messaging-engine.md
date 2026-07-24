# Approved Production Amendment — Jeffrey Relationship Messaging Engine

Version: 1.0.0
Module: Jeffrey Relationship Messaging Engine
Risk: Medium
Status: Implemented only after tests pass
Human review: Required before final merge
Rollback: Required

## Original problem

Recent reminder copy behaved like generic health information rather than a
short, personal Hong Kong WhatsApp message from Jeffrey. The repository also
linked to `/Jeffrey/` without containing that public route.

## Design principles

- Relationship and daily relevance before generic fitness information.
- Traditional Chinese and natural Hong Kong Cantonese.
- One main theme per day and three to five selected drafts.
- Verified facts or an explicit evergreen fallback.
- Minimal member data and no inferred health, emotion or private life.
- Every client-facing message remains a human-review draft.
- Warmth is professionally anchored in training, recovery, safety, schedule or
  a verified goal; private-intimacy and special-treatment cues are rejected.

## Affected modules

- `/Jeffrey/` static dashboard and deterministic messaging engine.
- Jeffrey voice, quality, member and source policies.
- AIOS project and production registries, validation and documentation.

## Data sources

Hong Kong Observatory current weather observations are the only connected live
source in v1.0. CHP, transport, news, holidays and sporting events remain
backlog items. A failed or stale HKO response cannot create a Daily Context
claim.

## Data preservation

The migration imports recognised legacy arrays without removing or rewriting
their original keys. New records are prepended. Tracking fields are retained.

## Outstanding

- Confirm the actual legacy dashboard storage schema in production.
- Add CHP, major transport disruption and calendar adapters after source and
  product review.
- Physical-device and Jeffrey voice review before merge.
- Cloudflare proxy is optional backlog work if direct HKO browser requests are
  blocked by a production browser.
