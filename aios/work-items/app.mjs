import {
  STATUS_ORDER,
  allowedTransitions,
  buildExecutionCommand,
  countByStatus,
  filterWorkItems
} from './engine.mjs';
import {
  LocalDemoAdapter,
  ReadOnlyDriveSnapshotAdapter
} from './adapters.mjs';

const sourceAdapter = new ReadOnlyDriveSnapshotAdapter({ snapshotUrl: '../../work-items.json' });
const adapter = new LocalDemoAdapter({
  sourceAdapter,
  storage: globalThis.localStorage
});

const state = {
  snapshot: null,
  items: [],
  selectedId: null,
  quickView: 'ALL'
};

const elements = {
  metrics: document.querySelector('#metrics'),
  registerState: document.querySelector('#register-state'),
  tableWrap: document.querySelector('#table-wrap'),
  rows: document.querySelector('#work-item-rows'),
  cards: document.querySelector('#work-item-cards'),
  filters: document.querySelector('#filters'),
  search: document.querySelector('#search'),
  status: document.querySelector('#status-filter'),
  priority: document.querySelector('#priority-filter'),
  owner: document.querySelector('#owner-filter'),
  module: document.querySelector('#module-filter'),
  dialog: document.querySelector('#detail-dialog'),
  detailId: document.querySelector('#detail-id'),
  detailTitle: document.querySelector('#detail-title'),
  detailContent: document.querySelector('#detail-content'),
  warning: document.querySelector('#governance-warning'),
  warningMessage: document.querySelector('#governance-message'),
  syncStatus: document.querySelector('#sync-status'),
  syncTime: document.querySelector('#sync-time'),
  toast: document.querySelector('#toast')
};

await load();

async function load() {
  showLoading();
  try {
    state.snapshot = await adapter.sync();
    state.items = state.snapshot.items;
    hydrateFilters();
    renderSync();
    render();
  } catch (error) {
    showError(error);
  }
}

function render() {
  renderMetrics();
  const filters = currentFilters();
  let items = filterWorkItems(state.items, filters);
  items = applyQuickView(items, state.quickView);

  elements.registerState.hidden = items.length > 0;
  elements.tableWrap.hidden = items.length === 0;
  elements.cards.hidden = items.length === 0;
  if (!items.length) {
    elements.registerState.className = 'state';
    elements.registerState.textContent = 'No work items match these filters.';
  }

  elements.rows.innerHTML = items.map((item) => `
    <tr>
      <td><span class="priority-badge">${safe(item.priority)}</span></td>
      <td>
        <button class="row-button" type="button" data-open="${safe(item.id)}">${safe(item.id)} · ${safe(item.title)}</button>
        <div class="subtext">${safe(item.legacyIds?.join(', ') || 'No legacy ID')}</div>
      </td>
      <td><span class="status-badge ${statusClass(item.status)}">${statusLabel(item.status)}</span></td>
      <td>${safe(item.module)}</td>
      <td>${safe(item.owner)}</td>
      <td>${formatDate(item.updatedAt)}</td>
    </tr>
  `).join('');

  elements.cards.innerHTML = items.map((item) => `
    <button class="work-card" type="button" data-open="${safe(item.id)}">
      <span class="work-card-head">
        <span><span class="priority-badge">${safe(item.priority)}</span> ${safe(item.id)}</span>
        <span class="status-badge ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </span>
      <strong>${safe(item.title)}</strong>
      <span class="subtext">${safe(item.module)} · ${safe(item.owner)} · ${formatDate(item.updatedAt)}</span>
    </button>
  `).join('');
}

function renderMetrics() {
  const counts = countByStatus(state.items);
  const active = counts.READY + counts.IN_PROGRESS + counts.REVIEW + counts.CHANGES_REQUESTED;
  const metrics = [
    ['Total work items', state.items.length],
    ['Active', active],
    ['Blocked', counts.BLOCKED],
    ['Completed', counts.COMPLETED]
  ];
  elements.metrics.innerHTML = metrics.map(([label, value]) => `
    <article class="metric"><div class="label">${label}</div><div class="value">${value}</div></article>
  `).join('');
}

