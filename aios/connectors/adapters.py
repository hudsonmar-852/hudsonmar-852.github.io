from __future__ import annotations

from typing import Callable, Iterable, Mapping

from aios.context.models import ContextItem, ContextLayer, ContextStatus
from aios.connectors.base import ContextConnector, RetrievalRequest, RetrievalResult


RawRecord = Mapping[str, object]
Fetcher = Callable[[RetrievalRequest], Iterable[RawRecord]]


class MappingConnector(ContextConnector):
    def __init__(self, name: str, fetcher: Fetcher, owner: str = "aios") -> None:
        self.name = name
        self.fetcher = fetcher
        self.owner = owner

    def retrieve(self, request: RetrievalRequest) -> RetrievalResult:
        items = []
        warnings = []
        for index, record in enumerate(self.fetcher(request)):
            content = str(record.get("content", "")).strip()
            source = str(record.get("source", "")).strip()
            if not content:
                warnings.append(f"record_{index}_missing_content")
                continue
            if not source:
                warnings.append(f"record_{index}_missing_source")
                continue
            items.append(
                ContextItem(
                    context_id=str(record.get("context_id", f"ctx_{self.name}_{index}")),
                    layer=ContextLayer.RETRIEVAL,
                    title=str(record.get("title", f"{self.name} result {index + 1}")),
                    content=content,
                    owner=str(record.get("owner", self.owner)),
                    source=source,
                    version=str(record.get("version", "1.0.0")),
                    status=ContextStatus.ACTIVE,
                    confidence=float(record.get("confidence", 0.8)),
                    relevance=float(record.get("relevance", 0.8)),
                    freshness=float(record.get("freshness", 0.8)),
                    usage_value=float(record.get("usage_value", 0.5)),
                    token_estimate=int(record.get("token_estimate", max(1, len(content) // 4))),
                    tags=list(record.get("tags", [])),
                    metadata={
                        **dict(record.get("metadata", {})),
                        "connector": self.name,
                        "provenance": float(record.get("provenance", 1.0)),
                    },
                )
            )
        return RetrievalResult(connector=self.name, items=items, warnings=warnings)


class GitHubConnector(MappingConnector):
    def __init__(self, fetcher: Fetcher) -> None:
        super().__init__("github", fetcher)


class GoogleDriveConnector(MappingConnector):
    def __init__(self, fetcher: Fetcher) -> None:
        super().__init__("google_drive", fetcher)
