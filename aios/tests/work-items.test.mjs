import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  STATUS_ORDER,
  WorkItemError,
  allowedTransitions,
  buildExecutionCommand,
  countByStatus,
  detectSourceConflict,
  filterWorkItems,
  parseTaskSpecification,
  sortWorkItems,
  transitionWorkItem
} from '../work-items/engine.mjs';
import {
  LocalDemoAdapter,
  ReadOnlyDriveSnapshotAdapter
} from '../work-items/adapters.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../../work-items.json', import.meta.url)));

function item(overrides = {}) {
  return {
    id: 'WI-20260728-002',
    legacyIds: ['TASK-20260728-002'],
    title: 'Build Work Items',
    summary: 'Summary',
    priority: 'P1',
    status: 'READY',
    module: 'AIOS Dashboard / PMO',
    owner: 'Codex',
    createdAt: '2026-07-28T00:00:00Z',
    updatedAt: '2026-07-28T00:00:00Z',
    acceptanceCriteria: [{ id: 'AC-01', label: 'Done', completed: false }],
    activity: [],
    ...overrides
  };
}

test('declares the approved lifecycle and validates every standard forward transition', () => {
  assert.deepEqual(STATUS_ORDER, [
    'BACKLOG',
    'READY',
    'IN_PROGRESS',
    'REVIEW',
    'CHANGES_REQUESTED',
    'BLOCKED',
    'COMPLETED',
    'ARCHIVED'
  ]);
  assert.deepEqual(allowedTransitions('REVIEW'), ['COMPLETED', 'CHANGES_REQUESTED', 'BLOCKED']);
  assert.deepEqual(allowedTransitions('BLOCKED'), ['READY', 'IN_PROGRESS']);
  assert.throws(
    () => transitionWorkItem(item(), 'COMPLETED'),
    (error) => error instanceof WorkItemError && error.code === 'INVALID_TRANSITION'
  );
});

test('requires approval for BACKLOG to READY', () => {
  const backlog = item({ status: 'BACKLOG' });
  assert.throws(
    () => transitionWorkItem(backlog, 'READY'),
    (error) => error.code === 'APPROVAL_REQUIRED'
  );
  assert.equal(
    transitionWorkItem(backlog, 'READY', { approved: true, changedAt: '2026-07-28T01:00:00Z' }).status,
    'READY'
  );
});

test('requires reasons for BLOCKED and CHANGES_REQUESTED', () => {
  assert.throws(
    () => transitionWorkItem(item(), 'BLOCKED'),
    (error) => error.code === 'REASON_REQUIRED'
  );
  const changed = transitionWorkItem(
    item({ status: 'REVIEW' }),
    'CHANGES_REQUESTED',
    { reason: 'Regression evidence is incomplete.', changedAt: '2026-07-28T01:00:00Z' }
  );
  assert.equal(changed.activity[0].reason, 'Regression evidence is incomplete.');
});

test('enforces the completion acceptance gate and records overrides', () => {
  const review = item({ status: 'REVIEW' });
  assert.throws(
    () => transitionWorkItem(review, 'COMPLETED'),
    (error) => error.code === 'COMPLETION_GATE'
  );
  const complete = transitionWorkItem(review, 'COMPLETED', {
    overrideReason: 'Chief Architect accepted one deferred external check.',
    changedAt: '2026-07-28T01:00:00Z'
  });
  assert.equal(complete.status, 'COMPLETED');
  assert.match(complete.activity[0].reason, /Chief Architect/);
});

test('sorts by priority, then latest update time', () => {
  const sorted = sortWorkItems([
    item({ id: 'WI-3', priority: 'P2' }),
    item({ id: 'WI-2', priority: 'P0', updatedAt: '2026-07-27T00:00:00Z' }),
    item({ id: 'WI-1', priority: 'P0', updatedAt: '2026-07-28T00:00:00Z' })
  ]);
  assert.deepEqual(sorted.map((candidate) => candidate.id), ['WI-1', 'WI-2', 'WI-3']);
});

