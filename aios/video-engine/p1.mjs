const MOVEMENT_ALIASES = Object.freeze({
  confident: 'The subject lifts the chin slightly, settles the shoulders, maintains a steady eyeline, and performs one deliberate movement.',
  natural: 'The subject breathes naturally, makes a subtle eye movement, shifts weight slightly, and keeps all gestures restrained.',
  energetic: 'The subject performs one clear energetic action with controlled acceleration and a stable finish.',
  emotional: 'The subject begins neutral, lets the requested emotion emerge through the eyes and facial muscles, then settles into a readable final expression.'
});

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function designMotion(job = {}) {
  const source = clean([job.action, job.motion, job.emotion].filter(Boolean).join(' '));
  const lower = source.toLowerCase();
  let subjectMotion = source;

  if (!subjectMotion) subjectMotion = MOVEMENT_ALIASES.natural;
  else if (lower.includes('confident') && !lower.includes('step') && !lower.includes('turn')) subjectMotion = MOVEMENT_ALIASES.confident;
  else if ((lower.includes('natural') || lower.includes('subtle')) && source.length < 80) subjectMotion = MOVEMENT_ALIASES.natural;
  else if ((lower.includes('energetic') || lower.includes('dynamic')) && source.length < 80) subjectMotion = MOVEMENT_ALIASES.energetic;

  const cameraMotion = clean(job.camera) || 'A subtle, stable camera drift supports the subject without competing with the action.';
  const sceneMotion = job.environment
    ? 'Environmental elements respond subtly and consistently to the subject and camera movement.'
    : 'Background motion remains subtle and temporally consistent.';

  return {
    subjectMotion,
    cameraMotion,
    sceneMotion,
    timingGuidance: job.duration <= 5
      ? 'Use one primary action and one camera move with a clean final pose.'
      : 'Use one primary action in two or three readable beats with a clean final pose.',
    complexity: 'bounded'
  };
}

export function compileCinematography(job = {}) {
  return {
    shot: clean(job.composition) || 'medium shot',
    angle: clean(job.camera).toLowerCase().includes('low angle') ? 'low angle' : clean(job.camera).toLowerCase().includes('high angle') ? 'high angle' : 'eye level',
    lens: clean(job.lens) || '50mm equivalent',
    movement: clean(job.camera) || 'slow controlled push-in',
    focus: 'keep the primary subject in stable focus',
    depthOfField: 'shallow-to-moderate depth of field with readable environment separation',
    lighting: clean(job.lighting) || 'coherent naturalistic key light with restrained fill',
    palette: clean(job.palette) || 'consistent neutral cinematic palette',
    continuityRule: 'Do not change camera axis, lighting direction, wardrobe, identity, or palette unless explicitly requested.'
  };
}

function weakestMetric(metrics) {
  const checks = [
    ['identity', metrics.identity],
    ['promptAdherence', metrics.promptAdherence],
    ['motionRealism', metrics.motionRealism],
    ['cameraAdherence', metrics.cameraAdherence],
    ['anatomy', metrics.anatomy],
    ['temporalConsistency', metrics.temporalConsistency],
    ['artifactSeverity', metrics.artifactSeverity == null ? undefined : 100 - metrics.artifactSeverity]
  ].filter(([, value]) => Number.isFinite(value));
  if (!checks.length) return ['unknown', 80];
  return checks.sort((a, b) => a[1] - b[1])[0];
}

export function diagnoseVideo(metrics = {}, context = {}) {
  const [weakest, score] = weakestMetric(metrics);
  const diagnoses = {
    identity: 'Identity drift or facial/subject inconsistency is the dominant failure.',
    promptAdherence: 'The generated clip diverges from the requested visible action or scene intent.',
    motionRealism: 'Motion is physically implausible, over-complex, abrupt, or insufficiently grounded.',
    cameraAdherence: 'The camera path or framing does not follow the intended cinematography.',
    anatomy: 'Anatomy or body geometry is unstable during motion.',
    temporalConsistency: 'Details, lighting, geometry, or scene state change inconsistently across frames.',
    artifactSeverity: 'Visible generation artifacts are the dominant quality problem.',
    unknown: 'No decisive low-scoring metric was supplied.'
  };
  return { weakestMetric: weakest, weakestScore: score, diagnosis: diagnoses[weakest], model: context.model || null };
}

export function buildRepairStrategy(metrics = {}, context = {}) {
  const diagnosis = diagnoseVideo(metrics, context);
  const repairs = {
    identity: {
      action: 'reduce_subject_rotation_and_strengthen_reference',
      instruction: 'Keep the subject orientation closer to the reference, reduce large head/body rotations, and move the camera instead of forcing identity-changing subject motion.',
      prefer: context.subjectReferenceCapable ? 'subject_reference_model' : 'strong_reference_image_model'
    },
    promptAdherence: {
      action: 'simplify_visible_action',
      instruction: 'Remove secondary actions and retain one explicit visible action plus one camera move.',
      prefer: 'same_model_first'
    },
    motionRealism: {
      action: 'reduce_motion_complexity',
      instruction: 'Reduce the action to two or three physical beats, lower speed, and add a stable beginning and ending pose.',
      prefer: 'motion_control_model'
    },
    cameraAdherence: {
      action: 'lock_camera_language',
      instruction: 'Use one named camera movement, one framing instruction, and a fixed camera axis; remove competing camera commands.',
      prefer: 'camera_control_model'
    },
    anatomy: {
      action: 'reduce_occlusion_and_extreme_pose',
      instruction: 'Use a less extreme pose, reduce limb crossing and self-occlusion, and keep hands and joints visible where possible.',
      prefer: 'same_model_first'
    },
    temporalConsistency: {
      action: 'strengthen_continuity_constraints',
      instruction: 'Lock identity, wardrobe, lighting, palette, environment, and camera axis; avoid simultaneous scene transformations.',
      prefer: 'reference_or_first_last_frame_model'
    },
    artifactSeverity: {
      action: 'regenerate_with_simpler_scene',
      instruction: 'Simplify background detail and motion, reduce simultaneous effects, and regenerate from the cleanest available reference.',
      prefer: 'same_model_first'
    },
    unknown: {
      action: 'collect_quality_metrics',
      instruction: 'Collect identity, prompt adherence, motion realism, camera adherence, anatomy, temporal consistency, and artifact severity scores before changing the generation plan.',
      prefer: 'no_model_change'
    }
  };
  const repair = repairs[diagnosis.weakestMetric];
  return { ...diagnosis, ...repair, principle: 'smallest_correction_first' };
}
