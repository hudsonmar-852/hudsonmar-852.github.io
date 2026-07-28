import { mapAudience } from './audience-mapper.js';

const EXCLUDED = [
  /政治|政黨|選舉|立法會|controvers/i,
  /命案|死亡|慘劇|悲劇|災難|distress|tragic/i,
  /傳聞|未證實|據報|speculat/i,
  /診斷|治療|藥物|流感高峰|medical/i
];

const BASE_SCORE = Object.freeze({
  warning: 100,
  transport: 92,
  southside: 88,
  weather: 86,
  special_event: 78,
  holiday: 76,
  news: 70,
  multimedia: 66
});

export function topicSafety(item) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  if (!text.trim()) return { safe: false, reason: 'empty_topic' };
  const blocked = EXCLUDED.find((pattern) => pattern.test(text));
  if (blocked) return { safe: false, reason: 'excluded_sensitive_topic' };
  if (item.speculative === true || item.supported === false) {
    return { safe: false, reason: 'unsupported_or_speculative' };
  }
  return { safe: true, reason: null };
}

function topicFromItem(item, type) {
  const audience = mapAudience({ ...item, type });
  const localBoost = /南區|黃竹坑|southside|wong chuk hang/i.test(`${item.title} ${item.summary}`) ? 8 : 0;
  const safetyBoost = type === 'warning' ? 8 : 0;
  const replyBoost = item.reply_likelihood === 'high' ? 5 : 0;
  return {
    id: `${type}:${item.id}`,
    type,
    title: item.title,
    summary: item.summary,
    score: Math.min(100, (BASE_SCORE[type] || 60) + localBoost + safetyBoost + replyBoost),
    audience_segments: audience,
    source_record_id: item.provenance.record_id,
    record_url: item.provenance.record_url
  };
}

export function selectTopics(context, { limit = 3 } = {}) {
  const candidates = [];
  const rejected = [];
  if (context.weather?.status === 'verified') {
    const type = context.weather.warnings.length ? 'warning' : 'weather';
    const weatherItem = {
      id: 'verified-weather',
      title: context.weather.warnings[0] || context.weather.conditions || '今日天氣',
      summary: [
        context.weather.conditions,
        context.weather.rain_risk,
        context.weather.thunderstorm_risk,
        context.weather.heat_risk,
        context.weather.cold_risk
      ].filter(Boolean).join('；'),
      provenance: {
        record_id: context.weather.record_id,
        source_name: context.weather.source_name,
        record_url: context.weather.source_url,
        source_timestamp: context.weather.source_timestamp,
        retrieval_timestamp: context.weather.retrieval_timestamp,
        freshness_score: context.weather.freshness_score,
        confidence_score: context.weather.confidence_score
      }
    };
    candidates.push(topicFromItem(weatherItem, type));
  }

  const groups = [
    ['transport', context.transport || []],
    ['southside', context.southside || []],
    ['news', context.top_news || []],
    ['multimedia', context.multimedia_hits || []],
    ['special_event', context.special_events || []],
    ['holiday', context.holiday ? [context.holiday] : []]
  ];
  for (const [type, items] of groups) {
    for (const item of items) {
      const safety = topicSafety(item);
      if (!safety.safe) {
        rejected.push({ id: item.id, type, reason: safety.reason });
        continue;
      }
      candidates.push(topicFromItem(item, type));
    }
  }

  const selected = candidates
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
  return {
    selected,
    rejected,
    recommended_topics: selected.map((item) => item.title),
    avoid_topics: [...new Set(rejected.map((item) => item.reason))]
  };
}
