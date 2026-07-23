import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(root, '..');
const jsonFiles = [
  'config/security-storage-policy.json',
  'data/production-manifest.json',
  'examples/production-manifest.example.json',
  'spec/branches/production-consolidation-2026-07-21.json',
  'templates/secret-inventory.example.json',
  'workflows/production-consolidation.json'
];

const forbiddenValuePatterns = [
  /sk-[A-Za-z0-9_-]{16,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /https:\/\/[^\s"']*webhook/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/
];

for (const relative of jsonFiles) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  JSON.parse(source);
}

function collectFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(filename));
    else files.push(filename);
  }
  return files;
}

const repositoryFiles = collectFiles(repositoryRoot);
const allJsonFiles = repositoryFiles.filter((filename) => filename.endsWith('.json'));
for (const filename of allJsonFiles) {
  JSON.parse(fs.readFileSync(filename, 'utf8'));
}

const scannableExtensions = new Set(['.html', '.js', '.json', '.md', '.mjs', '.txt', '.yml', '.yaml']);
const secretScanFiles = repositoryFiles.filter((filename) => {
  if (filename === fileURLToPath(import.meta.url)) return false;
  return scannableExtensions.has(path.extname(filename)) || path.basename(filename).startsWith('.env');
});
for (const filename of secretScanFiles) {
  const source = fs.readFileSync(filename, 'utf8');
  for (const pattern of forbiddenValuePatterns) {
    if (pattern.test(source)) {
      throw new Error(`Potential secret in ${path.relative(repositoryRoot, filename)}`);
    }
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/production-manifest.json'), 'utf8'));
if (manifest.secretManagement.onePassword !== 'not_used') throw new Error('1Password must not be a production dependency');
if (manifest.privateAccess.accountConfiguration !== 'pending_external_setup') throw new Error('OAuth status must not overstate completion');
if (!manifest.deferred.some((item) => item.id === 'grok-login-test' && item.status === 'deferred')) throw new Error('Grok test deferral is missing');

const workflow = JSON.parse(fs.readFileSync(path.join(root, 'workflows/production-consolidation.json'), 'utf8'));
if (!workflow.states.includes(workflow.currentState)) throw new Error('Workflow currentState is not a declared state');
if (workflow.automaticMerge !== false) throw new Error('Production workflow must require human merge approval');

const localAssets = [
  'index.html',
  'aios/index.html',
  'avataros/index.html',
  'avataros/config/avataros.config.json',
  'avataros/docs/system-spec.md',
  'prompt2/index.html',
  'share/index.html'
];
for (const relative of localAssets) {
  if (!fs.existsSync(path.join(repositoryRoot, relative))) throw new Error(`Missing public asset: ${relative}`);
}

const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
for (const project of projects) {
  if (!project.id || !project.name || !project.publicUrl || !project.repository) {
    throw new Error(`Incomplete project registry entry: ${project.id ?? 'unknown'}`);
  }
  if (project.repository === manifest.repository) {
    const target = path.resolve(root, project.publicUrl);
    const entrypoint = path.extname(target) ? target : path.join(target, 'index.html');
    if (!fs.existsSync(entrypoint)) throw new Error(`Missing local project route: ${project.publicUrl}`);
  }
}

const reports = JSON.parse(fs.readFileSync(path.join(root, 'data/reports.json'), 'utf8'));
for (const report of reports) {
  const target = path.resolve(root, report.publicUrl);
  if (!fs.existsSync(target)) throw new Error(`Missing report route: ${report.publicUrl}`);
}

const externalProjectPaths = new Set(
  projects
    .filter((project) => project.repository !== manifest.repository)
    .map((project) => `/${path.relative(repositoryRoot, path.resolve(root, project.publicUrl)).replaceAll(path.sep, '/')}/`)
);
const htmlFiles = repositoryFiles.filter((filename) => filename.endsWith('.html'));
let localLinkCount = 0;
for (const filename of htmlFiles) {
  const source = fs.readFileSync(filename, 'utf8');
  for (const match of source.matchAll(/\b(?:href|src)=["']([^"'#]+)["']/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(reference)) continue;
    if (reference.includes('${') || reference.startsWith('/cdn-cgi/')) continue;

    const pathname = reference.split(/[?#]/, 1)[0];
    const normalizedPublicPath = pathname.startsWith('/') && !path.extname(pathname)
      ? `${pathname.replace(/\/+$/, '')}/`
      : pathname;
    if ([...externalProjectPaths].some((projectPath) => normalizedPublicPath.startsWith(projectPath))) continue;
    const target = pathname.startsWith('/')
      ? path.join(repositoryRoot, pathname)
      : path.resolve(path.dirname(filename), pathname);
    const entrypoint = fs.existsSync(target) && fs.statSync(target).isDirectory()
      ? path.join(target, 'index.html')
      : target;
    if (!fs.existsSync(entrypoint)) {
      throw new Error(`Broken local link in ${path.relative(repositoryRoot, filename)}: ${reference}`);
    }
    localLinkCount += 1;
  }
}

console.log(`Validated ${allJsonFiles.length} JSON files, scanned ${secretScanFiles.length} public source files, checked ${localAssets.length} public assets and ${localLinkCount} local links.`);
