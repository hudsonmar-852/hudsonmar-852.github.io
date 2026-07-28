# AIOS-GOV-010 — Executable Agent Boundary Standard

Status: Approved for governed production merge
Date: 2026-07-28
Scope: AIOS workflows, coding agents, repository automation and cross-repository operations

## Purpose

Convert AIOS governance rules into enforceable runtime boundaries. An agent may reason broadly, but it may only execute explicitly permitted actions, against observable goals, through traceable workflow artifacts and isolated change environments.

## Merged controls

### 1. Safe Output Allowlist

Default policy is deny. Each agent or workflow must declare readable sources, approved outputs and blocked outputs.

```yaml
agent_id:
default_policy: deny
read_permissions: []
allowed_outputs: []
blocked_outputs:
  - merge_pull_request
  - delete_file
  - publish_publicly
  - change_permissions
  - access_or_export_secrets
```

When a required action is not allowed, the agent must produce a proposed action containing the expected change, reason, risk, evidence and rollback method, then wait for explicit approval.

### 2. Human-readable workflow source and compiled artifact

Each production automation should separate human intent from executable configuration.

```text
workflow-source/<workflow>.md
workflow-build/<workflow>.lock.yml
```

Required lifecycle:

```text
Source change
→ Compile
→ Permission validation
→ Generated diff review
→ Dry test
→ Pull request
→ Deploy
```

The compiled artifact must be regenerated whenever the source changes. Source and artifact versions must remain traceable.

### 3. Observable Goal Mission

Every agent mission must define observable success criteria and required evidence. The agent may not redefine success during execution.

```yaml
goal:
observable_success_criteria: []
evidence_required: []
stop_conditions: []
```

Completion is allowed only when all mandatory criteria have supporting evidence. Conflicting or impossible criteria require escalation.

### 4. Cross-repository Documentation Agent

After an approved product or architecture change is merged, a read-first documentation workflow may inspect linked repositories and draft documentation updates.

Rules:

- Create documentation-only proposals or pull requests.
- Do not alter production code unless separately authorised.
- Use one pull request per repository.
- Link every proposed documentation change to its source decision or merged change.
- Mark uncertain impacts for human review.

### 5. Structured Issue Metadata Contract

AIOS backlog and agent missions should use structured metadata rather than relying only on free-text descriptions.

```yaml
type: capability | bug | security | research | documentation
priority: P1 | P2 | P3
estimated_effort: XS | S | M | L | XL
risk: R0 | R1 | R2 | R3
target_date:
owner:
blocked_by: []
ai_execution_allowed: true | false
observable_success_criteria: []
evidence_required: []
```

Agents may recommend priority, effort and risk. Final production approval, security exceptions, ownership and committed deadlines remain human decisions.

### 6. No-clone Cross-repository Inspection

Cross-repository research must default to remote, read-only inspection before cloning.

Preferred order:

```text
Remote repository tree
→ Read selected text files
→ Compare schemas or documentation
→ Produce proposal
→ Clone only when execution requires it
```

Default readable files include README, documentation, schemas, manifests and workflow definitions. Agents must not download secrets, credentials, unnecessary binaries or private assets.

## Integration with existing AIOS governance

This standard extends:

- Universal Action Risk Matrix
- Agent Pull Request Governance
- Deterministic Core Boundary
- Atomic Task Standard
- Capability Registry
- Workflow Package Registry
- Handoff Packet
- Platform Exit Standard

## Production gate

A workflow is not production-ready until it has:

1. Explicit read permissions and safe output allowlist.
2. Human-readable source and traceable executable artifact where compilation applies.
3. Observable success criteria and evidence requirements.
4. Structured task metadata.
5. Pull-request review for repository changes.
6. Read-only remote inspection as the default for cross-repository research.
7. Rollback or rejection path.

## Rollback

Remove this standard, revert related registry entries and disable any workflows depending on its new fields. Existing workflows remain operational under the earlier Risk Matrix and PR Governance controls until migrated.