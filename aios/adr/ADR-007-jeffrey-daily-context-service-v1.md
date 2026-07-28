# ADR-007: Jeffrey Daily Context Service v1

Date: 2026-07-27
Status: Accepted for implementation; human review required before merge
Risk: Medium

## Decision

Introduce a reusable repository-record collector before Jeffrey generation. Apply deterministic source priority, hard freshness/confidence rejection, conflict exclusion, topic filtering, audience mapping, cross-history duplicate protection, and append-only draft output.

Jeffrey generation may consume only AIOS scheduled-task outputs and stored project records. It must not fetch a weather provider directly.

## Consequences

Safe fallback produces evergreen drafts when validated context is insufficient. Context output is either exactly ten sourced drafts or zero. Existing reminders, URLs, tracking keys, favourites, and browser history remain intact. Rollback is the feature flag plus commit revert.
