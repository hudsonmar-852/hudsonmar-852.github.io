# AIOS-WF-013 — Harness Stage Contract

## Status

Approved production baseline.

## Purpose

Standardise agent delivery into four explicit stages so that exploration, planning, implementation and review use different permissions, evidence requirements and completion gates.

## Mandatory stages

### 1. Prototype

Purpose: validate feasibility without changing production.

```yaml
stage: prototype
write_scope: sandbox_only
required_output:
  - feasibility_result
  - assumptions
  - constraints
  - known_failure_modes
completion_gate:
  - concept tested
  - no production change
```

### 2. Plan

Purpose: define the governed implementation before execution.

```yaml
stage: plan
write_scope: spec_and_plan_only
required_output:
  - scope
  - dependencies
  - files_to_change
  - risks
  - validation_plan
  - rollback_plan
completion_gate:
  - plan reviewed
  - scope approved
```

### 3. Implement

Purpose: execute only the approved plan.

```yaml
stage: implement
write_scope: approved_paths_only
required_output:
  - changed_files
  - tests
  - evidence
  - deviations
completion_gate:
  - approved scope respected
  - required tests completed
  - unverified claims disclosed
```

### 4. Review

Purpose: independently verify requirements, changes, tests and side effects.

```yaml
stage: review
write_scope: comments_and_review_records_only
required_output:
  - requirement_coverage
  - evidence_review
  - regression_review
  - security_review
  - final_verdict
completion_gate:
  - reviewer did not rely only on implementer claims
  - rollback remains available
```

## Stage transition rules

```text
Prototype
→ evidence of feasibility
→ Plan
→ approved scope and rollback
→ Implement
→ tests and diff evidence
→ Review
→ accepted or returned for rework
```

An agent must not skip directly from Prototype to Implement for production-impacting work.

A material scope change during Implement returns the task to Plan.

A failed Review returns the task to the relevant earlier stage; it must not be marked complete.

## Permission model

| Stage | Default permission | Production write |
|---|---|---|
| Prototype | Sandbox only | No |
| Plan | Documentation only | No |
| Implement | Approved paths | Governed |
| Review | Read and comment | No |

High-risk actions remain subject to the AIOS Action Risk Matrix and Safe Output Allowlist.

## Evidence contract

Every stage must record:

```yaml
task_id:
stage:
started_at:
completed_at:
inputs:
outputs:
evidence:
open_risks:
next_stage:
owner:
```

No stage may be marked complete when its required evidence is missing.

## Copy-ready execution instruction

```text
Complete this task through four separate stages:

1. Prototype
Validate feasibility only. Do not modify production.

2. Plan
Define scope, dependencies, risks, affected files, tests and rollback. Wait for the required approval before implementation.

3. Implement
Execute only the approved plan and approved paths. Record all deviations.

4. Review
Re-check requirements, diff, tests, regressions, security impact and rollback independently from the implementation stage.

At the end of every stage, provide evidence. Do not mark unverified work as complete. A material scope change must return the task to Plan.
```

## Integration points

- AIOS-GOV-010 Safe Output Allowlist
- Atomic Task Standard
- Pull Request Governance
- Test Honesty Gate
- Workflow Execution Budget
- Reliability Dashboard
- Handoff and Recovery Checkpoint

## Success conditions

- Production-impacting work follows all four stages.
- Each stage has a distinct permission boundary.
- Implementation cannot silently expand scope.
- Review is evidence-based and independent.
- Failed stages can be retried or rolled back without losing task state.

## Rollback

Remove this standard and restore the previous decision and change-log registry revisions. Existing production assets are unaffected because this amendment introduces workflow governance rather than runtime code.
