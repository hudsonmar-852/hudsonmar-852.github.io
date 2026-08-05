import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { deduplicateJobs, matchJobs, normalizeJob, recommendation, scoreJob } from "../job-match/engine.mjs";

const profile = {
  targetRoles: ["ai transformation", "business architect"], preferredIndustries: ["banking"],
  strengths: ["business analysis", "governance"], deliveryLeadership: ["roadmap"],
  aiAutomation: ["genai", "automation"], seniority: ["lead"], workingMode: ["hybrid"],
  compensationSignals: ["competitive"], avoid: ["junior"], minimumScore: 65, dailyLimit: 30
};

const strongJob = {
  id: "job-1", title: "AI Transformation Lead", company: "Example Bank", location: "Hong Kong",
  workingMode: "Hybrid", seniority: "Lead", salary: "Competitive", summary: "GenAI governance, business analysis and roadmap delivery in banking.",
  applyUrl: "https://example.com/job/1?utm_source=email"
};

test("normalization requires a title and application URL and strips tracking", () => {
  assert.throws(() => normalizeJob({ title: "Missing URL" }), /requires title and applyUrl/);
  assert.equal(normalizeJob(strongJob).applyUrl, "https://example.com/job/1");
});

test("deduplication detects source IDs and canonical application URLs", () => {
  const jobs = [normalizeJob(strongJob), normalizeJob({ ...strongJob, id: "job-2", applyUrl: "https://example.com/job/1?utm_campaign=x" }, 1)];
  const result = deduplicateJobs(jobs);
  assert.equal(result.unique.length, 1);
  assert.equal(result.duplicates.length, 1);
});

test("matching ranks qualified roles and excludes prior decisions", () => {
  const weak = { id: "job-2", title: "Office Assistant", company: "Example", applyUrl: "https://example.com/job/2", summary: "General filing" };
  const result = matchJobs([weak, strongJob], profile);
  assert.equal(result.jobs[0].id, "job-1");
  assert.ok(result.jobs[0].score >= 65);
  assert.equal(result.metrics.collected, 2);
  const excluded = matchJobs([strongJob], profile, { history: { "job-1": "APPLIED" } });
  assert.equal(excluded.jobs.length, 0);
  assert.equal(excluded.metrics.excludedByStatus, 1);
});

test("avoid preferences override otherwise matching jobs", () => {
  assert.equal(scoreJob({ ...normalizeJob(strongJob), title: "Junior AI Transformation Lead" }, profile).excluded, true);
});

test("recommendation bands are stable", () => {
  assert.equal(recommendation(90), "Highly Recommended");
  assert.equal(recommendation(80), "Strong Match");
  assert.equal(recommendation(65), "Possible Match");
});

test("public Job Match assets preserve the privacy and interaction contract", async () => {
  const [html, app, readme] = await Promise.all([
    readFile(new URL("../job-match/index.html", import.meta.url), "utf8"),
    readFile(new URL("../job-match/app.mjs", import.meta.url), "utf8"),
    readFile(new URL("../job-match/README.md", import.meta.url), "utf8")
  ]);
  assert.match(html, /Daily Job Match/);
  assert.match(app, /View \/ Apply/);
  assert.match(app, /FAVOURITE/);
  assert.match(app, /APPLIED/);
  assert.match(app, /NOT_SUITABLE/);
  assert.match(readme, /does not scrape job sites/);
  assert.match(readme, /CVs, email bodies/);
  assert.match(readme, /newest 90/);
});
