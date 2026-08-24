import { useEffect, useState } from 'react'
import {
  fetchLatestRound,
  shouldApplyRound,
  subscribeToRounds,
} from '../../../shared/supabase/rounds.js'

/**
 * Current round from Supabase `rounds`:
 * - one initial fetch (correct screen immediately)
 * - Realtime INSERT/UPDATE (instant status changes)
 * No polling. Does not decide which overlay to show.
 */
export function useCurrentRound() {
  const [round, setRound] = useState(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState('INIT')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error: queryError } = await fetchLatestRound()
      if (cancelled) return

      if (queryError) {
        console.error('[rounds] fetch failed', queryError.message)
        setError(queryError.message)
        setReady(true)
        return
      }

      setRound((prev) => (shouldApplyRound(data, prev) ? data : prev))
      setError(null)
      setReady(true)
    }

    load()

    const { unsubscribe } = subscribeToRounds(
      ({ eventType, new: next }) => {
        if (!next) {
          load()
          return
        }
        if (import.meta.env.DEV) {
          console.debug('[rounds] realtime', eventType, next.status, next.round_number)
        }
        setRound((prev) => (shouldApplyRound(next, prev) ? next : prev))
        setError(null)
        setReady(true)
      },
      (status, err) => {
        if (cancelled) return
        setRealtimeStatus(status)
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[rounds] realtime', status, err?.message || err)
          // Recover once with a fresh snapshot; keep listening via same channel lifecycle.
          load()
        } else if (status === 'SUBSCRIBED' && import.meta.env.DEV) {
          console.debug('[rounds] realtime subscribed')
        }
      },
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return {
    round,
    status: typeof round?.status === 'string' ? round.status : null,
    ready,
    error,
    realtimeStatus,
  }
}
