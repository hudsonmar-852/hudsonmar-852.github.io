import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findPotentialSecret,
  isScannableFilename
} from '../scripts/secret-scan.mjs';

const join = (...parts) => parts.join('');

test('detects supported credential formats without storing literal credential fixtures', () => {
  const cases = [
    ['GitHub fine-grained token', join('github', '_pat_', 'A'.repeat(24))],
    ['AWS access key', join('AK', 'IA', 'A'.repeat(16))],
    ['Google API key', join('AI', 'za', 'A'.repeat(35))],
    ['Bearer token', join('Bear', 'er ', 'A'.repeat(32))],
    ['JWT', join('eyJ', 'A'.repeat(12), '.', 'B'.repeat(12), '.', 'C'.repeat(12))],
    ['Google service-account credential', join(
      '{"type":"service_', 'account","project_id":"example","private_', 'key":"', 'A'.repeat(40), '"}'
    )],
    ['assigned secret', join('client_', 'secret = "', 'A'.repeat(24), '"')],
    ['private key', join('-----BEGIN ENCRYPTED ', 'PRIVATE KEY-----')]
  ];

  for (const [expected, source] of cases) {
    assert.equal(findPotentialSecret(source), expected);
  }
});

test('does not flag placeholders and empty environment templates', () => {
  const safeSources = [
    'OPENAI_CONTENT_PROD=',
    'client_secret = "replace-me"',
    'Authorization: Bearer <token>',
    join('{"type":"service_', 'account","private_', 'key":""}'),
    'This document discusses API keys without containing one.'
  ];

  for (const source of safeSources) assert.equal(findPotentialSecret(source), null);
});

test('includes sensitive key files and existing public source types', () => {
  for (const filename of ['identity.pem', 'signing.KEY', '.env.production', 'app.mjs', 'policy.yaml']) {
    assert.equal(isScannableFilename(filename), true);
  }
  assert.equal(isScannableFilename('dashboard.png'), false);
});
