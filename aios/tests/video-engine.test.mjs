import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVideoJob, routeModel, compilePrompt, planVideo, reviewVideo } from '../video-engine/engine.mjs';

test('image input automatically selects image_to_video mode', () => {
  const job = buildVideoJob({ image: 'frame.png', action: 'turns slowly' });
  assert.equal(job.mode, 'image_to_video');
});

test('native audio requirement routes to a capable P0 model', () => {
  const job = buildVideoJob({ prompt: 'interview', dialogue: 'Hello there' });
  const route = routeModel(job);
  assert.ok(['sora_2', 'veo_3_1'].includes(route.id));
  assert.equal(route.model.supports.nativeAudio, true);
});

test('multiple reference images route to Veo 3.1', () => {
  const job = buildVideoJob({ mode: 'image_to_video', referenceImages: ['a.png', 'b.png', 'c.png'] });
  assert.equal(routeModel(job).id, 'veo_3_1');
});

test('subject reference requirement routes to Hailuo', () => {
  const job = buildVideoJob({ mode: 'subject_reference', requireSubjectReference: true });
  assert.equal(routeModel(job).id, 'hailuo');
});

test('Runway compiler focuses on motion and preserves uploaded image', () => {
  const job = buildVideoJob({ image: 'frame.png', action: 'The subject turns slowly.', camera: 'Slow dolly in.' });
  const prompt = compilePrompt(job, 'runway_gen4');
  assert.match(prompt, /turns slowly/i);
  assert.match(prompt, /Preserve the identity, lighting, and colors/i);
});

test('planVideo returns routed model, continuity lock and compiled prompt', () => {
  const plan = planVideo({ image: 'frame.png', action: 'The subject breathes naturally.' });
  assert.ok(plan.model);
  assert.equal(plan.continuity.identity, 'preserve');
  assert.ok(plan.prompt.length > 20);
});

test('video QA maps score to PASS REPAIR and REGENERATE', () => {
  assert.equal(reviewVideo({ identity: 95, promptAdherence: 95, motionRealism: 95, cameraAdherence: 90, anatomy: 95, temporalConsistency: 95, artifactSeverity: 5 }).decision, 'PASS');
  assert.equal(reviewVideo({ identity: 75, promptAdherence: 75, motionRealism: 75, cameraAdherence: 75, anatomy: 75, temporalConsistency: 75, artifactSeverity: 25 }).decision, 'REPAIR');
  assert.equal(reviewVideo({ identity: 40, promptAdherence: 40, motionRealism: 40, cameraAdherence: 40, anatomy: 40, temporalConsistency: 40, artifactSeverity: 70 }).decision, 'REGENERATE');
});
