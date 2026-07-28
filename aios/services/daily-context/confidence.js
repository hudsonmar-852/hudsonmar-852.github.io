const SOURCE_QUALITY = Object.freeze({
  official: 30,
  trusted: 26,
  aios_verified: 24,
  internal: 20,
  community_verified: 18,
  unknown: 8
});

function bounded(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

export function scoreConfidence(record) {
  const sourceQuality = SOURCE_QUALITY[record.source_quality] ?? SOURCE_QUALITY.unknown;
  const timestamp = record.source_timestamp ? 15 : 0;
  const internalConsistency = 15 * bounded(record.internal_consistency ?? 1);
  const crossRecordAgreement = 15 * bounded(record.cross_record_agreement ?? 0.8);
  const completeness = 15 * bounded(record.completeness ?? 1);
  const explicitValidity = (record.valid_until || record.validUntil || record.validity_explicit) ? 10 : 5;
  const score = Math.round(
    sourceQuality
    + timestamp
    + internalConsistency
    + crossRecordAgreement
    + completeness
    + explicitValidity
  );
  return {
    score: Math.max(0, Math.min(100, score)),
    components: {
      source_quality: sourceQuality,
      timestamp,
      internal_consistency: Math.round(internalConsistency),
      cross_record_agreement: Math.round(crossRecordAgreement),
      completeness: Math.round(completeness),
      explicit_validity: explicitValidity
    }
  };
}

export function confidenceDecision(record, score = scoreConfidence(record).score) {
  const safetyCritical = ['weather', 'warning'].includes(record.record_type);
  const minimum = safetyCritical ? 85 : 80;
  if (score >= minimum) return { usable: true, lowRiskOnly: false, reason: null };
  if (!safetyCritical && score >= 70) {
    return { usable: true, lowRiskOnly: true, reason: 'low_risk_general_context_only' };
  }
  return {
    usable: false,
    lowRiskOnly: false,
    reason: safetyCritical ? 'weather_confidence_below_85' : 'confidence_below_70'
  };
}
