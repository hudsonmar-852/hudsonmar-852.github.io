const REQUIRED_CATEGORIES = Object.freeze(['golden', 'normal', 'edge', 'failure', 'regression']);

export function runEvaluationSuite({ cases, execute, metadata, baseline = null, changedVariables = [] }) {
  const categories = new Set(cases.map(({ category }) => category));
  const missing = REQUIRED_CATEGORIES.filter((category) => !categories.has(category));
  if (missing.length) throw new Error(`MVES missing categories: ${missing.join(', ')}`);
  if (baseline && metadata.causal_comparison && changedVariables.length !== 1) throw new Error('causal comparison requires exactly one changed variable');
  const caseResults = cases.map((testCase) => {
    const actual = execute(testCase.input);
    const passed = testCase.expect_error ? actual.error === testCase.expect_error : actual.output === testCase.expected;
    return { id: testCase.id, intent: testCase.intent, category: testCase.category, passed, expected: testCase.expected || testCase.expect_error, actual: actual.output || actual.error };
  });
  const passed = caseResults.filter(({ passed: ok }) => ok).length;
  const quality = Math.round((passed / caseResults.length) * 100);
  return {
    ...metadata,
    result: passed === caseResults.length ? 'PASS' : 'FAIL',
    process_quality: { score: quality, single_intent_cases: cases.every(({ intent }) => typeof intent === 'string' && intent.length > 0) },
    artifact_quality: { score: quality, golden_diff_passed: caseResults.filter(({ category }) => category === 'golden').every(({ passed: ok }) => ok) },
    outcome_quality: { score: quality, passed, total: caseResults.length },
    controlled_variables_changed: changedVariables,
    regression_comparison: baseline ? { baseline_result: baseline.result, delta: quality - baseline.outcome_quality.score } : null,
    cases: caseResults
  };
}
