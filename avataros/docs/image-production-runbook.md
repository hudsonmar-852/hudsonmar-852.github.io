# AvatarOS Image Production Runbook

## Purpose

Produce consistent, public-safe image keyframes from validated AvatarOS inputs
with the minimum repeated setup work. Grok Imagine generation and final human
approval remain manual.

## Fast path

1. Copy an approved Character Bible and Image Job from `avataros/examples/`.
2. Change only the fields required for the production request.
3. Validate before opening an external tool:

   ```sh
   node avataros/scripts/validate-avataros.mjs
   ```

4. Build the prompt pack:

   ```sh
   node avataros/scripts/build-image-prompt.mjs \
     --character avataros/examples/generic-premium-avatar.character.json \
     --job avataros/examples/instagram-reel.image-job.json
   ```

5. Paste `prompt` and `negativePrompt` into Grok Imagine.
6. Generate the requested variation count and reject outputs with identity
   drift, anatomy defects, inconsistent lighting or unreadable text.
7. Record human approval before importing a selected keyframe into CapCut or
   Canva.

## Input rules

- Use a lowercase kebab-case ID.
- Keep `schemaVersion` at `1.0.0`.
- Reference an existing Character Bible through `characterId`.
- Keep `humanApprovalRequired` set to `true`.
- Do not place credentials, private prompts, personal records or unpublished
  client data in public examples.
- Do not mark a character `approvedForGeneration` without the required consent
  and project approval.

## Failure handling

| Failure | Response |
|---|---|
| Validator reports an unknown character | Correct `characterId`; do not generate |
| Validator reports unsupported render settings | Use a schema-supported ratio, count and format |
| Provider differs from configuration | Stop and request architecture approval |
| Character or job is not public-safe | Move work to the approved private workflow |
| Identity drift appears | Reject output and reuse the unchanged identity-lock prompt |
| Human approval is missing | Do not export or publish |
| External provider is unavailable | Keep the validated prompt pack and retry later; do not silently switch providers |

## Release evidence

The checked-in `examples/premium-avatar.prompt-pack.json` is the deterministic
reference output. Unit tests compare it with the compiler result so contract or
prompt drift is visible in CI.
