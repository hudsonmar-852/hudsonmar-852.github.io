# AIOS Daily Knowledge Base — 2026-08-15

## 1. Executive Delta

今日採用 Delta-only Consolidation，只記錄 2026-08-15 真正新增、更新或狀態改變的 AIOS 資產。

今日最高價值增量：

1. Executive Dashboard 已建立 Draft PR #35，將 Work Items、Knowledge、Governance、EO-006、P0/P1/P2 priority 放在同一 operational snapshot。
2. Cost-per-Task、Model Routing、Execution Evidence 被正式記錄為 governed engineering candidates。
3. 求職自動化流程收斂成多層 capability routing：ChatGPT/Work 負責規劃與知識整合；Agent/Connected tools 負責外部或登入式資料取得；Codex 負責 deterministic implementation、tests、repo changes；結果回到 Daily Dashboard。
4. Job-seeking pipeline 收斂為：Find Jobs → Deduplicate → CV Match → Rank → Deep Research Top Jobs → Cover Letter → Application Checklist → Gmail Tracking → Daily Dashboard。
5. MacBook Skills 討論抽取成「Skill-as-Operational-Module」候選模式：Skill 應封裝 SOP、input/output contract、constraints、tool routing 與 reusable instructions，而非只是保存單一 Prompt。

## 2. Key Decisions / Long-term Retention

### 2.1 Capability-first Model Routing — Long-term Candidate ★★★★★

不要用同一個高成本執行模式處理所有工作。先判斷任務需要的能力，再路由：

- ChatGPT / Work：需求分析、規劃、知識整合、產出草稿、決策支援。
- Agent / Connected tools：需要登入、瀏覽、多來源採集或 connected-data read 的工作。
- Codex：程式實作、測試、repo 修改、可重現轉換、validator。
- Human Gate：申請送出、敏感寫入、production merge、不可逆操作。

Rule: expensive capability is selected by necessity, not by default.

### 2.2 Cost-per-Task Governance — Long-term Candidate ★★★★★

每個 workflow stage 應記錄：
- capability / model route
- expected value
- execution evidence
- retry cost
- human review requirement

Cost 優化不得以降低 evidence quality 或繞過 governance gate 為代價。

### 2.3 Job Search as a Governed Pipeline — Long-term Candidate ★★★★★

Canonical flow:

Find Jobs → Normalize → Deduplicate → Hard-filter → CV Match → Explainable Score → Rank → Deep Research Top Jobs → Tailored Application Assets → Checklist → Gmail Follow-up → Daily Dashboard

重要原則：
- 排名與推薦必須可解釋。
- Deep Research 只用於 Top shortlist，避免對所有職位使用高成本研究。
- Cover Letter / CV tailoring 必須基於已驗證 JD 與 CV evidence。
- Apply / Send 行動維持 Human Gate。
- 已申請、Not Suitable、Duplicate 必須寫回 ledger，避免每日重複處理。

### 2.4 Skill-as-Operational-Module — Long-term Candidate ★★★★☆

Skill 不應等同 Prompt 檔案。建議 Skill 最少包含：
- purpose
- trigger / when to use
- required inputs
- tool/capability routing
- execution SOP
- constraints / safety boundaries
- output contract
- QA / evidence checklist
- version / owner

適合建立的 AIOS Skills：Job Match、CV Evidence Compiler、Research Verifier、GitHub Knowledge Publisher、Drive Sync Reporter、Daily KB Consolidator。

### 2.5 Quota-aware Orchestration — Design Candidate ★★★★☆

將高成本 Agent work 集中於少量高價值 stage；其他 deterministic/repeatable stage 交由 Codex、scheduled workflow 或 standard ChatGPT execution。任何 quota reuse / schedule-slot reuse 均只作 orchestration design，不假設平台 quota 可被動態回收，除非有產品層 evidence。

## 3. Reusable Prompt Delta

### NEW Candidate: `Capability_Routed_Job_Search_Orchestrator_Prompt`

目的：把求職任務拆成 stages，為每個 stage 選擇最低足夠能力，只有 Top jobs 進入 expensive research。

Required output:
- Stage
- Input
- Capability Route
- Decision Rule
- Evidence
- Human Gate
- Output Asset

## 4. Workflow Delta

### NEW Candidate: `Capability_Routed_Job_Search_Pipeline`

1. Collect job candidates
2. Normalize fields
3. Deduplicate against daily/history ledger
4. Apply exclusions / hard constraints
5. CV semantic + evidence match
6. Explainable score and ranking
7. Deep research only Top N
8. Produce tailored cover letter / CV notes
9. Produce application checklist
10. Human apply decision
11. Gmail follow-up tracking
12. Update Daily Dashboard and ledger

## 5. Automation Candidates

- P1 Job Intake + Dedup Collector
- P1 CV Match & Explainable Ranker
- P1 Top-N Research Router
- P1 Gmail Application Follow-up Reconciler
- P1 Daily Job Dashboard Publisher
- P1 Cost-per-Task Recorder
- P1 Execution Evidence Completeness Gate
- P2 Skill Registry / Skill Dependency Indexer

所有項目維持 Candidate，除非 repository/runtime 有 implementation evidence。

## 6. Deduplication

今日沒有重新建立以下既有 Canon：
- Evidence-first Governance
- Delta-only Daily Consolidation
- Independent Work Item Principle
- Persistent Work Ledger
- Requirements Contract
- Context Provenance Firewall
- Progressive Skill Disclosure
- Work Item Reconciliation Evidence Standard
- Versioned Public Knowledge Publishing

今日新增內容只作上述 Canon 的新應用：cost-aware routing、job-seeking orchestration、Skill module packaging。

## 7. Verified Repository State

- Draft PR #35 exists: `AIOS Executive Dashboard — 2026-08-15`.
- PR #35 explicitly records Cost-per-Task, Model Routing and Execution Evidence as governed engineering candidates.
- Latest verified main commit before this knowledge write was `2c604d26666b298bbd796c782a64067dd1398c55` (`Register v1.2 Jessica Asia Miles guide`, 2026-08-14 UTC).
- Existing Draft PRs are not automatically merged by this consolidation.

## 8. Promotion Boundary

Knowledge recorded here does not imply production implementation. Promotion requires repository/runtime evidence, validation, and applicable human/governance approval.
