from __future__ import annotations

from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from typing import Dict, List


@dataclass(frozen=True)
class ArtifactManifest:
    artifact_id: str
    title: str
    version: str
    owner: str
    source_context_ids: List[str]
    parent_artifact_ids: List[str] = field(default_factory=list)
    checksum: str | None = None
    status: str = "active"
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    metadata: Dict[str, str] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return asdict(self)


def validate_lineage(manifest: ArtifactManifest) -> List[str]:
    errors: List[str] = []
    if not manifest.artifact_id.strip():
        errors.append("artifact_id_required")
    if not manifest.version.strip():
        errors.append("version_required")
    if not manifest.owner.strip():
        errors.append("owner_required")
    if not manifest.source_context_ids:
        errors.append("source_context_required")
    if manifest.artifact_id in manifest.parent_artifact_ids:
        errors.append("self_parent_not_allowed")
    return errors