test('computes counts and filters across status, owner, module and search text', () => {
  const items = [
    item(),
    item({ id: 'WI-2', legacyIds: ['TASK-2'], title: 'Runtime test', priority: 'P2', status: 'BLOCKED', owner: 'Hudson' })
  ];
  assert.equal(countByStatus(items).BLOCKED, 1);
  assert.deepEqual(filterWorkItems(items, { status: 'BLOCKED' }).map(({ id }) => id), ['WI-2']);
  assert.deepEqual(filterWorkItems(items, { query: '20260728-002' }).map(({ id }) => id), ['WI-20260728-002']);
  assert.deepEqual(filterWorkItems(items, { owner: 'Codex', module: 'AIOS Dashboard / PMO' }).map(({ id }) => id), ['WI-20260728-002']);
});

test('parses a task specification and reports source/index conflicts', () => {
  const parsed = parseTaskSpecification(`
Task ID: TASK-20260728-002
Preferred Work Item ID: WI-20260728-002
Title: Build AIOS Work Item Dashboard
Priority: P1
Status: READY
Owner: Codex
Module: AIOS Dashboard / PMO
  `);
  assert.deepEqual(parsed, {
    id: 'WI-20260728-002',
    legacyId: 'TASK-20260728-002',
    title: 'Build AIOS Work Item Dashboard',
    status: 'READY',
    priority: 'P1',
    owner: 'Codex',
    module: 'AIOS Dashboard / PMO'
  });
  assert.deepEqual(detectSourceConflict({
    ...item(),
    title: parsed.title,
    status: 'IN_PROGRESS'
  }, parsed), [{
    field: 'status',
    indexValue: 'IN_PROGRESS',
    sourceValue: 'READY'
  }]);
});

test('builds a traceable Codex execution command', () => {
  assert.equal(
    buildExecutionCommand(item()),
    'Execute WI-20260728-002 (TASK-20260728-002): Build Work Items. Read the full source specification before changing code.'
  );
});

test('read-only adapter handles success, Drive failure and missing governance', async () => {
  let fetchReceiver;
  const adapter = new ReadOnlyDriveSnapshotAdapter({
    snapshotUrl: '/work-items.json',
    fetchImpl: async function () {
      fetchReceiver = this;
      return new Response(JSON.stringify(snapshot), { status: 200 });
    }
  });
  assert.equal((await adapter.listWorkItems()).length, 1);
  assert.equal(fetchReceiver, globalThis);
  await assert.rejects(() => adapter.updateWorkItem(), (error) => error.code === 'READ_ONLY_DRIVE');
  assert.equal(
    (await adapter.getGovernanceDocument('PRODUCT_BASELINE.md')).status,
    'DRAFT'
  );
  await assert.rejects(
    () => adapter.getGovernanceDocument('UNKNOWN.md'),
    (error) => error.code === 'GOVERNANCE_MISSING'
  );

  const failing = new ReadOnlyDriveSnapshotAdapter({
    snapshotUrl: '/work-items.json',
    fetchImpl: async () => new Response('', { status: 503 })
  });
  await assert.rejects(() => failing.sync(), (error) => error.code === 'DRIVE_SYNC_FAILED');
});

test('local demo adapter persists an audit trail without mutating the source snapshot', async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const sourceAdapter = new ReadOnlyDriveSnapshotAdapter({
    snapshotUrl: '/work-items.json',
    fetchImpl: async () => new Response(JSON.stringify(snapshot), { status: 200 })
  });
  const adapter = new LocalDemoAdapter({ sourceAdapter, storage });
  const updated = await adapter.updateWorkItem('WI-20260728-002', 'IN_PROGRESS', {
    actor: 'Test user',
    changedAt: '2026-07-28T02:00:00Z'
  });
  assert.equal(updated.status, 'IN_PROGRESS');
  assert.equal(updated.activity.at(-1).mode, 'local_demo');
  assert.equal(snapshot.items[0].status, 'READY');
  assert.equal((await adapter.getWorkItem('TASK-20260728-002')).status, 'IN_PROGRESS');
});

test('snapshot exposes explicit stale-cache inputs and never publishes private source content', () => {
  assert.equal(typeof snapshot.cache.freshForMinutes, 'number');
  assert.equal(snapshot.sourceMode, 'google_drive_read_only_snapshot');
  assert.equal(snapshot.updateMode, 'local_demo_only');
  assert.equal(snapshot.items[0].source.contentPublished, false);
  assert.equal(snapshot.items[0].source.access, 'authenticated_private');
  assert.equal(snapshot.governance.complete, false);
  assert.ok(snapshot.governance.documents.every((document) =>
    document.status === 'DRAFT' && document.repositoryPath
  ));
});
