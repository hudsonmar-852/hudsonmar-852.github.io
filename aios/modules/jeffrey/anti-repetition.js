const ACTION_PATTERNS = [
  /飲(?:返)?(?:兩啖|啖|少少)水/,
  /慢慢行/,
  /預多少少時間/,
  /望一望/,
  /留意/,
  /郁(?:一郁|下)/,
  /抖(?:一抖|下)/,
  /放鬆/,
  /早少少/,
  /停一停/
];

export function normaliseMessage(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:'"“”‘’（）()\s💪😊😄👍🙏😂😏🥵☔]/gu, '');
}

function bigrams(value) {
  const normalized = normaliseMessage(value);
  if (normalized.length < 2) return new Set(normalized ? [normalized] : []);
  const result = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) {
    result.add(normalized.slice(index, index + 2));
  }
  return result;
}

export function semanticSimilarity(left, right) {
  const a = bigrams(left);
  const b = bigrams(right);
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return (2 * overlap) / (a.size + b.size);
}

export function openingPattern(value) {
  const text = String(value || '').split(/[，。！？!?]/, 1)[0];
  return normaliseMessage(text).slice(0, 10);
}

export function actionPhrases(value) {
  return ACTION_PATTERNS.filter((pattern) => pattern.test(value)).map((pattern) => pattern.source);
}

export function duplicateCheck(candidate, history, { nowDate } = {}) {
  const normalized = normaliseMessage(candidate);
  const opening = openingPattern(candidate);
  let maxSimilarity = 0;
  let closest = null;
  for (const item of history) {
    const text = item.text || item.content || item.draft || '';
    if (candidate === text) {
      return { decision: 'block', reason: 'exact_match', similarity: 1, match: text };
    }
    if (normalized && normalized === normaliseMessage(text)) {
      return { decision: 'block', reason: 'normalised_match', similarity: 1, match: text };
    }
    const similarity = semanticSimilarity(candidate, text);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      closest = text;
    }
  }
  if (maxSimilarity >= 0.88) {
    return { decision: 'block', reason: 'semantic_similarity', similarity: maxSimilarity, match: closest };
  }
  if (maxSimilarity >= 0.8) {
    return { decision: 'rewrite', reason: 'semantic_similarity', similarity: maxSimilarity, match: closest };
  }
  const recentOpeningCount = history.filter((item) => {
    if (nowDate && item.date) {
      const age = (Date.parse(`${nowDate}T00:00:00+08:00`) - Date.parse(`${item.date}T00:00:00+08:00`)) / 86400000;
      if (age < 0 || age > 7) return false;
    }
    return opening && openingPattern(item.text || item.content || item.draft) === opening;
  }).length;
  if (recentOpeningCount >= 3) {
    return {
      decision: 'rewrite',
      reason: 'opening_repeated_3_times_in_7_days',
      similarity: maxSimilarity,
      match: closest
    };
  }
  return {
    decision: 'pass',
    reason: null,
    similarity: maxSimilarity,
    match: closest,
    action_phrases: actionPhrases(candidate)
  };
}
