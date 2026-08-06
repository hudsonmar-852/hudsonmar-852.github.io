# Plugin SDK

`aios/core/plugin-sdk.mjs` implements manifest validation, semantic versions, allow-listed permissions, registration, start/stop lifecycle, health checks, configuration isolation, and async events. A minimal template plugin is exercised in `aios/tests/eo-006-core.test.mjs`. Plugins receive no ambient filesystem, network, or secret access; runtime adapters must enforce declared permissions.
