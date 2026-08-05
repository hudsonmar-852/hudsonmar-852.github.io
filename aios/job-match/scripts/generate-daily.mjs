#!/usr/bin/env node
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { matchJobs, recommendation } from "../engine.mjs";

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=")];
}));

const inputPath = resolve(args.input || `${moduleRoot}/data/sample-alerts.json`);
const profilePath = resolve(args.profile || `${moduleRoot}/config/career-match-profile.example.json`);
const historyPath = args.history ? resolve(args.history) : null;
const outputPath = resolve(args.output || `${moduleRoot}/data/current.json`);
const reportPath = resolve(args.report || `${moduleRoot}/reports/latest.md`);
const runHistoryPath = resolve(args["run-history"] || `${dirname(outputPath)}/run-history.json`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path, fallback) {
  try { return await readJson(path); } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function atomicWrite(path, content) {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, path);
}

function hongKongDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function markdown(board) {
  const lines = [
    `# AIOS Daily Job Match — ${board.boardDate}`,
    "",
    `Generated: ${board.generatedAt}`,
    "",
    `Collected ${board.metrics.collected}; removed ${board.metrics.duplicatesRemoved} duplicates; selected ${board.metrics.selected}.`,
    ""
  ];
  board.jobs.forEach((job, index) => {
    lines.push(
      `## ${index + 1}. ${job.title} — ${job.company}`,
      "",
      `- Match: **${job.score}/100 — ${recommendation(job.score)}**`,
      `- Location: ${job.location || "Not provided"}${job.workingMode ? ` · ${job.workingMode}` : ""}`,
      `- Posted: ${job.postedAt || "Not provided"}`,
      `- Why: ${job.reasons.join("; ") || "Manual review recommended"}`,
      `- Risks: ${job.risks.join("; ") || "None identified"}`,
      `- [View / Apply](${job.applyUrl})`,
      ""
    );
  });
  return lines.join("\n");
}

const [source, profile, history] = await Promise.all([
  readJson(inputPath),
  readJson(profilePath),
  historyPath ? readJson(historyPath) : Promise.resolve({})
]);
const rawJobs = Array.isArray(source) ? source : source.jobs;
if (!Array.isArray(rawJobs)) throw new TypeError("Input must be an array or an object with a jobs array");

const generatedAt = new Date().toISOString();
const result = matchJobs(rawJobs, profile, { history: history.statuses || history });
const board = {
  schemaVersion: 1,
  classification: source.classification === "private" ? "private-derived-output" : source.classification || "public-demo-data",
  generatedAt,
  boardDate: hongKongDate(),
  timezone: "Asia/Hong_Kong",
  mode: source.classification === "private" ? "private" : source.classification === "public-job-data" ? "public-live" : "demo",
  profileId: profile.profileId || "private-profile",
  ...result
};

const previousHistory = await readOptionalJson(runHistoryPath, { schemaVersion: 1, runs: [] });
const runHistory = {
  schemaVersion: 1,
  runs: [{ generatedAt, boardDate: board.boardDate, mode: board.mode, metrics: board.metrics }, ...(previousHistory.runs || [])].slice(0, 90)
};

await Promise.all([mkdir(dirname(outputPath), { recursive: true }), mkdir(dirname(reportPath), { recursive: true }), mkdir(dirname(runHistoryPath), { recursive: true })]);
await Promise.all([
  atomicWrite(outputPath, `${JSON.stringify(board, null, 2)}\n`),
  atomicWrite(reportPath, markdown(board)),
  atomicWrite(runHistoryPath, `${JSON.stringify(runHistory, null, 2)}\n`)
]);
console.log(`Generated ${board.jobs.length} matches: ${outputPath}`);
console.log(`Markdown report: ${reportPath}`);
console.log(`Run history: ${runHistoryPath}`);
