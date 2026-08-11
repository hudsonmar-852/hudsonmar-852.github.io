# Mission Manager MVP

Implemented in `aios/core/mission-manager.mjs`: validated mission schema, explicit state transitions, workspace checkpoints, resume state, immutable read copies, history, audit events, stage outputs, and deterministic errors. Current persistence is process-local and injected behind the manager boundary; durable storage is P2 before beta. Backward compatibility is preserved because no existing workflow contracts are modified.
