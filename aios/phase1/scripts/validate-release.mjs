import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, validateEvaluationRun, validateReleaseManifest, validateRequirementContract, validateRuntimeRecord } from '../lib/validation.mjs';
import { validateRegistry } from '../lib/registry.mjs';

const phaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(phaseRoot, '..', '..');
const manifest = readJson(path.join(phaseRoot, 'AIOS_RELEASE_MANIFEST.json'));
const registry = readJson(path.join(phaseRoot, 'AIOS_REGISTRY.json'));
const runtime = readJson(path.join(phaseRoot, 'evidence/baseline/RP001-RUNTIME-RECORD.json'));
const evaluation = readJson(path.join(phaseRoot, 'evidence/baseline/RP001-EVALUATION.json'));
const requirements = readJson(path.join(phaseRoot, 'config/requirement-contract.json'));
const uat = readJson(path.join(phaseRoot, 'AIOS_PHASE1_UAT_EVIDENCE.json'));
const runNodeTests = (files) => spawnSync(process.execPath, ['--test', ...files], { cwd: repoRoot, encoding: 'utf8' });
const controlTests = runNodeTests([
  'aios/phase1/tests/p0-controls.test.mjs',
  'aios/phase1/tests/rp001.integration.test.mjs'
]);
const catTests = runNodeTests(['aios/phase1/tests/capability-acceptance.test.mjs']);
const artifact = fs.readFileSync(path.join(phaseRoot, 'evidence/baseline/RP001-ARTIFACT.md'));
const recordedArtifact = runtime.artifacts.find(({ id }) => id === 'ARTIFACT-RP001-001');
const validCommitId = /^[0-9a-f]{40}$/.test(manifest.commit || '');
const releaseCommit = validCommitId ? spawnSync('git', ['show', `${manifest.commit}:aios/phase1/AIOS_RELEASE_MANIFEST.json`], { cwd: repoRoot, encoding: 'utf8' }) : { status: 1, stdout: '' };
let committedManifest = null;
try { committedManifest = releaseCommit.status === 0 ? JSON.parse(releaseCommit.stdout) : null; } catch { committedManifest = null; }
const checks = {
  schema_valid: [validateReleaseManifest(manifest), validateRequirementContract(requirements), validateRuntimeRecord(runtime), validateEvaluationRun(evaluation)].every((errors) => errors.length === 0),
  tests_pass: controlTests.status === 0,
  mves_pass: evaluation.result === 'PASS',
  cat_pass: catTests.status === 0,
  no_critical_regression: evaluation.cases.filter(({ category }) => category === 'regression').every(({ passed }) => passed),
  required_evidence_exists: manifest.evidence.every((location) => fs.existsSync(path.join(repoRoot, location))),
  evidence_integrity: recordedArtifact?.sha256 === crypto.createHash('sha256').update(artifact).digest('hex'),
  rollback_exists: Boolean(manifest.rollback?.procedure && fs.existsSync(path.join(repoRoot, manifest.rollback.procedure))),
  no_critical_blocker: !(manifest.known_issues || []).some(({ severity, status }) => severity === 'Critical' && status !== 'Resolved'),
  registry_valid: validateRegistry(registry, repoRoot).valid,
  uat_pass: uat.overall_result === 'PASS',
  release_provenance: committedManifest?.release_id === manifest.release_id && committedManifest?.release_status === 'Production'
};
checks.manifest_gate_consistent = Object.entries(manifest.production_gate).every(([name, declared]) => declared === checks[name]);
for (const [name, passed] of Object.entries(checks)) console.log(`${name}: ${passed ? 'PASS' : 'FAIL'}`);
if (controlTests.status !== 0) process.stderr.write(controlTests.stderr || controlTests.stdout);
if (catTests.status !== 0) process.stderr.write(catTests.stderr || catTests.stdout);
if (Object.values(checks).every(Boolean)) console.log('PRODUCTION GATE PASS'); else { console.error('PRODUCTION GATE FAIL'); process.exitCode = 1; }
