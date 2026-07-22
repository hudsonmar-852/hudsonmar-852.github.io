from __future__ import annotations

from typing import Iterable, List
from uuid import uuid4

from .models import ContextItem, ContextLayer, ContextPack, ContextPlan, ContextStatus


LAYER_PRIORITY = {
    ContextLayer.SYSTEM: 0,
    ContextLayer.SESSION: 1,
    ContextLayer.MEMORY: 2,
    ContextLayer.ARTIFACTS: 3,
    ContextLayer.RETRIEVAL: 4,
}


def assemble_context(plan: ContextPlan, items: Iterable[ContextItem]) -> ContextPack:
    accepted: List[ContextItem] = []
    rejected: List[dict[str, str]] = []
    used_tokens = 0

    candidates = sorted(
        list(items),
        key=lambda item: (LAYER_PRIORITY[item.layer], -item.score()),
    )

    seen_ids: set[str] = set()
    for item in candidates:
        if item.context_id in seen_ids:
            rejected.append({"id": item.context_id, "reason": "duplicate_context_id"})
            continue
        seen_ids.add(item.context_id)

        if item.layer not in plan.required_layers or item.layer in plan.excluded_layers:
            rejected.append({"id": item.context_id, "reason": "layer_not_requested"})
            continue
        if item.status in {ContextStatus.DEPRECATED, ContextStatus.ARCHIVED}:
            rejected.append({"id": item.context_id, "reason": item.status.value})
            continue
        if item.score() < 0.45:
            rejected.append({"id": item.context_id, "reason": "quality_below_threshold"})
            continue
        if item.layer is ContextLayer.RETRIEVAL and not item.source:
            rejected.append({"id": item.context_id, "reason": "retrieval_missing_source"})
            continue
        if used_tokens + item.token_estimate > plan.token_budget:
            rejected.append({"id": item.context_id, "reason": "token_budget_exceeded"})
            continue

        accepted.append(item)
        used_tokens += item.token_estimate

    # System instructions remain first and cannot be displaced by retrieved content.
    accepted.sort(key=lambda item: (LAYER_PRIORITY[item.layer], -item.score()))

    return ContextPack(
        run_id=f"run_{uuid4().hex[:12]}",
        task_type=plan.task_type,
        items=accepted,
        rejected=rejected,
        token_total=used_tokens,
        approval_required=plan.approval_required,
    )
