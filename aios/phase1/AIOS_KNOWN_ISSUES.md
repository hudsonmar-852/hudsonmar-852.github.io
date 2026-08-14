# AIOS Phase 1 Known Issues

Canonical record for open Phase 1 limitations. No Critical issue is open.

| ID | Severity | Status | Limitation | Impact | Resolution gate |
|---|---|---|---|---|---|
| KI-PHASE1-001 | Medium | Open | AT001 scheduling and publish are deterministic local simulations. | Local production baseline is testable; real external delivery is not a `PRODUCTION_PASS`. | Configure an approved scheduler and publication target with credentials, then capture real integration evidence. |
| KI-PHASE1-002 | Low | Open | JSON Schema files are documentation/interchange contracts; the dependency-free runtime uses matching native validators rather than a full Draft 2020-12 engine. | Supported Phase 1 constraints are executable, but arbitrary future schema keywords require validator expansion or a vetted dependency. | Add a schema engine when broader schema vocabulary creates real value. |
| KI-PHASE1-003 | Low | Open | The handoff test validates explanation and operation of this package, not every historical AIOS asset. | Phase 1 package is chat-independent; legacy repository orientation remains separately documented. | Expand handoff coverage incrementally in later phases. |
