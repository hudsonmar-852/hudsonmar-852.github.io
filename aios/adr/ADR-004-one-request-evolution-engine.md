# ADR-004: Adopt a One-request AIOS Evolution Workflow

Status: Accepted
Date: 2026-07-20
Decision owner: AIOS Governance

## Context

New AIOS ideas often lead to additional enhancements suggested during the same ChatGPT conversation. Previously, analysis, architecture comparison, change logging, backup planning, release notes and backlog updates could be produced, but they were not governed as one explicit end-to-end workflow.

## Decision

Adopt the AIOS Evolution & Architecture Review Engine as the orchestration layer for material AIOS ideas. A single authorised request may perform analysis, propose improvements, compare alternatives, prepare the merge decision and create the related change package files in one run.

The engine must use existing governance, provenance, QA, version control and rollback controls rather than create a parallel governance system.

## Alternatives considered

### Continue manual document-by-document requests

Rejected because it is slower, inconsistent and increases the chance that logs, backup references or reasons are omitted.

### Automatically merge every user idea directly into production

Rejected because it removes architectural review, can accumulate duplicated controls and conflicts with human approval and rollback requirements.

### Create a separate multi-agent architecture committee

Deferred. Role-based review perspectives are useful, but a permanent multi-agent layer would add complexity before there is evidence that it improves outcomes over a bounded review checklist.

## Consequences

Positive:

- one request can produce a complete and consistent change package
- reasons, dates, alternatives and affected assets become traceable
- AI-proposed enhancements are evaluated instead of blindly appended
- backups and rollback references are created before material changes

Trade-offs:

- materiality rules are needed to prevent excessive paperwork
- connector permissions determine whether external files can actually be written
- production-impacting changes still require human approval

## Review trigger

Review this decision if the workflow creates excessive documentation, causes duplicated governance, or if validated automation supports safer policy-based production promotion.
