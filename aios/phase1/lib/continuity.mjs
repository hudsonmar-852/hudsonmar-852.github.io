export function updateContinuity(previous, next) {
  const triggers = [];
  if (previous.stable_goal !== next.stable_goal) triggers.push('goal_changed');
  if (next.major_new_evidence) triggers.push('major_new_evidence');
  if (next.assumptions_invalidated) triggers.push('assumptions_invalidated');
  if (next.material_context_conflict) triggers.push('material_context_conflict');
  if (next.previous_execution_wrong) triggers.push('previous_execution_wrong');
  return { stable_goal: next.stable_goal, stable_assumptions: next.stable_assumptions, current_evidence: next.current_evidence, reset_triggers: triggers, reset: triggers.length > 0 };
}

export function discloseSkills({ stableCore, task, skillCatalog, knowledgeCatalog }) {
  const skills = skillCatalog.filter(({ task_types }) => task_types.includes(task.type));
  const knowledge = knowledgeCatalog.filter(({ tags }) => tags.some((tag) => task.tags.includes(tag)));
  return { stable_core: stableCore, task_classification: task.type, required_skills: skills.map(({ id }) => id), required_knowledge: knowledge.map(({ id }) => id), dynamic_context_required: task.requires_context === true };
}
