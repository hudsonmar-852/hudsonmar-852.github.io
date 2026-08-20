const STREAMS = new Set(['auto', 'standard', 'enhanced']);
const SOURCE_TYPES = new Set(['official', 'primary', 'peerReviewed', 'professional', 'journalism', 'commentary', 'unknown']);

export function validatePipelineInput(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return ['input must be an object'];
  if (!String(input.topic ?? '').trim()) errors.push('topic is required');
  if (String(input.topic ?? '').length > 500) errors.push('topic cannot exceed 500 characters');
  if (input.stream && !STREAMS.has(input.stream)) errors.push('stream must be auto, standard, or enhanced');
  if (input.rawSources !== undefined && !Array.isArray(input.rawSources)) errors.push('rawSources must be an array');
  return errors;
}

export function validateStructuredSource(source) {
  const errors = [];
  if (!source || typeof source !== 'object' || Array.isArray(source)) return ['source must be an object'];
  if (!String(source.title ?? '').trim()) errors.push('source.title is required');
  if (!String(source.url ?? source.canonical_url ?? '').trim()) errors.push('source.url is required');
  if (source.sourceType && !SOURCE_TYPES.has(source.sourceType)) errors.push('source.sourceType is unsupported');
  if (source.authorityScore !== undefined && (!Number.isFinite(Number(source.authorityScore)) || Number(source.authorityScore) < 0 || Number(source.authorityScore) > 6)) errors.push('source.authorityScore must be between 0 and 6');
  return errors;
}

export function validatePipelineOutput(output) {
  const errors = [];
  if (output?.schemaVersion !== '1.1.0') errors.push('schemaVersion must be 1.1.0');
  for (const field of ['runId', 'topic', 'stream', 'selection', 'stages', 'outputs', 'runtimeEvidence', 'startedAt', 'completedAt']) if (output?.[field] === undefined) errors.push(`${field} is required`);
  if (!['standard', 'enhanced'].includes(output?.stream)) errors.push('output stream is invalid');
  if (!['COMPLETED', 'FAILED'].includes(output?.runtimeEvidence?.terminalState)) errors.push('runtimeEvidence.terminalState is invalid');
  if (!Array.isArray(output?.runtimeEvidence?.stages)) errors.push('runtimeEvidence.stages must be an array');
  return errors;
}

export function assertContract(label, errors) { if (errors.length) throw new Error(`${label}: ${errors.join('; ')}`); }
