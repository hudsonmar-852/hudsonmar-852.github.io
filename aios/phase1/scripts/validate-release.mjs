import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, validateEvaluationRun, validateFormalAsset, validateRequirementContract, validateRuntimeRecord } from '../lib/validation.mjs';
import { validateRegistry } from '../lib/registry.mjs';

const phaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(phaseRoot, '..', '..');
const manifest = readJson(path.join(phaseRoot, 'AIOS_RELEASE_MANIFEST.json'));
const registry = readJson(path.join(phaseRoot, 'AIOS_REGISTRY.json'));
const runtime = readJson(path.join(phaseRoot, 'evidence/baseline/RP001-RUNTIME-RECORD.json'));
const evaluation = readJson(path.join(phaseRoot, 'evidence/baseline/RP001-EVALUATION.json'));
const requirements = readJson(path.join(phaseRoot, 'config/requirement-contract.json'));
const uat = readJson(path.join(phaseRoot, 'AIOS_PHASE1_UAT_EVIDENCE.json'));
const checks = {
  schema_valid: [validateFormalAsset(manifest), validateRequirementContract(requirements), validateRuntimeRecord(runtime), validateEvaluationRun(evaluation)].every((errors) => errors.length === 0),
  tests_pass: manifest.production_gate.tests_pass,
  mves_pass: evaluation.result === 'PASS',
  cat_pass: manifest.production_gate.cat_pass,
  no_critical_regression: evaluation.cases.filter(({ category }) => category === 'regression').every(({ passed }) => passed),
  required_evidence_exists: manifest.evidence.every((location) => fs.existsSync(path.join(repoRoot, location))),
  rollback_exists: Boolean(manifest.rollback?.procedure && fs.existsSync(path.join(repoRoot, manifest.rollback.procedure))),
  no_critical_blocker: !(manifest.known_issues || []).some(({ severity, status }) => severity === 'Critical' && status !== 'Resolved'),
  registry_valid: validateRegistry(registry, repoRoot).valid,
  uat_pass: uat.overall_result === 'PASS'
};
for (const [name, passed] of Object.entries(checks)) console.log(`${name}: ${passed ? 'PASS' : 'FAIL'}`);
if (Object.values(checks).every(Boolean)) console.log('PRODUCTION GATE PASS'); else { console.error('PRODUCTION GATE FAIL'); process.exitCode = 1; }
