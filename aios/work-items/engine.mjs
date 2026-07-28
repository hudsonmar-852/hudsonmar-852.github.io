export const STATUS_ORDER = Object.freeze([
  'BACKLOG',
  'READY',
  'IN_PROGRESS',
  'REVIEW',
  'CHANGES_REQUESTED',
  'BLOCKED',
  'COMPLETED',
  'ARCHIVED'
]);

export const PRIORITY_ORDER = Object.freeze(['P0', 'P1', 'P2', 'P3', 'P4']);

const STANDARD_TRANSITIONS = Object.freeze({
  BACKLOG: ['READY'],
  READY: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['REVIEW', 'BLOCKED'],
  REVIEW: ['COMPLETED', 'CHANGES_REQUESTED', 'BLOCKED'],
  CHANGES_REQUESTED: ['IN_PROGRESS', 'BLOCKED'],
  BLOCKED: ['READY', 'IN_PROGRESS'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: []
});

export class WorkItemError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'WorkItemError';
    this.code = code;
  }
}

export function allowedTransitions(status) {
  if (!STATUS_ORDER.includes(status)) {
    throw new WorkItemError('UNKNOWN_STATUS', `Unknown work item status: ${status}`);
  }
  return [...STANDARD_TRANSITIONS[status]];
}

export function validateTransition(item, nextStatus, options = {}) {
  if (!item || !item.id) {
    throw new WorkItemError('INVALID_ITEM', 'A work item with an ID is required.');
  }
  if (!allowedTransitions(item.status).includes(nextStatus)) {
    throw new WorkItemError(
      'INVALID_TRANSITION',
      `${item.status} cannot transition to ${nextStatus}.`
    );
  }
  if (item.status === 'BACKLOG' && nextStatus === 'READY' && options.approved !== true) {
    throw new WorkItemError(
      'APPROVAL_REQUIRED',
      'Chief Architect or authorized PMO approval is required before READY.'
    );
  }
  if (['BLOCKED', 'CHANGES_REQUESTED'].includes(nextStatus) && !clean(options.reason)) {
    throw new WorkItemError(
      'REASON_REQUIRED',
      `A reason is required when moving a work item to ${nextStatus}.`
    );
  }
  if (nextStatus === 'COMPLETED') {
    const criteria = item.acceptanceCriteria || [];
    const allComplete = criteria.length > 0 && criteria.every((criterion) => criterion.completed);
    if (!allComplete && !clean(options.overrideReason)) {
      throw new WorkItemError(
        'COMPLETION_GATE',
        'All acceptance criteria must pass, or an override reason must be recorded.'
      );
    }
  }
  return true;
}

export function transitionWorkItem(item, nextStatus, options = {}) {
  validateTransition(item, nextStatus, options);
  const changedAt = options.changedAt || new Date().toISOString();
  const actor = clean(options.actor) || 'Local demo user';
  const reason = clean(options.reason) || clean(options.overrideReason) || 'Standard workflow transition';
  return {
    ...structuredClone(item),
    status: nextStatus,
    updatedAt: changedAt,
    activity: [
      ...(item.activity || []),
      {
        type: 'status_changed',
        from: item.status,
        to: nextStatus,
        actor,
        reason,
        at: changedAt,
        mode: options.mode || 'local_demo'
      }
    ]
  };
}

export function countByStatus(items) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const item of items || []) {
    if (Object.hasOwn(counts, item.status)) counts[item.status] += 1;
  }
  return counts;
}

export function sortWorkItems(items) {
  return [...(items || [])].sort((left, right) => {
    const priorityDifference =
      priorityIndex(left.priority) - priorityIndex(right.priority);
    if (priorityDifference !== 0) return priorityDifference;
    const leftUpdated = Date.parse(left.updatedAt || left.createdAt || 0) || 0;
    const rightUpdated = Date.parse(right.updatedAt || right.createdAt || 0) || 0;
    if (leftUpdated !== rightUpdated) return rightUpdated - leftUpdated;
    return String(left.id).localeCompare(String(right.id));
  });
}

export function filterWorkItems(items, filters = {}) {
  const query = clean(filters.query).toLocaleLowerCase('en');
  return sortWorkItems(items).filter((item) => {
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'ALL' && item.priority !== filters.priority) return false;
    if (filters.owner && filters.owner !== 'ALL' && item.owner !== filters.owner) return false;
    if (filters.module && filters.module !== 'ALL' && item.module !== filters.module) return false;
    if (!query) return true;
    const haystack = [
      item.id,
      ...(item.legacyIds || []),
      item.title,
      item.summary,
      item.owner,
      item.module
    ].join(' ').toLocaleLowerCase('en');
    return haystack.includes(query);
  });
}

export function parseTaskSpecification(source) {
  const text = String(source || '');
  const valueAfter = (labels) => {
    for (const label of labels) {
      const match = text.match(new RegExp(`^\\s*${escapeRegExp(label)}\\s*[:：]\\s*(.+)$`, 'im'));
      if (match) return clean(match[1]);
    }
    return '';
  };
  const legacyId =
    valueAfter(['Task ID', 'Legacy Task ID']) ||
    text.match(/\bTASK-\d{8}-\d{3}\b/)?.[0] ||
    '';
  const preferredId =
    valueAfter(['Work Item ID', 'Preferred Work Item ID', 'WI ID']) ||
    text.match(/\bWI-\d{8}-\d{3}\b/)?.[0] ||
    '';
  return {
    id: preferredId,
    legacyId,
    title: valueAfter(['Title', 'Task Title']),
    status: valueAfter(['Status']).toUpperCase(),
    priority: valueAfter(['Priority']).toUpperCase(),
    owner: valueAfter(['Owner']),
    module: valueAfter(['Module'])
  };
}

export function detectSourceConflict(item, parsedSpecification) {
  const checks = [
    ['id', item.id, parsedSpecification.id],
    ['legacyId', item.legacyIds?.[0], parsedSpecification.legacyId],
    ['title', item.title, parsedSpecification.title],
    ['status', item.status, parsedSpecification.status],
    ['priority', item.priority, parsedSpecification.priority]
  ];
  return checks
    .filter(([, indexValue, sourceValue]) => clean(sourceValue) && clean(indexValue) !== clean(sourceValue))
    .map(([field, indexValue, sourceValue]) => ({ field, indexValue, sourceValue }));
}

export function buildExecutionCommand(item) {
  const legacyReference = item.legacyIds?.[0] ? ` (${item.legacyIds[0]})` : '';
  return `Execute ${item.id}${legacyReference}: ${item.title}. Read the full source specification before changing code.`;
}

function priorityIndex(priority) {
  const index = PRIORITY_ORDER.indexOf(priority);
  return index === -1 ? PRIORITY_ORDER.length : index;
}

function clean(value) {
  return String(value ?? '').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
