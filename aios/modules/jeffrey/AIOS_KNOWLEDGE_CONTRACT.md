# AIOS Knowledge Contract — Jeffrey Module

Version: 1.1.0
Status: Approved for merge  
Date: 2026-07-21

## Purpose

This contract defines how AI systems load and use Jeffrey-related knowledge without exposing private state or creating mass-produced messages.

## Required load order

1. Latest valid `aios/modules/jeffrey/context/YYYY-MM-DD-daily-context.json`, when `AIOS_DAILY_CONTEXT_V1=true`
2. `identity.json`
3. `voice_profile.json`
4. `safety_rules.json`
5. `internal_output_state.schema.json` using derived controls only
6. `relationship_profile.schema.json` for the active anonymised client only
7. `intent_structures.json` for the selected single intent
8. Recent conversation summary, limited to the minimum relevant context
9. `quality_rubric.json`

## Generation contract

- Interactive client generation produces no more than two candidate drafts. The scheduled catalogue batch is separate: five new drafts per existing category, plus exactly ten context drafts only when validated context exists.
- The Jeffrey generator consumes stored AIOS records only and never fetches external weather APIs.
- Start from a real-life or relationship context before fitness advice.
- Use one purpose and at most one gentle action.
- Treat templates as structures, not fixed sentences.
- Keep Hong Kong Cantonese natural, warm, professional and measured.
- Do not use street-style language, exaggerated English mixing or promotional fitness language.
- Do not expose raw private notes, health status or unauthorised personal circumstances.
- Do not invent personal stories, client facts, medical claims or gym policies.
- A human must approve every client-facing message.

## Safety transformation layer

```text
Private internal note
  -> local secure transformation
  -> derived non-sensitive controls
  -> generation prompt
```

Allowed derived controls include:

- warmth level
- push level
- humour level
- message length
- self-reference prohibition

Raw private notes must not be stored in this public repository, included in daily JSON, or sent to external AI platforms.

## Output shape

```json
{
  "intent": "warm_check_in",
  "client_id": "anonymous-id",
  "draft": "...",
  "scores": {
    "jeffrey_voice": 0,
    "warm_heart": 0,
    "reply_likelihood": 0,
    "ai_smell": 0
  },
  "safety_pass": true,
  "human_approval": "pending"
}
```

## Deferred features

RAG, emotion analysis, churn prediction, automatic story use, multi-model routing, video automation and reinforcement learning remain backlog items and are not part of this MVP.
