from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from aios.context.models import ContextItem, ContextLayer, ContextStatus


@dataclass(frozen=True)
class PromotionDecision:
    approved: bool
    reasons: List[str]


def evaluate_memory_candidate(
    candidate: ContextItem,
    existing_memories: Iterable[ContextItem],
    user_confirmed: bool,
    has_evidence: bool,
) -> PromotionDecision:
    reasons: List[str] = []

    if candidate.layer is not ContextLayer.SESSION:
        reasons.append("candidate_must_originate_from_session")
    if not user_confirmed:
        reasons.append("user_confirmation_required")
    if not has_evidence:
        reasons.append("evidence_required")
    if candidate.confidence < 0.75:
        reasons.append("confidence_below_threshold")
    if candidate.status in {ContextStatus.DEPRECATED, ContextStatus.ARCHIVED}:
        reasons.append("candidate_inactive")

    for memory in existing_memories:
        if memory.layer is not ContextLayer.MEMORY:
            continue
        if memory.title.strip().lower() == candidate.title.strip().lower():
            if memory.content.strip() == candidate.content.strip():
                reasons.append("duplicate_memory")
            elif memory.status in {ContextStatus.APPROVED, ContextStatus.ACTIVE}:
                reasons.append("conflict_with_active_memory")

    return PromotionDecision(approved=not reasons, reasons=reasons)


def promote_to_memory(candidate: ContextItem, decision: PromotionDecision) -> ContextItem:
    if not decision.approved:
        raise ValueError(f"Memory promotion rejected: {', '.join(decision.reasons)}")
    return ContextItem(
        context_id=candidate.context_id.replace("session", "memory", 1),
        layer=ContextLayer.MEMORY,
        title=candidate.title,
        content=candidate.content,
        owner=candidate.owner,
        source=candidate.source,
        version=candidate.version,
        status=ContextStatus.APPROVED,
        sensitivity=candidate.sensitivity,
        confidence=candidate.confidence,
        relevance=candidate.relevance,
        freshness=candidate.freshness,
        usage_value=candidate.usage_value,
        token_estimate=candidate.token_estimate,
        tags=candidate.tags,
        metadata={**candidate.metadata, "promoted_from": candidate.context_id},
    )
