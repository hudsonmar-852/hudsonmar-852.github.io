# AIOS Canonical File Map

Status: Draft pending `P-GOV-ALIGN-001`

The machine-readable authority is `aios/data/canonical-records.json`. It
defines repository, exact path, human copy, mirror policy, owner, reviewer,
update method, approval, retention, and archive for governance constitution,
agent instructions, major-change and decision policies, proposals, decisions,
approvals, pending decisions, conflicts, Engineering Orders, ADRs, architecture,
outstanding work, dashboard source, production readiness, releases, AI
communication, and the Drive structure manifest.

GitHub owns technical/executable records. Drive owns human/private/large-asset
records. MacBook and chat are never authoritative. A directory canonical path
means one record per unique ID under that directory; duplicate active IDs or
competing source-of-truth claims are invalid.

The following proposed directories do not yet exist and must not be populated
outside approved work: `aios/engineering-orders/`, `aios/docs/architecture/`,
and `aios/releases/`. Existing EOs in module folders remain in place until a
reviewed migration manifest is approved.
