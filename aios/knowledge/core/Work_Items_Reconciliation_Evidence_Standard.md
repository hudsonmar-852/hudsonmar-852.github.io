# Work Items Reconciliation Evidence Standard

## Long-term Retention

AIOS major-change reconciliation 必須同時保存 technical evidence 與 governance evidence，兩者不可互相取代。

### Required Evidence
- Proposal ID / impact level
- Direction confirmation evidence
- Execution confirmation evidence
- Approved baseline SHA
- Source commit inventory
- Source → reconciled commit mapping
- Shared-file conflict reconstruction notes
- Regression and validator results
- Secret scan / syntax / JSON / conflict-marker / whitespace checks
- Current-main divergence file list + overlap assessment
- Known production boundaries
- Rollback plan
- Final human review state

### Status Rule
`tests passed` ≠ `merge approved`

`mergeable=true` ≠ `approved to merge`

`disjoint divergence` ≠ `safe to auto-rebase/auto-merge`

所有 major change 在技術驗證後仍必須遵守 proposal-specific governance gate。
