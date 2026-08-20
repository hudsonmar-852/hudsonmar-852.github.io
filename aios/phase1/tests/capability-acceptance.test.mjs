import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const evidence = new URL('../evidence/baseline/', import.meta.url);
const read = (name) => JSON.parse(fs.readFileSync(new URL(name, evidence)));

test('CAT-001 RP001 capability produces governed output and promotion evidence', () => {
  const runtime = read('RP001-RUNTIME-RECORD.json');
  const qa = read('RP001-QA-RECORD.json');
  const promotion = read('RP001-KNOWLEDGE-PROMOTION.json');
  assert.equal(runtime.terminal_state, 'COMPLETED');
  assert.equal(qa.status, 'PASS');
  assert.equal(promotion.decision, 'AMEND');
  assert.equal(runtime.stages.at(-1).name, 'knowledge_promotion');
});

test('CAT-002 publication capability cannot cross the external human gate', () => {
  const runtime = read('RP001-RUNTIME-RECORD.json');
  const publish = runtime.stages.find(({ name }) => name === 'simulated_publish');
  assert.ok(publish); assert.equal(runtime.trigger.startsWith('AT001_'), true);
  assert.match(fs.readFileSync(new URL('RP001-ARTIFACT.md', evidence), 'utf8'), /External publication: prohibited without human approval/);
});
