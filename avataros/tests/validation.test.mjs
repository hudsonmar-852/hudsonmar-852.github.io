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

test('enforces the Character Bible ageRange schema limit', () => {
  const invalid = structuredClone(character);
  invalid.identity.ageRange = 'x'.repeat(41);

  assert.throws(
    () => validateCharacter(invalid),
    (error) => error instanceof AvatarValidationError
      && error.field === 'identity.ageRange'
      && /at most 40/.test(error.message)
  );
});

test('rejects additional Character Bible properties at root and nested levels', () => {
  const rootExtra = structuredClone(character);
  rootExtra.temporary = true;
  assert.throws(
    () => validateCharacter(rootExtra),
    (error) => error instanceof AvatarValidationError
      && error.field === 'temporary'
  );

  for (const [field, property] of [
    ['identity', 'nickname'],
    ['consistency', 'seed'],
    ['approval', 'approvedBy']
  ]) {
    const invalid = structuredClone(character);
    invalid[field][property] = 'unexpected';
    assert.throws(
      () => validateCharacter(invalid),
      (error) => error instanceof AvatarValidationError
        && error.field === `${field}.${property}`
    );
  }
});

test('rejects additional Image Job properties at root and nested levels', () => {
  const rootExtra = structuredClone(imageJob);
  rootExtra.temporary = true;
  assert.throws(
    () => validateImageJob(rootExtra, new Set([character.id])),
    (error) => error instanceof AvatarValidationError
      && error.field === 'temporary'
  );

  for (const [field, property] of [
    ['render', 'seed'],
    ['scene', 'motion'],
    ['approval', 'approvedBy']
  ]) {
    const invalid = structuredClone(imageJob);
    invalid[field][property] = 'unexpected';
    assert.throws(
      () => validateImageJob(invalid, new Set([character.id])),
      (error) => error instanceof AvatarValidationError
        && error.field === `${field}.${property}`
    );
  }
});
