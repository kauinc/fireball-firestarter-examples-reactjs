import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BettingBanner } from '../../betting/components/BettingBanner.jsx'
import { uiAssets } from '../../betting/assets/uiAssets.js'
import { formatMoney } from '../../betting/utils/formatMoney.js'
import { useFullscreen } from '../../betting/hooks/useFullscreen.js'
import { useHudViewportContext } from '../../hud/index.js'
import { useCurrentRound } from '../../betting/hooks/useCurrentRound.js'
import { usePublishedRoundBets, shouldShowRaceCrazyCombos, hasComboBet, hasCrazyComboBet } from '../../betting/state/roundBetsStore.js'
import {
  useMockPotentialWin,
  useRaceElapsed,
  useRaceOverlayState,
} from '../hooks/useRaceOverlay.js'
import { CurrentBetsBoard } from './CurrentBetsSheet.jsx'
import { DEFAULT_BALANCE } from '../../betting/constants/defaults.js'
import {
  HudFade,
  HudFullscreenButton,
  HudMenuChrome,
  useDialogFocus,
} from '../../hud/index.js'
import '../../betting/styles/hud-shared.css'
import '../../betting/styles/crazy-combos.css'
import '../styles/race.css'

/**
 * In-race HUD — same mobile portrait / landscape chrome as BettingOverlay:
 * Balance | CURRENT BETS | Potential Win. Open sheet = read-only board.
 */
