from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List

from aios.context.models import ContextItem


@dataclass(frozen=True)
class RetrievalRequest:
    query: str
    max_results: int = 10
    tags: List[str] = field(default_factory=list)
    freshness_hours: int | None = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RetrievalResult:
    connector: str
    items: List[ContextItem]
    warnings: List[str] = field(default_factory=list)


class ContextConnector(ABC):
    name: str

    @abstractmethod
    def retrieve(self, request: RetrievalRequest) -> RetrievalResult:
        raise NotImplementedError

    def healthcheck(self) -> Dict[str, Any]:
        return {"connector": self.name, "status": "ready"}


class ConnectorRegistry:
    def __init__(self, connectors: Iterable[ContextConnector] = ()) -> None:
        self._connectors = {connector.name: connector for connector in connectors}

    def register(self, connector: ContextConnector) -> None:
        self._connectors[connector.name] = connector

    def get(self, name: str) -> ContextConnector:
        if name not in self._connectors:
            raise KeyError(f"Unknown connector: {name}")
        return self._connectors[name]

    def names(self) -> List[str]:
        return sorted(self._connectors)
