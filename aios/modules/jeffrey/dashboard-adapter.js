const DRAFT_STATUS = 'draft_human_approval_required';

export function flattenDailyCatalogue(catalogue) {
  if (!catalogue?.new_reminders || catalogue.status !== DRAFT_STATUS) return [];
  return Object.entries(catalogue.new_reminders).flatMap(([category, reminders]) => (
    Array.isArray(reminders) ? reminders.map((reminder) => ({
      id: reminder.id,
      topic: category === 'weather_today' ? 'AIOS 今日情境' : `AIOS ${category}`,
      content: reminder.text,
      category,
      approvalStatus: 'pending',
      draftStatus: DRAFT_STATUS,
      source: reminder.source_line || null,
      sourceUrl: reminder.source_url || null,
      sourceRecordId: reminder.source_record_id || null,
      sourceTimestamp: null,
      contextStatus: catalogue.context_status,
      freshnessScore: reminder.freshness_score,
      confidenceScore: reminder.confidence_score,
      generated: true
    })) : []
  ));
}

export function prependCatalogueReminders({ legacy = [], catalogue, enabled }) {
  if (!enabled) return { reminders: legacy, mode: 'legacy_feature_disabled', contextStatus: 'disabled' };
  const fresh = flattenDailyCatalogue(catalogue);
  if (!fresh.length) return { reminders: legacy, mode: 'legacy_context_unavailable', contextStatus: 'unavailable' };
  return {
    reminders: [...fresh, ...legacy],
    mode: 'daily_context_v1',
    contextStatus: catalogue.context_status
  };
}

export async function loadLatestDailyAssets(fetchImpl = fetch, manifestUrl = '/aios/modules/jeffrey/latest.json') {
  try {
    const manifestResponse = await fetchImpl(manifestUrl, { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error(`manifest HTTP ${manifestResponse.status}`);
    const manifest = await manifestResponse.json();
    if (manifest.feature_flag !== 'AIOS_DAILY_CONTEXT_V1' || manifest.status !== DRAFT_STATUS) {
      throw new Error('manifest is not an approved draft adapter record');
    }
    const [contextResponse, catalogueResponse] = await Promise.all([
      fetchImpl(manifest.daily_context_url, { cache: 'no-store' }),
      fetchImpl(manifest.daily_catalogue_url, { cache: 'no-store' })
    ]);
    if (!contextResponse.ok || !catalogueResponse.ok) throw new Error('daily assets unavailable');
    return {
      ok: true,
      manifest,
      context: await contextResponse.json(),
      catalogue: await catalogueResponse.json()
    };
  } catch (error) {
    return {
      ok: false,
      manifest: null,
      context: null,
      catalogue: null,
      error: error instanceof Error ? error.message : 'daily context unavailable'
    };
  }
}
