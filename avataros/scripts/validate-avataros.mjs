import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const avatarRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export class AvatarValidationError extends Error {
  constructor(asset, field, message) {
    super(`${asset}.${field}: ${message}`);
    this.name = 'AvatarValidationError';
    this.asset = asset;
    this.field = field;
  }
}

function assertObject(value, asset, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AvatarValidationError(asset, field, 'must be an object');
  }
}

function assertString(value, asset, field, maxLength = 240) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AvatarValidationError(asset, field, 'must be a non-empty string');
  }
  if (value.length > maxLength) {
    throw new AvatarValidationError(asset, field, `must be at most ${maxLength} characters`);
  }
}

function assertSlug(value, asset, field) {
  assertString(value, asset, field, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new AvatarValidationError(asset, field, 'must be a lowercase kebab-case identifier');
  }
}

function assertStringArray(value, asset, field, minimum = 0) {
  if (!Array.isArray(value) || value.length < minimum) {
    throw new AvatarValidationError(asset, field, `must contain at least ${minimum} item(s)`);
  }
  value.forEach((item, index) => assertString(item, asset, `${field}[${index}]`, 160));
}

export function validateCharacter(character, asset = 'character') {
  assertObject(character, asset, 'root');
  if (character.schemaVersion !== '1.0.0') {
    throw new AvatarValidationError(asset, 'schemaVersion', 'must equal 1.0.0');
  }
  assertSlug(character.id, asset, 'id');
  assertString(character.displayName, asset, 'displayName', 80);

  assertObject(character.identity, asset, 'identity');
  for (const field of ['ageRange', 'presentation', 'faceShape', 'hair', 'eyes', 'skinTone']) {
    assertString(character.identity[field], asset, `identity.${field}`, 120);
  }

  assertObject(character.consistency, asset, 'consistency');
  assertStringArray(character.consistency.immutableTraits, asset, 'consistency.immutableTraits', 1);
  assertStringArray(character.consistency.wardrobeRules, asset, 'consistency.wardrobeRules');
  assertStringArray(character.consistency.negativePrompts, asset, 'consistency.negativePrompts');

  assertObject(character.approval, asset, 'approval');
  if (typeof character.approval.publicSafe !== 'boolean') {
    throw new AvatarValidationError(asset, 'approval.publicSafe', 'must be a boolean');
  }
  if (typeof character.approval.approvedForGeneration !== 'boolean') {
    throw new AvatarValidationError(asset, 'approval.approvedForGeneration', 'must be a boolean');
  }
  if (character.approval.humanApprovalRequired !== true) {
    throw new AvatarValidationError(asset, 'approval.humanApprovalRequired', 'must remain true');
  }
  return character;
}

export function validateImageJob(job, characterIds, asset = 'imageJob') {
  assertObject(job, asset, 'root');
  if (job.schemaVersion !== '1.0.0') {
    throw new AvatarValidationError(asset, 'schemaVersion', 'must equal 1.0.0');
  }
  assertSlug(job.id, asset, 'id');
  assertSlug(job.characterId, asset, 'characterId');
  if (!characterIds.has(job.characterId)) {
    throw new AvatarValidationError(asset, 'characterId', `references unknown character ${job.characterId}`);
  }
  assertString(job.objective, asset, 'objective', 240);

  assertObject(job.render, asset, 'render');
  if (job.render.provider !== 'Grok Imagine') {
    throw new AvatarValidationError(asset, 'render.provider', 'must preserve the configured Grok Imagine provider');
  }
  assertString(job.render.style, asset, 'render.style', 80);
  if (!['1:1', '4:5', '9:16', '16:9'].includes(job.render.aspectRatio)) {
    throw new AvatarValidationError(asset, 'render.aspectRatio', 'is not supported');
  }
  if (!Number.isInteger(job.render.imageCount) || job.render.imageCount < 1 || job.render.imageCount > 8) {
    throw new AvatarValidationError(asset, 'render.imageCount', 'must be an integer from 1 to 8');
  }
  if (!['png', 'jpg', 'webp'].includes(job.render.format)) {
    throw new AvatarValidationError(asset, 'render.format', 'is not supported');
  }

  assertObject(job.scene, asset, 'scene');
  for (const field of ['location', 'camera', 'lighting']) {
    assertString(job.scene[field], asset, `scene.${field}`, 160);
  }

  assertObject(job.approval, asset, 'approval');
  if (typeof job.approval.publicSafe !== 'boolean') {
    throw new AvatarValidationError(asset, 'approval.publicSafe', 'must be a boolean');
  }
  if (job.approval.humanApprovalRequired !== true) {
    throw new AvatarValidationError(asset, 'approval.humanApprovalRequired', 'must remain true');
  }
  return job;
}

function readJson(relativePath) {
  const filename = path.join(avatarRoot, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    throw new AvatarValidationError(relativePath, 'root', error.message);
  }
}

export function runValidation() {
  const config = readJson('config/avataros.config.json');
  const characterPath = 'examples/generic-premium-avatar.character.json';
  const jobPath = 'examples/instagram-reel.image-job.json';
  const character = validateCharacter(readJson(characterPath), characterPath);
  const job = validateImageJob(readJson(jobPath), new Set([character.id]), jobPath);

  if (config.defaultStack?.imageGeneration !== job.render.provider) {
    throw new AvatarValidationError('config/avataros.config.json', 'defaultStack.imageGeneration', 'must match the image job provider');
  }
  if (config.defaults?.character !== character.id) {
    throw new AvatarValidationError('config/avataros.config.json', 'defaults.character', 'must reference the sample character');
  }
  if (config.defaults?.aspectRatio !== job.render.aspectRatio) {
    throw new AvatarValidationError('config/avataros.config.json', 'defaults.aspectRatio', 'must match the sample image job');
  }

  return { characters: 1, imageJobs: 1 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = runValidation();
    console.log(`AvatarOS validation passed: ${result.characters} character(s), ${result.imageJobs} image job(s).`);
  } catch (error) {
    console.error(`AvatarOS validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
