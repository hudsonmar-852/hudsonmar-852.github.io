# Public Repository Safety Boundary

This repository is the public publishing layer for `hudsonmar-852.github.io`.

## Never commit

- API keys, access tokens, passwords or private keys
- webhook or automation endpoint URLs
- Google Drive folder/file IDs used by private workflows
- private prompts, personal records or unpublished project data
- administrative controls that rely only on a hidden URL

## Publishing rule

Only public-safe metadata and content explicitly approved for sharing belong here. Authenticated dashboards, private studios and live automation controls must use a private repository and a protected backend.

## Reporting

If sensitive data is discovered, remove it from the current version, rotate the affected credential, and purge it from Git history where required.
