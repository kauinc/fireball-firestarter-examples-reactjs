import { useSyncExternalStore } from 'react'
import { POSITION_OPTIONS } from '../constants/doofs.js'
import { pickRandomDoofUrls } from '../assets/doofImages.js'

/** Max visible race rows in the History panel. */
export const HISTORY_MAX_ROWS = 10

/**
 * @typedef {{
 *   id: string,
 *   places: Record<'1st' | '2nd' | '3rd', string | null>,
 * }} HistoryRow
 */

/** @type {HistoryRow[]} newest first */
let rows = seedInitialRows()

/** @type {{ phase: 'idle' | 'inserting', insertingId: string | null, exitingId: string | null }} */
let anim = Object.freeze({
  phase: 'idle',
  insertingId: null,
  exitingId: null,
})

/** Cached for useSyncExternalStore — must be referentially stable until emit(). */
let snapshot = Object.freeze({ rows, anim })

const listeners = new Set()

function emit() {
  snapshot = Object.freeze({ rows, anim })
  for (const listener of listeners) listener()
}

function seedInitialRows() {
  const urls = pickRandomDoofUrls(HISTORY_MAX_ROWS * POSITION_OPTIONS.length)
  const seeded = []
  for (let i = 0; i < HISTORY_MAX_ROWS; i += 1) {
    const places = {}
    POSITION_OPTIONS.forEach((pos, col) => {
      places[pos] = urls[i * POSITION_OPTIONS.length + col] ?? null
    })
    seeded.push(
      Object.freeze({
        id: `seed-${i}`,
        places: Object.freeze(places),
      }),
    )
  }
  return seeded
}

function getSnapshot() {
  return snapshot
}

/**
 * Begin insert animation: newest row on top (icons may land later),
 * keep one exiting overflow row until `finishHistoryInsert`.
 *
 * @param {{
 *   id: string,
 *   places: Record<'1st' | '2nd' | '3rd', string | null>,
 * }} result
 */
export function beginHistoryInsert(result) {
  if (rows[0]?.id === result.id) {
    return {
      insertingId: result.id,
      exitingId: anim.exitingId,
      alreadyPresent: true,
    }
  }

  const next = [
    Object.freeze({
      id: result.id,
      places: Object.freeze({ ...result.places }),
    }),
    ...rows,
  ]
  const exiting = next.length > HISTORY_MAX_ROWS ? next[HISTORY_MAX_ROWS] : null
  rows = next.slice(0, HISTORY_MAX_ROWS + (exiting ? 1 : 0))
  anim = Object.freeze({
    phase: 'inserting',
    insertingId: result.id,
    exitingId: exiting?.id ?? null,
  })
  emit()
  return { insertingId: result.id, exitingId: exiting?.id ?? null }
}

/** Trim overflow row and clear anim flags after CSS finishes. */
export function finishHistoryInsert() {
  rows = rows.slice(0, HISTORY_MAX_ROWS)
  anim = Object.freeze({
    phase: 'idle',
    insertingId: null,
    exitingId: null,
  })
  emit()
}

/**
 * Undo an in-progress insert (e.g. effect cleanup / Strict Mode remount).
 * @param {string} insertingId
 */
export function cancelHistoryInsert(insertingId) {
  if (anim.phase !== 'inserting' || anim.insertingId !== insertingId) return
  rows = rows.filter((r) => r.id !== insertingId).slice(0, HISTORY_MAX_ROWS)
  anim = Object.freeze({
    phase: 'idle',
    insertingId: null,
    exitingId: null,
  })
  emit()
}

export function subscribeHistory(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRaceHistory() {
  return useSyncExternalStore(subscribeHistory, getSnapshot, getSnapshot)
}

/**
 * Build a history row from settlement podium winners.
 * @param {string} roundId
 * @param {ReadonlyArray<{ place: string, src?: string | null }>} winners
 */
export function historyRowFromWinners(roundId, winners) {
  const places = { '1st': null, '2nd': null, '3rd': null }
  for (const w of winners ?? []) {
    if (w.place === '1st' || w.place === '2nd' || w.place === '3rd') {
      places[w.place] = w.src ?? null
    }
  }
  return {
    id: `round-${roundId}`,
    places,
  }
}
