import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { triggerAt001 } from '../lib/at001.mjs';
import { executeRp001, RP001_STAGES } from '../lib/rp001.mjs';

const read = (url) => JSON.parse(fs.readFileSync(url));
test('AT001 triggers a complete deterministic RP001 simulation with concrete evidence', async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-phase1-'));
  const prompt = read(new URL('../config/prompt-modules.json', import.meta.url));
  const result = await triggerAt001({ pipeline: executeRp001, input: { sources: read(new URL('../fixtures/rp001-sources.json', import.meta.url)), promptModules: prompt.modules, promptProfile: prompt.profile, evaluationCases: read(new URL('../fixtures/mves-cases.json', import.meta.url)), outputDir, clock: () => '2026-08-14T13:00:00.000Z' } });
  assert.equal(result.runtimeRecord.terminal_state, 'COMPLETED'); assert.deepEqual(result.runtimeRecord.stages.map(({ name }) => name), RP001_STAGES);
  assert.equal(result.qa.status, 'PASS'); assert.equal(result.publication.status, 'SIMULATED_PASS'); assert.equal(result.approval.external_publication_authorized, false); assert.equal(result.evaluation.result, 'PASS');
  for (const file of ['RP001-ARTIFACT.md', 'RP001-QA-RECORD.json', 'RP001-KNOWLEDGE-PROMOTION.json', 'RP001-EVALUATION.json', 'RP001-RUNTIME-RECORD.json']) assert.equal(fs.existsSync(path.join(outputDir, file)), true);
});

test('AT001 logs and stops non-repairable failure without blind retry', async () => {
  let attempts = 0; const logs = [];
  await assert.rejects(() => triggerAt001({ pipeline: async () => { attempts += 1; const error = new Error('bad requirement'); error.failureClassification = 'requirement_error'; throw error; }, input: {}, logger: (entry) => logs.push(entry) }), /bad requirement/);
  assert.equal(attempts, 1); assert.equal(logs.at(-1).action, 'log_and_stop');
});

test('AT001 retries a classified repairable failure once and logs terminal retry failure', async () => {
  let attempts = 0; const logs = [];
  await assert.rejects(() => triggerAt001({ pipeline: async () => { attempts += 1; const error = new Error('environment unavailable'); error.failureClassification = 'environment_error'; throw error; }, input: {}, logger: (entry) => logs.push(entry) }), /environment unavailable/);
  assert.equal(attempts, 2); assert.equal(logs.at(-1).event, 'retry_failed'); assert.equal(logs.at(-1).action, 'log_and_stop');
});
