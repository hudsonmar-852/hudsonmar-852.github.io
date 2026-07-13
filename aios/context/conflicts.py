from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from .models import ContextItem, ContextLayer, ContextStatus


@dataclass(frozen=True)
class Conflict:
    left_id: str
    right_id: str
    reason: str
    winner_id: str | None


def detect_conflicts(items: Iterable[ContextItem]) -> List[Conflict]:
    active = [
        item
        for item in items
        if item.status not in {ContextStatus.DEPRECATED, ContextStatus.ARCHIVED}
    ]
    conflicts: List[Conflict] = []

    for index, left in enumerate(active):
        for right in active[index + 1 :]:
            if left.title.strip().lower() != right.title.strip().lower():
                continue
            if left.content.strip() == right.content.strip():
                continue

            winner = _resolve_winner(left, right)
            conflicts.append(
                Conflict(
                    left_id=left.context_id,
                    right_id=right.context_id,
                    reason="same_title_different_content",
                    winner_id=winner.context_id if winner else None,
                )
            )
    return conflicts


def _resolve_winner(left: ContextItem, right: ContextItem) -> ContextItem | None:
    if left.layer is ContextLayer.SYSTEM and right.layer is not ContextLayer.SYSTEM:
        return left
    if right.layer is ContextLayer.SYSTEM and left.layer is not ContextLayer.SYSTEM:
        return right
    if left.supersedes == right.context_id:
        return left
    if right.supersedes == left.context_id:
        return right
    if left.status is ContextStatus.APPROVED and right.status is not ContextStatus.APPROVED:
        return left
    if right.status is ContextStatus.APPROVED and left.status is not ContextStatus.APPROVED:
        return right
    if left.score() > right.score():
        return left
    if right.score() > left.score():
        return right
    return None
