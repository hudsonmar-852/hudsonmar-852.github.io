import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonFiles = [
  'config/security-storage-policy.json',
  'data/production-manifest.json',
  'examples/production-manifest.example.json',
  'spec/branches/production-consolidation-2026-07-21.json',
  'templates/secret-inventory.example.json',
  'workflows/production-consolidation.json'
];

const forbiddenValuePatterns = [
  /sk-[A-Za-z0-9_-]{16,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /https:\/\/[^\s"']*webhook/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/
];

for (const relative of jsonFiles) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  JSON.parse(source);
  for (const pattern of forbiddenValuePatterns) {
    if (pattern.test(source)) throw new Error(`Potential secret in ${relative}`);
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/production-manifest.json'), 'utf8'));
if (manifest.secretManagement.onePassword !== 'not_used') throw new Error('1Password must not be a production dependency');
if (manifest.privateAccess.accountConfiguration !== 'pending_external_setup') throw new Error('OAuth status must not overstate completion');
if (!manifest.deferred.some((item) => item.id === 'grok-login-test' && item.status === 'deferred')) throw new Error('Grok test deferral is missing');

console.log(`Validated ${jsonFiles.length} JSON assets and production status controls.`);