function renderSync() {
  const staleAt = Date.parse(state.snapshot.cache?.lastSuccessfulSync || 0);
  const freshFor = Number(state.snapshot.cache?.freshForMinutes || 0) * 60_000;
  const stale = !staleAt || Date.now() - staleAt > freshFor;
  elements.syncStatus.textContent = stale
    ? 'Snapshot loaded · stale data warning'
    : 'Snapshot loaded · Drive writes disabled';
  elements.syncTime.textContent = `Snapshot generated ${formatDate(state.snapshot.generatedAt, true)}`;

  const missing = state.snapshot.governance?.documents?.filter((document) => !document.available) || [];
  const drafts = state.snapshot.governance?.documents?.filter((document) => document.status === 'DRAFT') || [];
  if (missing.length || state.snapshot.governance?.complete === false) {
    elements.warning.hidden = false;
    elements.warningMessage.textContent = missing.length
      ? `Missing: ${missing.map((document) => document.name).join(', ')}.`
      : `Drafts awaiting human approval: ${drafts.map((document) => document.name).join(', ')}.`;
  }
}

function openDetail(id) {
  state.selectedId = id;
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) return;
  const transitions = allowedTransitions(item.status);
  const criteriaComplete = item.acceptanceCriteria?.filter((criterion) => criterion.completed).length || 0;
  elements.detailId.textContent = `${item.id} · ${item.legacyIds?.join(', ') || 'No legacy ID'}`;
  elements.detailTitle.textContent = item.title;
  elements.detailContent.innerHTML = `
    <div class="detail-grid">
      ${detailCell('Priority', item.priority)}
      ${detailCell('Status', statusLabel(item.status))}
      ${detailCell('Owner', item.owner)}
      ${detailCell('Module', item.module)}
    </div>
    <section class="detail-section">
      <h3>Objective</h3>
      <p>${safe(item.summary)}</p>
    </section>
    <section class="detail-section">
      <h3>Source and privacy</h3>
      <p class="private-note">The full task remains private. Open the authenticated Google Drive source to read it before execution; this public dashboard never republishes raw specification content.</p>
      <div class="actions">
        <a class="button" href="${safeUrl(item.source.url)}" target="_blank" rel="noreferrer">Open full source specification</a>
        <button class="button" type="button" data-copy="${safe(item.id)}">Copy work item ID</button>
      </div>
    </section>
    <section class="detail-section">
      <h3>Codex execution command</h3>
      <div class="command">${safe(buildExecutionCommand(item))}</div>
      <div class="actions"><button class="button" type="button" data-copy-command="${safe(item.id)}">Copy command</button></div>
    </section>
    <section class="detail-section">
      <h3>Acceptance criteria · ${criteriaComplete}/${item.acceptanceCriteria?.length || 0}</h3>
      <ul class="criteria">
        ${(item.acceptanceCriteria || []).map((criterion) => `
          <li class="${criterion.completed ? 'pass' : ''}">${criterion.completed ? '✓' : '○'} ${safe(criterion.label)}</li>
        `).join('')}
      </ul>
    </section>
    <section class="detail-section">
      <h3>Dependencies and blockers</h3>
      <ul>
        ${(item.dependencies || []).map((dependency) => `<li>${safe(dependency.id)} · ${safe(dependency.status)} — ${safe(dependency.reason)}</li>`).join('') || '<li>None recorded.</li>'}
        ${(item.blockers || []).map((blocker) => `<li>${safe(blocker)}</li>`).join('')}
      </ul>
    </section>
    <section class="detail-section">
      <h3>Change status · local demo</h3>
      ${transitions.length ? `
        <form class="transition-form" id="transition-form">
          <label>Next status
            <select name="nextStatus">${transitions.map((status) => `<option value="${status}">${statusLabel(status)}</option>`).join('')}</select>
          </label>
          <label>Reason or completion override
            <textarea name="reason" placeholder="Required for Blocked, Changes requested, or incomplete completion"></textarea>
          </label>
          <label><input type="checkbox" name="approved"> Approval recorded (required for Backlog → Ready)</label>
          <button class="button primary" type="submit">Save local demo change</button>
        </form>
      ` : '<p class="subtext">No further transition is available from this status.</p>'}
    </section>
    <section class="detail-section">
      <h3>Activity</h3>
      <ul class="activity">
        ${(item.activity || []).slice().reverse().map((entry) => `
          <li><strong>${safe(activityLabel(entry))}</strong><br><span class="subtext">${safe(entry.actor)} · ${formatDate(entry.at, true)} · ${safe(entry.mode)}</span><br>${safe(entry.reason)}</li>
        `).join('')}
      </ul>
    </section>
  `;
  if (!elements.dialog.open) elements.dialog.showModal();
}

