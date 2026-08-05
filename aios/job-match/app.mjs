import { recommendation } from "./engine.mjs";

const STORAGE_KEY = "aios-job-match-decisions-v1";
const STATUSES = ["NEW", "FAVOURITE", "APPLIED", "NOT_SUITABLE"];
const state = { board: null, filter: "ALL", query: "", decisions: loadDecisions() };

const root = document.querySelector("#job-list");
const metricsRoot = document.querySelector("#metrics");
const notice = document.querySelector("#notice");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function loadDecisions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
}

function statusFor(job) {
  return state.decisions[job.id]?.status || job.status || "NEW";
}

function setStatus(jobId, status) {
  if (!STATUSES.includes(status)) return;
  state.decisions[jobId] = { status, updatedAt: new Date().toISOString() };
  saveDecisions();
  render();
  notice.textContent = `Status saved locally: ${status.replace("_", " ")}`;
}

function metric(label, value) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function renderMetrics() {
  const m = state.board.metrics;
  metricsRoot.innerHTML = [
    metric("Collected", m.collected), metric("Duplicates removed", m.duplicatesRemoved),
    metric("Qualified", m.qualified), metric("Today's list", state.board.jobs.length)
  ].join("");
}

function render() {
  if (!state.board) return;
  renderMetrics();
  const query = state.query.toLowerCase();
  const jobs = state.board.jobs.filter((job) => {
    const status = statusFor(job);
    const statusMatch = state.filter === "ALL" || status === state.filter;
    const queryMatch = `${job.title} ${job.company} ${job.location} ${job.summary}`.toLowerCase().includes(query);
    return statusMatch && queryMatch;
  });
  root.innerHTML = jobs.length ? jobs.map((job) => {
    const status = statusFor(job);
    return `<article class="job-card">
      <div class="score"><strong>${escapeHtml(job.score)}</strong><span>${escapeHtml(recommendation(job.score))}</span></div>
      <div class="job-body">
        <div class="job-heading"><div><p class="company">${escapeHtml(job.company)}</p><h2>${escapeHtml(job.title)}</h2></div><span class="status status-${escapeHtml(status.toLowerCase())}">${escapeHtml(status.replace("_", " "))}</span></div>
        <p class="meta">${escapeHtml(job.location || "Location not provided")} ${job.workingMode ? `· ${escapeHtml(job.workingMode)}` : ""} ${job.postedAt ? `· Posted ${escapeHtml(new Date(job.postedAt).toLocaleDateString("en-HK"))}` : ""}${job.verifiedAt ? ` · Verified ${escapeHtml(new Date(job.verifiedAt).toLocaleDateString("en-HK"))}` : ""}</p>
        <p>${escapeHtml(job.summary)}</p>
        <div class="insights"><div><strong>Why it matches</strong><ul>${job.reasons.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div><div><strong>Review before applying</strong><ul>${job.risks.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div></div>
        <div class="actions"><a class="primary" href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer">View / Apply ↗</a><button data-status="FAVOURITE" data-id="${escapeHtml(job.id)}">Favourite</button><button data-status="APPLIED" data-id="${escapeHtml(job.id)}">Applied</button><button data-status="NOT_SUITABLE" data-id="${escapeHtml(job.id)}">Not suitable</button></div>
      </div>
    </article>`;
  }).join("") : '<div class="empty"><strong>No jobs in this view.</strong><p>Try another filter or search term.</p></div>';
}

document.querySelector("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
  render();
});
document.querySelector("#search").addEventListener("input", (event) => { state.query = event.target.value.trim(); render(); });
root.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-status]");
  if (button) setStatus(button.dataset.id, button.dataset.status);
});

fetch("./data/current.json", { cache: "no-store" }).then((response) => {
  if (!response.ok) throw new Error(`Daily board unavailable (${response.status})`);
  return response.json();
}).then((board) => {
  if (!Array.isArray(board.jobs)) throw new TypeError("Daily board has an invalid jobs collection");
  state.board = board;
  document.querySelector("#board-date").textContent = board.boardDate;
  document.querySelector("#mode").textContent = board.mode === "demo" ? "Demo data" : board.mode === "public-live" ? "Verified public listings" : "Private daily output";
  render();
}).catch((error) => {
  metricsRoot.innerHTML = "";
  root.innerHTML = `<div class="empty error"><strong>Daily job list could not load.</strong><p>${escapeHtml(error.message)}</p><button onclick="location.reload()">Retry</button></div>`;
});
