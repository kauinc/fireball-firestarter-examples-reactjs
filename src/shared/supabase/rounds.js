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

/**
 * Realtime INSERT/UPDATE on `public.rounds` (single `*` binding, no poll).
 * @param {(payload: { eventType: string, new: Record<string, unknown> | null }) => void} onChange
 * @param {(status: string, error: Error | null) => void} [onStatus]
 * @returns {{ unsubscribe: () => void }}
 */
export function subscribeToRounds(onChange, onStatus) {
  const channel = supabase
    .channel(`rounds_realtime_${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rounds' },
      (payload) => {
        onChange({
          eventType: payload.eventType,
          new: payload.new ?? null,
        })
      },
    )
    .subscribe((status, err) => {
      onStatus?.(status, err ?? null)
    })

  return {
    unsubscribe() {
      supabase.removeChannel(channel)
    },
  }
}
