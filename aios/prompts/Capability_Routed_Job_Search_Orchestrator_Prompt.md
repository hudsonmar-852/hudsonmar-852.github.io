# Capability-Routed Job Search Orchestrator Prompt

Status: Candidate
Date: 2026-08-15

## Objective

將每日求職流程拆成 stages，先以最低足夠能力完成大部分篩選，只將高價值 shortlist 送入較高成本 research / agent stage；所有推薦保留 evidence、traceability 及 human apply gate。

## Inputs

- Current CV / canonical CV evidence
- Job sources / alerts / connected search results
- Exclusion list
- Salary / location / role constraints
- Applied / Favourite / Not Suitable / duplicate history ledger
- Research budget or Top-N limit

## Instructions

1. Collect and normalize candidate jobs into a stable schema.
2. Deduplicate against current batch and historical ledger.
3. Apply hard exclusions before semantic scoring.
4. Match each surviving JD against verified CV evidence only.
5. Produce an explainable score with matched evidence, gaps, risk and recommendation.
6. Rank all surviving jobs.
7. Route only Top N / threshold-qualified jobs to deeper external research.
8. Generate tailored application assets only after the JD and employer evidence are verified.
9. Keep Apply / Send / irreversible actions behind a Human Gate.
10. Reconcile Gmail/application follow-up status and update the Daily Dashboard / ledger.
11. Record the capability route, execution evidence and outcome for each stage.
12. Do not claim a stage is complete without evidence appropriate to that stage.

## Capability Routing Contract

For every stage return:

- Stage
- Required input
- Chosen capability / tool route
- Why this is the lowest sufficient capability
- Evidence required
- Human gate: yes/no
- Output asset
- Retry / fallback rule

Prefer planning/knowledge synthesis for ChatGPT/Work, connected/login-dependent retrieval for Agent/tools, deterministic implementation/testing for Codex, and human confirmation for final applications or sensitive writes.

## Output

1. Daily ranked job table
2. Top research shortlist
3. Per-job CV evidence match
4. Tailoring notes / cover-letter draft where appropriate
5. Application checklist
6. Gmail follow-up queue
7. Dashboard delta
8. Cost / capability / evidence ledger

## Governance

- Candidate / Draft ≠ Production.
- Deep research is evidence input, not authorization.
- Never fabricate JD facts, employer facts or CV achievements.
- Preserve source URLs / identifiers where available.
- Keep personal/private material outside public repository outputs.
