const PERMISSIONS = new Set(['mission:read', 'mission:write', 'decision:read', 'events:publish', 'storage:read', 'storage:write']);
export function validatePluginManifest(manifest) {
  const errors = [];
  if (manifest?.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  if (!manifest?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id)) errors.push('id must be kebab-case');
  if (!manifest?.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) errors.push('version must be semver');
  for (const permission of manifest?.permissions || []) if (!PERMISSIONS.has(permission)) errors.push(`unsupported permission: ${permission}`);
  return { valid: errors.length === 0, errors };
}
export class PluginRegistry {
  constructor() { this.plugins = new Map(); this.listeners = new Map(); }
  async register(manifest, implementation, config = {}) { const check = validatePluginManifest(manifest); if (!check.valid) throw new Error(check.errors.join('; ')); if (this.plugins.has(manifest.id)) throw new Error('plugin already registered'); const record = { manifest: structuredClone(manifest), implementation, config: structuredClone(config), state: 'REGISTERED' }; this.plugins.set(manifest.id, record); await implementation.onRegister?.({ config: record.config, emit: this.emit.bind(this) }); record.state = 'ACTIVE'; return this.health(manifest.id); }
  async stop(id) { const record = this.#get(id); await record.implementation.onStop?.(); record.state = 'STOPPED'; }
  async health(id) { const record = this.#get(id); const details = await record.implementation.health?.() || {}; return { id, state: record.state, healthy: record.state === 'ACTIVE' && details.healthy !== false, details }; }
  on(event, listener) { const listeners = this.listeners.get(event) || []; listeners.push(listener); this.listeners.set(event, listeners); }
  async emit(event, payload) { await Promise.all((this.listeners.get(event) || []).map((listener) => listener(structuredClone(payload)))); }
  #get(id) { const record = this.plugins.get(id); if (!record) throw new Error('plugin not found'); return record; }
}
