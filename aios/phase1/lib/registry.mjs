import fs from 'node:fs';
import path from 'node:path';
import { validateFormalAsset } from './validation.mjs';

function semver(version) { return version.split('.').map(Number); }
function newer(a, b) { const av = semver(a.version); const bv = semver(b.version); return av.find((part, index) => part !== bv[index]) > bv.find((part, index) => part !== av[index]); }

export function validateRegistry(registry, root) {
  const errors = [];
  const conflicts = [];
  const byId = new Map();
  for (const asset of registry.assets || []) {
    errors.push(...validateFormalAsset(asset).map((error) => `${asset.id}: ${error}`));
    const location = path.resolve(root, asset.canonical_location);
    if (!location.startsWith(path.resolve(root))) errors.push(`${asset.id}: canonical_location escapes repository`);
    else if (!fs.existsSync(location)) errors.push(`${asset.id}: canonical_location does not exist`);
    const existing = byId.get(asset.id) || [];
    existing.push(asset); byId.set(asset.id, existing);
  }
  for (const [id, assets] of byId) {
    const canonical = assets.filter(({ canonical }) => canonical !== false);
    if (canonical.length > 1) conflicts.push({ id, locations: canonical.map(({ canonical_location }) => canonical_location), resolution: 'select newest approved version; retain older version as reference/archive candidate' });
  }
  return { valid: errors.length === 0 && conflicts.length === 0, errors, conflicts };
}

export function resolveLowRiskDuplicates(assets) {
  const groups = Map.groupBy(assets, ({ id }) => id);
  return [...groups.values()].flatMap((versions) => {
    if (versions.length === 1) return versions;
    const approved = versions.filter(({ status }) => ['Production', 'UAT', 'Candidate'].includes(status));
    const canonical = (approved.length ? approved : versions).reduce((best, value) => newer(value, best) ? value : best);
    return versions.map((asset) => asset === canonical ? { ...asset, canonical: true } : { ...asset, canonical: false, status: asset.status === 'Production' ? 'Deprecated' : asset.status, superseded_by: canonical.id, archive_candidate: true });
  });
}
