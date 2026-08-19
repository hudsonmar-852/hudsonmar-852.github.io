import registry from './model-registry.json' with { type: 'json' };

const DEFAULTS = Object.freeze({ duration: 8, fps: 24, aspectRatio: '16:9', quality: 'high' });

export function buildVideoJob(input = {}) {
  const mode = input.image ? 'image_to_video' : (input.mode || 'text_to_video');
  return {
    mode,
    goal: input.goal || input.prompt || '',
    subject: input.subject || '',
    action: input.action || '',
    environment: input.environment || '',
    composition: input.composition || '',
    camera: input.camera || '',
    lens: input.lens || '',
    lighting: input.lighting || '',
    palette: input.palette || '',
    motion: input.motion || '',
    emotion: input.emotion || '',
    dialogue: input.dialogue || '',
    audio: input.audio || '',
    duration: input.duration || DEFAULTS.duration,
    fps: input.fps || DEFAULTS.fps,
    aspectRatio: input.aspectRatio || DEFAULTS.aspectRatio,
    quality: input.quality || DEFAULTS.quality,
    continuity: input.continuity || {},
    referenceImages: input.referenceImages || [],
    requireNativeAudio: Boolean(input.requireNativeAudio || input.dialogue || input.audio),
    requireFirstLastFrame: Boolean(input.requireFirstLastFrame),
    requireSubjectReference: Boolean(input.requireSubjectReference),
    requireMotionBrush: Boolean(input.requireMotionBrush)
  };
}

export function routeModel(job) {
  const candidates = Object.entries(registry.models).filter(([, model]) => model.modes.includes(job.mode));
  if (!candidates.length) throw new Error(`No video model supports mode: ${job.mode}`);

  const scored = candidates.map(([id, model]) => {
    let score = model.priority === 'P0' ? 20 : 10;
    if (job.requireNativeAudio && model.supports.nativeAudio) score += 35;
    if (job.requireFirstLastFrame && (model.supports.firstLastFrame || model.supports.startEndFrames)) score += 40;
    if (job.requireSubjectReference && model.supports.subjectReference) score += 45;
    if (job.requireMotionBrush && model.supports.motionBrush) score += 45;
    if (job.referenceImages.length > 1 && (model.supports.referenceImagesMax || 0) >= job.referenceImages.length) score += 30;
    if (job.mode === 'image_to_video' && model.strengths.includes('motion')) score += 15;
    if (job.emotion && model.strengths.includes('emotional_expression')) score += 20;
    if ((job.camera || job.lens) && model.strengths.includes('cinematography')) score += 15;
    return { id, score, model };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  return scored[0];
}

function compact(parts) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export function compilePrompt(job, modelId) {
  if (!registry.models[modelId]) throw new Error(`Unknown video model: ${modelId}`);

  const motion = compact([job.action, job.motion]);
  const camera = compact([job.camera, job.lens && `Lens: ${job.lens}.`]);
  const look = compact([job.lighting, job.palette, job.emotion]);
  const scene = compact([job.subject, job.environment, job.composition]);
  const continuity = job.mode === 'image_to_video'
    ? 'Based on the uploaded image, animate the scene naturally. Preserve the identity, lighting, and colors from the image.'
    : '';

  switch (modelId) {
    case 'runway_gen4':
      return compact([motion || 'The subject moves naturally.', camera, job.environment && `The environment responds naturally to the motion.`, look, job.mode === 'image_to_video' ? continuity : '']);
    case 'sora_2':
      return compact([
        `Scene: ${scene}.`,
        `Cinematography: ${camera || 'natural cinematic framing'}.`,
        `Action: ${motion || 'subtle natural movement'}.`,
        `Lighting and palette: ${look || 'coherent natural lighting and color'}.`,
        job.dialogue && `Dialogue: ${job.dialogue}.`,
        job.audio && `Background sound: ${job.audio}.`,
        continuity
      ]);
    case 'veo_3_1':
      return compact([
        scene,
        motion,
        camera,
        look,
        job.dialogue && `Dialogue: "${job.dialogue}".`,
        job.audio && `Audio: ${job.audio}.`,
        continuity
      ]);
    case 'kling':
      return compact([scene, motion, camera, look, continuity]);
    case 'hailuo':
      return compact([scene, motion, camera, look, continuity]);
    default:
      throw new Error(`Compiler not implemented for: ${modelId}`);
  }
}

export function continuityLock(job) {
  return {
    identity: job.continuity.identity || 'preserve',
    wardrobe: job.continuity.wardrobe || 'preserve',
    environment: job.continuity.environment || 'preserve',
    lighting: job.continuity.lighting || 'preserve',
    palette: job.continuity.palette || 'preserve',
    cameraAxis: job.continuity.cameraAxis || 'preserve',
    references: job.referenceImages
  };
}

export function reviewVideo(metrics = {}) {
  const weights = {
    identity: 0.22,
    promptAdherence: 0.18,
    motionRealism: 0.16,
    cameraAdherence: 0.12,
    anatomy: 0.12,
    temporalConsistency: 0.12,
    artifactSeverityInverse: 0.08
  };
  const artifactInverse = 100 - (metrics.artifactSeverity ?? 0);
  const normalized = { ...metrics, artifactSeverityInverse: artifactInverse };
  const overall = Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + (normalized[key] ?? 80) * weight, 0));
  const decision = overall >= 85 ? 'PASS' : overall >= 70 ? 'REPAIR' : 'REGENERATE';
  return { overall, decision };
}

export function planVideo(input = {}) {
  const job = buildVideoJob(input);
  const route = routeModel(job);
  return {
    job,
    model: route.id,
    routingScore: route.score,
    continuity: continuityLock(job),
    prompt: compilePrompt(job, route.id)
  };
}

export { registry };
