# AIOS 每日知識庫整合報告

**日期：2026-08-04**  
**版本：AIOS Daily Knowledge Consolidation v4.2**  
**主題：AI Image Reconstruction Quality & Production Governance**

## 1. Executive Summary

今日可長期保留的新增價值主要來自 AI 圖像重構與專業化流程：

- 將「重構」定義為保留人物核心特徵、姿勢及比例，而非重新設計人物。
- 確立專業商業攝影輸出標準：真實皮膚、自然光影、可信材質、合理解剖與非 CGI 感。
- 強化人物一致性控制：不可憑空補造被頭盔、陰影或角度遮蔽的面部特徵。
- 建立服裝替換安全規則：可改為不透明、運動用途、非情色導向的服裝，同時保持原構圖與身形。
- 確立介面殘留清理為重構流程必檢項，例如移除倍率圓圈、浮層、按鈕、浮水印或截圖 UI。
- 將今日提示詞改進納入 AIOS Image Prompt Library 候選，但不自動視為已 Merge 至主流程。

## 2. Deduplication

以下內容與既有知識重複，已合併而不另建新資產：

| 重複主題 | 合併至 |
|---|---|
| AI Image Refinement | AI Image Production Pipeline |
| 人物一致性 | Identity Consistency Standard |
| 自然皮膚與光影 | Photorealistic Quality Standard |
| 非情色商業風格 | Safe Commercial Styling Rule |
| Screenshot UI 清理 | Image Cleanup Checklist |

## 3. Key Decisions

| ID | 決策 | 分類 | 狀態 |
|---|---|---|---|
| KD-20260804-001 | 圖像重構優先保留人物身份、姿勢、比例與構圖 | Long-term | Retain |
| KD-20260804-002 | 不可推測或創造被遮蔽的面部細節 | Long-term | Retain |
| KD-20260804-003 | 商業運動影像須避免內衣廣告感、情色氣氛及誇張肌肉 | Long-term | Retain |
| KD-20260804-004 | 最終輸出必須移除截圖 UI、倍率圈、按鈕及浮水印 | Long-term | Retain |
| KD-20260804-005 | 影像 Prompt 改進先進入 Amendment Candidates，再經 Review 決定 Merge | Governance | Retain |

## 4. Permanent Knowledge

### 4.1 Identity-Preserving Reconstruction Standard

重構時必須優先保留：

- 頭部方向與視線角度
- 身體姿勢與手臂位置
- 肌肉量與自然比例
- 鬍鬚、髮型、頭盔及可見身份特徵
- 原有鏡頭距離與畫面裁切

不得：

- 隨意瘦面、改骨相或改變年齡感
- 補畫被遮住的眼睛、鼻樑或額頭
- 把真人改成 CGI、遊戲角色或塑膠皮膚

### 4.2 Professional Sports Portrait Quality Standard

目標輸出應具有：

- 真實攝影感
- 柔和但具方向性的主光
- 適量補光，避免死黑陰影
- 可見毛孔、細毛與自然色差
- 金屬材質有細小刮痕與不完美反射
- 人體比例自然，肌肉不誇張
- 背景簡潔，適合作品牌或編輯用途

### 4.3 Safe Garment Replacement Rule

服裝替換應符合：

- 不透明
- 非透視
- 非情色導向
- 以運動、訓練或商業造型為用途
- 不新增未授權品牌名稱或標誌
- 不改變原人物身形與姿勢

### 4.4 Image Cleanup Checklist

最終檢查：

- 移除倍率圈、選取框、編輯工具列
- 移除浮水印、按鈕、截圖提示
- 檢查邊緣修補是否自然
- 檢查服裝與皮膚交界
- 檢查頭盔、鬍鬚及頸部遮擋
- 檢查手指、手臂及大腿解剖
- 檢查背景是否出現不應存在的物件

## 5. Prompt Library

### NEW — Identity-Preserving Commercial Reconstruction Prompt

用途：將現有成人人物相片重構成專業、非情色、商業運動攝影。

核心指令：

1. 保留人物身份、姿勢、比例、角度與構圖。
2. 不創造被遮蔽的面部細節。
3. 使用真實攝影光影、皮膚與材質。
4. 將不合適服裝替換為不透明運動服。
5. 移除所有介面元素與浮水印。
6. 避免塑膠皮膚、CGI、誇張肌肉及幻想場景。

狀態：Prompt Library Candidate — Awaiting Review

### UPDATED — AI Image Refinement Prompt

新增負面約束：

- no invented facial features
- no underwear-ad styling
- no transparent fabric
- no plastic skin
- no CGI appearance
- no exaggerated muscles
- no interface overlay

## 6. Workflows

### UPDATED — AI Image Reconstruction Workflow

