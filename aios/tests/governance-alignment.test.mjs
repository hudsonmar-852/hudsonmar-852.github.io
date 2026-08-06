import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

test('major proposal has direction confirmation but remains unapproved', () => {
  const proposal = load('aios/data/governance-proposals.json')[0];
  assert.equal(proposal.proposal_id, 'P-GOV-ALIGN-001');
  assert.equal(proposal.major_change, true);
  assert.equal(proposal.requires_double_confirmation, true);
  assert.equal(proposal.status, 'DIRECTION_CONFIRMED');
  assert.equal(proposal.first_confirmation.status, 'CONFIRMED');
  assert.ok(proposal.first_confirmation.evidence_ref);
  assert.equal(proposal.second_confirmation.status, 'NOT_CONFIRMED');
  assert.equal(proposal.second_confirmation.evidence_ref, null);
});

test('direction confirmation has durable proposal-specific evidence', () => {
  const approvals = load('aios/data/approval-registry.json').records;
  const direction = approvals.find((record) =>
    record.proposal_id === 'P-GOV-ALIGN-001' &&
    record.confirmation_type === 'DIRECTION' &&
    record.confirmation_sequence === 1
  );
  assert.ok(direction);
  assert.equal(direction.status, 'CONFIRMED');
  assert.equal(direction.decision_text, 'APPROVE DIRECTION');
  assert.equal(direction.approved_direction, 'CREATE_NEW_CLEAN_BRANCH_AND_CHERRY_PICK');
  assert.ok(direction.evidence_ref);
});

test('Work Items reconciliation proposal is scoped and remains blocked', () => {
  const proposals = load('aios/data/governance-proposals.json');
  const alignment = proposals.find((proposal) => proposal.proposal_id === 'P-GOV-ALIGN-001');
  const workItems = proposals.find((proposal) => proposal.proposal_id === 'P-WORK-ITEMS-RECON-001');
  assert.ok(workItems);
  assert.deepEqual(Object.keys(workItems).sort(), Object.keys(alignment).sort());
  assert.equal(workItems.title, 'AIOS Work Items Reconciliation');
  assert.equal(workItems.major_change, true);
  assert.equal(workItems.requires_double_confirmation, true);
  assert.equal(workItems.status, 'AWAITING_DIRECTION_CONFIRMATION');
  assert.equal(workItems.first_confirmation.status, 'NOT_CONFIRMED');
  assert.equal(workItems.second_confirmation.status, 'NOT_CONFIRMED');
  assert.equal(workItems.execution_status, 'NOT_STARTED');
  assert.equal(workItems.human_decision_required, true);

  const pending = load('aios/data/pending-decisions.json').find((item) =>
    item.proposal_id === 'P-WORK-ITEMS-RECON-001'
  );
  assert.ok(pending);
  assert.equal(pending.status, 'AWAITING_DIRECTION_CONFIRMATION');
  assert.equal(pending.blocks_active_work, true);
});

test('canonical record types and paths are unique', () => {
  const rows = load('aios/data/canonical-records.json');
  assert.equal(new Set(rows.map((x) => x.record_type)).size, rows.length);
  assert.equal(new Set(rows.map((x) => x.canonical_path)).size, rows.length);
});

test('pending records expose review and revalidation state', () => {
  for (const item of load('aios/data/pending-decisions.json')) {
    assert.ok(item.next_review_due);
    assert.equal(typeof item.revalidation_required, 'boolean');
    assert.equal(typeof item.human_decision_required, 'boolean');
  }
});
