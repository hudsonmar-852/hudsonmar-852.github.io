# AIOF Workflow Positioning Standard

## Purpose

定義 AIOF 在 AIOS / enterprise AI workflow 中的建議位置、排序原則及 validation loop，避免 AIOF 只成為展示名稱而沒有實際 operating role。

## Default Position

`Problem / Context → Requirements / Constraints → AIOF → Standards / Controls → Tool / Model Routing → Execution → Evidence / QA → Outcome`

AIOF 應在需求已清楚後介入，負責 orchestration、decision logic、workflow shaping 及 governance framing；具體工具、Prompt、Agent 或 Automation 應在 AIOF 之後選擇。

## Dual-Gate Pattern

對需要強調治理或品質控制的流程，使用：

`AIOF Design Gate → Execution → AIOF Validation Gate`

Design Gate 檢查：
- objective / scope
- requirements / constraints
- routing logic
- standards / controls
- evidence requirement

Validation Gate 檢查：
- outcome 是否符合 requirement
- evidence 是否完整
- exceptions / risks
- rollback / next action

## Ordering Rules

1. **AIOF 不應預設排最尾。** 放最尾會令它看似 retrospective summary，而不是 operating framework。
2. **AIOF 不應早於 problem / requirement discovery。** 否則框架會在沒有足夠 context 下作出 routing。
3. **AIOF 應早於 tool selection。** Framework-before-Tool 是預設規則。
4. **可在尾端再次引用 AIOF。** 尾端用途是 validation，不是首次出現。
5. **不同 use case 可改變內部步驟，但不改變角色。** AIOF 的角色是 orchestration / governance，不是某一個固定工具。

## Definition Contract

每個對外使用的 AIOF 說明至少保存：

- Name
- One-line definition
- Purpose
- Scope
- Inputs
- Decision / orchestration logic
- Controls / standards
- Outputs
- Evidence requirements
- Example application
- Implementation status

## Evidence Boundary

可描述：
- 自行設計的 framework / methodology
- 已實際用於個人 AIOS workflow 的設計與治理方式
- 有 evidence 的 implementation / validation

不可在沒有證據時描述為：
- 已被某企業正式採用
- 已 production deployed
- 已產生未驗證的商業成果

## Recommended Visual

`Context & Requirements`
`↓`
`AIOF Orchestration Layer`
`↓`
`Standards / Guardrails`
`↓`
`Models / Tools / Agents / Automation`
`↓`
`Execution & Evidence`
`↓`
`AIOF Validation Loop`

此結構同時適合 CV supplementary page、portfolio、面試解釋及 AIOS Knowledge Base。