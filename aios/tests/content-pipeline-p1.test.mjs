import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceCoverage, runContentPipeline } from '../content-pipeline/engine.mjs';
import { validatePipelineInput, validatePipelineOutput, validateStructuredSource } from '../content-pipeline/contracts.mjs';
import { ContentProviderRegistry, validateProviderManifest } from '../content-pipeline/provider-registry.mjs';

const manifest = { schemaVersion: '1.0.0', id: 'local-research', version: '1.0.0', stages: ['focusedResearch', 'deepResearch'], priority: 10, credentialsRequired: false };

test('checked-in schemas are versioned and machine-readable', () => {
  for (const name of ['input', 'source', 'output']) {
    const schema = JSON.parse(fs.readFileSync(new URL(`../content-pipeline/schemas/${name}.schema.json`, import.meta.url), 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.match(schema.$id, /1\.1\.0$/);
  }
});

test('executable contracts reject unsafe shapes and accept P1 output', async () => {
  assert.match(validatePipelineInput({})[0], /topic/);
  assert.match(validateStructuredSource({ title: 'x', url: 'https://example.com', sourceType: 'invented' })[0], /unsupported/);
  await assert.rejects(runContentPipeline({ topic: '', stream: 'standard' }), /pipeline input/);
  const output = await runContentPipeline({ topic: 'Contract test', stream: 'standard' }, { runId: 'run-contract' });
  assert.deepEqual(validatePipelineOutput(output), []);
  assert.equal(output.schemaVersion, '1.1.0');
});

test('provider registry validates manifests and routes highest priority capability', async () => {
  assert.deepEqual(validateProviderManifest(manifest), []);
  assert.match(validateProviderManifest({ ...manifest, credentialsRequired: true })[0], /credentialsRequired false/);
  const registry = new ContentProviderRegistry({ clock: () => '2026-08-20T00:00:00.000Z' });
  registry.register({ ...manifest, id: 'low-priority', priority: 1 }, { execute: async () => ({ provider: 'low' }) });
  registry.register(manifest, { execute: async ({ stage }) => ({ provider: 'selected', stage }) });
  const output = await runContentPipeline({ topic: 'Provider routing', stream: 'standard' }, { providerRegistry: registry, runId: 'run-provider' });
  assert.equal(output.outputs.focusedResearch.provider, 'selected');
  assert.equal(output.runtimeEvidence.stages.find((x) => x.stage === 'focusedResearch').providerId, 'local-research');
});

test('manual provider routing overrides priority without changing workflow definitions', async () => {
  const registry = new ContentProviderRegistry();
  registry.register(manifest, { execute: async () => ({ provider: 'default' }) });
  registry.register({ ...manifest, id: 'manual-research', priority: 1 }, { execute: async () => ({ provider: 'manual' }) });
  const output = await runContentPipeline({ topic: 'Manual route', stream: 'standard' }, { providerRegistry: registry, providerRouting: { focusedResearch: 'manual-research' } });
  assert.equal(output.outputs.focusedResearch.provider, 'manual');
});

test('provider failure attaches bounded runtime evidence and stops publication', async () => {
  const registry = new ContentProviderRegistry({ clock: () => '2026-08-20T00:00:00.000Z' });
  registry.register(manifest, { execute: async () => { throw new Error('private detail'); } });
  await assert.rejects(async () => {
    try { await runContentPipeline({ topic: 'Failure', stream: 'standard' }, { providerRegistry: registry, runId: 'run-fail' }); }
    catch (error) { assert.equal(error.code, 'PROVIDER_EXECUTION_FAILED'); assert.equal(error.runtimeEvidence.terminalState, 'FAILED'); assert.equal(error.runtimeEvidence.stages.at(-1).status, 'FAIL'); throw error; }
  }, /provider local-research failed/);
});

test('freshness and claim coverage fail stale or unsupported evidence', () => {
  const result = evaluateSourceCoverage({
    claims: ['fresh', 'stale', 'missing'],
    now: '2026-08-20T00:00:00.000Z',
    sources: [
      { id: 'fresh-source', sourceType: 'official', updatedAt: '2026-08-01T00:00:00.000Z', claimIds: ['fresh'], supports: true },
      { id: 'stale-source', sourceType: 'journalism', updatedAt: '2025-01-01T00:00:00.000Z', claimIds: ['stale'], supports: true }
    ]
  });
  assert.equal(result.coverage, 1 / 3);
  assert.equal(result.passed, false);
  assert.deepEqual(result.unsupportedClaimIds, ['stale', 'missing']);
  assert.equal(result.freshness.find((x) => x.sourceId === 'stale-source').fresh, false);
});

test('pipeline reports claim coverage without blocking backward-compatible no-claim runs', async () => {
  const output = await runContentPipeline({ topic: 'Coverage', stream: 'standard', claims: ['c1'], rawSources: [{ title: 'Official', url: 'https://example.gov/x', sourceType: 'official', updatedAt: '2026-08-01T00:00:00.000Z', claimIds: ['c1'] }] }, { clock: () => '2026-08-20T00:00:00.000Z' });
  assert.equal(output.sourceCoverage.coverage, 1);
  assert.equal(output.sourceCoverage.passed, true);
  const empty = await runContentPipeline({ topic: 'No claims', stream: 'standard' });
  assert.equal(empty.sourceCoverage.coverage, 1);
});
