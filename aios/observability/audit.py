from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Iterable

from aios.context.models import ContextPack


def build_audit_event(
    pack: ContextPack,
    tools_called: Iterable[str] = (),
    output_score: float | None = None,
    human_approved: bool | None = None,
) -> Dict[str, Any]:
    event = pack.as_dict()
    event.update(
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools_called": list(tools_called),
            "output_score": output_score,
            "human_approved": human_approved,
        }
    )
    return event
