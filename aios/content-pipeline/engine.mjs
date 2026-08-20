import defaultConfig from './config.json' with { type: 'json' };

const VALID_STREAMS = new Set(['standard', 'enhanced']);
const AGREEMENT = new Set(['agreement', 'contradiction', 'additional_insight', 'missing_evidence']);

const text = (value) => String(value ?? '').trim();
const unique = (items) => [...new Set(items.map(text).filter(Boolean))];

export function normalizeSource(source, { retrievedAt = new Date().toISOString(), authority = defaultConfig.sourceAuthority } = {}) {
  if (!source || typeof source !== 'object') throw new Error('source must be an object');
  const url = text(source.url || source.canonical_url);
  const title = text(source.title);
  if (!title || !url) throw new Error('source title and URL are required');
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('source URL must be absolute'); }
  if (!['http:', 'https:', 'aios:'].includes(parsed.protocol)) throw new Error('source URL protocol is unsupported');
  const sourceType = text(source.sourceType || source.source_type || 'unknown');
  return {
    id: text(source.id) || `source-${simpleHash(url)}`,
    title,
    publisher: text(source.publisher),
    url,
    publishedAt: source.publishedAt || source.publication_date || null,
    updatedAt: source.updatedAt || source.update_date || null,
    retrievedAt: source.retrievedAt || retrievedAt,
    sourceType,
    authorityScore: Number(source.authorityScore ?? authority[sourceType] ?? 0),
    claimIds: unique(source.claimIds || source.claim_relationship || []),
    supports: source.supports !== false
  };
}

export function compareResearch({ primary = [], alternative = [], knowledge = [] }, config = defaultConfig) {
  const groups = new Map();
  for (const [origin, claims] of Object.entries({ primary, alternative, knowledge })) {
    for (const claim of claims || []) {
      const id = text(claim.claimId || claim.id || claim.claim);
      if (!id) continue;
      const group = groups.get(id) || { claim: id, primary: [], alternative: [], knowledge: [] };
      group[origin].push(claim); groups.set(id, group);
    }
  }
  return [...groups.values()].map((group) => {
    const p = bestClaim(group.primary, config); const a = bestClaim(group.alternative, config); const k = bestClaim(group.knowledge, config);
    const candidates = [p, a, k].filter(Boolean);
    const supported = candidates.filter((item) => item.supported !== false && item.sourceQuality > 0);
    const values = new Set(supported.map((item) => text(item.value).toLowerCase()));
    let agreementStatus = 'missing_evidence';
    if (supported.length === 1 && (!p || candidates.length > 1)) agreementStatus = 'additional_insight';
    else if (values.size === 1 && supported.length > 1) agreementStatus = 'agreement';
    else if (values.size > 1) agreementStatus = 'contradiction';
    const winner = [...supported].sort((x, y) => y.sourceQuality - x.sourceQuality || dateValue(y.recency) - dateValue(x.recency))[0] || null;
    return {
      claim: group.claim,
      primaryResult: p?.value ?? null,
      alternativeResult: a?.value ?? null,
      knowledgeResult: k?.value ?? null,
      agreementStatus,
      sourceQuality: winner?.sourceQuality ?? 0,
      recency: winner?.recency ?? null,
      confidence: winner ? Math.min(1, Math.max(0, Number(winner.confidence ?? winner.sourceQuality / 6))) : 0,
      recommendedResolution: winner ? text(winner.value) : null,
      unresolved: agreementStatus === 'contradiction' && new Set(supported.filter((x) => x.sourceQuality === winner?.sourceQuality).map((x) => text(x.value).toLowerCase())).size > 1
    };
  });
}

export function evaluateReaderExperience(input) {
  const content = text(input.content);
  const sentences = content.split(/[.!?。！？]+/).map(text).filter(Boolean);
  const duplicated = sentences.filter((sentence, index) => sentences.indexOf(sentence) !== index);
  return {
    needs: unique(input.readerNeeds || []),
    likelyQuestions: unique(input.readerQuestions || []),
    confusingTerms: unique(input.confusingTerms || []),
    missingInformation: unique(input.missingInformation || []),
    removeOrSimplify: unique([...(input.unnecessary || []), ...duplicated]),
    presentationHints: unique(input.presentationHints || [])
  };
}

export function selectWorkflow(input, config = defaultConfig) {
  if (input.stream && input.stream !== 'auto') {
    if (!VALID_STREAMS.has(input.stream)) throw new Error('stream must be standard, enhanced, or auto');
    return { stream: input.stream, recommended: input.stream, overridden: true, complexityScore: complexity(input) };
  }
  const complexityScore = complexity(input);
  const recommended = config.autoSelection.enabled && complexityScore >= config.autoSelection.enhancedThreshold ? 'enhanced' : config.defaultStream;
  return { stream: recommended, recommended, overridden: false, complexityScore };
}

export function runQualityControl(input, config = defaultConfig) {
  const sources = input.sources || input.rawSources || [];
  const comparison = input.researchComparison || [];
  const unsupported = unique(input.unsupportedClaims || []);
  const scores = {
    accuracy: clamp(100 - unsupported.length * 25 - comparison.filter((x) => x.unresolved).length * 20 - (input.claims?.length && !sources.length ? 35 : 0)),
    readerExperience: clamp(100 - (input.readerExperience?.confusingTerms?.length || 0) * 8 - (input.readerExperience?.missingInformation?.length || 0) * 10),
    usefulness: clamp(input.readerQuestions?.length ? 90 : 65),
    contentQuality: clamp(text(input.content).length ? 90 - (input.readerExperience?.removeOrSimplify?.length || 0) * 8 : 0),
    presentation: clamp(input.presentation?.headings?.length ? 90 : 65)
  };
  const overallScore = Math.round(Object.entries(config.qualityControl.weights).reduce((sum, [key, weight]) => sum + scores[key] * weight, 0));
  const passed = overallScore >= config.qualityControl.passScore && Object.values(scores).every((score) => score >= config.qualityControl.minimumDimensionScore) && unsupported.length === 0;
  return { scores, overallScore, passed, reviewNotes: buildReviewNotes({ scores, unsupported, comparison }), internal: true };
}

