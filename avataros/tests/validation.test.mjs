import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  AvatarValidationError,
  runValidation,
  validateCharacter,
  validateImageJob
} from '../scripts/validate-avataros.mjs';

const character = JSON.parse(fs.readFileSync(new URL('../examples/generic-premium-avatar.character.json', import.meta.url)));
const imageJob = JSON.parse(fs.readFileSync(new URL('../examples/instagram-reel.image-job.json', import.meta.url)));

test('validates the checked-in AvatarOS production baseline', () => {
  assert.deepEqual(runValidation(), { characters: 1, imageJobs: 1 });
});

test('rejects identity definitions without stable traits', () => {
  const invalid = structuredClone(character);
  invalid.consistency.immutableTraits = [];

  assert.throws(
    () => validateCharacter(invalid),
    (error) => error instanceof AvatarValidationError
      && error.field === 'consistency.immutableTraits'
  );
});

test('rejects image jobs that reference an unknown character', () => {
  assert.throws(
    () => validateImageJob(imageJob, new Set()),
    (error) => error instanceof AvatarValidationError
      && error.field === 'characterId'
  );
});

test('preserves human approval for every image job', () => {
  const invalid = structuredClone(imageJob);
  invalid.approval.humanApprovalRequired = false;

  assert.throws(
    () => validateImageJob(invalid, new Set([character.id])),
    (error) => error instanceof AvatarValidationError
      && error.field === 'approval.humanApprovalRequired'
  );
});
