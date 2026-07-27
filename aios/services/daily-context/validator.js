const REQUIRED = [
  'schema_version',
  'date',
  'timezone',
  'generated_at',
  'source_records',
  'weather',
  'top_news',
  'multimedia_hits',
  'transport',
  'southside',
  'special_events',
  'holiday',
  'audience_segments',
  'recommended_topics',
  'avoid_topics',
  'topic_candidates',
  'validation'
];

const WEATHER_REQUIRED = [
  'status',
  'record_id',
  'conditions',
  'temperature_c',
  'humidity_percent',
  'warnings',
  'rain_risk',
  'thunderstorm_risk',
  'heat_risk',
  'cold_risk',
  'source_name',
  'source_timestamp',
  'retrieval_timestamp',
  'source_url',
  'freshness_score',
  'confidence_score',
  'rejection_reason'
];

export function validateDailyContext(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { valid: false, errors: ['record_must_be_object'] };
  }
  for (const key of REQUIRED) {
    if (!(key in record)) errors.push(`missing:${key}`);
  }
  if (record.schema_version !== '1.0') errors.push('invalid:schema_version');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date || '')) errors.push('invalid:date');
  if (record.timezone !== 'Asia/Hong_Kong') errors.push('invalid:timezone');
  if (Number.isNaN(Date.parse(record.generated_at || ''))) errors.push('invalid:generated_at');
  if (!record.weather || typeof record.weather !== 'object') {
    errors.push('missing:weather');
  } else {
    for (const key of WEATHER_REQUIRED) {
      if (!(key in record.weather)) errors.push(`missing:weather.${key}`);
    }
    if (!['verified', 'unavailable', 'rejected'].includes(record.weather.status)) {
      errors.push('invalid:weather.status');
    }
  }
  for (const key of [
    'source_records',
    'top_news',
    'multimedia_hits',
    'transport',
    'southside',
    'special_events',
    'audience_segments',
    'recommended_topics',
    'avoid_topics',
    'topic_candidates'
  ]) {
    if (!Array.isArray(record[key])) errors.push(`invalid:${key}`);
  }
  if (!['pass', 'partial', 'fail'].includes(record.validation?.status)) {
    errors.push('invalid:validation.status');
  }
  return { valid: errors.length === 0, errors };
}

export function assertDailyContext(record) {
  const result = validateDailyContext(record);
  if (!result.valid) throw new Error(`Invalid Daily Context Record: ${result.errors.join(', ')}`);
  return record;
}
