import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildPrompt } from '../lib/prompt-builder.mjs';
import { selectContext, proposeContextEvolution } from '../lib/context-gate.mjs';
import { discloseSkills, updateContinuity } from '../lib/continuity.mjs';
import { runEvaluationSuite } from '../lib/evaluation.mjs';
import { resolveLowRiskDuplicates } from '../lib/registry.mjs';
import { validateContextItem, validateRequirementContract } from '../lib/validation.mjs';

const profile = { supported_models: ['test-engine'] };
test('prompt pipeline separates stable/dynamic layers and rejects undefined variables', () => {
  const modules = [{ id: 'stable', version: '1.0.0', layer: 'stable', dependencies: [], content: 'Policy' }, { id: 'root', version: '1.0.0', layer: 'dynamic', dependencies: ['stable'], content: '{{value}}' }];
  const result = buildPrompt({ modules, roots: ['root'], variables: { value: 'Context' }, compatibilityProfile: profile, goldenArtifact: 'old' });
  assert.equal(result.stablePrefix, 'Policy'); assert.equal(result.dynamicContext, 'Context'); assert.equal(result.drift, true);
  assert.throws(() => buildPrompt({ modules, roots: ['root'], compatibilityProfile: profile }), /undefined prompt variable/);
});

test('prompt pipeline detects undefined/circular dependencies and duplicate instructions', () => {
  assert.throws(() => buildPrompt({ modules: [{ id: 'a', version: '1.0.0', dependencies: ['missing'], content: 'A' }], roots: ['a'], compatibilityProfile: profile }), /undefined prompt dependency/);
  assert.throws(() => buildPrompt({ modules: [{ id: 'a', version: '1.0.0', dependencies: ['b'], content: 'A' }, { id: 'b', version: '1.0.0', dependencies: ['a'], content: 'B' }], roots: ['a'], compatibilityProfile: profile }), /circular prompt dependency/);
  assert.throws(() => buildPrompt({ modules: [{ id: 'a', version: '1.0.0', dependencies: [], content: 'Same' }, { id: 'b', version: '1.0.0', dependencies: ['a'], content: ' same ' }], roots: ['b'], compatibilityProfile: profile }), /duplicate prompt instructions/);
});

test('context selection records inclusion/exclusion and firewall denies external authorization', () => {
  const base = { source: 'test', user_controlled: false, transformed_by: [], allowed_for_reasoning: true, allowed_for_tool_action: false, tags: ['phase1'], topic: 'policy', expires_at: '2027-01-01T00:00:00Z' };
  const result = selectContext({ items: [{ ...base, id: 'canon', trust_level: 'authoritative', externally_supplied: false, verified: true, value: 'A' }, { ...base, id: 'external', trust_level: 'low', externally_supplied: true, verified: false, allowed_for_tool_action: true, value: 'B' }], taskTags: ['phase1'], now: '2026-08-14T00:00:00Z' });
  assert.deepEqual(result.selected.map(({ id }) => id), ['canon']); assert.match(result.decisions.find(({ id }) => id === 'external').exclusion_reason, /provenance_firewall/);
  assert.ok(validateContextItem(result.decisions.find(({ id }) => id === 'external')).length > 0);
});

test('context evolution preserves history and reasoning continuity resets only on policy triggers', () => {
  assert.equal(proposeContextEvolution({ canonVersion: '1.0.0', evidence: 'E1', action: 'amend', rationale: 'new fact' }).history_preserved, true);
  assert.equal(updateContinuity({ stable_goal: 'A' }, { stable_goal: 'A', stable_assumptions: [], current_evidence: [] }).reset, false);
  assert.deepEqual(updateContinuity({ stable_goal: 'A' }, { stable_goal: 'B', stable_assumptions: [], current_evidence: [] }).reset_triggers, ['goal_changed']);
});

test('progressive disclosure loads only task-relevant skills and knowledge', () => {
  const result = discloseSkills({ stableCore: ['safety'], task: { type: 'evaluation', tags: ['prompt'], requires_context: true }, skillCatalog: [{ id: 'eval', task_types: ['evaluation'] }, { id: 'deploy', task_types: ['deployment'] }], knowledgeCatalog: [{ id: 'prompt-policy', tags: ['prompt'] }, { id: 'billing', tags: ['finance'] }] });
  assert.deepEqual(result.required_skills, ['eval']); assert.deepEqual(result.required_knowledge, ['prompt-policy']);
});

test('MVES enforces categories and one-variable causal comparisons', () => {
  const categories = ['golden', 'normal', 'edge', 'failure', 'regression'];
  const cases = categories.map((category) => ({ id: category, intent: category, category, input: { value: 'x' }, expected: 'X' }));
  const metadata = { causal_comparison: true };
  assert.throws(() => runEvaluationSuite({ cases, execute: () => ({ output: 'X' }), metadata, baseline: { result: 'PASS', outcome_quality: { score: 100 } }, changedVariables: ['prompt', 'model'] }), /exactly one/);
  assert.equal(runEvaluationSuite({ cases, execute: () => ({ output: 'X' }), metadata, baseline: { result: 'PASS', outcome_quality: { score: 100 } }, changedVariables: ['prompt'] }).result, 'PASS');
});

test('requirement contract is structurally machine-testable', () => {
  const contract = JSON.parse(fs.readFileSync(new URL('../config/requirement-contract.json', import.meta.url)));
  assert.deepEqual(validateRequirementContract(contract), []);
});

test('registry duplicate resolution retains history and selects newest approved version', () => {
  const base = { id: 'A', type: 'test', name: 'A', canonical_location: 'a', owner: 'AIOS', last_verified: '2026-01-01T00:00:00Z', dependencies: [], status: 'Production' };
  const resolved = resolveLowRiskDuplicates([{ ...base, version: '1.0.0' }, { ...base, version: '1.1.0', canonical_location: 'b' }]);
  assert.equal(resolved.find(({ version }) => version === '1.1.0').canonical, true); assert.equal(resolved.find(({ version }) => version === '1.0.0').archive_candidate, true);
});
