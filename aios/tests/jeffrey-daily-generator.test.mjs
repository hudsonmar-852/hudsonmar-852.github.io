import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectDailyContext } from '../services/daily-context/index.js';
import { duplicateCheck, semanticSimilarity } from '../modules/jeffrey/anti-repetition.js';
import { generateDailyCatalogue, CATEGORY_ORDER } from '../modules/jeffrey/generator.js';
import {
  flattenDailyCatalogue,
  loadLatestDailyAssets,
  prependCatalogueReminders
} from '../modules/jeffrey/dashboard-adapter.js';
import { runDaily } from '../modules/jeffrey/run-daily.mjs';

const NOW = new Date('2026-07-27T10:00:00+08:00');

function validWarningContext() {
  return collectDailyContext({
    date: '2026-07-27',
    now: NOW,
    records: [{
      record_id: 'warning-1',
      record_type: 'warning',
      source_kind: 'scheduled_weather',
      source_name: 'AIOS scheduled weather and warning record',
      record_url: '/aios/data/daily-context-inputs/2026-07-27-warning.json',
      source_timestamp: '2026-07-27T09:30:00+08:00',
      retrieval_timestamp: '2026-07-27T09:35:00+08:00',
      source_quality: 'official',
      internal_consistency: 1,
      cross_record_agreement: 1,
      completeness: 1,
      validity_explicit: true,
      valid_until: '2026-07-27T12:00:00+08:00',
      supported: true,
      data: {
        conditions: '大雨',
        temperature_c: 27,
        humidity_percent: 90,
        warnings: ['黃色暴雨警告'],
        rain_risk: '高',
        thunderstorm_risk: '中',
        heat_risk: '低',
        cold_risk: '低'
      }
    }]
  });
}

test('exact and normalised duplicates block', () => {
  const history = [{ text: '今日慢慢嚟，唔使急。', date: '2026-07-26' }];
  assert.equal(duplicateCheck('今日慢慢嚟，唔使急。', history).decision, 'block');
  assert.equal(duplicateCheck('今日 慢慢嚟，唔使急！', history).decision, 'block');
});

test('high semantic similarity blocks', () => {
  const left = '今日交通有改動，出發前望一望路線先啦。';
  const right = '今日交通有改動，出發前望一望路線先啦呀。';
  assert.ok(semanticSimilarity(left, right) >= 0.88);
  assert.equal(duplicateCheck(left, [{ text: right }]).decision, 'block');
});

test('validated context produces exactly ten sourced draft reminders', () => {
  const result = generateDailyCatalogue({
    date: '2026-07-27',
    context: validWarningContext(),
    history: []
  });
  const reminders = result.catalogue.new_reminders.weather_today;
  assert.equal(reminders.length, 10);
  assert.equal(result.catalogue.context_status, 'validated');
  for (const reminder of reminders) {
    assert.equal(reminder.status, 'draft_human_approval_required');
    assert.equal(reminder.approval_status, 'pending');
    assert.match(reminder.source_line, /AIOS Daily Context/);
    assert.match(reminder.source_url, /^\/aios\/.+\.json$/);
    assert.equal(reminder.context_specific, true);
  }
});

test('unsupported context produces zero context reminders and evergreen only', () => {
  const context = collectDailyContext({ date: '2026-07-27', records: [], now: NOW });
  const result = generateDailyCatalogue({ date: '2026-07-27', context, history: [] });
  assert.equal(result.catalogue.new_reminders.weather_today.length, 0);
  assert.equal(result.catalogue.context_status, 'evergreen_only');
  assert.equal(result.catalogue.qa_summary.new_evergreen_reminders, 30);
});

test('each existing evergreen category receives five new drafts', () => {
  const context = collectDailyContext({ date: '2026-07-27', records: [], now: NOW });
  const result = generateDailyCatalogue({ date: '2026-07-27', context, history: [] });
  for (const category of CATEGORY_ORDER) {
    assert.equal(result.catalogue.new_reminders[category].length, 5, category);
    assert.equal(result.catalogue.new_reminders[category].every((item) => (
      item.status === 'draft_human_approval_required'
    )), true);
  }
});

test('dashboard adapter prepends new drafts and preserves old reminder objects', () => {
  const old = [{ id: 'old-1', content: '歷史訊息', count: 7 }];
  const context = collectDailyContext({ date: '2026-07-27', records: [], now: NOW });
  const { catalogue } = generateDailyCatalogue({ date: '2026-07-27', context, history: [] });
  const adapted = prependCatalogueReminders({ legacy: old, catalogue, enabled: true });
  assert.equal(adapted.reminders.length, 31);
  assert.equal(adapted.reminders.at(-1), old[0]);
  assert.equal(adapted.reminders[0].approvalStatus, 'pending');
  assert.equal(flattenDailyCatalogue(catalogue).length, 30);
});

test('feature flag disabled leaves existing dashboard behavior untouched', () => {
  const legacy = [{ id: 'legacy' }];
  const result = prependCatalogueReminders({ legacy, catalogue: {}, enabled: false });
  assert.equal(result.reminders, legacy);
  assert.equal(result.mode, 'legacy_feature_disabled');
});

test('dashboard loader gracefully falls back when context is unavailable', async () => {
  const result = await loadLatestDailyAssets(async () => ({ ok: false, status: 404 }));
  assert.equal(result.ok, false);
  assert.equal(result.context, null);
  assert.match(result.error, /manifest/);
});

test('runDaily feature flag off writes nothing', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-jeffrey-off-'));
  const result = runDaily({
    repositoryRoot: temporary,
    date: '2026-07-27',
    now: NOW,
    environment: { AIOS_DAILY_CONTEXT_V1: 'false' }
  });
  assert.equal(result.mode, 'legacy_unchanged');
  assert.deepEqual(result.written, []);
  assert.equal(fs.readdirSync(temporary).length, 0);
});

test('generator source does not call a raw weather API', () => {
  const source = fs.readFileSync(new URL('../modules/jeffrey/generator.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /data\.weather\.gov\.hk|weatherAPI\/opendata|fetch\s*\(/);
});
