import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const required = [
  'aios/governance/AIOS-GOVERNANCE-INDEX.md',
  'aios/governance/AIOS-MAJOR-CHANGE-APPROVAL-POLICY.md',
  'aios/governance/AIOS-DECISION-LIFECYCLE-POLICY.md',
  'aios/governance/AIOS-SINGLE-SOURCE-OF-TRUTH-POLICY.md',
  'aios/data/governance-proposals.json',
  'aios/data/pending-decisions.json',
  'aios/data/approval-registry.json',
  'aios/data/decision-conflicts.json',
  'aios/data/canonical-records.json'
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing ${file}`);
}

const proposals = json('aios/data/governance-proposals.json');
const pending = json('aios/data/pending-decisions.json');
const approvals = json('aios/data/approval-registry.json').records;
const canonical = json('aios/data/canonical-records.json');
const decisions = json('aios/data/decisions.json');
for (const [name, records, key] of [
  ['proposal', proposals, 'proposal_id'],
  ['decision', decisions, 'id']
]) {
  const ids = records.map((x) => x[key]);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Duplicate or missing ${name} ID`);
  }
}

for (const proposal of proposals) {
  if (proposal.major_change && !proposal.requires_double_confirmation) {
    throw new Error(`${proposal.proposal_id} bypasses double confirmation`);
  }
  if (proposal.major_change && ['APPROVED','EXECUTING','IMPLEMENTED','VERIFIED'].includes(proposal.status)) {
    const second = proposal.second_confirmation;
    if (second?.status !== 'CONFIRMED' || !second.evidence_ref) {
      throw new Error(`${proposal.proposal_id} lacks second-confirmation evidence`);
    }
  }
}
for (const item of pending) {
  if (!item.next_review_due) throw new Error(`${item.proposal_id} lacks next review date`);
  const calculated = Math.max(0, Math.floor((Date.parse('2026-08-06T00:00:00+08:00') - Date.parse(item.created_at)) / 86400000));
  if (item.aging_days !== calculated) throw new Error(`${item.proposal_id} aging_days drift`);
}
for (const approval of approvals) {
  if (!approval.proposal_id || !approval.evidence_ref) throw new Error('Approval evidence incomplete');
}
const paths = canonical.map((x) => x.canonical_path);
const types = canonical.map((x) => x.record_type);
if (new Set(paths).size !== paths.length) throw new Error('Canonical paths are not unique');
if (new Set(types).size !== types.length) throw new Error('Canonical record types are not unique');
for (const proposal of proposals) {
  if (proposal.superseded_by && !proposals.some((x) => x.proposal_id === proposal.superseded_by)) {
    throw new Error(`${proposal.proposal_id} successor is missing`);
  }
}
const agents = read('AGENTS.md');
if (!agents.includes('AIOS-GOVERNANCE-INDEX.md') || !agents.includes('BLOCKED — GOVERNANCE SOURCE NOT VERIFIED')) {
  throw new Error('AGENTS.md lacks governance startup gate');
}
for (const file of ['aios/data/status.json', 'avataros/project-board.md']) {
  const content = read(file);
  if (/%/.test(content) && !read('aios/reviews/AIOS-RECORD-DRIFT-AND-CONFLICT-REPORT.md').includes(file)) {
    throw new Error(`Unsupported percentage is not reported: ${file}`);
  }
}
console.log('AIOS governance alignment validation passed');
