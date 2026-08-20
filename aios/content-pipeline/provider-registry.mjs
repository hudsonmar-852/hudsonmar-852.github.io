const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ContentProviderRegistry {
  constructor({ clock = () => new Date().toISOString() } = {}) { this.clock = clock; this.providers = new Map(); }

  register(manifest, implementation) {
    const errors = validateProviderManifest(manifest);
    if (errors.length) throw new Error(errors.join('; '));
    if (this.providers.has(manifest.id)) throw new Error('provider already registered');
    if (typeof implementation?.execute !== 'function') throw new Error('provider execute function is required');
    this.providers.set(manifest.id, { manifest: structuredClone(manifest), implementation });
    return structuredClone(manifest);
  }

  resolve(stage, { providerId } = {}) {
    const candidates = [...this.providers.values()].filter(({ manifest }) => manifest.stages.includes(stage) && (!providerId || manifest.id === providerId));
    candidates.sort((a, b) => b.manifest.priority - a.manifest.priority || a.manifest.id.localeCompare(b.manifest.id));
    if (!candidates.length) return null;
    return candidates[0];
  }

  async execute(stage, context, options = {}) {
    const record = this.resolve(stage, options);
    if (!record) throw providerError('PROVIDER_UNAVAILABLE', `no provider registered for ${stage}`);
    const startedAt = this.clock();
    try {
      const output = await record.implementation.execute({ stage, context: structuredClone(context), config: structuredClone(record.manifest.config || {}) });
      return { output, evidence: { providerId: record.manifest.id, stage, status: 'PASS', startedAt, completedAt: this.clock() } };
    } catch (cause) {
      const error = providerError('PROVIDER_EXECUTION_FAILED', `provider ${record.manifest.id} failed at ${stage}`); error.cause = cause; error.evidence = { providerId: record.manifest.id, stage, status: 'FAIL', startedAt, completedAt: this.clock(), classification: cause?.failureClassification || 'provider_error' }; throw error;
    }
  }
}

export function validateProviderManifest(manifest) {
  const errors = [];
  if (manifest?.schemaVersion !== '1.0.0') errors.push('provider schemaVersion must be 1.0.0');
  if (!ID.test(manifest?.id || '')) errors.push('provider id must be kebab-case');
  if (!/^\d+\.\d+\.\d+$/.test(manifest?.version || '')) errors.push('provider version must be semver');
  if (!Array.isArray(manifest?.stages) || !manifest.stages.length) errors.push('provider stages are required');
  if (!Number.isFinite(manifest?.priority ?? 0)) errors.push('provider priority must be numeric');
  if (manifest?.credentialsRequired !== false) errors.push('P1 local providers must declare credentialsRequired false');
  return errors;
}

function providerError(code, message) { const error = new Error(message); error.code = code; return error; }
