import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSummaries, compareResearch, normalizeSource, runContentPipeline, runQualityControl, selectWorkflow } from '../content-pipeline/engine.mjs';

const source = { id: 's1', title: 'Official guide', publisher: 'Authority', url: 'https://example.gov/guide', sourceType: 'official', claimIds: ['c1'] };

test('standard stream runs shared reader, QC, source, summary, and approval stages', async () => {
  const result = await runContentPipeline({ topic: 'Simple topic', stream: 'standard', locale: 'zh-HK', content: 'Clear content.', keyPoints: ['One', 'Two'], readerQuestions: ['What next?'], rawSources: [source] });
  assert.equal(result.stream, 'standard');
  assert.equal(result.sectionLabels.readerQuestions, '你可能想知道');
  assert.equal(result.outputs.sources[0].authorityScore, 6);
  assert.equal(result.outputs.publishStore.externalPublicationAuthorized, false);
});

test('auto selection recommends enhanced for research-heavy work and manual override wins', () => {
  const complex = { technical: true, disputed: true, rapidlyChanging: true, professional: true };
  assert.equal(selectWorkflow(complex).stream, 'enhanced');
  assert.deepEqual(selectWorkflow({ ...complex, stream: 'standard' }).stream, 'standard');
});

test('comparison normalizes agreement, contradiction, additions, evidence gaps, and strongest resolution', () => {
  const result = compareResearch({
    primary: [{ claimId: 'agree', value: 'yes', sourceType: 'official' }, { claimId: 'conflict', value: 'old', sourceType: 'commentary', recency: '2025-01-01' }, { claimId: 'weak', value: 'maybe', supported: false }],
    alternative: [{ claimId: 'agree', value: 'yes', sourceType: 'primary' }, { claimId: 'conflict', value: 'new', sourceType: 'official', recency: '2026-01-01' }, { claimId: 'extra', value: 'detail', sourceType: 'professional' }]
  });
  assert.equal(result.find((x) => x.claim === 'agree').agreementStatus, 'agreement');
  assert.equal(result.find((x) => x.claim === 'conflict').recommendedResolution, 'new');
  assert.equal(result.find((x) => x.claim === 'extra').agreementStatus, 'additional_insight');
  assert.equal(result.find((x) => x.claim === 'weak').agreementStatus, 'missing_evidence');
});

test('equal-strength contradictions remain unresolved rather than being hallucinated away', () => {
  const [result] = compareResearch({ primary: [{ claimId: 'c', value: 'A', sourceType: 'official' }], alternative: [{ claimId: 'c', value: 'B', sourceType: 'official' }] });
  assert.equal(result.agreementStatus, 'contradiction');
  assert.equal(result.unresolved, true);
});

test('source normalization rejects missing, relative, and unsupported URLs', () => {
  assert.equal(normalizeSource(source).claimIds[0], 'c1');
  assert.throws(() => normalizeSource({ title: 'Missing URL' }), /required/);
  assert.throws(() => normalizeSource({ title: 'Relative', url: '/guide' }), /absolute/);
  assert.throws(() => normalizeSource({ title: 'Unsafe', url: 'javascript:alert(1)' }), /unsupported/);
});

test('unsupported claims fail internal QC and review notes are not public content', () => {
  const qc = runQualityControl({ content: 'Claim.', claims: ['c1'], unsupportedClaims: ['c1'], sources: [], readerQuestions: ['Why?'], readerExperience: {}, presentation: { headings: ['Overview'] } });
  assert.equal(qc.passed, false);
  assert.equal(qc.internal, true);
  assert.match(qc.reviewNotes.join(' '), /Unsupported claims/);
});

test('summary modes stay bounded and comparison summary does not repeat the article', () => {
  const summary = buildSummaries({ keyPoints: ['1','2','3','4','5','6','7','8'], researchComparison: [{ claim: 'c1', agreementStatus: 'agreement', recommendedResolution: 'R' }] });
  assert.equal(summary.quick.length, 2);
  assert.equal(summary.threeMinute.length, 5);
  assert.deepEqual(summary.researchComparison.agreements, ['c1']);
});

test('interesting facts exclude unsupported and duplicated main claims', async () => {
  const result = await runContentPipeline({ topic: 'Research', stream: 'enhanced', locale: 'zh-HK', mainClaimIds: ['main'], interestingFacts: [{ claimId: 'main', verified: true, sourceId: 's1' }, { claimId: 'novel', verified: true, sourceId: 's1' }, { claimId: 'weak', verified: false, sourceId: 's1' }] });
  assert.deepEqual(result.outputs.interestingFacts.facts.map((x) => x.claimId), ['novel']);
  assert.equal(result.outputs.interestingFacts.label, '唔講你唔知');
});

test('empty optional inputs and source failure preserve deterministic fallback behavior', async () => {
  const empty = await runContentPipeline({ topic: 'Empty state', stream: 'standard' });
  assert.deepEqual(empty.outputs.sources, []);
  await assert.rejects(runContentPipeline({ topic: 'Bad source', stream: 'standard', rawSources: [{ title: 'No URL' }] }), /source title and URL/);
});
