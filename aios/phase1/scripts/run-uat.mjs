import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, validateRuntimeRecord, writeJson } from '../lib/validation.mjs';
import { validateRegistry } from '../lib/registry.mjs';

const phaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(phaseRoot, '..', '..');
const evidenceDir = path.join(phaseRoot, 'evidence', 'baseline');
const exists = (name) => fs.existsSync(path.join(evidenceDir, name));
const runtime = readJson(path.join(evidenceDir, 'RP001-RUNTIME-RECORD.json'));
const evaluation = readJson(path.join(evidenceDir, 'RP001-EVALUATION.json'));
const automation = readJson(path.join(evidenceDir, 'AT001-AUTOMATION-LOG.json'));
const handoff = exists('AI-HANDOFF-TEST.json') ? readJson(path.join(evidenceDir, 'AI-HANDOFF-TEST.json')) : null;
const registry = readJson(path.join(phaseRoot, 'AIOS_REGISTRY.json'));
const registryResult = validateRegistry(registry, repoRoot);
const tests = [
  ['UAT-001', 'RP001 completes all ten governed stages', runtime.terminal_state === 'COMPLETED' && runtime.stages.length === 10, 'EXECUTABLE_PASS', 'RP001-RUNTIME-RECORD.json'],
  ['UAT-002', 'AT001 triggers RP001 without hidden business logic', automation.status === 'SIMULATED_PASS' && automation.hidden_business_logic === false, 'SIMULATED_PASS', 'AT001-AUTOMATION-LOG.json'],
  ['UAT-003', 'Runtime Record is schema-valid', validateRuntimeRecord(runtime).length === 0, 'EXECUTABLE_PASS', 'RP001-RUNTIME-RECORD.json'],
  ['UAT-004', 'Concrete artifact and QA record exist', exists('RP001-ARTIFACT.md') && exists('RP001-QA-RECORD.json'), 'EXECUTABLE_PASS', 'RP001-ARTIFACT.md'],
  ['UAT-005', 'Knowledge promotion decision is recorded', exists('RP001-KNOWLEDGE-PROMOTION.json'), 'EXECUTABLE_PASS', 'RP001-KNOWLEDGE-PROMOTION.json'],
  ['UAT-006', 'MVES covers and passes five required categories', evaluation.result === 'PASS' && new Set(evaluation.cases.map(({ category }) => category)).size === 5, 'EXECUTABLE_PASS', 'RP001-EVALUATION.json'],
  ['UAT-007', 'Canonical package supports chat-independent handoff', handoff?.result === 'PASS' && handoff?.independent_auditor === true, 'EXECUTABLE_PASS', 'AI-HANDOFF-TEST.json'],
  ['UAT-008', 'IDs, locations, statuses and canonical conflicts are traceable', registryResult.valid, 'EXECUTABLE_PASS', '../../AIOS_REGISTRY.json'],
  ['UAT-009', 'Known issues and rollback operations are documented', fs.existsSync(path.join(phaseRoot, 'AIOS_KNOWN_ISSUES.md')) && fs.existsSync(path.join(phaseRoot, 'docs', 'OPERATIONS.md')), 'EXECUTABLE_PASS', '../../AIOS_KNOWN_ISSUES.md'],
  ['UAT-010', 'Simulated deployment passes smoke checks without external publication', runtime.stages.some(({ name }) => name === 'simulated_publish') && runtime.artifacts.every(({ location }) => exists(location)), 'SIMULATED_PASS', 'RP001-RUNTIME-RECORD.json']
];
const items = tests.map(([id, description, passed, passStatus, location]) => ({ id, status: passed ? passStatus : 'FAIL', test_method: description, evidence_location: `aios/phase1/evidence/baseline/${location}`, expected_result: 'criterion satisfied', actual_result: passed ? 'criterion satisfied' : 'criterion not satisfied', blocker: passed ? null : 'local executable criterion failed' }));
const report = { id: 'UAT-PHASE1-001', type: 'uat_report', name: 'AIOS Phase 1 UAT Evidence', version: '1.0.0', status: items.every(({ status }) => status.endsWith('PASS')) ? 'UAT' : 'Blocked', canonical_location: 'aios/phase1/AIOS_PHASE1_UAT_EVIDENCE.json', owner: 'AIOS QA', last_verified: '2026-08-14T13:00:03.000Z', dependencies: ['RP001', 'AT001', 'EVAL-RP001-001'], overall_result: items.every(({ status }) => status.endsWith('PASS')) ? 'PASS' : 'FAIL', items };
writeJson(path.join(phaseRoot, 'AIOS_PHASE1_UAT_EVIDENCE.json'), report);
for (const item of items) console.log(`${item.id}: ${item.status}`);
if (report.overall_result !== 'PASS') process.exitCode = 1;
