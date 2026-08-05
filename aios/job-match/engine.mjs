const DEFAULT_WEIGHTS = Object.freeze({
  targetRole: 25,
  strengths: 20,
  deliveryLeadership: 15,
  aiAutomation: 15,
  preferredIndustries: 10,
  seniority: 5,
  workingMode: 5,
  compensation: 5
});

const ACTIVE_STATUSES = new Set(["NEW", "FAVOURITE", "SHORTLISTED"]);
const EXCLUDED_STATUSES = new Set(["APPLIED", "NOT_SUITABLE", "REJECTED", "EXPIRED"]);

function text(value) {
  return String(value ?? "").trim();
}

function terms(values) {
  return (Array.isArray(values) ? values : []).map((value) => text(value).toLowerCase()).filter(Boolean);
}

function searchable(job) {
  return [job.title, job.company, job.location, job.summary, ...(job.tags || [])].join(" ").toLowerCase();
}

function hits(haystack, needles) {
  return needles.filter((needle) => haystack.includes(needle));
}

function ratioScore(haystack, needles, weight) {
  if (!needles.length) return 0;
  const matched = hits(haystack, needles).length;
  if (!matched) return 0;
  // Profile arrays contain acceptable alternatives, not mandatory keywords.
  // One strong signal earns most of the category; additional signals add confidence.
  return Math.round(Math.min(1, 0.7 + ((matched - 1) * 0.15)) * weight);
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "tracking", "ref"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return text(value);
  }
}

function slug(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9\p{L}]+/gu, "-").replace(/^-|-$/g, "");
}

export function normalizeJob(raw, index = 0) {
  const title = text(raw.title);
  const company = text(raw.company) || "Company not provided";
  const applyUrl = canonicalUrl(raw.applyUrl || raw.url);
  if (!title || !applyUrl) throw new TypeError(`Job ${index + 1} requires title and applyUrl`);

  return {
    id: text(raw.id) || `${slug(company)}-${slug(title)}-${index + 1}`,
    source: text(raw.source) || "job-alert",
    sourceId: text(raw.sourceId),
    title,
    company,
    location: text(raw.location),
    workingMode: text(raw.workingMode),
    employmentType: text(raw.employmentType),
    seniority: text(raw.seniority),
    salary: text(raw.salary),
    postedAt: text(raw.postedAt),
    receivedAt: text(raw.receivedAt),
    summary: text(raw.summary),
    tags: Array.isArray(raw.tags) ? raw.tags.map(text).filter(Boolean) : [],
    applyUrl
  };
}

export function duplicateKey(job) {
  if (job.sourceId) return `${job.source.toLowerCase()}:${job.sourceId.toLowerCase()}`;
  return `${slug(job.company)}|${slug(job.title)}|${slug(job.location)}`;
}

export function deduplicateJobs(jobs) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];
  for (const job of jobs) {
    const keys = [duplicateKey(job), canonicalUrl(job.applyUrl)].filter(Boolean);
    if (keys.some((key) => seen.has(key))) {
      duplicates.push(job);
      continue;
    }
    keys.forEach((key) => seen.add(key));
    unique.push(job);
  }
  return { unique, duplicates };
}

export function scoreJob(job, profile, weights = DEFAULT_WEIGHTS) {
  const haystack = searchable(job);
  const avoidHits = hits(haystack, terms(profile.avoid));
  if (avoidHits.length) {
    return { score: 0, reasons: [], risks: [`Excluded preference: ${avoidHits.join(", ")}`], excluded: true };
  }

  const roleHits = hits(haystack, terms(profile.targetRoles));
  const strengthHits = hits(haystack, terms(profile.strengths));
  const deliveryHits = hits(haystack, terms(profile.deliveryLeadership));
  const aiHits = hits(haystack, terms(profile.aiAutomation));
  const industryHits = hits(haystack, terms(profile.preferredIndustries));
  const seniorityHits = hits(haystack, terms(profile.seniority));
  const modeHits = hits(haystack, terms(profile.workingMode));
  const compensationHits = hits(haystack, terms(profile.compensationSignals));

  const score = Math.min(100,
    ratioScore(haystack, terms(profile.targetRoles), weights.targetRole) +
    ratioScore(haystack, terms(profile.strengths), weights.strengths) +
    ratioScore(haystack, terms(profile.deliveryLeadership), weights.deliveryLeadership) +
    ratioScore(haystack, terms(profile.aiAutomation), weights.aiAutomation) +
    ratioScore(haystack, terms(profile.preferredIndustries), weights.preferredIndustries) +
    ratioScore(haystack, terms(profile.seniority), weights.seniority) +
    ratioScore(haystack, terms(profile.workingMode), weights.workingMode) +
    ratioScore(haystack, terms(profile.compensationSignals), weights.compensation)
  );

  const reasons = [
    roleHits.length && `Target role: ${roleHits.slice(0, 2).join(", ")}`,
    strengthHits.length && `Core strengths: ${strengthHits.slice(0, 3).join(", ")}`,
    aiHits.length && `AI/automation: ${aiHits.slice(0, 2).join(", ")}`,
    industryHits.length && `Preferred industry: ${industryHits.slice(0, 2).join(", ")}`,
    deliveryHits.length && `Delivery leadership: ${deliveryHits.slice(0, 2).join(", ")}`
  ].filter(Boolean);

  const risks = [
    !job.salary && "Compensation not provided",
    !job.workingMode && "Working mode not provided",
    !job.postedAt && "Posting date not provided",
    score < 75 && "Review role requirements before applying"
  ].filter(Boolean);

  return { score, reasons, risks, excluded: false };
}

export function matchJobs(rawJobs, profile, options = {}) {
  const minimumScore = Number(options.minimumScore ?? profile.minimumScore ?? 65);
  const limit = Math.max(1, Math.min(30, Number(options.limit ?? profile.dailyLimit ?? 30)));
  const history = options.history || {};
  const normalized = rawJobs.map(normalizeJob);
  const { unique, duplicates } = deduplicateJobs(normalized);
  const excludedByStatus = [];

  const ranked = unique.flatMap((job) => {
    const status = text(history[job.id] || history[duplicateKey(job)]).toUpperCase();
    if (EXCLUDED_STATUSES.has(status)) {
      excludedByStatus.push(job);
      return [];
    }
    const match = scoreJob(job, profile, options.weights);
    if (match.excluded || match.score < minimumScore) return [];
    return [{ ...job, ...match, status: ACTIVE_STATUSES.has(status) ? status : "NEW" }];
  }).sort((a, b) => b.score - a.score || Date.parse(b.postedAt || 0) - Date.parse(a.postedAt || 0) || a.title.localeCompare(b.title));

  return {
    jobs: ranked.slice(0, limit),
    metrics: {
      collected: normalized.length,
      duplicatesRemoved: duplicates.length,
      excludedByStatus: excludedByStatus.length,
      qualified: ranked.length,
      selected: Math.min(ranked.length, limit)
    }
  };
}

export function recommendation(score) {
  if (score >= 85) return "Highly Recommended";
  if (score >= 75) return "Strong Match";
  return "Possible Match";
}

export { DEFAULT_WEIGHTS, EXCLUDED_STATUSES };
