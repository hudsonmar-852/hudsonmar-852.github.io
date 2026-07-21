import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../data/production-manifest.json', import.meta.url)));
const policy = JSON.parse(fs.readFileSync(new URL('../config/security-storage-policy.json', import.meta.url)));
const workflow = JSON.parse(fs.readFileSync(new URL('../workflows/production-consolidation.json', import.meta.url)));

test('keeps public and private status explicit', () => {
  assert.equal(manifest.publicMonitor.status, 'operational');
  assert.equal(manifest.privateAccess.accountConfiguration, 'pending_external_setup');
});

test('does not require a paid password manager', () => {
  assert.equal(policy.paidPasswordManagerRequired, false);
  assert.equal(manifest.secretManagement.onePassword, 'not_used');
});

test('preserves human approval and no auto-merge', () => {
  assert.equal(workflow.currentState, 'WAITING_REVIEW');
  assert.equal(workflow.automaticMerge, false);
});

test('records Grok testing as non-blocking deferred work', () => {
  assert.deepEqual(manifest.deferred.find((item) => item.id === 'grok-login-test'), {
    id: 'grok-login-test',
    status: 'deferred',
    blocking: false
  });
});

