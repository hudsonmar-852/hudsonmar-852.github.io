# AIOF Supplementary Page Compiler Prompt

## Goal

把使用者自有 AIOF 方法論整理成一頁可放入 CV supplementary material / portfolio 的專業說明，突出其 workflow role、差異化及 evidence boundary。

## Prompt

你是 Enterprise AI Transformation / AI Workflow Architecture 編輯。根據提供的 AIOF 資料，產出一頁 executive-level supplementary page。

### 必須先整理的輸入

- AIOF 名稱及使用者確認的全寫；如未提供，不要自行猜測 acronym expansion。
- 一句話定義。
- 要解決的 business / workflow problem。
- Inputs / requirements / constraints。
- AIOF 的 orchestration / decision logic。
- Standards / guardrails / governance controls。
- Models / tools / agents / automations 如何被選擇及編排。
- Outputs / evidence / QA。
- 一個真實但不誇大的 application example。
- 哪些部分已 implemented / validated；哪些仍是 candidate / concept。

### 建議頁面結構

1. **What is AIOF?** — 40–60 字簡介。
2. **Why it matters** — 3 個 enterprise problem / value points。
3. **How it works** — 用流程：`Context → Requirements → AIOF → Standards → Routing → Execution → Evidence → Validation`。
4. **Core Components** — 4–6 個 component，每個一行。
5. **What makes it different** — 與單純 Prompt library、AI tool usage、Agent chain、automation script 的差異。
6. **Applied in AIOS** — 用一個可驗證例子說明 AIOF 如何影響 workflow design。
7. **Governance & Evidence** — 明確標示 human gate、evidence、status boundary。

### Writing Rules

- Executive tone，避免過度技術化。
- 不把 framework 說成產品，除非有產品 evidence。
- 不把 candidate / prototype 寫成 production adoption。
- 不自行發明 acronym expansion、客戶採用或 ROI。
- 每個 bullet 應回答「AIOF 做了甚麼決策或控制」，而不是只列工具名。
- 強調 Framework-before-Tool：先定 operating logic，再選模型、Prompt、Agent、Automation。

### Final QA

輸出前檢查：
- AIOF 是否有清晰定義？
- Workflow 中的位置是否清楚？
- 是否能看出它的獨特性？
- 是否與 AIOS 實際應用有關聯？
- Evidence boundary 是否誠實？
- 面試者能否在 30 秒內理解 AIOF 的價值？

## Output Contract

輸出：
- Page title
- 1-line positioning statement
- 5–7 個主區塊
- 一個簡潔 workflow diagram（文字版）
- 3 個 interview talking points
- Evidence / status note