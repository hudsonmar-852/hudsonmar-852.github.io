# AvatarOS 0.1.0-sprint-1 Release Notes

Release date: 2026-07-23
Engineering Order: EO-IMG-001
Architecture: Unchanged

## Highlights

- Introduces the frozen Character Bible Contract v1.0.0.
- Introduces the frozen Image Job Contract v1.0.0.
- Adds public-safe character and image-job examples.
- Converts validated inputs into a deterministic Grok Imagine prompt pack.
- Preserves mandatory human approval before an image is accepted.
- Adds actionable validation errors, unit tests and CI coverage.

## Production workflow

```sh
node avataros/scripts/validate-avataros.mjs
node avataros/scripts/build-image-prompt.mjs
```

The resulting prompt and negative prompt are transferred manually to Grok
Imagine. Generated variations must be reviewed for identity, anatomy, lighting
and output quality before CapCut or Canva use.

## Test evidence

- 13 Node.js tests pass locally.
- 34 JSON assets parse successfully.
- The AvatarOS baseline validates one Character Bible and one Image Job.
- The reference prompt pack matches deterministic compiler output.
- Public source safety, required asset and local-link checks pass.
- GitHub Actions `Test public production baseline` passed on Pull Request #11:
  `actions/runs/29986044261`.

## Known limitations

- Image generation and visual QA remain external manual steps.
- Provider availability and output behavior are not covered by repository tests.
- The validator enforces the approved baseline directly rather than implementing
  a general-purpose JSON Schema engine.
- The branch remains a draft Pull Request until final Cycle 2 review.

## Upgrade notes

This is the first frozen Image Engine input baseline. Future incompatible
contract changes require Chief Architect approval, a new schema version and
migration guidance.
