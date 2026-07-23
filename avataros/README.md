# AvatarOS V3

AI Avatar Operating System for ultra-realistic avatar video production.

## Purpose

AvatarOS V3 is a modular production system for creating consistent AI avatar videos through ChatGPT, Grok Imagine, CapCut, Canva, Suno AI, and future API integrations.

## Current Sprint

Sprint 2 — Prompt Engine

## Main Entry Points

- ChatGPT conversation workflow
- GitHub Pages web dashboard
- JSON-based character, scene, camera, lighting, prompt, and export presets

## Image production

- Validate inputs with `node avataros/scripts/validate-avataros.mjs`.
- Build a provider-ready prompt pack with
  `node avataros/scripts/build-image-prompt.mjs`.
- Follow `docs/image-production-runbook.md` for generation, failure handling
  and human approval.

## Project Structure

```text
avataros/
├── README.md
├── VERSION
├── CHANGELOG.md
├── project-board.md
├── docs/
├── config/
├── characters/
├── presets/
├── templates/
├── projects/
├── exports/
├── assets/
└── index.html
```

## Working Rule

Every sprint must produce a working artifact, not only planning notes.
