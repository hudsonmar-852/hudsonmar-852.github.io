import {
  buildExecutionCommand,
  transitionWorkItem,
  WorkItemError
} from './engine.mjs';

export class ReadOnlyDriveSnapshotAdapter {
  constructor({ snapshotUrl, fetchImpl = globalThis.fetch } = {}) {
    this.snapshotUrl = snapshotUrl;
    this.fetchImpl = fetchImpl;
    this.snapshot = null;
  }

  async sync() {
    if (typeof this.fetchImpl !== 'function') {
      throw new WorkItemError('SYNC_UNAVAILABLE', 'No fetch implementation is available.');
    }
    const response = await this.fetchImpl.call(globalThis, this.snapshotUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new WorkItemError(
        'DRIVE_SYNC_FAILED',
        `Read-only Drive snapshot failed with HTTP ${response.status}.`
      );
    }
    const snapshot = await response.json();
    validateSnapshot(snapshot);
    this.snapshot = snapshot;
    return structuredClone(snapshot);
  }

  async listWorkItems() {
    const snapshot = this.snapshot || await this.sync();
    return structuredClone(snapshot.items);
  }

  async getWorkItem(id) {
    const item = (await this.listWorkItems()).find((candidate) =>
      candidate.id === id || candidate.legacyIds?.includes(id)
    );
    if (!item) throw new WorkItemError('NOT_FOUND', `Work item not found: ${id}`);
    return item;
  }

  async updateWorkItem() {
    throw new WorkItemError(
      'READ_ONLY_DRIVE',
      'Google Drive writes require a private server-side adapter and are not enabled.'
    );
  }

  async createWorkItem() {
    return this.updateWorkItem();
  }

  async getGovernanceDocument(name) {
    const snapshot = this.snapshot || await this.sync();
    const reference = snapshot.governance?.documents?.find((document) => document.name === name);
    if (!reference?.available) {
      throw new WorkItemError('GOVERNANCE_MISSING', `Governance document is unavailable: ${name}`);
    }
    return structuredClone(reference);
  }
}

export class LocalDemoAdapter {
  constructor({ sourceAdapter, storage, storageKey = 'aios.work-items.demo.v1' }) {
    this.sourceAdapter = sourceAdapter;
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async sync() {
    const snapshot = await this.sourceAdapter.sync();
    return { ...snapshot, items: mergeItems(snapshot.items, this.readOverrides()) };
  }

  async listWorkItems() {
    const snapshot = await this.sync();
    return snapshot.items;
  }

  async getWorkItem(id) {
    const item = (await this.listWorkItems()).find((candidate) =>
      candidate.id === id || candidate.legacyIds?.includes(id)
    );
    if (!item) throw new WorkItemError('NOT_FOUND', `Work item not found: ${id}`);
    return item;
  }

  async updateWorkItem(id, nextStatus, options = {}) {
    const item = await this.getWorkItem(id);
    const updated = transitionWorkItem(item, nextStatus, {
      ...options,
      mode: 'local_demo'
    });
    const overrides = this.readOverrides().filter((candidate) => candidate.id !== updated.id);
    this.writeOverrides([...overrides, updated]);
    return updated;
  }

  async createWorkItem() {
    throw new WorkItemError(
      'CREATE_DISABLED',
      'Creating work items is disabled until authenticated Drive writes are available.'
    );
  }

  async getGovernanceDocument(name) {
    return this.sourceAdapter.getGovernanceDocument(name);
  }

  executionCommand(item) {
    return buildExecutionCommand(item);
  }

  clearLocalChanges() {
    this.storage?.removeItem(this.storageKey);
  }

  readOverrides() {
    if (!this.storage) return [];
    try {
      const value = JSON.parse(this.storage.getItem(this.storageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  writeOverrides(items) {
    if (!this.storage) {
      throw new WorkItemError('STORAGE_UNAVAILABLE', 'Local demo storage is unavailable.');
    }
    this.storage.setItem(this.storageKey, JSON.stringify(items));
  }
}

function mergeItems(baseItems, overrides) {
  const overrideMap = new Map(overrides.map((item) => [item.id, item]));
  return baseItems.map((item) => overrideMap.get(item.id) || item);
}

function validateSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.items)) {
    throw new WorkItemError('INVALID_SNAPSHOT', 'Work item snapshot must contain an items array.');
  }
}
