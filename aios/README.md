# AIOS Five-Layer Context Architecture v1

This module implements a governed context foundation for AIOS using five layers:

1. `system` — immutable or tightly governed rules.
2. `session` — temporary task and conversation state.
3. `memory` — approved reusable long-term knowledge.
4. `artifacts` — versioned outputs and source assets.
5. `retrieval` — dynamic external knowledge fetched at run time.

## Included in v1

- Context registry and metadata contract
- Context router with task-based layer selection
- Context assembler with budget enforcement
- Memory promotion gate
- Conflict and lifecycle checks
- Audit event generation
- Policy configuration
- Unit tests

## Principles

- System rules cannot be overridden by retrieved content.
- Session data is not promoted to memory automatically.
- Retrieval results are treated as untrusted until validated.
- Artifacts remain versioned objects, not implicit memory.
- Every assembled context pack records provenance and rejection reasons.

## Run tests

```bash
python -m unittest discover -s aios/tests -v
```

## Directory map

```text
aios/
├── context/
│   ├── models.py
│   ├── router.py
│   └── assembler.py
├── memory/
│   └── promotion.py
├── observability/
│   └── audit.py
├── policies/
│   └── context-policy.json
├── registry/
│   └── contexts.json
└── tests/
    └── test_context_architecture.py
```

## Status

This branch is an isolated MVP. It does not modify production modules or the main branch.