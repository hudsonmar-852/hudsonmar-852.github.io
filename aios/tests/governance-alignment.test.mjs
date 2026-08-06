import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

test('major proposal remains unapproved and requires two confirmations', () => {
  const proposal = load('aios/data/governance-proposals.json')[0];
  assert.equal(proposal.proposal_id, 'P-GOV-ALIGN-001');
  assert.equal(proposal.major_change, true);
  assert.equal(proposal.requires_double_confirmation, true);
  assert.equal(proposal.status, 'AWAITING_DIRECTION_CONFIRMATION');
  assert.equal(proposal.second_confirmation.evidence_ref, null);
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