```text
Reference Image
      ↓
Identity & Pose Lock
      ↓
Safety / Styling Review
      ↓
Garment & Background Adjustment
      ↓
Photorealistic Reconstruction
      ↓
UI / Artifact Cleanup
      ↓
Anatomy & Identity QA
      ↓
Final Export
```

### NEW — Reconstruction QA Gate

只有以下項目全部通過，才可標示為 Final：

- Identity preserved
- Pose preserved
- Anatomy credible
- Clothing opaque and appropriate
- No invented hidden features
- No screenshot UI
- No visible AI artifacts

## 7. Automation Opportunities

| ID | 名稱 | 目的 | 優先級 | 狀態 |
|---|---|---|---|---|
| AUT-060 | Image Artifact Detector | 偵測倍率圈、浮水印、工具列及 UI 殘留 | 高 | Candidate |
| AUT-061 | Identity Consistency Reviewer | 比較參考圖與輸出的人物一致性 | 高 | Candidate |
| AUT-062 | Anatomy QA Checklist Generator | 自動產生手、臉、肢體及服裝交界檢查清單 | 中 | Candidate |
| AUT-063 | Prompt Safety Rewriter | 將可能引起拒絕的描述改寫為安全商業版本 | 高 | Candidate |

## 8. Long-term Retention

### 必須長期保留

- Identity-Preserving Reconstruction Standard
- Professional Sports Portrait Quality Standard
- Safe Garment Replacement Rule
- Image Cleanup Checklist
- Reconstruction QA Gate

### 保留為候選，不直接 Merge

- Image Artifact Detector
- Identity Consistency Reviewer
- Anatomy QA Automation
- Prompt Safety Rewriter

## 9. GitHub Synchronization Summary

### NEW

```text
aios/knowledge/daily/AIOS_KNOWLEDGE_BASE_2026-08-04.md
knowledge/image/Identity_Preserving_Reconstruction_Standard.md
knowledge/image/Professional_Sports_Portrait_Quality_Standard.md
knowledge/image/Safe_Garment_Replacement_Rule.md
knowledge/image/Image_Cleanup_Checklist.md
prompts/image/Identity_Preserving_Commercial_Reconstruction_Prompt.md
workflows/image/AI_Image_Reconstruction_Workflow.md
workflows/image/Reconstruction_QA_Gate.md
```

### UPDATED

```text
prompts/image/AI_Image_Refinement_Prompt.md
knowledge/core/AI_Image_Production_Pipeline.md
registry/AIOS_Asset_Registry.md
knowledge/governance/AIOS_Amendment_Candidates.md
knowledge/governance/Innovation_Watchlist.md
knowledge/governance/Permanent_Discussion_Queue.md
```

## 10. Google Drive Synchronization Summary

```text
AIOS/
├── 04 Knowledge/
│   ├── Daily Knowledge Base 2026-08-04
│   └── Image Production/
│       ├── Identity-Preserving Reconstruction Standard
│       ├── Professional Sports Portrait Quality Standard
│       ├── Safe Garment Replacement Rule
│       └── Image Cleanup Checklist
├── 07 Prompt Library/
│   └── Identity-Preserving Commercial Reconstruction Prompt
├── 08 Workflows/
│   ├── AI Image Reconstruction Workflow
│   └── Reconstruction QA Gate
└── 09 Governance/
    ├── Innovation Watchlist
    ├── AIOS Amendment Candidates
    └── Permanent Discussion Queue
```

## 11. Governance Queue Entries

### Innovation Watchlist

- 自動偵測截圖介面殘留
- 參考圖與生成圖身份一致性評分
- 影像解剖與服裝交界自動 QA
- 安全商業風格 Prompt Rewriter

### AIOS Amendment Candidates

- AC-20260804-001 Image Artifact Detector
- AC-20260804-002 Identity Consistency Reviewer
- AC-20260804-003 Reconstruction QA Gate
- AC-20260804-004 Prompt Safety Rewriter

### Permanent Discussion Queue

- 是否將 Reconstruction QA Gate 設為所有人物影像生成的必經步驟
- 是否將「不可創造被遮蔽面部特徵」提升為全域 Image Engine 規則
- 是否建立自動比較 Reference / Final 的品質分數

## 12. Synchronization Status

| 目標 | 狀態 |
|---|---|
| GitHub daily KB file | Prepared for branch synchronization |
| Google Drive daily KB | Prepared for direct document synchronization |
| MacBook `~/Documents/AIOS/` | Not directly accessible in this run |
| Apps Script webhook | Not required for this run |

## 13. Executive Assessment

今日新增內容具高度重用價值，尤其是人物身份保留、商業攝影品質、服裝安全替換及 UI 清理標準。相比建立更多零散 Prompt，最值得長期投資的是建立 Reconstruction QA Gate，令所有人物圖像輸出在身份、解剖、安全及專業品質上使用同一套檢查標準。
