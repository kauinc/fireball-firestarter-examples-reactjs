/**
 * Rows logged to Supabase `round_events.event_type` by the operator dashboard.
 */
export const RoundEventType = Object.freeze({
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
})

/**
 * Extra values seen on `rounds.result_status` (not the live `status` machine).
 * `result_status` is normally null; TIMED_OUT when the race hits the max time.
 */
export const RoundRecordStatus = Object.freeze({
  RESULTS_SENT: 'RESULTS_SENT',
  RACE_TIMED_OUT: 'TIMED_OUT',
})
