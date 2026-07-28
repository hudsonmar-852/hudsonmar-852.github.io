import fs from 'node:fs';
import path from 'node:path';
import { scoreFreshness } from './freshness.js';
import { scoreConfidence, confidenceDecision } from './confidence.js';
import { sourcePriority, selectHighestPriority } from './source-priority.js';

const RECORD_DIRECTORIES = [
  ['executive_dashboard', 'aios/data/executive-dashboard'],
  ['scheduled_daily_context', 'aios/data/daily-context-inputs'],
  ['knowledge_base_daily', 'aios/data/knowledge-base/daily'],
  ['daily_intelligence', 'aios/data/daily-intelligence'],
  ['jeffrey_project_context', 'aios/modules/jeffrey/context-records']
];

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listJsonFiles(filename));
    else if (entry.name.endsWith('.json')) files.push(filename);
  }
  return files;
}

function readJson(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch {
    return null;
  }
}

export function adaptStoredCatalogue(data, relativePath) {
  const weather = data?.weather_context;
  if (!data?.catalogue_date || !weather) return null;
  const statusVerified = weather.refresh_status === 'verified';
  const recordUrl = `/${relativePath.replaceAll(path.sep, '/')}`;
  return {
    record_id: `jeffrey-catalogue:${data.catalogue_date}`,
    record_type: 'weather',
    source_kind: 'jeffrey_project_context',
    source_name: 'AIOS Jeffrey stored daily catalogue',
    record_url: recordUrl,
    date: data.catalogue_date,
    source_timestamp: weather.source_update_time || weather.forecast_update_time || '',
    retrieval_timestamp: weather.retrieval_time || '',
    source_quality: 'aios_verified',
    internal_consistency: statusVerified ? 1 : 0.35,
    cross_record_agreement: statusVerified ? 0.9 : 0.4,
    completeness: statusVerified ? 0.9 : 0.55,
    validity_explicit: false,
    supported: statusVerified,
    data: {
      conditions: weather.current_conditions || weather.verified_observation || '',
      temperature_c: extractNumber(weather.current_conditions || weather.verified_observation),
      humidity_percent: extractPercent(weather.current_conditions || weather.verified_observation),
      warnings: Array.isArray(weather.active_warnings) ? weather.active_warnings : [],
      rain_risk: weather.rain_thunderstorm_risk || '',
      thunderstorm_risk: weather.rain_thunderstorm_risk || '',
      heat_risk: weather.heat_cold_risk || '',
      cold_risk: weather.heat_cold_risk || ''
    }
  };
}

function extractNumber(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)\s*°?C/i);
  return match ? Number(match[1]) : null;
}

function extractPercent(value) {
  const match = String(value || '').match(/(?:濕度|humidity)[^\d]*(\d{1,3})\s*%/i);
  return match ? Number(match[1]) : null;
}

function recordsFromValue(value, defaults) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => recordsFromValue(item, defaults));
  if (Array.isArray(value.records)) return value.records.map((item) => ({ ...defaults, ...item }));
  if (value.record_id && value.record_type) return [{ ...defaults, ...value }];
  return [];
}

export function loadStoredRecords(repositoryRoot, date) {
  const records = [];
  for (const [sourceKind, relativeDirectory] of RECORD_DIRECTORIES) {
    const directory = path.join(repositoryRoot, relativeDirectory);
    for (const filename of listJsonFiles(directory)) {
      const value = readJson(filename);
      const relative = path.relative(repositoryRoot, filename);
      records.push(...recordsFromValue(value, {
        source_kind: sourceKind,
        record_url: `/${relative.replaceAll(path.sep, '/')}`
      }));
    }
  }
  const catalogueDirectory = path.join(repositoryRoot, 'aios/modules/jeffrey/catalogues');
  for (const filename of listJsonFiles(catalogueDirectory)) {
    if (filename.includes(`${path.sep}generated${path.sep}`)) continue;
    const value = readJson(filename);
    if (value?.catalogue_date !== date) continue;
    const adapted = adaptStoredCatalogue(value, path.relative(repositoryRoot, filename));
    if (adapted) records.push(adapted);
  }
  return records;
}

function missingFields(record) {
  return ['record_id', 'record_type', 'source_kind', 'source_name', 'record_url', 'source_timestamp']
    .filter((key) => !record[key]);
}

