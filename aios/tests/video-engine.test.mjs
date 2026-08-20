import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRepairStrategy,
  buildVideoJob,
  compileCinematography,
  compilePrompt,
  designMotion,
  planVideo,
  reviewVideo,
  routeModel
} from '../video-engine/engine.mjs';

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

test('motion designer expands abstract confident motion into physical cues', () => {
  const job = buildVideoJob({ action: 'look confident', duration: 8 });
  const motion = designMotion(job);
  assert.match(motion.subjectMotion, /chin|shoulders|eyeline/i);
  assert.equal(motion.complexity, 'bounded');
  assert.match(motion.timingGuidance, /two or three readable beats/i);
});

test('cinematography compiler supplies stable defaults and preserves explicit lens', () => {
  const job = buildVideoJob({ lens: '85mm', lighting: 'soft window light', camera: 'low angle slow dolly in' });
  const cinema = compileCinematography(job);
  assert.equal(cinema.angle, 'low angle');
  assert.equal(cinema.lens, '85mm');
  assert.match(cinema.continuityRule, /camera axis/i);
});

test('Runway compiler focuses on executable motion and preserves uploaded image', () => {
  const job = buildVideoJob({ image: 'frame.png', action: 'The subject turns slowly.', camera: 'Slow dolly in.' });
  const prompt = compilePrompt(job, 'runway_gen4');
  assert.match(prompt, /turns slowly/i);
  assert.match(prompt, /Preserve the identity, lighting, and colors/i);
});

test('planVideo returns P1 motion and cinematography plans', () => {
  const plan = planVideo({ image: 'frame.png', action: 'The subject breathes naturally.' });
  assert.ok(plan.model);
  assert.equal(plan.continuity.identity, 'preserve');
  assert.ok(plan.motionDesign.subjectMotion);
  assert.ok(plan.cinematography.lens);
  assert.ok(plan.prompt.length > 20);
});

test('repair strategist applies smallest correction first for identity drift', () => {
  const repair = buildRepairStrategy({
    identity: 42,
    promptAdherence: 90,
    motionRealism: 80,
    cameraAdherence: 85,
    anatomy: 88,
    temporalConsistency: 82,
    artifactSeverity: 10
  }, { model: 'runway_gen4' });
  assert.equal(repair.weakestMetric, 'identity');
  assert.equal(repair.action, 'reduce_subject_rotation_and_strengthen_reference');
  assert.equal(repair.principle, 'smallest_correction_first');
});

test('video QA maps score to PASS REPAIR and REGENERATE and attaches repair on REPAIR', () => {
  assert.equal(reviewVideo({ identity: 95, promptAdherence: 95, motionRealism: 95, cameraAdherence: 90, anatomy: 95, temporalConsistency: 95, artifactSeverity: 5 }).decision, 'PASS');
  const repairReview = reviewVideo({ identity: 75, promptAdherence: 75, motionRealism: 75, cameraAdherence: 75, anatomy: 75, temporalConsistency: 75, artifactSeverity: 25 });
  assert.equal(repairReview.decision, 'REPAIR');
  assert.ok(repairReview.repair);
  assert.equal(reviewVideo({ identity: 40, promptAdherence: 40, motionRealism: 40, cameraAdherence: 40, anatomy: 40, temporalConsistency: 40, artifactSeverity: 70 }).decision, 'REGENERATE');
});
