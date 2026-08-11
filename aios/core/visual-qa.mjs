export const QA_DIMENSIONS = Object.freeze(['identity', 'face', 'hands', 'lighting', 'composition', 'promptCompliance']);
export function buildVisualQaReport({ jobId, checks, reviewer = null }) {
  const missing = QA_DIMENSIONS.filter((name) => !checks?.[name]); if (missing.length) throw new Error(`missing QA checks: ${missing.join(', ')}`);
  const normalized = Object.fromEntries(QA_DIMENSIONS.map((name) => [name, normalize(checks[name])]));
  const scores = Object.values(normalized).map(({ score }) => score); const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  return { schemaVersion: '1.0.0', jobId, checks: normalized, overallScore, automatedRecommendation: overallScore >= 80 && scores.every((score) => score >= 60) ? 'REVIEW' : 'REJECT', humanApproval: { required: true, status: reviewer ? 'RECORDED' : 'PENDING', reviewer } };
}
function normalize(check) { const score = Number(check.score); if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error('QA score must be between 0 and 100'); return { score, notes: String(check.notes || '') }; }
