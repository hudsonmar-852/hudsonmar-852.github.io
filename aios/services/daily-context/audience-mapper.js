export const AUDIENCE_SEGMENTS = Object.freeze([
  'office_worker',
  'senior',
  'runner',
  'bodybuilding',
  'golf',
  'pain_recovery',
  'general_wellness',
  'southside_parent',
  'healthcare_worker'
]);

const TYPE_SEGMENTS = Object.freeze({
  weather: ['general_wellness', 'office_worker', 'senior', 'runner', 'southside_parent'],
  warning: ['general_wellness', 'office_worker', 'senior', 'runner', 'southside_parent'],
  transport: ['office_worker', 'southside_parent', 'healthcare_worker'],
  southside: ['southside_parent', 'office_worker', 'general_wellness'],
  multimedia: ['general_wellness'],
  news: ['general_wellness', 'office_worker'],
  special_event: ['general_wellness', 'runner', 'golf'],
  holiday: ['general_wellness', 'office_worker', 'healthcare_worker']
});

export function mapAudience(item) {
  const explicit = (item.audience_segments || []).filter((segment) => AUDIENCE_SEGMENTS.includes(segment));
  if (explicit.length) return [...new Set(explicit)];
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
  const segments = new Set(TYPE_SEGMENTS[item.record_type || item.type] || ['general_wellness']);
  if (/跑|run|馬拉松/.test(text)) segments.add('runner');
  if (/長者|senior|elderly/.test(text)) segments.add('senior');
  if (/南區|黃竹坑|southside|wong chuk hang/.test(text)) segments.add('southside_parent');
  if (/交通|港鐵|巴士|道路|transport|mtr/.test(text)) segments.add('office_worker');
  if (/高溫|酷熱|大雨|颱風|雷暴/.test(text)) segments.add('general_wellness');
  return [...segments];
}

export function messageAngle(type, segment) {
  const key = `${type}:${segment}`;
  return {
    'warning:office_worker': 'transport_or_work_arrangement',
    'warning:senior': 'stay_safe_indoors',
    'weather:runner': 'adjust_outdoor_timing',
    'transport:southside_parent': 'leave_extra_travel_time',
    'southside:office_worker': 'leave_extra_travel_time',
    'multimedia:general_wellness': 'warm_conversation',
    'news:general_wellness': 'warm_conversation'
  }[key] || (type === 'transport' ? 'travel_planning' : 'practical_daily_care');
}
