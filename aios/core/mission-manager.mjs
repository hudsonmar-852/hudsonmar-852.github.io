import crypto from 'node:crypto';

export const MISSION_STATES = Object.freeze(['DRAFT', 'VALIDATED', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED']);
const TRANSITIONS = Object.freeze({
  DRAFT: ['VALIDATED', 'CANCELLED'], VALIDATED: ['RUNNING', 'CANCELLED'],
  RUNNING: ['WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED'],
  WAITING_APPROVAL: ['RUNNING', 'COMPLETED', 'CANCELLED'], COMPLETED: [], FAILED: ['RUNNING', 'CANCELLED'], CANCELLED: []
});

export function validateMission(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) errors.push('mission must be an object');
  if (!input?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.id)) errors.push('id must be kebab-case');
  if (!input?.objective?.trim()) errors.push('objective is required');
  if (!Array.isArray(input?.workflow) || input.workflow.length === 0) errors.push('workflow requires at least one stage');
  return { valid: errors.length === 0, errors };
}

export class MissionManager {
  constructor({ clock = () => new Date().toISOString() } = {}) { this.clock = clock; this.missions = new Map(); }
  create(input) {
    const check = validateMission(input); if (!check.valid) throw new Error(check.errors.join('; '));
    if (this.missions.has(input.id)) throw new Error('mission already exists');
    const now = this.clock();
    const mission = { schemaVersion: '1.0.0', ...structuredClone(input), state: 'DRAFT', currentStage: 0, workspace: {}, history: [], audit: [], outputs: [], createdAt: now, updatedAt: now };
    this.#audit(mission, 'mission.created', { objective: mission.objective }); this.missions.set(mission.id, mission); return structuredClone(mission);
  }
  get(id) { const mission = this.missions.get(id); if (!mission) throw new Error('mission not found'); return structuredClone(mission); }
  transition(id, nextState, actor = 'system', reason = '') {
    const mission = this.#live(id); if (!MISSION_STATES.includes(nextState)) throw new Error('invalid mission state');
    if (!TRANSITIONS[mission.state].includes(nextState)) throw new Error(`invalid transition ${mission.state} -> ${nextState}`);
    mission.history.push({ from: mission.state, to: nextState, actor, reason, at: this.clock() }); mission.state = nextState; mission.updatedAt = this.clock();
    this.#audit(mission, 'mission.transitioned', { nextState, actor, reason }); return this.get(id);
  }
  checkpoint(id, patch, actor = 'system') { const mission = this.#live(id); Object.assign(mission.workspace, structuredClone(patch)); mission.updatedAt = this.clock(); this.#audit(mission, 'mission.checkpointed', { actor, keys: Object.keys(patch) }); return this.get(id); }
  resume(id) { const mission = this.get(id); if (!['RUNNING', 'WAITING_APPROVAL', 'FAILED'].includes(mission.state)) throw new Error('mission is not resumable'); return { mission, stage: mission.workflow[mission.currentStage], workspace: mission.workspace }; }
  advance(id, output, actor = 'system') { const mission = this.#live(id); if (mission.state !== 'RUNNING') throw new Error('mission must be running'); mission.outputs.push({ stage: mission.workflow[mission.currentStage], value: structuredClone(output), at: this.clock() }); mission.currentStage += 1; mission.updatedAt = this.clock(); this.#audit(mission, 'mission.stage.completed', { actor, stageIndex: mission.currentStage - 1 }); return this.get(id); }
  #live(id) { const mission = this.missions.get(id); if (!mission) throw new Error('mission not found'); return mission; }
  #audit(mission, type, details) { mission.audit.push({ id: crypto.randomUUID(), type, missionId: mission.id, at: this.clock(), details }); }
}