async function submitTransition(form) {
  const item = state.items.find((candidate) => candidate.id === state.selectedId);
  if (!item) return;
  const data = new FormData(form);
  const nextStatus = String(data.get('nextStatus'));
  const reason = String(data.get('reason') || '').trim();
  if (['COMPLETED', 'ARCHIVED'].includes(nextStatus) && !globalThis.confirm(`Move ${item.id} to ${nextStatus}? This is a local demo change only.`)) return;
  try {
    const updated = await adapter.updateWorkItem(item.id, nextStatus, {
      actor: 'Local demo user',
      approved: data.get('approved') === 'on',
      reason,
      overrideReason: nextStatus === 'COMPLETED' ? reason : ''
    });
    state.items = state.items.map((candidate) => candidate.id === updated.id ? updated : candidate);
    render();
    openDetail(updated.id);
    showToast(`${updated.id} moved to ${statusLabel(updated.status)} locally.`);
  } catch (error) {
    showToast(error.message, true);
  }
}

function hydrateFilters() {
  for (const status of STATUS_ORDER) elements.status.add(new Option(statusLabel(status), status));
  addUniqueOptions(elements.owner, state.items.map((item) => item.owner));
  addUniqueOptions(elements.module, state.items.map((item) => item.module));
}

function currentFilters() {
  return {
    query: elements.search.value,
    status: elements.status.value,
    priority: elements.priority.value,
    owner: elements.owner.value,
    module: elements.module.value
  };
}

function applyQuickView(items, view) {
  if (view === 'ACTIVE') return items.filter((item) => ['READY', 'IN_PROGRESS', 'REVIEW', 'CHANGES_REQUESTED'].includes(item.status));
  if (view === 'BLOCKED') return items.filter((item) => item.status === 'BLOCKED');
  if (view === 'DONE') return items.filter((item) => ['COMPLETED', 'ARCHIVED'].includes(item.status));
  return items;
}

function showLoading() {
  elements.registerState.hidden = false;
  elements.registerState.className = 'state';
  elements.registerState.textContent = 'Loading work items…';
}

function showError(error) {
  elements.registerState.hidden = false;
  elements.registerState.className = 'state error';
  elements.registerState.textContent = `Work item register unavailable: ${error.message}`;
  elements.syncStatus.textContent = 'Drive snapshot unavailable';
  elements.syncTime.textContent = 'Check the repository snapshot and try again.';
}

function showToast(message, error = false) {
  elements.toast.textContent = message;
  elements.toast.style.borderColor = error ? '#713c42' : '';
  elements.toast.hidden = false;
  globalThis.setTimeout(() => { elements.toast.hidden = true; }, 3500);
}

function detailCell(label, value) {
  return `<div class="detail-cell"><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`;
}

function activityLabel(entry) {
  return entry.type === 'status_changed'
    ? `${statusLabel(entry.from)} → ${statusLabel(entry.to)}`
    : 'Work item registered';
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status) {
  return String(status || '').toLowerCase();
}

function formatDate(value, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-HK', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {})
  }).format(date);
}

function addUniqueOptions(select, values) {
  for (const value of [...new Set(values.filter(Boolean))].sort()) select.add(new Option(value, value));
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? safe(url.href) : '#';
  } catch {
    return '#';
  }
}

elements.filters.addEventListener('input', render);
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
  state.quickView = button.dataset.view;
  document.querySelectorAll('[data-view]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
  render();
}));
document.addEventListener('click', async (event) => {
  const openButton = event.target.closest('[data-open]');
  if (openButton) openDetail(openButton.dataset.open);
  const copyButton = event.target.closest('[data-copy]');
  if (copyButton) {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    showToast('Work item ID copied.');
  }
  const commandButton = event.target.closest('[data-copy-command]');
  if (commandButton) {
    const item = state.items.find((candidate) => candidate.id === commandButton.dataset.copyCommand);
    await navigator.clipboard.writeText(buildExecutionCommand(item));
    showToast('Codex command copied.');
  }
});
document.querySelector('#close-detail').addEventListener('click', () => elements.dialog.close());
elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});
elements.detailContent.addEventListener('submit', (event) => {
  if (event.target.id === 'transition-form') {
    event.preventDefault();
    submitTransition(event.target);
  }
});
document.querySelector('#reset-demo').addEventListener('click', async () => {
  adapter.clearLocalChanges();
  await load();
  if (elements.dialog.open) elements.dialog.close();
  showToast('Local demo changes cleared.');
});
