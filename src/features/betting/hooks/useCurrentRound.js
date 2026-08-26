import { useSyncExternalStore } from 'react'
import {
  fetchLatestRound,
  shouldApplyRound,
  subscribeToRounds,
} from '../../../shared/supabase/rounds.js'

/**
 * Shared round snapshot for all overlays (one fetch + one Realtime subscription).
 */

const SERVER_SNAPSHOT = Object.freeze({
  round: null,
  status: null,
  ready: false,
  error: null,
  realtimeStatus: 'INIT',
})

let snapshot = SERVER_SNAPSHOT
const listeners = new Set()
let started = false
let stopRealtime = null

function emit(next) {
  snapshot = Object.freeze(next)
  for (const listener of listeners) listener()
}

function applyRound(data) {
  const prev = snapshot.round
  const round = shouldApplyRound(data, prev) ? data : prev
  emit({
    ...snapshot,
    round,
    status: typeof round?.status === 'string' ? round.status : null,
    ready: true,
    error: null,
  })
}

async function loadLatest() {
  const { data, error: queryError } = await fetchLatestRound()
  if (queryError) {
    console.error('[rounds] fetch failed', queryError.message)
    emit({
      ...snapshot,
      ready: true,
      error: queryError.message,
    })
    return
  }
  applyRound(data)
}

function ensureStarted() {
  if (started) return
  started = true

  loadLatest()

  const { unsubscribe } = subscribeToRounds(
    ({ eventType, new: next }) => {
      if (!next) {
        loadLatest()
        return
      }
      if (import.meta.env.DEV) {
        console.debug(
          '[rounds] realtime',
          eventType,
          next.status,
          next.round_number,
        )
      }
      applyRound(next)
    },
    (status, err) => {
      emit({ ...snapshot, realtimeStatus: status })
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[rounds] realtime', status, err?.message || err)
        loadLatest()
      } else if (status === 'SUBSCRIBED' && import.meta.env.DEV) {
        console.debug('[rounds] realtime subscribed')
      }
    },
  )

  stopRealtime = unsubscribe
}

function subscribe(listener) {
  listeners.add(listener)
  ensureStarted()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && stopRealtime) {
      stopRealtime()
      stopRealtime = null
      started = false
    }
  }
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

/**
 * Current round from Supabase `rounds`:
 * - one shared initial fetch
 * - Realtime INSERT/UPDATE
 * Safe to call from multiple overlays — multiplexed via this store.
 */
export function useCurrentRound() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
