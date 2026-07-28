# Jeffrey Daily Context v1

Status: Approved Production Amendment — implementation awaiting human review
Risk: Medium
Feature flag: `AIOS_DAILY_CONTEXT_V1`

## Architecture review and gap

The existing Jeffrey catalogues were static, append-only draft records. They preserved approval status and provenance but had no reusable runtime collector, deterministic conflict handling, freshness/confidence gates, cross-history duplicate checks, or dashboard loader for scheduled AIOS records.

## Frozen flow

```text
AIOS scheduled outputs and stored project records
  -> Daily Context Collector
  -> source priority + conflict rejection
  -> freshness + confidence validation
  -> one fused topic from compatible validated records
  -> Jeffrey draft generator
  -> voice/safety/duplicate QA
  -> exactly five append-only draft messages
  -> dashboard adapter
```

The collector reads repository records only. The generator contains no external weather request. Context-specific messages link to an AIOS stored record, never a raw provider endpoint.

## Data and migration

- Historical catalogues remain unchanged.
- New drafts are written under date-keyed directories and are prepended by adapters at read time.
- Every daily catalogue contains one fused topic and exactly five messages; group sorting is disabled.
- `latest.json` is the only mutable pointer; date records are append-only.
- All outputs remain `draft_human_approval_required`.
- The existing catalogue format remains available; v2 output carries `historical_catalogue_refs`.

## Feature flag

Default is disabled unless the scheduler or dashboard runtime config explicitly sets `AIOS_DAILY_CONTEXT_V1=true`. Disabled mode returns the legacy path without writes. Dashboard record failure degrades to the existing catalogue/context path.

## Rollback

1. Set `AIOS_DAILY_CONTEXT_V1=false` in scheduler and dashboard runtime config.
2. Revert the implementation commits in the AIOS and Jeffrey repositories.
3. Leave historical and generated date records in place for audit; do not clear browser storage.
4. Restore the prior `latest.json` pointer only if required.

## Known limitations

- Context quality depends on upstream scheduled records being present and timely.
- Semantic duplicate detection is deterministic character n-gram similarity, not an external embedding service.
- Human Jeffrey voice review and final production merge remain required.

## Architecture freeze

No direct provider API, automatic customer send, historical deletion, secret, paid service, or medical inference is part of v1. Such changes require a new governed execution order.
