export async function triggerAt001({ pipeline, input, logger = () => {} }) {
  let retryCount = 0;
  try {
    logger({ automation: 'AT001', event: 'triggered', pipeline: 'RP001' });
    return await pipeline({ ...input, trigger: 'AT001_simulated_schedule' });
  } catch (error) {
    const deterministicAndRepairable = ['environment_error', 'tool_error'].includes(error.failureClassification);
    logger({ automation: 'AT001', event: 'failed', classification: error.failureClassification || 'workflow_error', action: deterministicAndRepairable ? 'diagnose_then_retry_once' : 'log_and_stop' });
    if (!deterministicAndRepairable) throw error;
    retryCount += 1;
    try {
      const result = await pipeline({ ...input, trigger: 'AT001_simulated_schedule_retry' });
      result.runtimeRecord.retry_count = retryCount;
      logger({ automation: 'AT001', event: 'retry_completed', retry_count: retryCount });
      return result;
    } catch (retryError) {
      logger({ automation: 'AT001', event: 'retry_failed', retry_count: retryCount, classification: retryError.failureClassification || 'workflow_error', action: 'log_and_stop' });
      throw retryError;
    }
  }
}
