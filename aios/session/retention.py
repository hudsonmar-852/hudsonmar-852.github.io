from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, List, Tuple

from aios.context.models import ContextItem, ContextLayer


def partition_expired_sessions(
    items: Iterable[ContextItem],
    ttl_hours: int = 72,
    now: datetime | None = None,
) -> Tuple[List[ContextItem], List[ContextItem]]:
    current = now or datetime.now(timezone.utc)
    cutoff = current - timedelta(hours=ttl_hours)
    active: List[ContextItem] = []
    expired: List[ContextItem] = []

    for item in items:
        if item.layer is not ContextLayer.SESSION:
            active.append(item)
            continue

        created = datetime.fromisoformat(item.created_at.replace("Z", "+00:00"))
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        created = created.astimezone(timezone.utc)

        if created < cutoff:
            expired.append(item)
        else:
            active.append(item)

    return active, expired
