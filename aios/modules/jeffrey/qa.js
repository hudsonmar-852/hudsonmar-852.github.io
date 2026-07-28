import { actionPhrases } from './anti-repetition.js';

const AI_PHRASES = [
  '此外',
  '因此',
  '同時',
  '為了',
  '建議你',
  '建議大家',
  '請注意',
  '保持健康',
  '有助於',
  '適量',
  '提升訓練表現',
  '立即行動',
  '最佳方案'
];
const MEDICAL = /診斷|治療|醫治|處方|藥物|保證康復|改善痛症|根治|中暑徵狀/;
const REALTIME = /今日|今朝|今晚|而家|現時|落雨|大雨|雷暴|風球|酷熱|交通|封路|延誤/;
const FITNESS = /操|健身|訓練|運動|重量|動作|跑步/;
const WARM = /慢慢|唔使急|辛苦|安全|舒服|都得|就夠|記得|留返/;
const CANTONESE = /今日|今晚|今朝|呀|啦|喎|啲|咗|嚟|唔|冇|俾|慢慢/;

export const QA_THRESHOLDS = Object.freeze({
  jeffrey_voice: 90,
  warm_heart: 90,
  reply_likelihood: 75,
  ai_smell_max: 10
});

function emojiCount(text) {
  return (text.match(/\p{Extended_Pictographic}/gu) || []).length;
}

function purposeCount(text) {
  const groups = [
    /飲水|水樽|口渴/,
    /呼吸|呼氣/,
    /交通|封路|出發|路線|轉車/,
    /休息|瞓|收尾/,
    /伸展|腳踝|郁|髖|手腕/,
    /訓練|重量|動作/,
    /食飯/,
    /安全|大雨|風球|雷暴/
  ];
  return groups.filter((pattern) => pattern.test(text)).length;
}

function scoreDraft(draft) {
  const text = draft.text;
  const aiHits = AI_PHRASES.filter((phrase) => text.includes(phrase)).length;
  const voice = Math.max(0, 100
    - aiHits * 35
    - (CANTONESE.test(text) ? 0 : 25)
    - (text.length > 90 ? 20 : 0)
    - (emojiCount(text) > 2 ? 20 : 0));
  const warm = Math.max(0, 90 + (WARM.test(text) ? 8 : 0) - (/[！!]{2,}/.test(text) ? 15 : 0));
  const reply = Math.max(0, 75 + (/[？?]|有冇|點呀|忙唔忙|食咗飯未/.test(text) ? 15 : 0));
  const aiSmell = Math.min(100, aiHits * 35 + (/^溫馨提示|^健康小貼士/.test(text) ? 40 : 0));
  return {
    jeffrey_voice: voice,
    warm_heart: warm,
    reply_likelihood: reply,
    ai_smell: aiSmell
  };
}

export function qaDraft(draft, { duplicate = { decision: 'pass' } } = {}) {
  const scores = scoreDraft(draft);
  const actions = actionPhrases(draft.text);
  const contextSpecific = draft.context_specific === true;
  const sourceIsStoredRecord = /^\/aios\/.+\.json(?:#.*)?$/.test(draft.source_url || '');
  const unsupportedClaim = contextSpecific && (!draft.source_record_id || !sourceIsStoredRecord);
  const unverifiedWeather = /大雨|雷暴|風球|酷熱|落雨/.test(draft.text)
    && (!contextSpecific || draft.context_status !== 'validated');
  const forcedFitness = contextSpecific
    && FITNESS.test(draft.text)
    && !['runner', 'bodybuilding'].some((segment) => draft.audience_segments?.includes(segment));
  const checks = {
    duplicate: duplicate.decision === 'pass',
    one_purpose: purposeCount(draft.text) <= 1,
    one_action_maximum: actions.length <= 1,
    unsupported_claim: !unsupportedClaim,
    forced_fitness_angle: !forcedFitness,
    medical_claim: !MEDICAL.test(draft.text),
    source_provenance: !contextSpecific || sourceIsStoredRecord,
    freshness: !contextSpecific || Number(draft.freshness_score) > 0,
    confidence: !contextSpecific || Number(draft.confidence_score) >= 70,
    unverified_weather: !unverifiedWeather,
    draft_status: draft.status === 'draft_human_approval_required'
  };
  const passes = scores.jeffrey_voice >= QA_THRESHOLDS.jeffrey_voice
    && scores.warm_heart >= QA_THRESHOLDS.warm_heart
    && scores.reply_likelihood >= QA_THRESHOLDS.reply_likelihood
    && scores.ai_smell <= QA_THRESHOLDS.ai_smell_max
    && Object.values(checks).every(Boolean);
  return {
    passes,
    scores,
    checks,
    actions,
    duplicate,
    failures: [
      ...(scores.jeffrey_voice < QA_THRESHOLDS.jeffrey_voice ? ['jeffrey_voice'] : []),
      ...(scores.warm_heart < QA_THRESHOLDS.warm_heart ? ['warm_heart'] : []),
      ...(scores.reply_likelihood < QA_THRESHOLDS.reply_likelihood ? ['reply_likelihood'] : []),
      ...(scores.ai_smell > QA_THRESHOLDS.ai_smell_max ? ['ai_smell'] : []),
      ...Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name)
    ]
  };
}

export function rewriteOnce(draft) {
  let text = draft.text
    .replaceAll('建議你', '')
    .replaceAll('請注意', '')
    .replaceAll('此外', '')
    .replace(/\s+/g, ' ')
    .trim();
  if (actionPhrases(text).length > 1) {
    text = text.split(/[。！？!?]/).filter(Boolean)[0] + '。';
  }
  if (!CANTONESE.test(text)) text = `今日${text}`;
  return { ...draft, text, rewrite_count: 1 };
}
