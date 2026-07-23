# AvatarOS V3 System Specification

## Objective

Create a modular AI avatar production system that supports both conversational input and structured web-form input.

## Operating Model

AvatarOS V3 works in two modes:

1. ChatGPT Responsive Mode
   - User gives natural-language project input.
   - ChatGPT fills missing details.
   - Output includes storyboard, prompt pack, production steps, and QA checklist.

2. GitHub Pages Dashboard Mode
   - User selects options from a web page.
   - The page builds a structured project JSON.
   - ChatGPT or future API tools transform the JSON into production outputs.

## Core Engines

- Character Engine
- Prompt Engine
- Scene Engine
- Camera Engine
- Lighting Engine
- Motion Engine
- Voice Engine
- Brand Engine
- Export Engine
- QA Engine
- AI Router

## Production Input Contracts

AvatarOS uses versioned, public-safe JSON contracts so character identity and
image requests can be validated before any manual generation step:

- `schemas/character-bible.schema.json` defines stable identity, consistency
  rules and generation approval.
- `schemas/image-job.schema.json` defines the image objective, render settings,
  scene and human-approval requirement.

Every image job references a Character Bible by `characterId`. Schema version
`1.0.0` is the Sprint 1 baseline. Contract changes require architecture review.

## Current Development Principle

Start with static GitHub Pages and JSON files. Avoid unnecessary backend complexity until the MVP workflow is proven.

## Manual Tool Boundary

At this stage, ChatGPT can create and update project files through GitHub. Grok Imagine, CapCut, Canva, and Suno usually require manual operation unless future connectors or APIs are available.

## Sprint 0 Definition of Done

- Repository path exists.
- README exists.
- VERSION exists.
- CHANGELOG exists.
- Project board exists.
- Config exists.
- System specification exists.
- Foundation dashboard exists and reports Sprint 0 as completed.
