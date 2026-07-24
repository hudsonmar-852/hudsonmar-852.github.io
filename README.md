# Hudson Mar Project Portal

Public GitHub Pages layer for approved projects, demonstrations and AIOS status metadata.

## Main routes

- `/` — public project portal
- `/aios/` — AIOS public monitoring dashboard
- `/share/` — approved public knowledge library
- `/avataros/` — AvatarOS public documentation and demo
- `/prompt2/` — public Prompt Intelligence tool
- `/Jeffrey/` — Jeffrey Relationship Messaging Engine v1.0 draft dashboard

Private Prompt/Grok studios, credentials, webhooks and automation controls are intentionally excluded. See [SECURITY.md](SECURITY.md) before publishing changes.

## Validation

The public production baseline uses Node.js without third-party runtime
packages. Run the same checks used by CI:

```sh
node --test aios/tests/production-consolidation.test.mjs aios/modules/jeffrey/tests/relationship-messaging-engine.test.mjs avataros/tests/prompt-builder.test.mjs avataros/tests/validation.test.mjs functions/private-test/index.test.mjs
node aios/scripts/validate-production-consolidation.mjs
node avataros/scripts/validate-avataros.mjs
node --check functions/private-test/index.js
```

Build the default public-safe AvatarOS prompt pack:

```sh
node avataros/scripts/build-image-prompt.mjs
```

Pull requests and pushes to `main` run these checks through
`.github/workflows/aios-validation.yml`.
