import { supabase } from './client.js'

const ROUND_COLUMNS = [
  'id',
  'round_number',
  'status',
  'created_at',
  'betting_closed_at',
  'race_started_at',
  'finished_at',
  'placements',
  'winner_doof_index',
  'race_duration',
  'result_status',
  'runtime_node_id',
].join(',')

const REALTIME_CHANNEL_PREFIX = 'rounds_realtime'

/**
 * Latest round by round_number (Unreal writes here).
 * @returns {Promise<{ data: Record<string, unknown> | null, error: Error | null }>}
 */
export async function fetchLatestRound() {
  const { data, error } = await supabase
    .from('rounds')
    .select(ROUND_COLUMNS)
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data: data ?? null, error: error ?? null }
}

/**
 * Whether `next` should replace `current` as the active round snapshot.
 * Same id → always apply (status PATCH). Newer round_number → switch.
 * @param {Record<string, unknown> | null | undefined} next
 * @param {Record<string, unknown> | null | undefined} current
 */
export function shouldApplyRound(next, current) {
  if (!next?.id) return false
  if (!current?.id) return true
  if (next.id === current.id) return true

  const nextNum = Number(next.round_number)
  const curNum = Number(current.round_number)
  if (Number.isFinite(nextNum) && Number.isFinite(curNum)) {
    return nextNum >= curNum
  }

  return true
}

/** @type {{
 *   channel: ReturnType<typeof supabase.channel>,
 *   onChange: Set<(payload: { eventType: string, new: Record<string, unknown> | null }) => void>,
 *   onStatus: Set<(status: string, error: Error | null) => void>,
 * } | null} */
let sharedRoundsRealtime = null
let roundsRealtimeSeq = 0

function ensureRoundsRealtime() {
  if (sharedRoundsRealtime) return sharedRoundsRealtime

  const onChange = new Set()
  const onStatus = new Set()
  roundsRealtimeSeq += 1

  // Unique topic each time the shared channel is (re)created. Reusing a topic
  // that is still subscribed and calling .on() again throws in supabase-js.
  const channel = supabase
    .channel(`${REALTIME_CHANNEL_PREFIX}_${roundsRealtimeSeq}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rounds' },
      (payload) => {
        const event = {
          eventType: payload.eventType,
          new: payload.new ?? null,
        }
        for (const listener of onChange) listener(event)
      },
    )
    .subscribe((status, err) => {
      for (const listener of onStatus) listener(status, err ?? null)
    })

  sharedRoundsRealtime = { channel, onChange, onStatus }
  return sharedRoundsRealtime
}

/**
 * Realtime INSERT/UPDATE on `public.rounds` (shared channel, no poll).
 * Safe to call from multiple hooks — listeners are multiplexed.
 *
 * Why shared: BettingOverlay + RaceOverlay both use `useCurrentRound()`. Two
 * `supabase.channel(rounds_realtime_${Date.now()})` calls in the same ms reuse
 * one channel; the second `.on()` after `.subscribe()` throws.
 *
 * @param {(payload: { eventType: string, new: Record<string, unknown> | null }) => void} onChange
 * @param {(status: string, error: Error | null) => void} [onStatus]
 * @returns {{ unsubscribe: () => void }}
 */
export function subscribeToRounds(onChange, onStatus) {
  const shared = ensureRoundsRealtime()
  shared.onChange.add(onChange)
  if (onStatus) shared.onStatus.add(onStatus)

  return {
    unsubscribe() {
      shared.onChange.delete(onChange)
      if (onStatus) shared.onStatus.delete(onStatus)

      if (shared.onChange.size === 0 && sharedRoundsRealtime === shared) {
        sharedRoundsRealtime = null
        supabase.removeChannel(shared.channel)
      }
    },
  }
}
