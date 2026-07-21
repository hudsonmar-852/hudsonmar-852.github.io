# AIOS Knowledge Contract — Jeffrey Module

Version: 1.0.0  
Status: Approved for merge  
Date: 2026-07-21

## Purpose

This contract defines how AI systems load and use Jeffrey-related knowledge without exposing private state or creating mass-produced messages.

## Required load order

1. `identity.json`
2. `voice_profile.json`
3. `safety_rules.json`
4. `internal_output_state.schema.json` using derived controls only
5. `relationship_profile.schema.json` for the active anonymised client only
6. `intent_structures.json` for the selected single intent
7. Recent conversation summary, limited to the minimum relevant context
8. `quality_rubric.json`

## Generation contract

- Produce no more than two candidate drafts.
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
