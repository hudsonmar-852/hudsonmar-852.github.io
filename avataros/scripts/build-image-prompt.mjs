import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCharacter, validateImageJob } from './validate-avataros.mjs';

const avatarRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read ${filename}: ${error.message}`);
  }
}

/**
 * Compile validated AvatarOS inputs into a provider-ready prompt pack.
 * The returned object is deterministic and contains no credentials.
 */
export function compilePromptPack(characterInput, imageJobInput) {
  const character = validateCharacter(characterInput, 'character');
  const job = validateImageJob(imageJobInput, new Set([character.id]), 'imageJob');

  if (!character.approval.publicSafe || !character.approval.approvedForGeneration) {
    throw new Error(`Character ${character.id} is not approved for generation`);
  }
  if (!job.approval.publicSafe) {
    throw new Error(`Image job ${job.id} is not approved for public-safe processing`);
  }

  const identity = [
    character.identity.presentation,
    character.identity.ageRange,
    character.identity.faceShape,
    character.identity.hair,
    character.identity.eyes,
    character.identity.skinTone
  ].join(', ');
  const consistency = character.consistency.immutableTraits.join('; ');
  const wardrobe = character.consistency.wardrobeRules.join('; ');

  return {
    schemaVersion: '1.0.0',
    jobId: job.id,
    provider: job.render.provider,
    prompt: [
      job.objective,
      `Character identity: ${identity}.`,
      `Identity lock: ${consistency}.`,
      wardrobe ? `Wardrobe: ${wardrobe}.` : '',
      `Scene: ${job.scene.location}.`,
      `Camera: ${job.scene.camera}.`,
      `Lighting: ${job.scene.lighting}.`,
      `Visual style: ${job.render.style}.`,
      `Composition: ${job.render.aspectRatio}, ${job.render.imageCount} variation(s), ${job.render.format.toUpperCase()} output.`,
      'Preserve natural anatomy, realistic texture, coherent lighting and exact character identity.'
    ].filter(Boolean).join(' '),
    negativePrompt: character.consistency.negativePrompts.join(', '),
    output: {
      aspectRatio: job.render.aspectRatio,
      imageCount: job.render.imageCount,
      format: job.render.format
    },
    approval: {
      status: 'pending_human_review',
      required: true
    }
  };
}

function parseArguments(argumentsList) {
  const options = {
    character: path.join(avatarRoot, 'examples/generic-premium-avatar.character.json'),
    job: path.join(avatarRoot, 'examples/instagram-reel.image-job.json')
  };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument !== '--character' && argument !== '--job') {
      throw new Error(`Unknown argument: ${argument}`);
    }
    const value = argumentsList[index + 1];
    if (!value) throw new Error(`Missing value for ${argument}`);
    options[argument.slice(2)] = path.resolve(value);
    index += 1;
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArguments(process.argv.slice(2));
    const pack = compilePromptPack(readJson(options.character), readJson(options.job));
    console.log(JSON.stringify(pack, null, 2));
  } catch (error) {
    console.error(`Image prompt build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
