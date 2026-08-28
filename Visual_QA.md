# Visual QA Foundation

`aios/core/visual-qa.mjs` requires scored contracts for identity, face, hands, lighting, composition, and prompt compliance, then calculates an overall report and automated recommendation. Automation can recommend review or rejection but can never approve: `humanApproval.required` is always true. Provider-specific computer vision is intentionally outside this foundation.
