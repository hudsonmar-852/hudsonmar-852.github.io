# AIOS Daily Job Match

Public-safe, local-first implementation of `WI-20260805-001`.

## Workflow

```text
JobsDB / LinkedIn / Indeed / recruiter alert emails
→ private alert exporter
→ normalized JSON input
→ deterministic validation and deduplication
→ career-profile scoring and preference exclusions
→ daily top 20–30 JSON + Markdown
→ read-only AIOS dashboard
→ local Favourite / Applied / Not Suitable decisions
```

The repository deliberately does not scrape job sites, sign into job accounts,
or contain Gmail credentials, CVs, email bodies, private profile values, or
production output. `sample-alerts.json` and the example profile are fictional.

## Generate a daily board

Keep private inputs outside the repository, then run:

```sh
node aios/job-match/scripts/generate-daily.mjs \
  --input=/absolute/private/path/alerts.json \
  --profile=/absolute/private/path/career-profile.json \
  --history=/absolute/private/path/decisions.json \
  --output=/absolute/private/path/current.json \
  --report=/absolute/private/path/daily-job-match.md \
  --run-history=/absolute/private/path/run-history.json
```

The public demo can be refreshed from fictional data with:

```sh
node aios/job-match/scripts/generate-daily.mjs
```

Outputs are replaced atomically. The run-history ledger retains the newest 90
runs. The engine accepts normalized job objects with `title` and `applyUrl`; see
`data/sample-alerts.json`. A future private Gmail adapter should query a
dedicated label with least-privilege authorization and emit only this contract.

## Scheduling

Schedule the generator in the private AIOS runtime at 08:00
`Asia/Hong_Kong`. Do not schedule it in GitHub Pages or commit private outputs.
Use atomic file replacement and retain private run history outside the public
repository. A failed run must leave the previous successful board intact and
raise an operational alert.

## Rollback

Remove the additive `/aios/job-match/` route and its dashboard link. No data
migration is required; browser decisions use `aios-job-match-decisions-v1` in
local storage and can be cleared independently.
