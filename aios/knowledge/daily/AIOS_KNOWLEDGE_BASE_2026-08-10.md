# AIOS 每日知識庫 — 2026-08-10

## Executive Summary

今日採用 Delta-only Consolidation。已排除與 AIOS 長期知識無關的個人行政／日常事項，保留真正可重用的 AI 創作、簡報重構及治理知識。

今日主要新增方向：
1. 8 分鐘教育節目簡報的 Story Compression 與 Visual Rhythm 標準。
2. 將外部 AI（例如 Gemini）的建議視為 critique input，再由 AIOS 驗證、去重及決策，而非直接 Merge。
3. 建立低文字密度、視覺語義化的簡報轉換規則。

## Key Decisions

### KD-20260810-001 — Airtime-driven Deck Architecture
對教育節目／短時段簡報，頁數及內容密度必須由播出時間反推。8 分鐘單元不應沿用傳統長篇報告型簡報。

狀態：Permanent Knowledge Candidate
長期價值：★★★★★

### KD-20260810-002 — Visual Semantics over Paragraphs
長段文字應優先轉化為可視化語義：
- 時序／程序 → Timeline
- 雙方觀點／取捨 → Balance / Compare
- 篩選／決策 → Funnel
- 多階段方法 → Process Flow

狀態：Permanent Knowledge Candidate
長期價值：★★★★★

### KD-20260810-003 — External AI Critique Is Input, Not Authority
Gemini、Perplexity 或其他 AI 的建議可納入 AIOS Critique Layer，但必須經過：
Validate → Deduplicate → Fit-to-goal → Risk Check → Accept / Modify / Reject。
不得因第三方模型提出建議而直接視作 AIOS 已 Merge 決策。

狀態：Permanent Knowledge Candidate
長期價值：★★★★★

## Reusable Knowledge

### Presentation Story Compression Standard
原則：
- 一頁一個主要訊息。
- 先定節目節奏，再定頁數，而不是先保留所有原始內容。
- 每頁只保留觀眾當下需要理解的資訊。
- 詳細論證移至講稿／speaker notes，而非塞入投影片。
- 視覺節奏需有 Hook、Context、Conflict/Contrast、Resolution、Takeaway。

### Visual Style Profile — Sports Dispute Resolution Project
此組 Design Tokens 目前只屬 Project-level reusable profile，未提升為 AIOS Global Theme：
- 主色：Deep Tech Blue #1A3B5C
- Accent：Orange #F5A623
- 標題：粗黑體
- 內文：Microsoft YaHei / 相近清晰中文字體
- 視覺：Timeline、Balance、Funnel 優先於長篇文字

## New Prompt Asset

- Deck_Compression_Visual_Narrative_Optimizer.md

## New Workflow Asset

- External_AI_Critique_to_Deck_Production.md

## Automation Candidates

### AC-20260810-001 — Slide Density Linter
檢查每頁字數、要點數、標題長度及資訊密度，標示需要拆頁或圖像化的頁面。
狀態：Candidate / Not Implemented

### AC-20260810-002 — Narrative Timing Estimator
根據總播出時間、每頁預估停留時間及旁白字數，估算簡報是否超時。
狀態：Candidate / Not Implemented

### AC-20260810-003 — Visual Semantic Mapper
識別段落中的 time / compare / process / filter 關係，自動建議 Timeline、Balance、Flow、Funnel 等視覺形式。
狀態：Candidate / Not Implemented

## Deduplication Notes

未重新建立以下既有知識：
- Evidence-first Governance
- Delta-only Daily Consolidation
- Independent Work Item Principle
- Character Consistency Standard
- Jeffrey Coaching OS Lifecycle
- Authenticated Browser Agent Principles

以上保持 Reference Only，避免每日 KB 重複膨脹。

## GitHub / Google Drive Sync Intent

本日建議同步：
NEW
- aios/knowledge/daily/AIOS_KNOWLEDGE_BASE_2026-08-10.md
- aios/prompts/Deck_Compression_Visual_Narrative_Optimizer.md
- aios/workflows/External_AI_Critique_to_Deck_Production.md

CANDIDATES / NOT IMPLEMENTED
- Slide Density Linter
- Narrative Timing Estimator
- Visual Semantic Mapper

No direct production merge is implied by this knowledge-base update.
