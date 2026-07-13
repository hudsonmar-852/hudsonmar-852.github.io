from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, List

from aios.context.models import ContextItem, ContextLayer


_PATTERNS = [
    ("ignore_previous", re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.I)),
    ("reveal_secrets", re.compile(r"reveal|print|expose.*(secret|token|password|api key)", re.I)),
    ("system_override", re.compile(r"system\s*(prompt|message)|developer\s*message", re.I)),
    ("tool_coercion", re.compile(r"must\s+(call|use|execute)\s+(the\s+)?tool", re.I)),
    ("data_exfiltration", re.compile(r"send|upload|forward.*(data|files|credentials)", re.I)),
]


@dataclass(frozen=True)
class ScreeningResult:
    safe: bool
    findings: List[str]


def screen_text(text: str) -> ScreeningResult:
    findings = [name for name, pattern in _PATTERNS if pattern.search(text)]
    return ScreeningResult(safe=not findings, findings=findings)


def screen_retrieval_items(items: Iterable[ContextItem]) -> tuple[List[ContextItem], List[dict[str, str]]]:
    accepted: List[ContextItem] = []
    rejected: List[dict[str, str]] = []
    for item in items:
        if item.layer is not ContextLayer.RETRIEVAL:
            accepted.append(item)
            continue
        result = screen_text(item.content)
        if result.safe:
            accepted.append(item)
        else:
            rejected.append(
                {
                    "id": item.context_id,
                    "reason": "prompt_injection_suspected",
                    "findings": ",".join(result.findings),
                }
            )
    return accepted, rejected
