# Jeffrey Relationship Messaging Engine migration and rollback

Version: 1.0.0
Risk: Medium
Human review: Required before final merge

## Migration

The deployment is additive. It introduces `/Jeffrey/` and does not delete or
reset browser storage.

1. Read the canonical `jeffrey.reminders` array.
2. Read the confirmed production maps `jeffreyFavourites` and `jeffreyUsage`,
   preserving message content, saved time, copy count and last copied time.
3. Read recognised legacy arrays: `jeffreyReminders`, `reminders` and
   `jeffrey_messages`.
4. Import only entries with a new `id` or message text.
5. Preserve every legacy key unchanged.
6. Store the migration receipt at `jeffrey.relationship.migration.v1`.
7. Add newly generated messages with `unshift()` so history remains intact.

The deployed dashboard source was audited from `hudsonmar-852/Jeffrey`.
Historical daily JSON is repository data in that separate production project;
this migration preserves browser-level tracked history but does not delete,
move or rewrite that external repository.

## Rollback

1. Revert the feature commit or restore commit `6130d9f`.
2. Publish the restored static assets through the repository's normal
   human-approved merge workflow.
3. Do not clear localStorage. The new canonical and migration keys are safe to
   leave in place and legacy keys were not changed.
4. If the `/Jeffrey/` route must be removed, revert only the new route and AIOS
   registry entries.

Safety branch: `backup/jeffrey-production-before-relationship-engine-20260725`.
