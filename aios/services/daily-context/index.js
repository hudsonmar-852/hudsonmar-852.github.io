import { buildContextCollections, evaluateRecords, loadStoredRecords, resolveWeather } from './collector.js';
import { mapAudience } from './audience-mapper.js';
import { selectTopics } from './topic-selector.js';
import { assertDailyContext } from './validator.js';

export const DAILY_CONTEXT_SCHEMA_VERSION = '1.0';
export const DAILY_CONTEXT_FEATURE_FLAG = 'AIOS_DAILY_CONTEXT_V1';

function sourceRecordView(record) {
  return {
    record_id: record.record_id || '',
    record_type: record.record_type || '',
    source_kind: record.source_kind || '',
    source_name: record.source_name || '',
    record_url: record.record_url || '',
    source_timestamp: record.source_timestamp || '',
    retrieval_timestamp: record.retrieval_timestamp || '',
    priority: record.priority,
    freshness_score: record.freshness_score,
    confidence_score: record.confidence_score,
    decision: record.decision,
    rejection_reason: record.rejection_reason || null
  };
}

export function featureEnabled(environment = process.env) {
  return String(environment[DAILY_CONTEXT_FEATURE_FLAG] || '').toLowerCase() === 'true';
}

export function collectDailyContext({ date, records = [], now = new Date() }) {
  const evaluated = evaluateRecords(records, now);
  const { weather, conflicts } = resolveWeather(evaluated);
  const collections = buildContextCollections(evaluated);
  const draft = {
    schema_version: DAILY_CONTEXT_SCHEMA_VERSION,
    date,
    timezone: 'Asia/Hong_Kong',
    generated_at: now.toISOString(),
    source_records: evaluated.map(sourceRecordView),
    weather,
    ...collections,
    audience_segments: [],
    recommended_topics: [],
    avoid_topics: [],
    topic_candidates: [],
    validation: {
      stale_items_rejected: evaluated
        .filter((record) => record.decision === 'rejected' && /older|previous_day|timestamp|validity/.test(record.rejection_reason || ''))
        .map((record) => ({ record_id: record.record_id, reason: record.rejection_reason })),
      conflicts_rejected: conflicts,
      missing_fields: [...new Set(evaluated.flatMap((record) => record.missing_fields || []))],
      status: 'partial'
    }
  };
  const topics = selectTopics(draft);
  draft.topic_candidates = topics.selected;
  draft.recommended_topics = topics.recommended_topics;
  draft.avoid_topics = topics.avoid_topics;
  draft.audience_segments = [...new Set([
    ...topics.selected.flatMap((topic) => topic.audience_segments),
    ...Object.values(collections)
      .flatMap((value) => Array.isArray(value) ? value : value ? [value] : [])
      .flatMap(mapAudience)
  ])];
  const acceptedCount = evaluated.filter((record) => record.decision === 'accepted').length;
  draft.validation.status = acceptedCount && topics.selected.length ? 'pass' : 'partial';
  return assertDailyContext(draft);
}

export function collectFromRepository({ repositoryRoot, date, now = new Date() }) {
  const records = loadStoredRecords(repositoryRoot, date);
  return collectDailyContext({ date, records, now });
}

export {
  scoreFreshness,
  scoreNewsFreshness,
  scoreTransportFreshness,
  scoreWeatherFreshness
} from './freshness.js';
export { scoreConfidence, confidenceDecision } from './confidence.js';
export { selectHighestPriority, sourcePriority, SOURCE_PRIORITY } from './source-priority.js';
export { selectTopics, topicSafety } from './topic-selector.js';
export { mapAudience, messageAngle, AUDIENCE_SEGMENTS } from './audience-mapper.js';
export { validateDailyContext, assertDailyContext } from './validator.js';
