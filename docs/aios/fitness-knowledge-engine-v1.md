# AIOS Fitness Knowledge Engine v1.0

## Status
Approved for merge as an AIOS production specification. Runtime wiring remains subject to locating the current reminder data file and renderer.

## Purpose
Add evidence-based, lesser-known fitness and recovery knowledge to the existing Hong Kong gym reminder workflow without removing or replacing old reminders.

## Core integration rules

1. Preserve all existing reminders and tracking fields.
2. New knowledge items use `unshift()` and appear before older items.
3. Add and pin category `健身冷知識` immediately after `今日天氣`.
4. Category filters must auto-register the new category.
5. Preserve `copyCount`, `usageCount`, `lastCopiedAt`, `createdAt`, and `lastUsedAt`.
6. Output language must be Hong Kong Cantonese only.
7. Style must be short, WhatsApp-friendly, modern gym-instructor tone, low-AI and low-sales.
8. Weather remains highest priority when directly relevant; knowledge content must not force a weather angle.

## Knowledge categories

- Myth Buster
- Recovery Secret
- Hidden Training Science
- Nutrition Surprise
- Office Worker Fitness
- Hong Kong Lifestyle
- Gym Mistake
- 30-second Coach Tip

## Source and evidence policy

Every knowledge item must include:

```js
{
  sourceTitle,
  sourceUrl,
  sourceType,
  publishedAt,
  checkedAt,
  evidenceLevel,
  claimScope
}
```

Accepted sources, in priority order:

1. Systematic review or meta-analysis
2. Peer-reviewed research paper
3. Official medical, sports, university or government guidance
4. Reputable professional body

Reject content sourced only from social posts, anonymous blogs, promotional supplement pages, or unsupported claims.

## Content model

```js
{
  id,
  category: "健身冷知識",
  topic,
  hook,
  message,
  microAction,
  evidenceSummary,
  sourceTitle,
  sourceUrl,
  evidenceLevel,
  noveltyScore,
  usefulnessScore,
  hkRelevanceScore,
  whatsappFitScore,
  riskLevel,
  createdAt,
  usageCount: 0,
  copyCount: 0,
  lastCopiedAt: null,
  lastUsedAt: null
}
```

## Message structure

Use:

```text
反常識 Hook + 一句解釋 + 一個可做行動
```

Example:

```text
操完第二日唔痛，唔代表冇效果。酸痛好多時只係身體未習慣新刺激；下次睇動作穩唔穩、重量有冇慢慢進步仲實際。
```

## Quality gate

A knowledge item must pass all checks:

- Hong Kong Cantonese only
- 45–90 Chinese characters preferred
- One main claim only
- One micro-action maximum
- No diagnosis or treatment claim
- No guaranteed result
- No fear-based wording
- No supplement promotion
- No unsupported precision
- No copied research wording
- Source link retained
- Claim remains within the source scope

## Anti-AI rules

Down-rank or reject openings such as:

- 大家知唔知道
- 提醒大家
- 研究顯示大家應該
- 今日同大家分享
- 作為一名健身教練

Prefer natural openings such as:

- 原來操完唔痛，未必係白做。
- 成身汗，唔代表燒脂特別多。
- 攰到完全唔郁，未必恢復得最快。

## Ranking logic

```js
score =
  evidenceLevel * 25 +
  usefulnessScore * 20 +
  noveltyScore * 20 +
  hkRelevanceScore * 15 +
  whatsappFitScore * 10 +
  freshnessBonus * 10 -
  repetitionPenalty -
  medicalRiskPenalty -
  recentUsePenalty
```

## Daily selection

Maximum two knowledge items per day:

- One high-evidence surprising fact
- One practical recovery or lifestyle fact

Do not show two items with the same action or body area on the same day.

## Initial approved topic pool

1. Muscle soreness is not a reliable measure of workout quality.
2. Sweating more does not necessarily mean more fat loss.
3. Light active recovery may feel better than complete inactivity after ordinary training soreness.
4. Sleep and recovery materially affect adaptation to training.
5. Static stretching immediately before maximal strength or power work can reduce acute performance when excessive.
6. Training to failure is not required on every set for muscle growth.
7. Short movement breaks can reduce discomfort from prolonged sitting.
8. Hydration needs vary with heat, humidity, sweat rate and session length.
9. A warm-up should prepare the exact movement pattern instead of simply making the body tired.
10. Progress can be measured through technique, repetitions, load, range of motion and consistency—not only body weight.

All topic wording must be revalidated against current sources before publication.

## Learning loop

Track:

```js
{
  copied,
  used,
  replied,
  saved,
  shared,
  ignored,
  bookingTriggered
}
```

Use results to adjust topic, length, opening style and send-time ranking. Do not infer medical conditions or sensitive personal traits.

## Dashboard additions

Display:

- Source and evidence badge
- Novelty score
- Last verified date
- Copy and usage count
- Recently used warning
- Duplicate-risk warning
- Approve / reject / archive controls

## Rollback

This module is additive. Rollback must only disable `健身冷知識` visibility and generation. It must not delete old reminders, tracking records or source metadata.
