import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../work-items/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../work-items/app.mjs', import.meta.url), 'utf8');
const dashboard = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Work Items page includes the critical accessible workflow surfaces', () => {
  assert.match(page, /id="work-items"/);
  assert.match(page, /id="filters"/);
  assert.match(page, /id="detail-dialog"/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /Local demo update mode/);
  assert.match(page, /Read-only Drive snapshot/);
});

test('page exposes exactly one additive navigation route from AIOS Project Control', () => {
  assert.match(dashboard, /href="\.\/work-items\/"/);
  assert.match(dashboard, /Open Work Items/);
});

test('copy behavior uses only the requested ID or generated execution command', () => {
  assert.match(app, /navigator\.clipboard\.writeText\(copyButton\.dataset\.copy\)/);
  assert.match(app, /navigator\.clipboard\.writeText\(buildExecutionCommand\(item\)\)/);
});

test('runtime provides loading, empty, error, stale and confirmation states', () => {
  assert.match(app, /Loading work items/);
  assert.match(app, /No work items match/);
  assert.match(app, /Work item register unavailable/);
  assert.match(app, /stale data warning/);
  assert.match(app, /globalThis\.confirm/);
  assert.match(app, /Drafts awaiting human approval/);
});
