# Evidence-Driven Recommendation Compiler

Status: Candidate / P1

## Objective

將外部研究、使用者實際 usage profile、限制條件、價格／優惠時效及比較維度編譯成可驗證的推薦排序，避免以泛化 persona 或單一高消費假設取代真實條件。

## Input Contract

- objective
- profile
- constraints
- source_freshness
- pricing_or_offer_date
- comparison_dimensions
- acceptance_criteria
- review_date

常用 profile 欄位：

- monthly_spend_range
- local_vs_overseas_ratio
- designated_merchant_dependence
- conversion_fee_tolerance
- points_expiry_tolerance
- welcome_offer_window
- target_reward
- minimum_spend_threshold

## Processing Rules

1. 先抽取 Requirement Contract，再建立比較模型。
2. 時效性資料必須標示 source_freshness / last_verified。
3. 使用者 usage profile 改變時必須重新計算 ranking，不得只重寫結論。
4. 分開 base-rate value、promotion value、threshold risk、fee cost、expiry risk。
5. 所有推薦保存 assumptions、evidence_status 與 review_date。
6. 缺乏足夠 evidence 的項目標示 requires_review，不得升格為確定結論。

## Output Contract

- ranked_options
- fit_score
- tradeoffs
- assumptions
- evidence_status
- expiry_or_review_date
- recommended_action
- rejected_or_lower_ranked_reasons

## Validation

- Requirements satisfied
- Constraints tested
- Freshness checked
- Same-profile comparison
- No hidden threshold assumption
- Evidence attached
- Review date assigned

## AIOS Alignment

符合 Foundation v1.4：Requirements before instructions、Evaluation-first、Constraints as Acceptance Criteria、Context Provenance、Incremental Evolution。
