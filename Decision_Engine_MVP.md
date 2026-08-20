# Decision Engine MVP

Implemented in `aios/core/decision-engine.mjs` with configuration in `aios/config/decision-policies.json`. Rules use exact deterministic context matching, priority ordering is stable, incompatible effects produce conflicts, risk and policy trigger human approval, and every decision records context and result in an audit ledger. Secrets are never included in configuration.
