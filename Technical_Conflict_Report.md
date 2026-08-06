# Technical Conflict Report — EO-006

No approved public contract or named architecture boundary was replaced.

| Check | Result | Risk |
| --- | --- | --- |
| Architecture | Isolated modules under `aios/core`; existing static runtime unchanged | Low |
| Schema/API | Versioned `1.0.0`; no existing endpoint modified | Low |
| Folder/naming | New paths follow current `aios/` conventions | Low |
| Version/workflow | Human approval and no automatic merge retained | Low |
| Plugin/decision/mission | Independent contracts; orchestration composes them without cyclic imports | Low |
| Security | Shared secret stored only in Apps Script properties; root scope is server-side; no delete API | Medium until deployed smoke test |
| Merge | Five old draft PRs are non-mergeable; EO branch starts from current `origin/main` | High for legacy PRs, low for EO branch |

Merge gate: full CI pass, secret scan, architecture review, Drive authorization disposition, and explicit user approval. Rollback is one PR revert; Drive `Communication` may remain harmlessly or be manually moved/renamed.
