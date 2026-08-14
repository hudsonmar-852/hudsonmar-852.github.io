from __future__ import annotations

from typing import Dict

from .models import ContextLayer, ContextPlan


DEFAULT_PLANS: Dict[str, ContextPlan] = {
    "content_generation": ContextPlan(
        task_type="content_generation",
        required_layers=[
            ContextLayer.SYSTEM,
            ContextLayer.SESSION,
            ContextLayer.MEMORY,
            ContextLayer.RETRIEVAL,
        ],
        excluded_layers=[],
        token_budget=12000,
        freshness_requirement_hours=24,
        approval_required=False,
    ),
    "artifact_update": ContextPlan(
        task_type="artifact_update",
        required_layers=[
            ContextLayer.SYSTEM,
            ContextLayer.SESSION,
            ContextLayer.MEMORY,
            ContextLayer.ARTIFACTS,
        ],
        excluded_layers=[],
        token_budget=14000,
        approval_required=True,
    ),
    "research": ContextPlan(
        task_type="research",
        required_layers=[
            ContextLayer.SYSTEM,
            ContextLayer.SESSION,
            ContextLayer.RETRIEVAL,
            ContextLayer.ARTIFACTS,
        ],
        excluded_layers=[],
        token_budget=16000,
        freshness_requirement_hours=72,
        approval_required=False,
    ),
}


def route_context(task_type: str, token_budget: int | None = None) -> ContextPlan:
    plan = DEFAULT_PLANS.get(
        task_type,
        ContextPlan(
            task_type=task_type,
            required_layers=[ContextLayer.SYSTEM, ContextLayer.SESSION],
            excluded_layers=[],
            token_budget=8000,
            approval_required=False,
        ),
    )
    if token_budget is None:
        return plan
    return ContextPlan(
        task_type=plan.task_type,
        required_layers=plan.required_layers,
        excluded_layers=plan.excluded_layers,
        token_budget=token_budget,
        freshness_requirement_hours=plan.freshness_requirement_hours,
        approval_required=plan.approval_required,
    )
