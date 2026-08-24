/**
 * Doof Troop round lifecycle as written by Unreal into Supabase `rounds.status`.
 * LiveKit carries A/V only — `status` is the source of truth for overlays.
 * Do not infer overlay screens from timestamps.
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
 * Map round status onto player-facing overlay stages.
 * @typedef {'betting' | 'race_countdown' | 'race' | 'results' | 'idle'} OverlayStage
 */

/** @type {Record<string, OverlayStage>} */
export const ROUND_STATE_TO_OVERLAY = Object.freeze({
  [RoundState.ROUND_NONE]: 'idle',
  // Unreal loading map — clear overlay.
  [RoundState.ROUND_CREATED]: 'idle',
  [RoundState.BETTING_OPEN]: 'betting',
  // Countdown in Unreal — clear client overlay.
  [RoundState.BETTING_CLOSED]: 'idle',
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
