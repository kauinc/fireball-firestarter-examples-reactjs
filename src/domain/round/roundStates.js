/**
 * Doof Troop round lifecycle as synced via Supabase `runtime_state.round_state`.
 * LiveKit carries A/V only — these states are the source of truth for overlays.
 */
export const RoundState = Object.freeze({
  ROUND_NONE: 'ROUND_NONE',
  ROUND_CREATED: 'ROUND_CREATED',
  BETTING_OPEN: 'BETTING_OPEN',
  BETTING_CLOSED: 'BETTING_CLOSED',
  TRACK_READY: 'TRACK_READY',
  RACE_RUNNING: 'RACE_RUNNING',
  RESULTS_SENT: 'RESULTS_SENT',
  ROUND_COMPLETED: 'ROUND_COMPLETED',
  ROUND_CANCELLED_OPERATOR: 'ROUND_CANCELLED_OPERATOR',
  ROUND_CANCELLED_RUNTIME: 'ROUND_CANCELLED_RUNTIME',
})

/** Terminal / idle states where a new round can start. */
export const IDLE_ROUND_STATES = Object.freeze([
  RoundState.ROUND_NONE,
  RoundState.RESULTS_SENT,
  RoundState.ROUND_COMPLETED,
  RoundState.ROUND_CANCELLED_OPERATOR,
  RoundState.ROUND_CANCELLED_RUNTIME,
])

/**
 * Map operator/runtime states onto the four player-facing overlay stages.
 * @typedef {'betting' | 'race_countdown' | 'race' | 'results' | 'idle'} OverlayStage
 */

/** @type {Record<string, OverlayStage>} */
export const ROUND_STATE_TO_OVERLAY = Object.freeze({
  [RoundState.ROUND_NONE]: 'idle',
  [RoundState.ROUND_CREATED]: 'idle',
  [RoundState.BETTING_OPEN]: 'betting',
  [RoundState.BETTING_CLOSED]: 'race_countdown',
  [RoundState.TRACK_READY]: 'race_countdown',
  [RoundState.RACE_RUNNING]: 'race',
  [RoundState.RESULTS_SENT]: 'results',
  [RoundState.ROUND_COMPLETED]: 'idle',
  [RoundState.ROUND_CANCELLED_OPERATOR]: 'idle',
  [RoundState.ROUND_CANCELLED_RUNTIME]: 'idle',
})

export function toOverlayStage(roundState) {
  return ROUND_STATE_TO_OVERLAY[roundState] ?? 'idle'
}
