import { readFile } from 'node:fs/promises';

const path = new URL('../data/agent-operating-context.json', import.meta.url);
const data = JSON.parse(await readFile(path, 'utf8'));
const errors = [];

const requireFields = (obj, fields, scope) => {
  for (const field of fields) {
    if (!(field in obj)) errors.push(`${scope}: missing ${field}`);
  }
};

requireFields(data, [
  'version',
  'policyDecision',
  'instructionCanary',
  'acceptanceCoverage',
  'sessionEnvelope',
  'repositoryOrientation',
  'clientPolicies',
  'continuityCheck'
], 'root');

if (data.policyDecision !== 'AIOS-GOV-019') {
  errors.push('policyDecision must be AIOS-GOV-019');
}

if (!Array.isArray(data.clientPolicies) || data.clientPolicies.length === 0) {
  errors.push('clientPolicies must contain at least one profile');
} else {
  for (const [index, policy] of data.clientPolicies.entries()) {
    requireFields(policy, ['client', 'read', 'write', 'secrets', 'deploy'], `clientPolicies[${index}]`);
  }
}

if (data.sessionEnvelope.warningThreshold >= data.sessionEnvelope.wrapUpThreshold) {
  errors.push('warningThreshold must be lower than wrapUpThreshold');
}

if (data.continuityCheck.blockOnMismatch !== true) {
  errors.push('continuityCheck.blockOnMismatch must remain true');
}

if (errors.length) {
  console.error('Agent Operating Context validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Agent Operating Context validation passed.');
