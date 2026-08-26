import { useMemo } from 'react'
import { RoundState } from '../../../domain/round/roundStates.js'
import { mockSettlementForRound } from '../utils/mockSettlement.js'

/**
 * Settlement HUD when `rounds.status === RESULTS_SENT`.
 * @param {{
 *   status: string | null,
 *   round?: Record<string, unknown> | null,
 *   bets?: ReadonlyArray<object>,
 * }} args
 */
export function useSettlementOverlayState({
  status,
  round = null,
  bets = [],
}) {
  const isSettlement = status === RoundState.RESULTS_SENT
  const roundId = round?.id != null ? String(round.id) : null
  const betsKey = bets.map((b) => b.id).join(',')

  const settlement = useMemo(() => {
    if (!isSettlement) return null
    return mockSettlementForRound(roundId, { bets })
  }, [isSettlement, roundId, betsKey, bets])

  return {
    isSettlementUiVisible: isSettlement,
    settlement,
  }
}
