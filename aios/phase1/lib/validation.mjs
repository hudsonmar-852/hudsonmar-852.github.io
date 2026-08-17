import fs from 'node:fs';
import path from 'node:path';

export const ASSET_STATUSES = Object.freeze(['Draft', 'Candidate', 'UAT', 'Simulated', 'Production', 'Blocked', 'Deprecated', 'Archived']);
export const FORMAL_ASSET_FIELDS = Object.freeze(['id', 'type', 'name', 'version', 'status', 'canonical_location', 'owner', 'last_verified', 'dependencies']);

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function validateFormalAsset(asset) {
  const errors = [];
  for (const field of FORMAL_ASSET_FIELDS) {
    if (asset[field] === undefined || asset[field] === null || asset[field] === '') errors.push(`${field} is required`);
  }
  if (!Array.isArray(asset.dependencies)) errors.push('dependencies must be an array');
  if (!ASSET_STATUSES.includes(asset.status)) errors.push(`status must be one of: ${ASSET_STATUSES.join(', ')}`);
  if (asset.version && !/^\d+\.\d+\.\d+$/.test(asset.version)) errors.push('version must use semantic versioning');
  if (asset.last_verified && Number.isNaN(Date.parse(asset.last_verified))) errors.push('last_verified must be an ISO date');
  return errors;
}

export function validateRequirementContract(contract) {
  const required = ['objective', 'required_outcomes', 'assumptions', 'dependencies', 'constraints', 'prohibited_actions', 'unresolved_requirements', 'acceptance_criteria', 'task_specification', 'output_contract', 'validation'];
  const errors = validateFormalAsset(contract);
  for (const field of required) if (contract[field] === undefined) errors.push(`${field} is required`);
  for (const field of required.filter((field) => field !== 'objective' && field !== 'task_specification' && field !== 'output_contract' && field !== 'validation')) {
    if (!Array.isArray(contract[field])) errors.push(`${field} must be an array`);
  }
  for (const criterion of contract.acceptance_criteria || []) {
    if (!criterion.id || !criterion.test || !criterion.expected) errors.push('acceptance criteria require id, test and expected');
  }
  return errors;
}

export function validateContextItem(item) {
  const required = ['id', 'source', 'trust_level', 'externally_supplied', 'user_controlled', 'transformed_by', 'verified', 'allowed_for_reasoning', 'allowed_for_tool_action'];
  const errors = [];
  for (const field of required) if (item[field] === undefined) errors.push(`${field} is required`);
  if (item.allowed_for_tool_action && !item.verified) errors.push('unverified context cannot authorize tool action');
  if (item.externally_supplied && item.allowed_for_tool_action) errors.push('external context cannot authorize tool action');
  return errors;
}

export function validateEvaluationRun(run) {
  const fields = ['dataset_version', 'prompt_version', 'model_profile', 'context_version', 'runtime_configuration', 'tool_versions', 'environment_manifest', 'result', 'process_quality', 'artifact_quality', 'outcome_quality'];
  const errors = validateFormalAsset(run);
  for (const field of fields) if (run[field] === undefined) errors.push(`${field} is required`);
  if (run.causal_comparison && (run.controlled_variables_changed || []).length !== 1) errors.push('causal comparison requires exactly one changed controlled variable');
  return errors;
}

export function validateRuntimeRecord(record) {
  const fields = ['pipeline_id', 'pipeline_version', 'trigger', 'started_at', 'completed_at', 'terminal_state', 'stages', 'artifacts', 'qa_record', 'knowledge_promotion_decision', 'environment_manifest', 'retry_count', 'failure_classification'];
  const errors = validateFormalAsset(record);
  for (const field of fields) if (record[field] === undefined) errors.push(`${field} is required`);
  if ((record.retry_count ?? 0) > 1) errors.push('retry_count cannot exceed one');
  if (!Array.isArray(record.stages) || record.stages.some((stage) => !stage.name || !stage.status || !stage.evidence)) errors.push('each runtime stage requires name, status and evidence');
  return errors;
}

export function validateReleaseManifest(manifest) {
  const errors = validateFormalAsset(manifest);
  for (const field of ['release_id', 'release_status', 'commit', 'production_gate', 'evidence', 'rollback']) {
    if (manifest[field] === undefined) errors.push(`${field} is required`);
  }
  if (!/^[0-9a-f]{40}$/.test(manifest.commit || '')) errors.push('commit must be a full 40-character Git object ID');
  const gateFields = ['schema_valid', 'tests_pass', 'mves_pass', 'cat_pass', 'no_critical_regression', 'required_evidence_exists', 'rollback_exists', 'no_critical_blocker'];
  for (const field of gateFields) if (typeof manifest.production_gate?.[field] !== 'boolean') errors.push(`production_gate.${field} must be boolean`);
  if (!Array.isArray(manifest.evidence) || manifest.evidence.length === 0) errors.push('evidence must be a non-empty array');
  if (!manifest.rollback?.procedure || !manifest.rollback?.strategy) errors.push('rollback requires procedure and strategy');
  return errors;
}

export function assertValid(label, errors) {
  if (errors.length) throw new Error(`${label}: ${errors.join('; ')}`);
}
