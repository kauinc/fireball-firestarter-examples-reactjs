import { useEffect, useMemo, useState } from 'react'
import {
  BETTING_BANNER,
  BETTING_WINDOW_SECONDS,
  BettingPhase,
} from '../constants/bettingPhase.js'
import { RoundState } from '../../../domain/round/index.js'

/**
 * Overlay UI from round `status` only (no timestamp inference).
 * Visible while `status === BETTING_OPEN` (client countdown for PLACE/NO MORE BETS).
 *
 * @param {{
 *   status: string | null,
 *   round?: Record<string, unknown> | null,
 * }} args
 */
export function useBettingOverlayState({ status, round = null }) {
  const [now, setNow] = useState(null)
  const [openedLocalAt, setOpenedLocalAt] = useState(null)
  const openKey = `${round?.id ?? ''}:${status ?? ''}`

  useEffect(() => {
    if (status !== RoundState.BETTING_OPEN) {
      queueMicrotask(() => setOpenedLocalAt(null))
      return undefined
    }
    queueMicrotask(() => setOpenedLocalAt(Date.now()))
    return undefined
  }, [status, openKey])

  useEffect(() => {
    if (status !== RoundState.BETTING_OPEN) return undefined
    const id = setInterval(() => setNow(Date.now()), 200)
    queueMicrotask(() => setNow(Date.now()))
    return () => clearInterval(id)
  }, [status])

  return useMemo(() => {
    // Per product flow: ROUND_CREATED → do nothing; BETTING_CLOSED → clear; …
    if (status === RoundState.BETTING_OPEN) {
      let secondsLeft = BETTING_WINDOW_SECONDS
      if (openedLocalAt != null && now != null) {
        const elapsed = Math.floor((now - openedLocalAt) / 1000)
        secondsLeft = Math.max(0, BETTING_WINDOW_SECONDS - elapsed)
      }

      const phase =
        secondsLeft > 0 ? BettingPhase.OPEN : BettingPhase.CLOSED

      return {
        phase,
        secondsLeft,
        bannerLabel: BETTING_BANNER[phase],
        isBettingUiVisible: true,
        canPlaceBets: secondsLeft > 0,
        disabled: secondsLeft <= 0,
      }
    }

    return {
      phase: BettingPhase.HIDDEN,
      secondsLeft: 0,
      bannerLabel: null,
      isBettingUiVisible: false,
      canPlaceBets: false,
      disabled: true,
    }
  }, [status, openedLocalAt, now])
}
