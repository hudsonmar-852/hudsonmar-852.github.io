import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../services/drive-file-service/Code.js', import.meta.url), 'utf8');
const iterator = (items) => { let i = 0; return { hasNext: () => i < items.length, next: () => items[i++] }; };
class Folder {
  constructor(id, name, parent = null) { this.id = id; this.name = name; this.parent = parent; this.files = []; this.folders = []; }
  getId() { return this.id; } getName() { return this.name; } setName(v) { this.name = v; } getUrl() { return `folder:${this.id}`; } getLastUpdated() { return new Date(0); }
  getParents() { return iterator(this.parent ? [this.parent] : []); } getFiles() { return iterator(this.files); } getFolders() { return iterator(this.folders); }
  getFilesByName(n) { return iterator(this.files.filter((x) => x.name === n)); } getFoldersByName(n) { return iterator(this.folders.filter((x) => x.name === n)); }
  createFile(n, c, m) { const x = new File(`f${registry.size}`, n, c, m, this); this.files.push(x); registry.set(x.id, x); return x; }
  createFolder(n) { const x = new Folder(`d${registry.size}`, n, this); this.folders.push(x); registry.set(x.id, x); return x; }
  moveTo(p) { this.parent.folders = this.parent.folders.filter((x) => x !== this); this.parent = p; p.folders.push(this); }
}
class File {
  constructor(id, name, content, mime, parent) { this.id = id; this.name = name; this.content = content; this.mime = mime; this.parent = parent; }
  getId() { return this.id; } getName() { return this.name; } setName(v) { this.name = v; } getUrl() { return `file:${this.id}`; } getLastUpdated() { return new Date(0); }
  getParents() { return iterator([this.parent]); } getBlob() { return { getDataAsString: () => this.content }; } setContent(v) { this.content = v; }
  moveTo(p) { this.parent.files = this.parent.files.filter((x) => x !== this); this.parent = p; p.files.push(this); }
}
let registry;
function setup(propertyOverrides = {}) {
  registry = new Map(); const root = new Folder('root', 'Hudson AIOS'); const outside = new Folder('outside', 'Outside'); registry.set(root.id, root); registry.set(outside.id, outside);
  const properties = { DRIVE_FILE_SERVICE_SECRET: 'secret', AIOS_ROOT_FOLDER_ID: 'root', ...propertyOverrides };
  const context = { JSON, String, Error, Date, Object, Array, console: { log: () => {} }, Utilities: { getUuid: () => 'request-1', newBlob: (v) => ({ getBytes: () => Buffer.from(v) }) }, PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => properties[k] }) }, DriveApp: { getFolderById: (id) => { const x = registry.get(id); if (!(x instanceof Folder)) throw new Error('Folder inaccessible'); return x; }, getFileById: (id) => { const x = registry.get(id); if (!(x instanceof File)) throw new Error('File inaccessible'); return x; } }, ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this; } }) } };
  vm.createContext(context); vm.runInContext(source, context); return { api: context, root, outside };
}
const post = (api, body) => JSON.parse(api.doPost({ postData: { contents: JSON.stringify(body) } }).text);
test('Drive service supports the complete non-destructive lifecycle', () => {
  const { api, root } = setup(); const a = root.createFolder('A'); const b = root.createFolder('B');
  const created = post(api, { secret: 'secret', command: 'create', folderId: a.id, name: 'note.md', mimeType: 'text/markdown', content: 'one' }).result;
  assert.equal(post(api, { secret: 'secret', command: 'read', fileId: created.id }).result.content, 'one');
  post(api, { secret: 'secret', command: 'update', fileId: created.id, content: 'two' }); post(api, { secret: 'secret', command: 'append', fileId: created.id, content: ' three' });
  post(api, { secret: 'secret', command: 'rename', targetId: created.id, name: 'renamed.md' }); post(api, { secret: 'secret', command: 'move', targetId: created.id, destinationFolderId: b.id });
  assert.equal(post(api, { secret: 'secret', command: 'search', query: 'renamed' }).result.matches[0].name, 'renamed.md'); assert.equal(b.files[0].content, 'two three');
});
test('Drive service rejects invalid secrets and outside-root access', () => {
  const { api, outside } = setup(); const file = outside.createFile('private.txt', 'x', 'text/plain');
  assert.equal(post(api, { secret: 'wrong', command: 'list_folder' }).error.code, 'UNAUTHORIZED'); assert.equal(post(api, { secret: 'secret', command: 'read', fileId: file.id }).error.code, 'OUTSIDE_ROOT');
});
test('authorization check reads configured folders, five files, and parents without mutations', () => {
  const ids = ['source-1', 'source-2', 'source-3', 'source-4', 'source-5'];
  const { api, root } = setup({ AIOS_COMMUNICATION_FOLDER_ID: 'communication', AIOS_PENDING_SOURCE_FILE_IDS: ids.join(',') });
  const communication = new Folder('communication', 'Communication', root); root.folders.push(communication); registry.set(communication.id, communication);
  for (const id of ids) { const file = new File(id, `${id}.md`, 'unchanged', 'text/markdown', root); root.files.push(file); registry.set(id, file); }
  const before = root.files.map((file) => [file.id, file.name, file.content, file.parent.id]);
  const report = api.testDriveMigrationAuthorization();
  assert.equal(report.ok, true); assert.equal(report.readOnly, true); assert.equal(report.root.name, 'Hudson AIOS'); assert.equal(report.communication.name, 'Communication'); assert.equal(report.sources.length, 5);
  assert.deepEqual(root.files.map((file) => [file.id, file.name, file.content, file.parent.id]), before);
});
test('authorization check reports an inaccessible source without modifying Drive state', () => {
  const { api, root } = setup({ AIOS_COMMUNICATION_FOLDER_ID: 'communication', AIOS_PENDING_SOURCE_FILE_IDS: 'missing,source-2,source-3,source-4,source-5' });
  const communication = new Folder('communication', 'Communication', root); root.folders.push(communication); registry.set(communication.id, communication);
  for (const id of ['source-2', 'source-3', 'source-4', 'source-5']) { const file = new File(id, id, 'unchanged', 'text/plain', root); root.files.push(file); registry.set(id, file); }
  const report = api.testDriveMigrationAuthorization();
  assert.equal(report.ok, false); assert.equal(report.sources[0].accessible, false); assert.match(report.sources[0].error, /inaccessible/); assert.equal(root.files.length, 4);
});
