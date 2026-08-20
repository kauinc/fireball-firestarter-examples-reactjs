/**
 * Rows logged to Supabase `round_events.event_type` by the operator dashboard.
 */
export const RoundEventType = Object.freeze({
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
})

/**
 * Additional statuses stored on `rounds.status` (stats / history),
 * beyond the live `runtime_state.round_state` machine.
 */
export const RoundRecordStatus = Object.freeze({
  RESULTS_SENT: 'RESULTS_SENT',
  RACE_TIMED_OUT: 'RACE_TIMED_OUT',
})
