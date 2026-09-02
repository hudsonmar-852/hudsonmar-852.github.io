from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class ContextLayer(str, Enum):
    SYSTEM = "system"
    SESSION = "session"
    MEMORY = "memory"
    ARTIFACTS = "artifacts"
    RETRIEVAL = "retrieval"


class ContextStatus(str, Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    APPROVED = "approved"
    ACTIVE = "active"
    REVIEW_DUE = "review_due"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


@dataclass(frozen=True)
class ContextItem:
    context_id: str
    layer: ContextLayer
    title: str
    content: str
    owner: str
    source: str
    version: str = "1.0.0"
    status: ContextStatus = ContextStatus.ACTIVE
    sensitivity: str = "internal"
    confidence: float = 1.0
    relevance: float = 1.0
    freshness: float = 1.0
    usage_value: float = 0.5
    token_estimate: int = 0
    tags: List[str] = field(default_factory=list)
    supersedes: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    review_after: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def score(self) -> float:
        duplicate_penalty = float(self.metadata.get("duplicate_penalty", 0.0))
        return max(
            0.0,
            min(
                1.0,
                0.30 * self.relevance
                + 0.20 * self.freshness
                + 0.20 * float(self.metadata.get("provenance", 1.0))
                + 0.15 * self.confidence
                + 0.10 * self.usage_value
                - 0.05 * duplicate_penalty,
            ),
        )


@dataclass(frozen=True)
class ContextPlan:
    task_type: str
    required_layers: List[ContextLayer]
    excluded_layers: List[ContextLayer]
    token_budget: int
    freshness_requirement_hours: Optional[int] = None
    approval_required: bool = False


@dataclass
class ContextPack:
    run_id: str
    task_type: str
    items: List[ContextItem]
    rejected: List[Dict[str, str]]
    token_total: int
    approval_required: bool

    def as_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "task_type": self.task_type,
            "contexts_loaded": [item.context_id for item in self.items],
            "contexts_rejected": self.rejected,
            "token_total": self.token_total,
            "approval_required": self.approval_required,
        }
