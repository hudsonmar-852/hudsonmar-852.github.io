export const PRODUCTION_STAGES = Object.freeze(['research', 'planning', 'script', 'storyboard', 'imageJob', 'promptCompiler', 'validator', 'humanReview', 'productionPackage']);

export class ProductionOrchestrator {
  constructor({ missionManager, providers = {}, clock = () => new Date().toISOString() }) { this.missions = missionManager; this.providers = providers; this.clock = clock; }
  async run(missionId) {
    let mission = this.missions.get(missionId);
    if (mission.state === 'DRAFT') mission = this.missions.transition(missionId, 'VALIDATED');
    if (['VALIDATED', 'FAILED'].includes(mission.state)) mission = this.missions.transition(missionId, 'RUNNING');
    while (mission.currentStage < PRODUCTION_STAGES.length) {
      const stage = PRODUCTION_STAGES[mission.currentStage];
      if (stage === 'humanReview') { this.missions.transition(missionId, 'WAITING_APPROVAL'); return { status: 'WAITING_APPROVAL', mission: this.missions.get(missionId) }; }
      const provider = this.providers[stage] || mockProvider;
      const output = await provider({ mission, stage, priorOutputs: mission.outputs });
      mission = this.missions.advance(missionId, output);
    }
    this.missions.transition(missionId, 'COMPLETED'); return { status: 'COMPLETED', mission: this.missions.get(missionId) };
  }
  approve(missionId, { approved, reviewer, notes = '' }) {
    if (!reviewer) throw new Error('reviewer is required'); const mission = this.missions.get(missionId);
    if (mission.state !== 'WAITING_APPROVAL') throw new Error('mission is not waiting for approval');
    if (!approved) return this.missions.checkpoint(missionId, { review: { approved, reviewer, notes, at: this.clock() } }, reviewer);
    this.missions.checkpoint(missionId, { review: { approved, reviewer, notes, at: this.clock() } }, reviewer);
    this.missions.transition(missionId, 'RUNNING', reviewer, 'human approval granted'); return this.missions.advance(missionId, { approved, reviewer, notes });
  }
}

async function mockProvider({ mission, stage, priorOutputs }) { return { provider: 'mock', stage, missionId: mission.id, inputCount: priorOutputs.length, generatedAt: new Date().toISOString() }; }