export function buildSummaries(input) {
  const points = unique(input.keyPoints || []).slice(0, 7);
  const comparison = input.researchComparison || [];
  return {
    quick: points.slice(0, 2),
    threeMinute: points.slice(0, 5),
    multiLevel: { executive: points.slice(0, 2), scan: points.slice(0, 5), detailed: points },
    researchComparison: {
      agreements: comparison.filter((x) => x.agreementStatus === 'agreement').map((x) => x.claim),
      additions: comparison.filter((x) => x.agreementStatus === 'additional_insight').map((x) => x.claim),
      disagreements: comparison.filter((x) => x.agreementStatus === 'contradiction').map((x) => ({ claim: x.claim, unresolved: x.unresolved })),
      recommendation: unique(comparison.map((x) => x.recommendedResolution)).slice(0, 5)
    }
  };
}

export async function runContentPipeline(input, { config = defaultConfig, providers = {}, clock = () => new Date().toISOString() } = {}) {
  if (!text(input?.topic)) throw new Error('topic is required');
  const selection = selectWorkflow(input, config);
  const locale = config.sectionLabels[input.locale] ? input.locale : 'default';
  const context = { ...structuredClone(input), selection, sectionLabels: structuredClone(config.sectionLabels[locale]), startedAt: clock(), outputs: {} };
  for (const stage of config.streams[selection.stream]) {
    context.outputs[stage] = providers[stage] ? await providers[stage](structuredClone(context)) : builtInStage(stage, context, config);
    if (stage === 'researchComparison') context.researchComparison = context.outputs[stage];
    if (stage === 'readerExperience') context.readerExperience = context.outputs[stage];
    if (stage === 'readerQuestions') context.readerQuestions = context.outputs[stage].questions;
    if (stage === 'sources') context.sources = context.outputs[stage];
  }
  context.completedAt = clock();
  return { schemaVersion: '1.0.0', topic: context.topic, stream: selection.stream, selection, sectionLabels: context.sectionLabels, stages: config.streams[selection.stream], outputs: context.outputs, startedAt: context.startedAt, completedAt: context.completedAt };
}

function builtInStage(stage, context, config) {
  if (stage === 'understand') return { topic: context.topic, audience: text(context.audience) || 'general', objective: text(context.objective) || 'inform' };
  if (stage === 'researchComparison') return compareResearch(context.research || {}, config);
  if (stage === 'readerExperience') return evaluateReaderExperience(context);
  if (stage === 'readerQuestions') return { label: context.sectionLabels.readerQuestions, questions: unique(context.readerQuestions || []) };
  if (stage === 'interestingFacts') return { label: context.sectionLabels.interestingFacts, facts: (context.interestingFacts || []).filter((fact) => fact?.verified && fact?.sourceId && !context.mainClaimIds?.includes(fact.claimId)) };
  if (stage === 'sources') return (context.rawSources || []).map((source) => normalizeSource(source, { retrievedAt: context.completedAt || context.startedAt, authority: config.sourceAuthority })).sort((a, b) => b.authorityScore - a.authorityScore);
  if (stage === 'qualityControl' || stage === 'advancedQualityControl') return runQualityControl(context, config);
  if (stage === 'threeMinuteSummary' || stage === 'multiLevelSummary') return buildSummaries(context);
  if (stage === 'publishStore') return { status: 'READY_FOR_APPROVAL', externalPublicationAuthorized: false };
  return { status: 'COMPLETED' };
}

function bestClaim(items, config) { return [...items].map((item) => ({ ...item, value: item.value ?? item.result, sourceQuality: Number(item.sourceQuality ?? config.sourceAuthority[item.sourceType || 'unknown'] ?? 0), recency: item.recency || item.updatedAt || item.publishedAt || null })).sort((a, b) => b.sourceQuality - a.sourceQuality || dateValue(b.recency) - dateValue(a.recency))[0] || null; }
function complexity(input) { return [input.technical, input.disputed, input.rapidlyChanging, input.professional, (input.research?.alternative?.length || 0) > 0, (input.claims?.length || 0) > 5].filter(Boolean).length; }
function dateValue(value) { const parsed = Date.parse(value || ''); return Number.isNaN(parsed) ? 0 : parsed; }
function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))); }
function simpleHash(value) { let hash = 0; for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; return hash.toString(16); }
function buildReviewNotes({ scores, unsupported, comparison }) { const notes = []; if (unsupported.length) notes.push(`Unsupported claims: ${unsupported.join(', ')}`); for (const [name, score] of Object.entries(scores)) if (score < 75) notes.push(`${name} requires review (${score})`); if (comparison.some((x) => x.unresolved)) notes.push('Unresolved research contradiction requires explicit disclosure'); return notes; }

export { defaultConfig as CONTENT_PIPELINE_CONFIG, AGREEMENT as RESEARCH_AGREEMENT_STATUSES };
