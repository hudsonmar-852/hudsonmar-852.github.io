# Research to Versioned Public Knowledge

Status: Candidate / P1

## Purpose

將需要定期更新的研究結果轉成可追蹤、可驗證、可公開分享及可回退的知識資產。

## Workflow

`Research → Verify → Normalize → Personalize → Compare → Evidence Check → Publish Version → Registry → Public Library → Monitor Delta → Amend / Archive`

## Stage Contracts

### 1. Research
收集 primary / authoritative sources 與必要市場資料。

### 2. Verify
核對日期、資格、價格、費用、條款、官方名稱及來源可信度。

### 3. Normalize
統一比較單位、欄位、時區、貨幣、版本及 terminology。

### 4. Personalize
套用明確 Requirement / Recommendation Contract，不以泛化 persona 代替實際 usage profile。

### 5. Compare
按相同 profile、相同期間及相同假設比較候選項目。

### 6. Evidence Check
每個主要 claim 保存 supporting evidence、confidence、last_verified、requires_review。

### 7. Publish Version
建立不可混淆的版本號及 effective date。

### 8. Registry
更新 asset id、version、status、owner、public path、archive path、last_verified、next_review_date。

### 9. Public Library
只發布通過 Evidence / Quality Gate 的版本。

### 10. Monitor Delta
新優惠、政策、產品或來源改變時，只計算真正 Delta。

### 11. Amend / Archive
採 Add / Amend / Deprecate；保留上一版供 rollback 與 historical comparison。

## Failure Rules

- Freshness 不足：停止 Promotion，標記 requires_review。
- 主要來源矛盾：不得直接發布單一確定結論。
- Usage profile 改變：重新運算 recommendation ranking。
- 新版本未通過驗證：保留上一 Production Version。

## AIOS Alignment

與既有 Versioned Public Knowledge Publishing Pattern 合併使用，不建立新的 Foundation Layer。符合 Foundation v1.4 Incremental Context Evolution、Evidence-first、Requirements Contract 與 Evaluation-first 原則。
