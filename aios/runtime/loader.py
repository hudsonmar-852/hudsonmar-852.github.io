from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from aios.connectors.base import ConnectorRegistry, RetrievalRequest
from aios.context.assembler import assemble_context
from aios.context.freshness import validate_freshness
from aios.context.models import ContextItem, ContextPack
from aios.context.router import route_context
from aios.security.prompt_injection import screen_retrieval_items


@dataclass(frozen=True)
class RuntimeLoadRequest:
    task_type: str
    connector_names: List[str]
    query: str
    token_budget: int | None = None
    freshness_hours: int | None = None


class RuntimeContextLoader:
    def __init__(self, connectors: ConnectorRegistry) -> None:
        self.connectors = connectors

    def load(
        self,
        request: RuntimeLoadRequest,
        static_items: Iterable[ContextItem] = (),
    ) -> ContextPack:
        plan = route_context(request.task_type, token_budget=request.token_budget)
        collected = list(static_items)
        rejected: list[dict[str, str]] = []

        retrieval_request = RetrievalRequest(
            query=request.query,
            freshness_hours=request.freshness_hours,
        )
        for connector_name in request.connector_names:
            result = self.connectors.get(connector_name).retrieve(retrieval_request)
            collected.extend(result.items)
            rejected.extend(
                {"id": connector_name, "reason": warning} for warning in result.warnings
            )

        safe_items, security_rejections = screen_retrieval_items(collected)
        rejected.extend(security_rejections)

        fresh_items = []
        freshness_limit = request.freshness_hours or plan.freshness_requirement_hours
        for item in safe_items:
            result = validate_freshness(item, max_age_hours=freshness_limit)
            if result.valid:
                fresh_items.append(item)
            else:
                rejected.append({"id": item.context_id, "reason": result.reason})

        pack = assemble_context(plan, fresh_items)
        pack.rejected = rejected + pack.rejected
        return pack