function evaluateRecord(record, now) {
  const priority = sourcePriority(record.source_kind);
  const missing = missingFields(record);
  const freshness = scoreFreshness(record, now);
  const confidence = scoreConfidence(record);
  const confidenceGate = confidenceDecision(record, confidence.score);
  const unsupported = record.supported === false;
  const reason = missing.length
    ? `missing_fields:${missing.join('|')}`
    : !freshness.usable
      ? freshness.reason
      : !confidenceGate.usable
        ? confidenceGate.reason
        : unsupported
          ? 'unsupported_record'
          : null;
  return {
    ...record,
    priority,
    freshness_score: freshness.score,
    confidence_score: confidence.score,
    confidence_components: confidence.components,
    low_risk_only: confidenceGate.lowRiskOnly,
    decision: reason ? 'rejected' : 'accepted',
    rejection_reason: reason,
    missing_fields: missing
  };
}

function provenance(record) {
  return {
    record_id: record.record_id,
    source_name: record.source_name,
    record_url: record.record_url,
    source_timestamp: record.source_timestamp,
    retrieval_timestamp: record.retrieval_timestamp || '',
    freshness_score: record.freshness_score,
    confidence_score: record.confidence_score
  };
}

function contextItem(record) {
  return {
    id: record.record_id,
    title: record.title || record.data?.title || '',
    summary: record.summary || record.data?.summary || '',
    audience_segments: record.audience_segments || [],
    supported: record.supported !== false,
    speculative: record.speculative === true,
    provenance: provenance(record)
  };
}

function emptyWeather(status = 'unavailable', reason = 'no_valid_weather_record') {
  return {
    status,
    record_id: null,
    conditions: '',
    temperature_c: null,
    humidity_percent: null,
    warnings: [],
    rain_risk: '',
    thunderstorm_risk: '',
    heat_risk: '',
    cold_risk: '',
    source_name: '',
    source_timestamp: '',
    retrieval_timestamp: '',
    source_url: '',
    freshness_score: 0,
    confidence_score: 0,
    rejection_reason: reason
  };
}

export function evaluateRecords(records, now = new Date()) {
  return records.map((record) => evaluateRecord(record, now));
}

export function buildContextCollections(evaluated) {
  const accepted = evaluated.filter((record) => record.decision === 'accepted');
  const collections = {
    top_news: [],
    multimedia_hits: [],
    transport: [],
    southside: [],
    special_events: [],
    holiday: null
  };
  const mapping = {
    news: 'top_news',
    multimedia: 'multimedia_hits',
    transport: 'transport',
    southside: 'southside',
    special_event: 'special_events'
  };
  for (const [recordType, target] of Object.entries(mapping)) {
    const candidates = accepted.filter((record) => record.record_type === recordType);
    if (!candidates.length) continue;
    const priority = Math.min(...candidates.map((record) => record.priority));
    collections[target] = candidates
      .filter((record) => record.priority === priority)
      .sort((a, b) => b.confidence_score - a.confidence_score || a.record_id.localeCompare(b.record_id))
      .slice(0, 5)
      .map(contextItem);
  }
  const holidays = accepted.filter((record) => record.record_type === 'holiday');
  if (holidays.length) {
    const selected = [...holidays].sort((a, b) => a.priority - b.priority || b.confidence_score - a.confidence_score)[0];
    collections.holiday = contextItem(selected);
  }
  return collections;
}

export function resolveWeather(evaluated) {
  const candidates = evaluated.filter((record) => (
    ['weather', 'warning'].includes(record.record_type) && record.decision === 'accepted'
  ));
  const selection = selectHighestPriority(candidates, (record) => record.data);
  if (selection.conflicts.length) {
    for (const conflict of selection.conflicts) {
      const record = evaluated.find((item) => item.record_id === conflict.record_id);
      record.decision = 'conflict_rejected';
      record.rejection_reason = conflict.reason;
    }
    return {
      weather: emptyWeather('rejected', 'conflicting_weather_records'),
      conflicts: selection.conflicts
    };
  }
  if (!selection.selected) {
    const rejectedExists = evaluated.some((record) => ['weather', 'warning'].includes(record.record_type));
    return {
      weather: emptyWeather(rejectedExists ? 'rejected' : 'unavailable'),
      conflicts: []
    };
  }
  const record = selection.selected;
  return {
    weather: {
      status: 'verified',
      record_id: record.record_id,
      conditions: record.data?.conditions || '',
      temperature_c: record.data?.temperature_c ?? null,
      humidity_percent: record.data?.humidity_percent ?? null,
      warnings: record.data?.warnings || [],
      rain_risk: record.data?.rain_risk || '',
      thunderstorm_risk: record.data?.thunderstorm_risk || '',
      heat_risk: record.data?.heat_risk || '',
      cold_risk: record.data?.cold_risk || '',
      source_name: record.source_name,
      source_timestamp: record.source_timestamp,
      retrieval_timestamp: record.retrieval_timestamp || '',
      source_url: record.record_url,
      freshness_score: record.freshness_score,
      confidence_score: record.confidence_score,
      rejection_reason: null
    },
    conflicts: []
  };
}
