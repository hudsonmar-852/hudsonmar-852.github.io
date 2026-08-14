import crypto from 'node:crypto';

const TOKEN = /{{\s*([A-Za-z0-9_.-]+)\s*}}/g;

function topoSort(modules, rootIds) {
  const byId = new Map(modules.map((module) => [module.id, module]));
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];
  function visit(id, chain = []) {
    if (!byId.has(id)) throw new Error(`undefined prompt dependency: ${id}`);
    if (visiting.has(id)) throw new Error(`circular prompt dependency: ${[...chain, id].join(' -> ')}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependencies || []) visit(dependency, [...chain, id]);
    visiting.delete(id); visited.add(id); ordered.push(byId.get(id));
  }
  for (const id of rootIds) visit(id);
  return ordered;
}

export function buildPrompt({ modules, roots, variables = {}, compatibilityProfile, goldenArtifact = null }) {
  const ordered = topoSort(modules, roots);
  const seen = new Map();
  const duplicates = [];
  const stable = [];
  const dynamic = [];
  for (const module of ordered) {
    const normalized = module.content.trim().replace(/\s+/g, ' ').toLowerCase();
    if (seen.has(normalized)) duplicates.push([seen.get(normalized), module.id]);
    else seen.set(normalized, module.id);
    (module.layer === 'dynamic' ? dynamic : stable).push(module.content.trim());
  }
  if (duplicates.length) throw new Error(`duplicate prompt instructions: ${duplicates.map((pair) => pair.join('/')).join(', ')}`);
  const render = (parts) => parts.join('\n\n').replace(TOKEN, (_, key) => {
    if (!(key in variables)) throw new Error(`undefined prompt variable: ${key}`);
    return String(variables[key]);
  });
  const stablePrefix = render(stable);
  const dynamicContext = render(dynamic);
  const artifact = `${stablePrefix}\n\n--- DYNAMIC CONTEXT ---\n\n${dynamicContext}\n`;
  if (!compatibilityProfile?.supported_models?.length) throw new Error('prompt-model compatibility profile is required');
  const hash = crypto.createHash('sha256').update(artifact).digest('hex');
  return { stablePrefix, dynamicContext, artifact, hash, drift: goldenArtifact === null ? null : goldenArtifact !== artifact, dependencies: ordered.map(({ id, version }) => ({ id, version })), compatibilityProfile };
}
