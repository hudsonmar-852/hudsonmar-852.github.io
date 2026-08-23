# Place Hunting Verification and Rerank Workflow

## Objective
Turn a raw temporary-accommodation candidate list into a current, comparable and decision-ready Top-3 shortlist.

## Workflow
1. **Collect** — gather candidate offers and exact source URLs.
2. **Freshness Check** — record source timestamp and flag stale price/availability.
3. **Normalize** — map all offers into the same comparison schema and stay period.
4. **Evidence Gate** — preserve unknowns and contradictions; do not guess.
5. **Cost Normalization** — compute true decision-period total and monthly equivalent.
6. **Weighted Scoring** — apply project-owned criteria and weights.
7. **Confidence Adjustment** — lower confidence for missing material fields.
8. **Rank** — rank by total decision value.
9. **Top-3 Compression** — keep only the strongest action shortlist.
10. **Human Gate** — present recommendation and unresolved evidence before booking/payment.
11. **Revalidation** — immediately before commitment, refresh quote, availability and terms.

## State Model
`discovered -> partially_verified -> comparable -> shortlisted -> revalidated -> decision_ready`

Exception states:
- `stale`
- `missing_material_data`
- `contradictory_source`
- `unavailable`
- `rejected`

## Evidence Contract
Minimum fields should include exact offer identity, usable size, normalized total cost, mandatory charges, services, flexibility terms, deposit/prepayment, availability, location convenience and current visual/source evidence.

## Automation Hooks
- Freshness Revalidator
- Quote / Availability Collector
- Decision-Period Cost Normalizer
- Missing-Field Evidence Gate
- Price / Availability Watcher

All automation hooks are candidates until implementation and validation evidence exists.
