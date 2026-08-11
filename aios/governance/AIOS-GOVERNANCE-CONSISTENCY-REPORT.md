# AIOS Governance Consistency Report

Audit date: 2026-08-06
Baseline: `origin/main@cb3ae91`

| Requirement | Current file/path | Classification | Gap/conflict | Recommended canonical file | Action | Risk | Approval |
|---|---|---|---|---|---|---|---|
| Two confirmations | AGENTS.md; GOV-010 | MISSING_REQUIRED_CONTENT | no Proposal-ID second confirmation | Major Change Policy | adopt draft | Critical | two-step |
| Major-change definition | scattered governance/security docs | PARTIALLY_ALIGNED | incomplete enumerated scope | Major Change Policy | consolidate | Critical | two-step |
| Hudson authority/no assumed approval | AGENTS.md | PARTIALLY_ALIGNED | role assigned to ChatGPT; generic trigger behavior | Major Change Policy | clarify authority | Critical | two-step |
| Decision lifecycle/health | `decisions.json` | MISSING_REQUIRED_CONTENT | no confirmations, evidence, review dates, health | Decision Lifecycle Policy and proposal registry | migrate later | Critical | two-step |
| Pending review | OUTSTANDING_TASKS; amendments | PARTIALLY_ALIGNED | stale, split, no aging | `pending-decisions.json` | validate daily/weekly | High | package approval |
| Approval audit | change log; reviews | CONFLICTING | Approved vs Waiting Review; evidence absent | `approval-registry.json` | treat legacy as UNVERIFIED | Critical | Hudson review |
| SSOT | Drive Master and duplicate drafts | CONFLICTING | multiple authority/structure claims | SSOT Policy/canonical map | preserve and migrate by manifest | Critical | two-step |
| Agent enforcement | AGENTS.md; GOV-019 | PARTIALLY_ALIGNED | canary exists but no registry/approval startup gate | AGENTS.md and index | adopt draft | Critical | two-step |
| Dashboard integrity | status.json; project board | OUTDATED | stale timestamps, unsupported percentages | dashboard source data | separate correction | High | review |
| Architecture/ADRs | `aios/docs`, `aios/adr`, Drive | PARTIALLY_ALIGNED | locations and approval evidence fragmented | canonical map | migrate incrementally | High | two-step if structural |
| Engineering Orders | AvatarOS docs and PMO Drive | PARTIALLY_ALIGNED | no central registry/path | `aios/engineering-orders/` | planned only | Medium | two-step structure |
| AI communication | Drive chatgpt_grok | PARTIALLY_ALIGNED | sparse/stale log; not approval source | Drive communication log | retain and promote decisions | Medium | none to record |

Existing files were extended where safe. New files are required because no
existing record fully defines double confirmation, lifecycle health, unique
canonical mappings, approval evidence, or conflict registration.
