# AIOS 每日知識庫｜2026-09-02

## 1. 今日摘要

今日採用 Delta-only Consolidation。主要新增集中於 Human Image Visual QA，尤其是多尺度皮膚真實度檢核；既有 Multi-reference Role Assignment、Structured Job Contract、Atomic Edit + Locks、Smallest-correction-first Repair、Human Approval Gate 保持引用，不重複建立。

GitHub 核證顯示本次同步前 main 最新 commit 仍為 `0bddc2a0935abed4e69dee9902bf4f2801ca0b90`（2026-08-28，P0 final baseline merge）。因此今日 Image QA 改進屬 P1 knowledge/workflow delta，不改寫 frozen P0 baseline。

## 2. 長期保留知識

### Multi-scale Skin Realism QA
人像生成／編輯不可只在 full-frame 預覽判斷皮膚品質。至少檢查：

1. Full frame：整體自然度、光影與膚色一致性。
2. Face crop：毛孔、細紋、重建痕跡、過度平滑。
3. Body / limbs crop：手臂、手部、胸肩等紋理與血管密度。
4. 100–200% zoom：重複 synthetic pores、裂紋／網格狀紋理、oversharpen halo、denoise/reconstruction artifacts。

### Reject Conditions
出現以下情況應判定 QA fail：
- 誇張 crack/grid/wrinkle texture
- 重複或規律 synthetic pores
- 過量或不自然 veins
- oversharpen halos
- waxy / plastic smoothing
- 過高 local contrast / highlights
- denoise / reconstruction artifacts

### Preserve Conditions
應保留：
- 低幅度自然毛孔
- 不規則細微 microtexture
- 與年齡／光線相符的細紋
- 合理、非密集的血管可見度
- 連續自然的 shading / skin tone

### Structural QA Before Resolution
Canonical order：
`Structure / Identity / Skin / Lighting QA → Smallest Correction → Re-QA → Final Resolution Enhancement → Human Approval`

Upscale / 4K enhancement 不得用來掩蓋原始生成 defect；高解析度只應在結構與皮膚 QA 通過後執行。

## 3. Workflow 更新

更新 Governed Image Edit Execution：

`Request → Reference Role Assignment → Structured Job Contract → Lock Validation → Generate/Edit → Full-frame QA → Face/Body Crop QA → 100–200% Skin QA → Diagnose → Smallest Correction → Re-QA → Resolution Pass → Human Approval`

## 4. Prompt / Contract 更新

建議更新 `Multi_Reference_Image_Job_Contract_Compiler` 與 Visual QA Contract，加入：

- `qa_scales`: full_frame / face_crop / body_crop / zoom_100_200
- `skin_reject_conditions`
- `skin_preserve_conditions`
- `vein_density_check`
- `oversharpen_check`
- `reconstruction_artifact_check`
- `resolution_pass_allowed_after_qa`

## 5. Automation Candidates

- P1 Multi-scale Skin QA Validator
- P1 Synthetic Texture / Repetition Detector
- P1 Vein Density & Anatomy Plausibility Check
- P1 Resolution-pass Gate

全部維持 Candidate；未有 implementation evidence 不標記為 Production。

## 6. 去重 / Reference Only

不重新建立：Evidence-first Governance、Delta-only Consolidation、Structured Job Contract、Multi-reference Role Assignment、Atomic Edit + Locks、Immutable Revision Lineage、Smallest-correction-first Repair、Human Approval Gate、Internal Baseline ≠ Final Approval。

## 7. GitHub / Drive 同步狀態

GitHub：本 Daily KB 寫入獨立 branch `aios/daily-kb-2026-09-02`；不宣稱 merged to main。

Google Drive：同步前未找到 `AIOS Daily Knowledge Base — 2026-09-02`；目前可用 Drive action 未提供建立／更新文件能力，因此維持 copy-ready / not synced。
