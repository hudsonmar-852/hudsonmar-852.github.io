# Capability-Routed Job Search Pipeline

Status: Candidate
Date: 2026-08-15

## Purpose

以 evidence-first、cost-aware、human-gated 方式，把每日求職由資料收集一直推進至 Dashboard 與 follow-up，而不是對所有職位使用同一高成本 agent/research 路徑。

## Canonical Flow

Job Sources / Alerts
→ Normalize
→ Deduplicate
→ Hard Filters
→ CV Evidence Match
→ Explainable Score
→ Rank
→ Top-N Deep Research
→ Application Assets
→ Application Checklist
→ Human Apply Gate
→ Gmail Follow-up Reconciliation
→ Daily Dashboard / Ledger

## Stage Routing

### 1. Intake
Use connected/public sources appropriate to the platform. Do not imply access to authenticated sources unless access is actually available.

### 2. Normalize + Deduplicate
Prefer deterministic logic. Compare canonical URL, employer, title, location, job ID and history ledger.

### 3. Hard Filter
Apply exclusions, eligibility, location, compensation and role-family constraints before expensive semantic analysis.

### 4. CV Match
Use only verified CV evidence. Return matched requirements, missing requirements, transferable evidence and uncertainty.

### 5. Rank
Produce explainable scoring and keep the reason for every score component.

### 6. Top-N Research Router
Only threshold-qualified jobs enter deeper employer/JD research. Research findings are evidence inputs and must not silently override user constraints.

### 7. Application Asset Builder
Prepare tailored notes, cover letter and checklist from verified job + CV evidence. Do not invent achievements.

### 8. Human Gate
User approval remains required before application submission, email sending, sensitive data disclosure or irreversible external action.

### 9. Follow-up
Reconcile Gmail/application status, next actions and stale applications.

### 10. Dashboard
Persist ranked jobs, state transitions, evidence, capability route and outcome. Avoid duplicate reprocessing on future runs.

## Required Evidence per Run

- source list / job IDs
- dedup decisions
- scoring rationale
- Top-N research evidence
- application asset version
- human decision where required
- follow-up status
- dashboard/ledger write evidence

## Failure / Fallback Rules

- Authenticated source unavailable → mark source unavailable; do not fabricate results.
- Deep research quota constrained → preserve ranking and research only highest-value jobs.
- Missing CV evidence → mark gap/unknown, do not infer achievement.
- Tool write unavailable → produce copy-ready delta report.

## Production Boundary

This workflow is a reusable candidate until runtime implementation, tests and governance evidence promote it.
