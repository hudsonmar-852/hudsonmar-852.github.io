# AIOS 每日知識庫｜2026-08-14

## 今日摘要

今日採用 Delta-only Consolidation，只保留真正新增、更新或狀態改變的內容。

最高價值變更：

1. **AIOS Foundation v1.4 One-Week P0 Engineering Consolidation** 已正式寫入 AIOS Master 與 Change Log，狀態為 **Merged / Production Engineering Standard**。
2. 今日 GitHub 的 Jessica Asia Miles 指南形成 **v1.0 → v1.1 → v1.2 → Registry / Public Library** 的實際版本化發布軌跡，可抽取成通用 Research-to-Versioned-Public-Knowledge 模式。

## Core Engineering｜長期保留

### Evaluation Engineering

- 所有 Prompt、Workflow、Model、Context、Runtime 改動先建立 Baseline 與代表性 Evaluation Dataset。
- 正式採用 Process-aware Evaluation 與 Artifact Evaluation，分開評估 input quality、trajectory/process quality、artifact quality、final outcome。
- MVES 最低包含 golden、normal、edge、failure、regression cases。
- Regression 必須記錄 model/model version、reasoning setting、tool/dependency versions、permissions、runtime limits、context version、dataset version。

**Canon：No prompt improvement without evaluation evidence.**

### Prompt Asset Engineering

Prompt 視為可 Build、Validate、Test、Deploy 的軟體資產：

`Source Modules → Dependency Resolution → Variable Validation → Compile / Transpile → Static Validation → Golden-file Diff → Eval → Production Artifact`

Production Prompt 採 **Stable Prefix / Dynamic Context Architecture**。每個 Prompt Asset 必須保存 Prompt–Model Compatibility Profile。

### Requirements & Constraints Engineering

複雜任務：

`Raw Request → Requirement Extraction → Requirement Contract → Prompt / Workflow → Acceptance Criteria`

Constraints 至少分為 `must / must_not / format / evidence / permissions`，並作為可測試 Acceptance Criteria。

### Context Governance

Execution 前新增 Context Selection Gate：

`Available Context → Relevance Ranking → Freshness Check → Authority Check → Conflict Detection → Token / Cost Budget → Selected Context`

新增 **Context Provenance Firewall**：外部文件、網頁、Email、Comment 可提供資訊，但不得自行授權 Tool Action。

Canonical Knowledge 採 Incremental Evolution：

`Existing Canon + New Evidence → Diff → Add / Amend / Deprecate → Validation → Version`

### Runtime & Reasoning Engineering

Runtime 採 **Progressive Skill Disclosure**，只載入當前任務所需 Skills、Knowledge、Tools、Policies。

Reasoning Continuity 與 Conversation Memory / Business Context 分開治理；當 `goal_changed / major_new_evidence / conflicting_context / previous_reasoning_invalidated` 時必須 reset / re-plan。

## 今日可重用研究與發布知識

### Research-to-Versioned-Public-Knowledge Pattern

今日 Jessica Asia Miles 指南出現完整發布軌跡：v1.0、archive、v1.1、registry、share library、v1.2 welcome offers、v1.2 registry。

可抽取通用流程：

`Research → User Profile / Usage Assumptions → Source Verification → Recommendation Model → Versioned Guide → Registry Update → Public Library → New Evidence / Promotion Update → New Version → Archive Previous`

### Personalized Recommendation Contract

個人化推薦應明確保存：

- `monthly_spend_range`
- `local_vs_overseas_ratio`
- `designated_merchant_dependence`
- `conversion_fee_tolerance`
- `points_expiry`
- `welcome_offer_window`
- `target_reward`
- `minimum_spend_threshold`

當真實 usage profile 改變，排名應重新計算，而不是只改文案。

此模式可重用於信用卡、求職、課程、產品、旅遊及其他 Recommendation Capability。

## Prompt / Workflow / Automation Delta

