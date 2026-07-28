import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectDailyContext,
  confidenceDecision,
  mapAudience,
  scoreConfidence,
  scoreNewsFreshness,
  scoreTransportFreshness,
  scoreWeatherFreshness,
  selectHighestPriority,
  validateDailyContext
} from '../services/daily-context/index.js';

const NOW = new Date('2026-07-27T10:00:00+08:00');
const STORED_URL = '/aios/data/daily-context-inputs/2026-07-27-weather.json';

function weather(overrides = {}) {
  return {
    record_id: 'weather-1',
    record_type: 'weather',
    source_kind: 'scheduled_weather',
    source_name: 'AIOS scheduled weather record',
    record_url: STORED_URL,
    date: '2026-07-27',
    source_timestamp: '2026-07-27T09:00:00+08:00',
    retrieval_timestamp: '2026-07-27T09:05:00+08:00',
    source_quality: 'official',
    internal_consistency: 1,
    cross_record_agreement: 1,
    completeness: 1,
    supported: true,
    data: {
      conditions: '有陽光，天氣炎熱',
      temperature_c: 32,
      humidity_percent: 72,
      warnings: [],
      rain_risk: '低',
      thunderstorm_risk: '低',
      heat_risk: '高',
      cold_risk: '低'
    },
    ...overrides
  };
}

function news(overrides = {}) {
  return {
    record_id: 'news-1',
    record_type: 'news',
    source_kind: 'scheduled_news',
    source_name: 'AIOS Daily News record',
    record_url: '/aios/data/daily-context-inputs/2026-07-27-news.json',
    date: '2026-07-27',
    source_timestamp: '2026-07-27T08:00:00+08:00',
    retrieval_timestamp: '2026-07-27T08:05:00+08:00',
    source_quality: 'trusted',
    internal_consistency: 1,
    cross_record_agreement: 0.9,
    completeness: 1,
    supported: true,
    title: '南區周末社區活動安排',
    summary: '黃竹坑有社區活動，附近人流或會較多。',
    ...overrides
  };
}

test('valid fresh weather record is verified with provenance', () => {
  const context = collectDailyContext({ date: '2026-07-27', records: [weather()], now: NOW });
  assert.equal(context.weather.status, 'verified');
  assert.equal(context.weather.freshness_score, 100);
  assert.ok(context.weather.confidence_score >= 85);
  assert.equal(context.weather.source_url, STORED_URL);
  assert.equal(validateDailyContext(context).valid, true);
});

test('stale and previous-day weather are rejected', () => {
  const stale = scoreWeatherFreshness(weather({ source_timestamp: '2026-07-27T05:30:00+08:00' }), NOW);
  assert.equal(stale.usable, false);
  assert.equal(stale.reason, 'weather_older_than_4h');
  const previous = scoreWeatherFreshness(weather({ source_timestamp: '2026-07-26T23:30:00+08:00' }), NOW);
  assert.equal(previous.reason, 'previous_day_weather');
  const context = collectDailyContext({
    date: '2026-07-27',
    records: [weather({ source_timestamp: '2026-07-27T05:30:00+08:00' })],
    now: NOW
  });
  assert.equal(context.weather.status, 'rejected');
  assert.equal(context.topic_candidates.length, 0);
});

test('conflicting highest-priority weather records are conflict_rejected', () => {
  const context = collectDailyContext({
    date: '2026-07-27',
    records: [
      weather(),
      weather({ record_id: 'weather-2', data: { ...weather().data, temperature_c: 27 } })
    ],
    now: NOW
  });
  assert.equal(context.weather.status, 'rejected');
  assert.equal(context.weather.rejection_reason, 'conflicting_weather_records');
  assert.equal(context.validation.conflicts_rejected.length, 2);
  assert.equal(context.source_records.every((record) => record.decision === 'conflict_rejected'), true);
});

test('missing source timestamp is hard rejected', () => {
  const context = collectDailyContext({
    date: '2026-07-27',
    records: [weather({ source_timestamp: '' })],
    now: NOW
  });
  assert.equal(context.weather.status, 'rejected');
  assert.match(context.source_records[0].rejection_reason, /missing_fields/);
  assert.ok(context.validation.missing_fields.includes('source_timestamp'));
});

test('no available context produces valid partial fallback record', () => {
  const context = collectDailyContext({ date: '2026-07-27', records: [], now: NOW });
  assert.equal(context.weather.status, 'unavailable');
  assert.equal(context.validation.status, 'partial');
  assert.deepEqual(context.topic_candidates, []);
  assert.equal(validateDailyContext(context).valid, true);
});

test('fresh news remains usable when weather is unavailable', () => {
  const context = collectDailyContext({ date: '2026-07-27', records: [news()], now: NOW });
  assert.equal(context.weather.status, 'unavailable');
  assert.equal(context.top_news.length, 1);
  assert.equal(context.validation.status, 'pass');
  assert.equal(context.topic_candidates.length, 1);
});

test('low-confidence multimedia trend is rejected', () => {
  const record = news({
    record_id: 'trend-1',
    record_type: 'multimedia',
    source_kind: 'daily_intelligence',
    source_quality: 'unknown',
    internal_consistency: 0.2,
    cross_record_agreement: 0.1,
    completeness: 0.4
  });
  const score = scoreConfidence(record).score;
  assert.ok(score < 70);
  assert.equal(confidenceDecision(record, score).usable, false);
  const context = collectDailyContext({ date: '2026-07-27', records: [record], now: NOW });
  assert.equal(context.multimedia_hits.length, 0);
  assert.equal(context.source_records[0].decision, 'rejected');
});

test('audience mapping covers Southside transport and runner weather', () => {
  assert.ok(mapAudience({ record_type: 'transport', title: '黃竹坑道路安排' }).includes('southside_parent'));
  assert.ok(mapAudience({ record_type: 'weather', title: '酷熱下跑步時段' }).includes('runner'));
});

test('freshness boundary rules for news and transport are deterministic', () => {
  assert.equal(scoreNewsFreshness(news({ source_timestamp: '2026-07-27T03:00:00+08:00' }), NOW).score, 80);
  assert.equal(scoreTransportFreshness(news({
    record_type: 'transport',
    source_timestamp: '2026-07-27T08:00:00+08:00'
  }), NOW).score, 80);
  assert.equal(scoreTransportFreshness(news({
    record_type: 'transport',
    source_timestamp: '2026-07-27T06:00:00+08:00'
  }), NOW).usable, false);
});

test('source priority picks the highest valid tier and never merges lower values', () => {
  const result = selectHighestPriority([
    { record_id: 'stored', priority: 5, confidence_score: 99, freshness_score: 100, data: { value: 'B' } },
    { record_id: 'dashboard', priority: 1, confidence_score: 85, freshness_score: 85, data: { value: 'A' } }
  ]);
  assert.equal(result.selected.record_id, 'dashboard');
  assert.equal(result.ignored[0].record_id, 'stored');
});
