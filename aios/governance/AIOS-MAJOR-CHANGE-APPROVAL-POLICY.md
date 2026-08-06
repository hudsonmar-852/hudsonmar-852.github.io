# AIOS Major Change Approval Policy

Status: Draft pending `P-GOV-ALIGN-001` approval  
Owner: Hudson

Major or high-impact changes require two durable confirmations:

1. Direction confirmation permits review and preparation only.
2. Execution confirmation authorizes the exact reviewed proposal.

The second confirmation must state `APPROVE <Proposal ID>` and be retained in
`aios/data/approval-registry.json` with evidence. “OK”, “Go”, “Continue”,
“Yes”, “Fine”, silence, topic changes, general permission, earlier approval, or
blanket approval never counts. Rejection and withdrawal evidence is permanent.

Impact level 3, or any architecture, repository/Drive structure, source-of-
truth, canonical replacement, cross-module schema, agent authority, governance,
production merge/deploy, security/permission, OAuth/webhook/secret, paid
service, large move/rename, deletion, irreversible, or high-impact action is
major. Changed scope invalidates execution approval and returns to review.

Hudson may pause, stop, reject, defer, reprioritize, require redesign or
external review, and refuse merge or deployment at any time.

Without normal approval, only minimum reversible containment may stop active
data loss, credential exposure, a security incident, or production damage.
Wider remediation still requires both confirmations.