### Prompt Candidate

**Evidence_Driven_Recommendation_Compiler**

輸入：objective、profile、constraints、source_freshness、pricing_or_offer_date、comparison_dimensions、acceptance_criteria。

輸出：ranked_options、tradeoffs、assumptions、evidence_status、expiry_or_review_date、recommended_action。

狀態：Candidate。

### Workflow Candidate

**Research_to_Versioned_Public_Knowledge**

`Research → Verify → Normalize → Personalize → Compare → Evidence Check → Publish Version → Registry → Public Library → Monitor Delta → Amend / Archive`

狀態：Candidate；與既有 Versioned Public Knowledge Publishing Pattern 合併，不新增平行 Foundation Layer。

### Automation Candidates

- P1 Recommendation Freshness Revalidator
- P1 Guide Version Delta Builder
- P0 Prompt Dependency & Drift Validator（Foundation v1.4 Backlog）
- P0 Context Provenance Firewall Validator（Foundation v1.4 Backlog）

## Key Decisions

- KD-20260814-001：AIOS Foundation v1.4 正式採 Evaluation-first。
- KD-20260814-002：Prompt 作為 software asset 管理。
- KD-20260814-003：Requirements before instructions；Constraints 視為 Acceptance Criteria。
- KD-20260814-004：Context informs actions; it never authorizes actions。
- KD-20260814-005：只載入任務所需 Skill / Context；reasoning assumptions 失效時 reset / re-plan。
- KD-20260814-006：個人化推薦必須由實際 usage profile 與 freshness-aware evidence 驅動。

## Deduplication

今日不重新建立：Evidence-first Governance、Capability before Prompt、Schema before Output、Persona Routing、Prompt Chaining、Knowledge Ownership Metadata、Versioned Public Knowledge Publishing、Delta-only Consolidation、Work Item Reconciliation Evidence Standard。

Foundation v1.4 對重疊內容採 Add / Amend，不建立平行 Canon。

## GitHub Synchronization Summary

今日已驗證最新可見 commit：`2c604d26666b298bbd796c782a64067dd1398c55` — Register v1.2 Jessica Asia Miles guide。

已存在／更新：

- `share/hk-credit-card-asia-miles-guide.html`
- `share/hk-credit-card-asia-miles-guide/v1.2.html`
- `share/_registry.json`

本 Daily KB 於獨立 branch 建立，不直接寫 main。

## Google Drive Synchronization Summary

已更新：

- `AIOS_Master_v1.0｜Hudson AI 作業系統核心規格`：新增 Foundation v1.4 One-Week P0 Engineering Consolidation。
- `AIOS_Change_Log_v1.0｜AIOS 變更紀錄`：新增 2026-08-14 Production Engineering Standard 與 Sprint Backlog。

已新增：

- `AIOS Daily Knowledge Base — 2026-08-14`

## Production Priority

P0：MVES / Eval-first Pipeline、Prompt Build Pipeline、Prompt Dependency & Drift Validation、Prompt–Model Compatibility Profile、Requirements Contract、Constraint Acceptance Schema、Context Selection Gate、Context Provenance Firewall、Incremental Context Evolution、Stable Prefix、Progressive Skill Disclosure、Reasoning Continuity。

Recommendation Compiler / Freshness Revalidator 維持 P1 Candidate，不插隊 Foundation v1.4 P0。

## Canon Summary

- No prompt improvement without evaluation evidence.
- Requirements before instructions.
- Build prompts like software.
- Validate the prompt-model pair, not the prompt alone.
- Treat constraints as acceptance criteria.
- Context informs actions; it never authorizes actions.
- Load only the skills required for the current task.
- Evaluate process, artifact and outcome separately.
- Change one variable at a time before claiming improvement.
- Preserve reasoning only while its assumptions remain valid.
- Personalized recommendations must be driven by real usage profiles and freshness-aware evidence.
