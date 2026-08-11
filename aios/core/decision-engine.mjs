export class DecisionEngine {
  constructor(config = {}) { this.config = { approvalThreshold: 80, priorities: {}, rules: [], ...config }; this.audit = []; }
  decide(context) {
    const matches = this.config.rules.filter((rule) => ruleMatches(rule.when || {}, context)).map((rule) => ({ ...rule, priority: rule.priority ?? this.config.priorities[rule.id] ?? 0 }));
    const conflicts = detectConflicts(matches); const ranked = [...matches].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)); const winner = ranked[0] || null;
    const requiresHumanApproval = Boolean(winner?.requiresHumanApproval || conflicts.length || Number(context.riskScore || 0) >= this.config.approvalThreshold);
    const result = { decision: winner?.effect ?? 'NO_MATCH', ruleId: winner?.id ?? null, conflicts, requiresHumanApproval, matchedRules: ranked.map(({ id }) => id) };
    this.audit.push({ at: new Date().toISOString(), context: structuredClone(context), result: structuredClone(result) }); return result;
  }
}

function ruleMatches(expected, actual) { return Object.entries(expected).every(([key, value]) => Array.isArray(value) ? value.includes(actual[key]) : actual[key] === value); }
export function detectConflicts(rules) { const effects = new Set(rules.map((rule) => JSON.stringify(rule.effect))); return effects.size > 1 ? rules.map(({ id, effect, priority }) => ({ id, effect, priority })) : []; }
