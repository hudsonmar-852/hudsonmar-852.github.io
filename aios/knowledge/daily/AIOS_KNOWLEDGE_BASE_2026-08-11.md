# AIOS 每日知識庫 — 2026-08-11

## Executive Summary

今日採用 Delta-only Consolidation，只保留 2026-08-11 的新增或狀態變更。核心增量是 Work Items reconciliation 與治理證據標準化：PR #32 已建立，完成兩階段批准、回歸測試、production validator、AvatarOS validator、secret scan、syntax/JSON/conflict-marker/whitespace checks，但仍受 Draft/人工審核限制，未 Merge。

## 今日新增／更新

### 1. Governed Work Items Reconciliation
- Proposal: `P-WORK-ITEMS-RECON-001`
- Direction confirmation: completed
- Execution confirmation: completed
- Delivery restriction: Draft PR only
- Auto-merge: prohibited
- Human review remains mandatory

### 2. Reconciliation Evidence Standard
所有 major-change reconciliation 應保留：
1. approved baseline SHA；
2. source commit → reconciled commit mapping；
3. shared-file conflict reconstruction evidence；
4. regression/test results；
5. validator/secret-scan evidence；
6. current-main divergence analysis；
7. rollback path；
8. explicit governance state。

### 3. Disjoint Main Divergence Rule
若 approved baseline 與 current main 有 divergence，必須分析 changed files 是否與 reconciliation scope 重疊。即使屬 disjoint change，也不可跳過 human review 或自行 rebase/merge。

## Key Decisions / Reusable Knowledge

### LONG-TERM RETENTION — ★★★★★
- **Approved Baseline Preservation**：大型 reconciliation 必須保留已批准 baseline，不能為追 main 而靜默改變批准範圍。
- **Source-to-Reconciled Commit Mapping**：每個批准來源 commit 必須可追溯至 reconciliation commit。
- **Manual Reconstruction over Blind Conflict Choice**：共享檔案衝突應重建雙方必要功能，而不是簡單選 ours/theirs。
- **Evidence Before Status Promotion**：測試通過不等於可 Merge；治理狀態與技術驗證必須同時通過。
- **Read-only Production Boundary**：Work Items 對 operational Drive 仍維持 read-only；production Drive writes 仍只是 proposal。

## Prompt
新增：`Work_Item_Reconciliation_Review_Prompt.md`

## Workflow
新增：`Governed_Work_Items_Reconciliation_Workflow.md`

## Automation Candidates
- Reconciliation Commit Mapper — Candidate
- Main Divergence Scope Checker — Candidate
- Evidence Completeness Gate — Candidate
- Draft PR Governance Guard — Candidate

上述全部仍為 Candidate，不視為 implemented。

## Deduplication
不重複建立：Evidence-first Governance、Independent Work Item Principle、Persistent Work Ledger、Delta-only Consolidation、External AI Critique Rule。今日只記錄 reconciliation 新增層。

## GitHub Evidence
- PR #32: `AIOS: reconcile governed Work Items dashboard and validation hardening`
- Created: 2026-08-11
- Head: `cc834103dc177476427455ab1ce3c4884876989e`
- Base: `main` / `79918f64de3aa64fdf03395fbdbbb117e984adcd`
- Commits: 6
- Status: Open, not merged
- Local validation: 40/40 tests passed; production validator passed; AvatarOS validator passed; secret scan passed; syntax/JSON/conflict-marker/whitespace checks passed.

## Synchronization Classification
- GitHub daily KB: NEW
- Reconciliation review prompt: NEW
- Reconciliation workflow: NEW
- Evidence standard: NEW
- Existing governance assets: REFERENCE ONLY
