from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from .models import ContextItem


@dataclass(frozen=True)
class FreshnessResult:
    valid: bool
    reason: str
    age_hours: Optional[float]


def validate_freshness(
    item: ContextItem,
    max_age_hours: int | None = None,
    now: datetime | None = None,
) -> FreshnessResult:
    current = now or datetime.now(timezone.utc)

    if item.review_after:
        review_at = _parse_datetime(item.review_after)
        if current > review_at:
            return FreshnessResult(False, "review_due", None)

    created_at = _parse_datetime(item.created_at)
    age_hours = max(0.0, (current - created_at).total_seconds() / 3600)

    if max_age_hours is not None and age_hours > max_age_hours:
        return FreshnessResult(False, "freshness_window_exceeded", age_hours)
    if item.freshness < 0.45:
        return FreshnessResult(False, "freshness_score_below_threshold", age_hours)
    return FreshnessResult(True, "fresh", age_hours)


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)
