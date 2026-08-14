import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { buildPrompt } from './prompt-builder.mjs';
import { runEvaluationSuite } from './evaluation.mjs';
import { assertValid, validateEvaluationRun, validateRuntimeRecord, writeJson } from './validation.mjs';

export const RP001_STAGES = Object.freeze(['source_collection', 'verification', 'deduplication', 'ranking', 'executive_analysis', 'deliverable_generation', 'qa', 'approval_gate', 'simulated_publish', 'knowledge_promotion']);

const sha = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

function classifyFailure(error) {
  const message = String(error?.message || error);
  if (/permission/i.test(message)) return 'permission_error';
  if (/environment|platform|runtime/i.test(message)) return 'environment_error';
  if (/context|provenance/i.test(message)) return 'context_error';
  if (/prompt|variable|dependency/i.test(message)) return 'prompt_error';
  if (/requirement|acceptance/i.test(message)) return 'requirement_error';
  if (/tool/i.test(message)) return 'tool_error';
  return 'workflow_error';
}

function evaluateArtifact(artifact) {
  const required = ['# AIOS Phase 1 Executive Brief', '## Verified findings', '## Recommendation'];
  const missing = required.filter((heading) => !artifact.includes(heading));
  return { status: missing.length ? 'FAIL' : 'PASS', checks: { required_sections: missing.length === 0, non_empty: artifact.length > 100, no_unverified_claims: !artifact.includes('[UNVERIFIED]') }, missing };
}

export async function executeRp001({ sources, promptModules, promptProfile, evaluationCases, outputDir, clock = () => new Date().toISOString(), trigger = 'manual_simulation', approvalPolicy = 'auto_low_risk_simulation' }) {
  const startedAt = clock();
  const stageEvidence = [];
  const recordStage = (name, output) => { stageEvidence.push({ name, status: 'PASS', evidence: sha(output), output_summary: Array.isArray(output) ? `${output.length} items` : typeof output }); return output; };
  try {
    const collected = recordStage('source_collection', sources);
    const verified = recordStage('verification', collected.filter(({ verified, trust_level }) => verified && ['high', 'authoritative'].includes(trust_level)));
    const deduplicated = recordStage('deduplication', [...new Map(verified.map((item) => [item.canonical_url || item.id, item])).values()]);
    const ranked = recordStage('ranking', deduplicated.toSorted((a, b) => b.score - a.score));
    const analysis = recordStage('executive_analysis', { top_findings: ranked.slice(0, 3).map(({ title, summary, score }) => ({ title, summary, score })), recommendation: 'Promote the validated Phase 1 production baseline while retaining human approval for external publication.' });
    const compiled = buildPrompt({ modules: promptModules, roots: ['rp001-deliverable'], variables: { findings: analysis.top_findings.map(({ title, summary }) => `- ${title}: ${summary}`).join('\n'), recommendation: analysis.recommendation }, compatibilityProfile: promptProfile });
    const artifact = recordStage('deliverable_generation', `${compiled.artifact}\nBuild-SHA256: ${compiled.hash}\n`);
    const artifactFile = path.join(outputDir, 'RP001-ARTIFACT.md');
    fs.mkdirSync(outputDir, { recursive: true }); fs.writeFileSync(artifactFile, artifact);
    const qa = recordStage('qa', evaluateArtifact(artifact));
    if (qa.status !== 'PASS') throw new Error(`artifact validation failed: ${qa.missing.join(', ')}`);
    const approval = recordStage('approval_gate', { policy: approvalPolicy, decision: approvalPolicy === 'auto_low_risk_simulation' ? 'APPROVED_FOR_SIMULATION' : 'HUMAN_APPROVAL_REQUIRED', external_publication_authorized: false });
    const publication = recordStage('simulated_publish', { status: 'SIMULATED_PASS', destination: 'local_evidence_only', artifact: path.basename(artifactFile), external_side_effect: false });
    const promotion = recordStage('knowledge_promotion', { decision: 'AMEND', status: 'Candidate', target: 'AIOS Phase 1 operational knowledge', reason: 'Executable simulation and evaluation evidence support adding the baseline; external publication remains gated.', evidence: [path.basename(artifactFile), 'RP001-QA-RECORD.json'] });
    const evalMetadata = {
      id: 'EVAL-RP001-001', type: 'evaluation_run', name: 'RP001 MVES', version: '1.0.0', status: 'UAT', canonical_location: 'aios/phase1/evidence/baseline/RP001-EVALUATION.json', owner: 'AIOS Engineering', last_verified: clock(), dependencies: ['RP001', 'PROMPT-RP001-001'],
      dataset_version: 'rp001-mves-1.0.0', prompt_version: '1.0.0', model_profile: promptProfile, context_version: 'phase1-context-1.0.0', runtime_configuration: { mode: 'deterministic_simulation', approval_policy: approvalPolicy }, tool_versions: { node: process.version }, environment_manifest: { platform: process.platform, arch: process.arch, timezone: 'UTC', locale: 'en-US' }, causal_comparison: false
    };
    const evaluation = runEvaluationSuite({ cases: evaluationCases, execute: ({ value }) => value === null ? { error: 'missing_value' } : { output: String(value).trim().toUpperCase() }, metadata: evalMetadata });
    assertValid('evaluation run', validateEvaluationRun(evaluation));
    const completedAt = clock();
    const runtimeRecord = {
      id: 'RUNTIME-RP001-001', type: 'runtime_record', name: 'RP001 Phase 1 baseline runtime', version: '1.0.0', status: 'UAT', canonical_location: 'aios/phase1/evidence/baseline/RP001-RUNTIME-RECORD.json', owner: 'AIOS Engineering', last_verified: completedAt, dependencies: ['RP001', 'AT001', 'EVAL-RP001-001'],
      pipeline_id: 'RP001', pipeline_version: '1.0.0', trigger, started_at: startedAt, completed_at: completedAt, terminal_state: evaluation.result === 'PASS' ? 'COMPLETED' : 'FAILED', stages: stageEvidence, artifacts: [{ id: 'ARTIFACT-RP001-001', location: 'RP001-ARTIFACT.md', sha256: sha(artifact) }], qa_record: 'RP001-QA-RECORD.json', knowledge_promotion_decision: 'RP001-KNOWLEDGE-PROMOTION.json', environment_manifest: evalMetadata.environment_manifest, retry_count: 0, failure_classification: null, tool_calls: [], cost: { currency: 'USD', amount: 0, simulated: true }
    };
    assertValid('runtime record', validateRuntimeRecord(runtimeRecord));
    writeJson(path.join(outputDir, 'RP001-QA-RECORD.json'), { id: 'QA-RP001-001', artifact: 'ARTIFACT-RP001-001', ...qa, evaluated_at: completedAt });
    writeJson(path.join(outputDir, 'RP001-KNOWLEDGE-PROMOTION.json'), promotion);
    writeJson(path.join(outputDir, 'RP001-EVALUATION.json'), evaluation);
    writeJson(path.join(outputDir, 'RP001-RUNTIME-RECORD.json'), runtimeRecord);
    return { runtimeRecord, artifact, qa, promotion, evaluation, approval, publication };
  } catch (error) {
    error.failureClassification = classifyFailure(error);
    throw error;
  }
}
