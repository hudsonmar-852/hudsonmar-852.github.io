import {
  ENGINE_VERSION, MESSAGE_TYPES, STORAGE_KEYS, fetchHongKongContext,
  generateMessages, migrateMessages
} from './engine.mjs';

const $ = (selector) => document.querySelector(selector);
const state = {
  messages: [],
  context: null,
  members: [],
  activeMember: null
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function writeMessages() {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(state.messages));
}

function contextLabel(context) {
  if (!context?.verified) return '今日即時資料未能確認 · Evergreen fallback';
  return `Weather verified · ${context.status === 'fresh' ? 'Fresh' : 'Stale'}`;
}

function renderStatus() {
  const context = state.context;
  $('#data-status').innerHTML = `
    <strong>${contextLabel(context)}</strong>
    <span>來源：${context?.source?.name || '未確認'}</span>
    <span>Fetch：${context?.fetchedAt ? new Date(context.fetchedAt).toLocaleString('zh-HK') : '—'}</span>
    <span>Published：${context?.publishedAt ? new Date(context.publishedAt).toLocaleString('zh-HK') : '—'}</span>`;
}

function card(message) {
  const source = message.source?.url
    ? `<a href="${message.source.url}" target="_blank" rel="noreferrer">${message.source.name}</a>`
    : 'Evergreen';
  return `<article class="message-card" data-id="${message.id}">
    <div class="chips"><span>${message.category || 'Legacy'}</span><span>${message.memberLabel || 'General'}</span><span>${message.mainTheme || 'history'}</span></div>
    <textarea aria-label="可編輯訊息">${message.text || ''}</textarea>
    <div class="meta"><span>${message.dataStatus || 'history'}</span><span>${source}</span><span>${message.generatedAt ? new Date(message.generatedAt).toLocaleString('zh-HK') : '歷史訊息'}</span></div>
    <div class="tracking"><span>Used ${message.usageCount || 0}</span><span>Last copied ${message.lastCopied ? new Date(message.lastCopied).toLocaleString('zh-HK') : '—'}</span></div>
    <div class="actions">
      <button data-action="copy">Copy</button>
      <button data-action="favourite">${message.favourite ? '★ Favourite' : '☆ Favourite'}</button>
      <button data-action="regenerate">Regenerate</button>
    </div>
  </article>`;
}

function filteredMessages() {
  const type = $('#type-filter').value;
  const category = $('#category-filter').value;
  return state.messages.filter((item) => (!type || item.category === type) && (!category || item.category === category));
}

function render() {
  const visible = filteredMessages();
  $('#messages').innerHTML = visible.length ? visible.map(card).join('') : '<p class="empty">未有符合條件嘅訊息。</p>';
}

function activeProfile() {
  return state.members.find((member) => member.id === $('#member').value) || {};
}

function generate({ replaceId = null } = {}) {
  const generated = generateMessages({
    profile: activeProfile(),
    context: state.context || {},
    schedule: { hasTrainingToday: $('#training-today').checked },
    recent: state.messages.slice(0, 30),
    tone: $('#tone').value,
    count: 5
  });
  if (replaceId && generated[0]) {
    const index = state.messages.findIndex((item) => item.id === replaceId);
    if (index >= 0) state.messages.splice(index, 1, generated[0]);
  } else {
    state.messages.unshift(...generated);
  }
  writeMessages();
  render();
}

async function refreshContext() {
  $('#refresh-context').disabled = true;
  state.context = await fetchHongKongContext();
  localStorage.setItem(STORAGE_KEYS.context, JSON.stringify(state.context));
  renderStatus();
  $('#refresh-context').disabled = false;
}

function initSelectors() {
  $('#type-filter').innerHTML = '<option value="">全部類型</option>'
    + Object.values(MESSAGE_TYPES).map((value) => `<option>${value}</option>`).join('');
  $('#member').innerHTML = '<option value="">General</option>'
    + state.members.map((member) => `<option value="${member.id}">${member.nickname || member.displayName || member.id}</option>`).join('');
  const legacyCategories = [...new Set(state.messages.map((item) => item.category).filter(Boolean))].sort();
  $('#category-filter').innerHTML = '<option value="">全部 Category</option>'
    + legacyCategories.map((value) => `<option>${value}</option>`).join('');
}

$('#messages').addEventListener('input', (event) => {
  const cardElement = event.target.closest('[data-id]');
  if (!cardElement || event.target.tagName !== 'TEXTAREA') return;
  const message = state.messages.find((item) => item.id === cardElement.dataset.id);
  if (message) {
    message.text = event.target.value;
    message.editedAt = new Date().toISOString();
    writeMessages();
  }
});

$('#messages').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  const cardElement = event.target.closest('[data-id]');
  if (!button || !cardElement) return;
  const message = state.messages.find((item) => item.id === cardElement.dataset.id);
  if (!message) return;
  if (button.dataset.action === 'copy') {
    await navigator.clipboard.writeText(message.text);
    message.usageCount = (message.usageCount || 0) + 1;
    message.lastCopied = new Date().toISOString();
    writeMessages();
    render();
  } else if (button.dataset.action === 'favourite') {
    message.favourite = !message.favourite;
    writeMessages();
    render();
  } else if (button.dataset.action === 'regenerate') {
    generate({ replaceId: message.id });
  }
});

$('#generate').addEventListener('click', () => generate());
$('#refresh-context').addEventListener('click', refreshContext);
$('#type-filter').addEventListener('change', render);
$('#category-filter').addEventListener('change', render);

const migration = migrateMessages(localStorage);
state.messages = migration.messages;
state.members = read(STORAGE_KEYS.members, []);
state.context = read(STORAGE_KEYS.context, null);
initSelectors();
renderStatus();
render();
$('#version').textContent = `Jeffrey Relationship Messaging Engine v${ENGINE_VERSION}`;

const isFresh = state.context?.fetchedAt && Date.now() - Date.parse(state.context.fetchedAt) < 30 * 60 * 1000;
if (!isFresh) refreshContext();
