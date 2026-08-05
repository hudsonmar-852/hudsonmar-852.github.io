# AIOS-GOV-019 — Verifiable Agent Operating Context

Status: Approved
Date: 2026-08-05
Scope: AIOS governance, quality, repository orientation, client permissions and cross-client runtime continuity

## Purpose

This standard requires AIOS agents to prove which instructions, repository state, permissions, acceptance criteria and resource limits are active before production-impacting work begins.

## 1. AIOS-GOV-018 — Instruction Compliance Canary

Before execution, the agent must return a non-destructive canary record containing:

```yaml
instruction_sources_loaded: []
policy_version:
write_scope:
completion_definition:
unknown_data_handling:
canary_status: PASS | FAIL
```

A failed or inconsistent canary blocks write-capable execution.

## 2. AIOS-QA-017 — Acceptance Coverage Contract

Every requirement must map to implementation, test evidence and current status.

```yaml
acceptance_id:
requirement:
implementation_ref:
test_ref:
evidence_ref:
status: PASS | CONDITIONAL | FAIL | UNVERIFIED
remaining_risk:
```

No evidence means UNVERIFIED. Partial completion cannot be promoted to complete.

## 3. AIOS-COST-006 — Session Resource Envelope

Each agent session must declare resource limits and graceful-stop behaviour.

```yaml
maximum_credits:
warning_threshold: 0.70
wrap_up_threshold: 0.90
overrun_tolerance:
checkpoint_required: true
```

At the warning threshold, exploration narrows. At the wrap-up threshold, the agent saves evidence and checkpoint state and starts no new subtask.

## 4. AIOS-REPO-007 — Verified Repository Orientation

Before changing an unfamiliar repository, AIOS must produce a verified orientation pack covering:

- Repository purpose
- Architecture and entry points
- Build, test and deploy commands
- Contribution rules
- Security and secret boundaries
- Latest verified commit
- Unknown or unverified areas

All claims must be grounded in repository files. Missing documentation must not be replaced with assumptions.

## 5. AIOS-SEC-010 — Client-specific Capability Policy

Permissions are assigned by client and execution environment, not only by user identity.

```yaml
client_id:
read_scope:
write_scope:
secret_scope:
deploy_scope:
approval_mode:
```

Examples:

- Public dashboard agent: read-only, no secrets, no deploy
- ChatGPT planning: read and draft only
- Codex development: approved paths only; deployment requires approval
- Cloud automation: scoped runtime credentials; PR output only

## 6. AIOS-RUN-020 — Cross-client Continuity Check

A client handoff must verify:

```yaml
project_id:
repository:
branch:
head_commit:
instruction_version:
active_task:
active_attempt:
last_verified_evidence:
pending_changes:
source_client:
handoff_timestamp:
```

Any repository, branch, commit, policy, task or attempt mismatch is a drift condition. Execution must pause until resolved.

## Runtime order

```text
Load central policy
→ Run instruction canary
→ Verify repository orientation
→ Load acceptance coverage matrix
→ Apply client capability policy
→ Set session resource envelope
→ Execute through AIOS Harness
→ Verify cross-client continuity at handoff
```

## Enforcement status

This merge establishes the authoritative governance standard and registry entries. Runtime enforcement, UI indicators and automated canary checks require separate implementation tasks and evidence before being marked Enforced.

## Rollback

Revert the merge commit, remove this document and restore the preceding versions of `aios/data/decisions.json` and `aios/data/change-log.json`.
