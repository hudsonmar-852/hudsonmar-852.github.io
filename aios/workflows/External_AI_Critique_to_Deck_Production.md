# External AI Critique → AIOS Deck Production Workflow

## Goal
將 Gemini、Perplexity 或其他外部 AI 對簡報的建議安全地納入 AIOS，而不把第三方建議直接當作已批准或已 Merge 的規格。

## Workflow
1. Collect — 收集原始 Deck、講稿、節目時長與外部 critique。
2. Normalize — 將建議拆成 Structure、Visual、Timing、Copy、Brand、Risk 六類。
3. Deduplicate — 合併相同或近似建議，保留來源及差異。
4. Validate — 檢查是否符合受眾、時長、事實完整性、平台限制及現有 AIOS 規則。
5. Decide — 每項標記 Accept / Modify / Reject，不直接 Merge。
6. Restructure — 先做 Story Compression，再重新編排頁序與節奏。
7. Visual Map — 把段落映射至 Timeline、Balance、Funnel、Flow 等視覺語義。
8. Timing Pass — 估算每頁停留時間與旁白長度，修正超時。
9. QA — 檢查一頁一訊息、文字密度、視覺一致性、重複內容及關鍵限定資訊。
10. Publish — 產出 Deck + Speaker Notes + Sync Summary。

## Governance Gate
- External critique ≠ approved change.
- Knowledge candidate ≠ implemented automation.
- Draft branch / PR ≠ production merge.
- 所有 Done / Merged / Production 狀態必須有可驗證 evidence。