export function RaceOverlay({ balance = DEFAULT_BALANCE }) {
  const { scale: viewportScale, compact, orientation } = useHudViewportContext()
  const { round, status } = useCurrentRound()
  const { isRaceUiVisible, raceKey, raceStartedAt } = useRaceOverlayState({
    status,
    round,
  })
  const { label: elapsedLabel } = useRaceElapsed({
    active: isRaceUiVisible,
    raceStartedAt,
    raceKey,
  })
  const potentialWin = useMockPotentialWin({ active: isRaceUiVisible })
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const { roundId: betsRoundId, bets, comboPick: publishedComboPick, crazyComboPicks: publishedCrazyComboPicks } =
    usePublishedRoundBets()
  const [betsOpenForKey, setBetsOpenForKey] = useState(null)
  // Close CURRENT BETS when the race key changes (new round / phase).
  if (betsOpenForKey != null && betsOpenForKey !== raceKey) {
    setBetsOpenForKey(null)
  }
  const betsOpen = Boolean(isRaceUiVisible && betsOpenForKey === raceKey)
  const betsDialogRef = useRef(null)
  const betsTableRef = useRef(null)
  const currentBetsToggleRef = useRef(null)
  const overlayRef = useRef(null)

  const closeBets = useCallback(() => setBetsOpenForKey(null), [])
  useDialogFocus({
    open: betsOpen,
    onClose: closeBets,
    containerRef: betsDialogRef,
  })

  const roundMatches = round?.id != null && String(round.id) === String(betsRoundId ?? '')
  const visibleBets = roundMatches ? bets : []
  const visibleComboPick = roundMatches ? publishedComboPick : null

  const visibleCrazyComboPicks = roundMatches ? publishedCrazyComboPicks : null

  const showCrazyCombos = shouldShowRaceCrazyCombos({ bets: visibleBets })
  const showComboBar = hasComboBet(visibleBets)
  const showCrazyComboBar = hasCrazyComboBet(visibleBets)

  useEffect(() => {
    if (!betsOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') closeBets()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [betsOpen, closeBets])

  useLayoutEffect(() => {
    const root = overlayRef.current
    if (!root) return undefined

    function syncToggleLift() {
      if (
        !betsOpen ||
        !currentBetsToggleRef.current ||
        !betsTableRef.current
      ) {
        root.style.removeProperty('--race-bets-lift')
        return
      }

      const toggleRect = currentBetsToggleRef.current.getBoundingClientRect()
      const tableTop = betsTableRef.current.getBoundingClientRect().top
      const gap = Number.parseFloat(
        getComputedStyle(root).getPropertyValue('--race-current-bets-table-gap'),
      )
      const safeGap = Number.isFinite(gap) ? gap : 0
      // Lift so the button bottom sits above the board, not over the grid.
      const lift = toggleRect.bottom - (tableTop - safeGap)
      root.style.setProperty(
        '--race-bets-lift',
        `${Math.max(0, Math.round(lift))}px`,
      )
    }

    syncToggleLift()

    const table = betsTableRef.current
    const observer =
      typeof ResizeObserver !== 'undefined' && table
        ? new ResizeObserver(syncToggleLift)
        : null
    observer?.observe(table)
    window.addEventListener('resize', syncToggleLift)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', syncToggleLift)
      root.style.removeProperty('--race-bets-lift')
    }
  }, [
    betsOpen,
    visibleBets.length,
    showCrazyCombos,
    viewportScale,
    orientation,
  ])

  if (!isRaceUiVisible) {
    return null
  }

  const currentBetsToggle = (
    <button
      ref={currentBetsToggleRef}
      type="button"
      className={`race-overlay__current-bets${betsOpen ? ' is-open' : ''}`}
      style={{ backgroundImage: `url(${uiAssets.myBetsHistory})` }}
      aria-label="Current bets"
      aria-expanded={betsOpen}
      aria-controls="race-current-bets-dialog"
      onClick={() => setBetsOpenForKey(betsOpen ? null : raceKey)}
    >
      <span className="race-overlay__current-bets-handle" aria-hidden="true">
        <img src={uiAssets.historyBetsToggleArrow} alt="" draggable={false} />
      </span>
      CURRENT BETS
    </button>
  )

  return (
    <div
      ref={overlayRef}
      className={`race-overlay${betsOpen ? ' is-bets-open' : ''}`}
      data-compact={compact ? 'true' : undefined}
      data-orient={orientation}
      data-round-id={round?.id ?? undefined}
      data-round-status={status ?? undefined}
      style={{ '--hud-scale': viewportScale }}
    >
      <BettingBanner secondsLeft={elapsedLabel} />

      {compact ? <HudMenuChrome placement="top" /> : null}

      {betsOpen ? (
        <button
          type="button"
          className="race-bets-sheet__darken"
          aria-label="Close current bets"
          onClick={closeBets}
        />
      ) : null}

      <div className="betting-overlay__bottom">
        {!betsOpen ? <HudFade /> : null}
        <div className="betting-overlay__hud">
          {betsOpen ? (
            <div
              id="race-current-bets-dialog"
              ref={betsDialogRef}
              className="race-bets-sheet__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Current bets"
              tabIndex={-1}
            >
              <CurrentBetsBoard
                bets={visibleBets}
                tableRef={betsTableRef}
                showCrazyCombos={showCrazyCombos}
                showComboBar={showComboBar}
                showCrazyComboBar={showCrazyComboBar}
                comboPick={visibleComboPick}
                crazyComboPicks={visibleCrazyComboPicks}
              />
            </div>
          ) : null}

          <div className="race-overlay__toggle-portal">{currentBetsToggle}</div>

          <footer className="betting-footer race-overlay__footer">
            <div className="betting-footer__balance-wrap">
              <span className="betting-footer__caption">BALANCE:</span>
              <div
                className="betting-footer__meter"
                style={{ backgroundImage: `url(${uiAssets.balanceBar})` }}
              >
                {formatMoney(balance)}
              </div>
            </div>

            <div className="race-overlay__mid">
              <span className="race-overlay__mid-spacer" aria-hidden="true" />
            </div>

            <div className="betting-footer__total-wrap">
              <span className="betting-footer__caption">POTENTIAL WIN:</span>
              <div
                className="betting-footer__meter"
                style={{ backgroundImage: `url(${uiAssets.balanceBar})` }}
              >
                {formatMoney(potentialWin)}
              </div>
            </div>

            {compact ? null : <HudMenuChrome placement="footer" />}
          </footer>
        </div>
      </div>

      <HudFullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
      />
    </div>
  )
}
