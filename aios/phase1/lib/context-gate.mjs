import { validateContextItem } from './validation.mjs';

const TRUST = Object.freeze({ low: 1, medium: 2, high: 3, authoritative: 4 });

export function selectContext({ items, taskTags, now, maxItems = 5 }) {
  const evaluated = items.map((item) => {
    const errors = validateContextItem(item);
    const relevant = (item.tags || []).some((tag) => taskTags.includes(tag));
    const fresh = !item.expires_at || Date.parse(item.expires_at) >= Date.parse(now);
    const authority = TRUST[item.trust_level] || 0;
    const conflicts = items.filter((candidate) => candidate.id !== item.id && candidate.topic === item.topic && candidate.value !== item.value && (TRUST[candidate.trust_level] || 0) >= authority);
    let exclusion_reason = null;
    if (errors.length) exclusion_reason = `provenance_firewall: ${errors.join('; ')}`;
    else if (!relevant) exclusion_reason = 'not_relevant';
    else if (!fresh) exclusion_reason = 'stale';
    else if (conflicts.length) exclusion_reason = `authority_conflict:${conflicts.map(({ id }) => id).join(',')}`;
    return { ...item, authority_score: authority, selected: !exclusion_reason, inclusion_reason: exclusion_reason ? null : 'relevant_fresh_highest_authority_within_budget', exclusion_reason };
  });
  const eligible = evaluated.filter(({ selected }) => selected).sort((a, b) => b.authority_score - a.authority_score);
  for (const item of eligible.slice(maxItems)) { item.selected = false; item.inclusion_reason = null; item.exclusion_reason = 'budget_exceeded'; }
  return { selected: eligible.slice(0, maxItems), decisions: evaluated };
}

export function proposeContextEvolution({ canonVersion, evidence, action, rationale }) {
  if (!['add', 'amend', 'deprecate'].includes(action)) throw new Error('context evolution action must be add, amend or deprecate');
  return { canon_version: canonVersion, new_evidence: evidence, diff: { action, rationale }, proposal_status: 'Candidate', validation_required: true, history_preserved: true };
}
