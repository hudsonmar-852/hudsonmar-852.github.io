# AIOS Runtime Reliability v2

Status: Approved for merge
Date: 2026-07-20
Scope: Public-safe architecture summary only

## Purpose

Strengthen AIOS reliability without replacing the Phase 1 foundation or adding unnecessary multi-agent complexity.

## Merged controls

### 1. Prompt Experimentation Standard

Combines prompt regression testing with controlled ablation testing.

Required controls:
- fixed test dataset
- baseline score
- one-variable-at-a-time ablation
- quality, cost and regression comparison
- approval before production promotion

### 2. TDD-governed Agent Development

Standard change flow:

Issue → failing test → minimal change → validation → bounded repair → diff review → pull request → human approval

Rules:
- tests are required before behaviour changes
- repair attempts are bounded
- refactoring before tests pass is prohibited
- production merge without validation evidence is prohibited

### 3. Runtime Evidence v2

Each execution should retain public-safe metadata for:
- workflow version
- prompt version
- state transitions
- tool calls
- validation results
- duration and cost
- terminal state
- escalation record

Sensitive prompts, credentials and private context must never be published to the public dashboard.

### 4. Trace Replay

Runtime records should support dry-run replay and divergence detection so failures can be traced to the first material change in state, prompt, tool selection or validation result.

### 5. Atomic Agent Standard

Each agent or skill must:
- have one primary responsibility
- use structured input and output
- be stateless by default
- be independently testable
- avoid direct external publication unless explicitly approved

### 6. Explicit Escalation State

ESCALATED is a formal workflow state and must include:
- reason
- failed stage
- evidence available
- decision required
- recommended options
- assigned reviewer where applicable

### 7. Long-running Job Checkpoint

Long-running workflows should save bounded checkpoints containing:
- current stage
- completed and pending steps
- validated artifact references
- remaining budget
- resume conditions

Resume must revalidate previous outputs before continuing.

## Implementation priority

P0:
1. Prompt ablation
2. TDD governance
3. Runtime trace replay

P1:
4. Atomic agent standard
5. Explicit escalation record

P2:
6. Long-running checkpoint
7. Managed tool gateway architecture

## Non-goals

This merge does not introduce:
- unrestricted self-modifying agents
- unbounded multi-agent loops
- automatic production merges
- direct publication of private prompts or credentials
- a replacement for the existing public/private architecture
