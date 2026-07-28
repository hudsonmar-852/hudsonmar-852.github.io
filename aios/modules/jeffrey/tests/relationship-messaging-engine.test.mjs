import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchHongKongContext, generateMessages, migrateMessages, scoreCandidate, voiceLock
} from '../../../../Jeffrey/engine.mjs';

const NOW = new Date('2026-07-25T12:00:00+08:00');

const scenarios = [
  ['酷熱日', { context: { verified: true, kind: 'hot', source: { name: '香港天文台', url: 'https://example.test' } } }],
  ['大雨日', { context: { verified: true, kind: 'rain', source: { name: '香港天文台', url: 'https://example.test' } } }],
  ['普通工作日', {}],
  ['晚上有堂', { schedule: { hasTrainingToday: true } }],
  ['會員近期少出現', { profile: { id: 'member-1', nickname: '阿明', recentAttendance: 'less_frequent' } }],
  ['久坐會員', { profile: { id: 'member-2', nickname: 'May', commonIssues: ['long_sitting'] } }],
  ['初學會員', { profile: { id: 'member-3', nickname: 'Sam', communicationStyle: 'calm', fitnessFocus: ['beginner'] } }],
  ['玩味型熟客', { profile: { id: 'member-4', nickname: 'Ken', communicationStyle: 'playful' }, tone: 'playful' }],
  ['冷靜型會員', { profile: { id: 'member-5', nickname: 'Wing', communicationStyle: 'calm' }, tone: 'calm' }],
  ['無任何會員資料', { profile: {} }]
];

for (const [name, input] of scenarios) {
  test(`${name} 產生 5 條通過 Voice Lock 的草稿`, () => {
    const messages = generateMessages({ ...input, count: 5, now: NOW });
    assert.equal(messages.length, 5);
    for (const message of messages) {
      assert.equal(voiceLock(message.text, message.facts).pass, true, message.text);
      assert.equal(message.scores.hongKongNaturalness >= 4, true);
      assert.equal(message.scores.jeffreyVoiceMatch >= 4, true);
      assert.equal(message.scores.warmth >= 4, true);
      assert.equal(message.scores.factualSafety, 5);
      assert.equal(message.scores.repetitionRisk >= 4, true);
      assert.equal(message.humanApproval, 'pending');
    }
  });
}

test('拒絕書面語、未核實即時資訊及虛構 progress', () => {
  assert.equal(voiceLock('今天請注意補充足夠水分，以維持良好的運動表現。').pass, false);
  assert.equal(voiceLock('出面落緊大雨，唔使急。', { claimsRealtime: true, verified: false }).pass, false);
  const scored = scoreCandidate({
    text: '今晚再做多一下呀💪',
    facts: { requiresProgress: true, hasProgress: false }
  });
  assert.equal(scored.passes, false);
});

test('Professional Relationship Guard 阻止曖昧、私人投射及無訓練重點訊息', () => {
  assert.deepEqual(voiceLock('今日突然諗起你😂 有空覆我呀。').failures, ['relationship_boundary', 'missing_professional_anchor']);
  assert.equal(voiceLock('你今日好似好攰喎，我陪住你。').failures.includes('inferred_personal_state'), true);
  assert.equal(voiceLock('掛住你呀，得閒搵我。').failures.includes('relationship_boundary'), true);
  assert.equal(voiceLock('最近少見你上堂呀，想郁返我哋慢慢接返個節奏。').pass, true);
  assert.equal(voiceLock('今晚動作放慢少少，我哋專心做好控制。').pass, true);
});

test('近期少出現訊息保持專業而不製造私人特殊感', () => {
  const messages = generateMessages({
    profile: { id: 'member-boundary', nickname: 'Chris', recentAttendance: 'less_frequent' },
    count: 5,
    now: NOW
  });
  assert.equal(messages.length, 5);
  for (const message of messages) {
    assert.equal(/突然諗起|吹兩句|掛住|等你|畀我/.test(message.text), false, message.text);
    assert.equal(/操|訓練|上堂|動作|節奏|目標|郁/.test(message.text), true, message.text);
  }
});

test('HKO fetch 成功先標示 verified daily context', async () => {
  const context = await fetchHongKongContext(async () => ({
    ok: true,
    json: async () => ({
      updateTime: '2026-07-25T11:30:00+08:00',
      temperature: { data: [{ place: '香港天文台', value: 30 }] },
      rainfall: { data: [{ place: '南區', max: 0 }] },
      warningMessage: ['酷熱天氣警告現正生效。']
    })
  }), NOW);
  assert.equal(context.verified, true);
  assert.equal(context.kind, 'hot');
  assert.equal(context.source.name, '香港天文台');
  assert.equal(context.confidence, 1);
});

test('fetch 失敗或 stale 時不會當成今日事實', async () => {
  const failed = await fetchHongKongContext(async () => { throw new Error('offline'); }, NOW);
  assert.equal(failed.verified, false);
  assert.equal(failed.status, 'failed');
  const stale = await fetchHongKongContext(async () => ({
    ok: true,
    json: async () => ({ updateTime: '2026-07-24T01:00:00+08:00' })
  }), NOW);
  assert.equal(stale.verified, false);
  assert.equal(stale.status, 'stale');
  const fallback = generateMessages({ context: failed, count: 5, now: NOW });
  assert.equal(fallback.every((message) => message.dataStatus === 'fallback'), true);
  assert.equal(fallback.some((message) => /大雨|咁熱|咁焗/.test(message.text)), false);
});

test('migration 保留現有 tracking、history 及 legacy keys', () => {
  const values = new Map([
    ['jeffrey.reminders', JSON.stringify([{ id: 'current', text: '現有訊息', favourite: true, usageCount: 8, lastCopied: '2026-07-20' }])],
    ['reminders', JSON.stringify([{ id: 'legacy', text: '舊訊息', usageCount: 3 }])],
    ['jeffreyFavourites', JSON.stringify({ 'old-key': { id: 'fav', content: '舊 Favourite 訊息', savedAt: '2026-07-19' } })],
    ['jeffreyUsage', JSON.stringify({ 'old-key': { id: 'fav', content: '舊 Favourite 訊息', count: 6, lastCopied: '2026-07-20' } })]
  ]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const result = migrateMessages(storage);
  assert.equal(result.messages.length, 3);
  assert.equal(result.messages[0].favourite, true);
  assert.equal(result.messages[0].usageCount, 8);
  assert.equal(result.messages[0].lastCopied, '2026-07-20');
  assert.equal(values.has('reminders'), true);
  assert.equal(values.has('jeffreyFavourites'), true);
  assert.equal(values.has('jeffreyUsage'), true);
  assert.equal(result.messages.find((item) => item.id === 'fav').favourite, true);
  assert.equal(result.messages.find((item) => item.id === 'fav').usageCount, 6);
  assert.equal(JSON.parse(values.get('jeffrey.relationship.migration.v1')).preservedLegacyKeys, true);
});
