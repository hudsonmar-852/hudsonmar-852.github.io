# Governed Work Items Reconciliation Workflow

`Proposal → Direction Confirmation → Execution Confirmation → Approved Baseline Freeze → Source Commit Inventory → Reconciliation Mapping → Shared-file Conflict Reconstruction → Regression + Security Validation → Current-main Divergence Analysis → Draft PR → Human Review → Merge Decision`

## Gates

1. **Approval Gate**：Direction 與 Execution 必須分開完成。
2. **Baseline Gate**：記錄 approved baseline SHA，禁止靜默漂移。
3. **Traceability Gate**：所有 source commits 都有 reconciliation mapping。
4. **Conflict Gate**：shared files 必須人工重建必要功能。
5. **Evidence Gate**：tests、validators、secret scan、syntax、JSON、conflict marker、whitespace 全部有紀錄。
6. **Divergence Gate**：分析 current main 是否有 overlap；disjoint 不代表可以自動 merge。
7. **Production Boundary Gate**：read-only/write/deployment/permission 狀態必須如實標示。
8. **Human Merge Gate**：Draft PR 不得自動升級或 auto-merge。

## Rollback

在未 Merge 前直接關閉 Draft PR；若日後 Merge，使用對應 reconciliation commits 的 revert plan。任何 operational Drive data mutation 必須另有獨立 rollback。
