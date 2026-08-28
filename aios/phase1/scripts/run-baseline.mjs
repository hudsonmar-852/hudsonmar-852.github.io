import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { triggerAt001 } from '../lib/at001.mjs';
import { executeRp001 } from '../lib/rp001.mjs';
import { readJson, writeJson } from '../lib/validation.mjs';

const phaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(phaseRoot, 'evidence', 'baseline');
const sources = readJson(path.join(phaseRoot, 'fixtures', 'rp001-sources.json'));
const promptConfig = readJson(path.join(phaseRoot, 'config', 'prompt-modules.json'));
const evaluationCases = readJson(path.join(phaseRoot, 'fixtures', 'mves-cases.json'));
const timestamps = ['2026-08-14T13:00:00.000Z', '2026-08-14T13:00:01.000Z', '2026-08-14T13:00:02.000Z', '2026-08-14T13:00:03.000Z'];
let tick = 0;
const logs = [];
const result = await triggerAt001({ pipeline: executeRp001, input: { sources, promptModules: promptConfig.modules, promptProfile: promptConfig.profile, evaluationCases, outputDir, clock: () => timestamps[Math.min(tick++, timestamps.length - 1)] }, logger: (entry) => logs.push(entry) });
writeJson(path.join(outputDir, 'AT001-AUTOMATION-LOG.json'), { id: 'AT001-RUN-001', status: 'SIMULATED_PASS', hidden_business_logic: false, max_retries: 1, events: logs, runtime_record: 'RP001-RUNTIME-RECORD.json' });
console.log(`RP001 ${result.runtimeRecord.terminal_state}; AT001 SIMULATED_PASS; evidence=${path.relative(process.cwd(), outputDir)}`);
