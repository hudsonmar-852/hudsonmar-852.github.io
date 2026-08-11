import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { MissionManager } from '../core/mission-manager.mjs';
import { DecisionEngine } from '../core/decision-engine.mjs';
import { ProductionOrchestrator, PRODUCTION_STAGES } from '../core/production-orchestrator.mjs';
import { PluginRegistry, validatePluginManifest } from '../core/plugin-sdk.mjs';
import { buildVisualQaReport } from '../core/visual-qa.mjs';

test('mission lifecycle stores history, audit, workspace and outputs', () => {
  const manager = new MissionManager({ clock: () => '2026-08-06T00:00:00.000Z' });
  manager.create({ id: 'mission-one', objective: 'Build package', workflow: PRODUCTION_STAGES });
  manager.transition('mission-one', 'VALIDATED'); manager.transition('mission-one', 'RUNNING');
  manager.checkpoint('mission-one', { source: 'approved brief' }); manager.advance('mission-one', { research: true });
  const mission = manager.get('mission-one');
  assert.equal(mission.currentStage, 1); assert.equal(mission.workspace.source, 'approved brief'); assert.ok(mission.history.length >= 2); assert.ok(mission.audit.length >= 5);
});

test('decision engine is deterministic, detects conflict, and requires review', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../config/decision-policies.json', import.meta.url)));
  config.rules.push({ id: 'test-conflict', when: { environment: 'production' }, effect: 'ALLOW', priority: 1 });
  const engine = new DecisionEngine(config); const result = engine.decide({ environment: 'production', containsSecret: false });
  assert.equal(result.ruleId, 'require-production-review'); assert.equal(result.decision, 'REQUIRE_APPROVAL'); assert.equal(result.requiresHumanApproval, true); assert.equal(result.conflicts.length, 2);
});

test('orchestrator pauses at mandatory human review and completes after approval', async () => {
  const manager = new MissionManager(); manager.create({ id: 'production-one', objective: 'Production package', workflow: PRODUCTION_STAGES });
  const orchestrator = new ProductionOrchestrator({ missionManager: manager });
  const paused = await orchestrator.run('production-one'); assert.equal(paused.status, 'WAITING_APPROVAL'); assert.equal(paused.mission.currentStage, 7);
  orchestrator.approve('production-one', { approved: true, reviewer: 'release-manager' });
  const completed = await orchestrator.run('production-one'); assert.equal(completed.status, 'COMPLETED'); assert.equal(completed.mission.outputs.length, 9);
});

test('plugin registry validates permissions and exposes lifecycle health', async () => {
  assert.equal(validatePluginManifest({ schemaVersion: '1.0.0', id: 'bad-plugin', version: '1.0.0', permissions: ['root'] }).valid, false);
  const registry = new PluginRegistry(); const health = await registry.register({ schemaVersion: '1.0.0', id: 'template-plugin', version: '1.0.0', permissions: ['events:publish'] }, { health: () => ({ healthy: true }) });
  assert.equal(health.healthy, true); await registry.stop('template-plugin'); assert.equal((await registry.health('template-plugin')).healthy, false);
});

test('visual QA has all contracts and cannot auto-approve', () => {
  const checks = Object.fromEntries(['identity', 'face', 'hands', 'lighting', 'composition', 'promptCompliance'].map((key) => [key, { score: 90 }]));
  const report = buildVisualQaReport({ jobId: 'image-one', checks });
  assert.equal(report.automatedRecommendation, 'REVIEW'); assert.deepEqual(report.humanApproval, { required: true, status: 'PENDING', reviewer: null });
});
