import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { compilePromptPack } from '../scripts/build-image-prompt.mjs';

const character = JSON.parse(fs.readFileSync(new URL('../examples/generic-premium-avatar.character.json', import.meta.url)));
const imageJob = JSON.parse(fs.readFileSync(new URL('../examples/instagram-reel.image-job.json', import.meta.url)));
const referencePack = JSON.parse(fs.readFileSync(new URL('../examples/premium-avatar.prompt-pack.json', import.meta.url)));

test('builds a deterministic provider-ready prompt pack', () => {
  const first = compilePromptPack(character, imageJob);
  const second = compilePromptPack(character, imageJob);

  assert.deepEqual(first, second);
  assert.deepEqual(first, referencePack);
  assert.equal(first.provider, 'Grok Imagine');
  assert.equal(first.output.aspectRatio, '9:16');
  assert.match(first.prompt, /Identity lock:/);
  assert.match(first.prompt, /natural 50mm perspective/);
  assert.match(first.negativePrompt, /identity drift/);
  assert.deepEqual(first.approval, {
    status: 'pending_human_review',
    required: true
  });
});

test('refuses a character that is not approved for generation', () => {
  const unapproved = structuredClone(character);
  unapproved.approval.approvedForGeneration = false;

  assert.throws(
    () => compilePromptPack(unapproved, imageJob),
    /not approved for generation/
  );
});

test('refuses a non-public image job', () => {
  const privateJob = structuredClone(imageJob);
  privateJob.approval.publicSafe = false;

  assert.throws(
    () => compilePromptPack(character, privateJob),
    /not approved for public-safe processing/
  );
});
