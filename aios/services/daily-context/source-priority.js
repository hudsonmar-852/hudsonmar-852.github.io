export const SOURCE_PRIORITY = Object.freeze({
  executive_dashboard: 1,
  scheduled_daily_context: 2,
  scheduled_weather: 2,
  scheduled_news: 2,
  knowledge_base_daily: 3,
  daily_intelligence: 4,
  jeffrey_project_context: 5,
  evergreen: 6
});

export function sourcePriority(sourceKind) {
  return SOURCE_PRIORITY[sourceKind] ?? 6;
}

function stableValue(value) {
  if (Array.isArray(value)) return JSON.stringify([...value].sort());
  if (value && typeof value === 'object') {
    return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));
  }
  return JSON.stringify(value ?? null);
}

export function selectHighestPriority(records, valueSelector = (record) => record.data) {
  if (!records.length) return { selected: null, conflicts: [], ignored: [] };
  const sorted = [...records].sort((a, b) => (
    a.priority - b.priority
    || b.confidence_score - a.confidence_score
    || b.freshness_score - a.freshness_score
    || a.record_id.localeCompare(b.record_id)
  ));
  const priority = sorted[0].priority;
  const top = sorted.filter((record) => record.priority === priority);
  const values = new Map();
  for (const record of top) {
    const key = stableValue(valueSelector(record));
    if (!values.has(key)) values.set(key, []);
    values.get(key).push(record);
  }
  if (values.size > 1) {
    return {
      selected: null,
      conflicts: top.map((record) => ({
        record_id: record.record_id,
        priority,
        reason: 'conflicting_values_at_same_priority'
      })),
      ignored: sorted.filter((record) => record.priority !== priority)
    };
  }
  return {
    selected: top[0],
    conflicts: [],
    ignored: sorted.filter((record) => record.record_id !== top[0].record_id)
  };
}
