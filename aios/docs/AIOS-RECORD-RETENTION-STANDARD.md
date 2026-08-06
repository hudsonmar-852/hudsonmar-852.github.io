# AIOS Record Retention Standard

Status: Draft pending `P-GOV-ALIGN-001`

Governance, proposals, decisions, confirmations, rejections, conflicts, ADRs,
Engineering Orders, releases, security evidence, and supersession links are
permanent. Git history is the repository archive; records are corrected by
new revision, never erased. Pending records remain until terminal and retain
their history afterward.

Operational status and dashboard data retain current state plus Git history.
Reports and AI communications retain their durable Drive IDs and may be moved
only by approved manifest. Superseded Drive documents move to
`Hudson AIOS/99_Archive` only after purpose, permissions, canonical successor,
and rollback are verified. Unknown purpose goes to `98_Unknown`; age alone is
not an archive reason. No deletion is authorized by this standard.
