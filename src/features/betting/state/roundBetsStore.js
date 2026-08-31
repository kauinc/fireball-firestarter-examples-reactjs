import { useSyncExternalStore } from 'react'
import { emptyCrazyComboPicks } from '../constants/combo.js'

/**
 * Last chip placements for the active round.
 * Survives BettingOverlay UI hide so RaceOverlay can show a read-only board.
 */
let snapshot = Object.freeze({
  roundId: null,
  bets: Object.freeze([]),
  crazyCombo: false,
  comboPick: null,
  crazyComboPicks: emptyCrazyComboPicks(),
})
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

/**
 * @param {string | null | undefined} roundId
 * @param {Array<Record<string, unknown>>} bets
 * @param {{ crazyCombo?: boolean, comboPick?: { kind: string, key: string } | null, crazyComboPicks?: Record<string, { color: string, pattern: string } | null> }} [meta]
 */
export function publishRoundBets(roundId, bets, meta = {}) {
  snapshot = Object.freeze({
    roundId: roundId ?? null,
    bets: Object.freeze([...(bets ?? [])]),
    crazyCombo: Boolean(meta.crazyCombo),
    comboPick: meta.comboPick ?? null,
    crazyComboPicks: Object.freeze({ ...(meta.crazyComboPicks ?? emptyCrazyComboPicks()) }),
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

export function hasComboBet(bets) {
  return bets?.some((bet) => bet.target?.type === 'combo') ?? false
}

export function hasCrazyComboBet(bets) {
  return bets?.some((bet) => bet.target?.type === 'crazyCombo') ?? false
}

/**
 * Combo bars on race/settlement HUD only when chips were placed on them.
 * @param {{ bets?: ReadonlyArray<Record<string, unknown>> }} state
 */
export function shouldShowRaceCrazyCombos(state) {
  return hasComboBet(state?.bets) || hasCrazyComboBet(state?.bets)
}

/** @returns {{ roundId: string | null, bets: ReadonlyArray<Record<string, unknown>>, crazyCombo: boolean, comboPick: { kind: string, key: string } | null, crazyComboPicks: Record<string, { color: string, pattern: string } | null> }} */
export function usePublishedRoundBets() {
  return useSyncExternalStore(
    subscribeRoundBets,
    getRoundBetsSnapshot,
    getRoundBetsSnapshot,
  )
}
