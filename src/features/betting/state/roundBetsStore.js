import { useSyncExternalStore } from 'react'

/**
 * Last chip placements for the active round.
 * Survives BettingOverlay UI hide so RaceOverlay can show a read-only board.
 */
let snapshot = Object.freeze({
  roundId: null,
  bets: Object.freeze([]),
  crazyCombo: false,
})
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

/**
 * @param {string | null | undefined} roundId
 * @param {Array<Record<string, unknown>>} bets
 * @param {{ crazyCombo?: boolean }} [meta]
 */
export function publishRoundBets(roundId, bets, meta = {}) {
  snapshot = Object.freeze({
    roundId: roundId ?? null,
    bets: Object.freeze([...(bets ?? [])]),
    crazyCombo: Boolean(meta.crazyCombo),
  })
  emit()
}

export function getRoundBetsSnapshot() {
  return snapshot
}

export function subscribeRoundBets(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Combo bars on race HUD only when Crazy Combo was on and chips were placed.
 * @param {{ crazyCombo?: boolean, bets?: ReadonlyArray<Record<string, unknown>> }} state
 */
export function shouldShowRaceCrazyCombos(state) {
  return Boolean(state?.crazyCombo) && (state?.bets?.length ?? 0) > 0
}

/** @returns {{ roundId: string | null, bets: ReadonlyArray<Record<string, unknown>>, crazyCombo: boolean }} */
export function usePublishedRoundBets() {
  return useSyncExternalStore(
    subscribeRoundBets,
    getRoundBetsSnapshot,
    getRoundBetsSnapshot,
  )
}
