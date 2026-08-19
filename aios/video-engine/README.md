# AIOS Video Engine v1

## Purpose

AIOS Video Engine converts a platform-independent video intent into a provider-specific generation plan while preserving AIOS architecture boundaries. It does not call paid provider APIs or perform external account actions.

## Pipeline

1. `video-director` — normalize user/image intent into a Video Job Contract.
2. `video-continuity-lock` — preserve identity, wardrobe, environment, lighting, palette and camera-axis requirements.
3. `video-model-router` — choose a provider from declared capabilities rather than hard-coded preference.
4. `video-prompt-compiler` — compile the same job differently for Runway Gen-4, Sora 2, Veo 3.1, Kling or Hailuo.
5. `video-qa-reviewer` — convert objective quality metrics into `PASS`, `REPAIR` or `REGENERATE`.
6. P1 extension skills: `video-motion-designer`, `cinematography-compiler`, `video-repair-strategist`.

## Provider roles

- Runway Gen-4: concise motion-first image-to-video and camera/scene motion.
- Sora 2: cinematic shot design, lens/lighting/timing, dialogue and audio.
- Veo 3.1: multimodal generation, up to three reference images, first/last-frame workflows, extension and native audio.
- Kling: camera/motion control, keyframes/start-end frames and motion brush.
- Hailuo: subject reference, facial consistency, emotional expression and precise camera motion.

Provider facts are registered in `model-registry.json`. Routing code must consume registry capabilities instead of duplicating provider assumptions.

## Video Job Contract

`buildVideoJob()` normalizes fields including mode, goal, subject, action, environment, camera, lens, lighting, palette, motion, emotion, dialogue/audio, duration, aspect ratio, continuity requirements and references.

Image input automatically selects `image_to_video`. Default technical values are 8 seconds, 24 fps, 16:9 and high quality unless the caller specifies otherwise.

## Routing principles

Routing is deterministic and capability-first. Hard requirements (native audio, first/last frame, subject reference, motion brush, multiple references) receive stronger weights than general quality preference. The router returns the highest-scoring compatible model and its score for auditability.

## Prompt compilation

Compilers preserve provider-specific prompting conventions. Image-to-video prompts include the continuity instruction:

`Based on the uploaded image, animate the scene naturally. Preserve the identity, lighting, and colors from the image.`

Runway compilation stays concise and motion-first; Sora uses structured cinematography/action/light/audio sections; Veo combines visual, camera and audio instructions; Kling and Hailuo emphasize subject/scene motion, camera and atmosphere.

## QA contract

`reviewVideo()` accepts normalized 0-100 metrics for identity, prompt adherence, motion realism, camera adherence, anatomy, temporal consistency and artifact severity. The current deterministic thresholds are:

- `PASS`: overall >= 85
- `REPAIR`: overall 70-84
- `REGENERATE`: overall < 70

External visual analysis and paid generation remain adapters outside this v1 core.

## Safety and architecture

- No credentials or provider API keys are stored here.
- No paid generation is triggered automatically.
- No production provider is permanently privileged; routing remains registry driven.
- Human review can be inserted after QA without changing the core contract.
- Provider adapters may be added later behind the same Video Job Contract.
