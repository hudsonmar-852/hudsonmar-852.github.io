from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Iterable, List

from aios.context.models import ContextItem, ContextLayer, ContextStatus


class ContextRegistryStore:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> List[ContextItem]:
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text(encoding="utf-8"))
        return [self._from_dict(item) for item in data.get("contexts", [])]

    def save(self, items: Iterable[ContextItem]) -> None:
        payload = {
            "schema_version": "1.0.0",
            "contexts": [self._to_dict(item) for item in items],
        }
        self.path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )

    def upsert(self, item: ContextItem) -> None:
        current = {entry.context_id: entry for entry in self.load()}
        current[item.context_id] = item
        self.save(current.values())

    @staticmethod
    def _to_dict(item: ContextItem) -> dict:
        data = asdict(item)
        data["layer"] = item.layer.value
        data["status"] = item.status.value
        return data

    @staticmethod
    def _from_dict(data: dict) -> ContextItem:
        return ContextItem(
            **{
                **data,
                "layer": ContextLayer(data["layer"]),
                "status": ContextStatus(data["status"]),
            }
        )
