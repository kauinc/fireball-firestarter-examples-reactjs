import { useEffect, useState } from 'react'
import { BettingBanner } from '../../betting/components/BettingBanner.jsx'
import { uiAssets } from '../../betting/assets/uiAssets.js'
import { formatMoney } from '../../betting/utils/formatMoney.js'
import { useFullscreen } from '../../betting/hooks/useFullscreen.js'
import { useHudViewport } from '../../betting/hooks/useHudScale.js'
import { useCurrentRound } from '../../betting/hooks/useCurrentRound.js'
import { usePublishedRoundBets, shouldShowRaceCrazyCombos } from '../../betting/state/roundBetsStore.js'
import {
  useMockPotentialWin,
  useRaceElapsed,
  useRaceOverlayState,
} from '../hooks/useRaceOverlay.js'
import { CurrentBetsBoard } from './CurrentBetsSheet.jsx'
import { DEFAULT_BALANCE } from '../../betting/constants/defaults.js'
import '../../loading/styles/fonts.css'
import '../../betting/styles/hud-shared.css'
import '../../betting/styles/crazy-combos.css'
import '../styles/race.css'

/**
 * In-race HUD — same mobile portrait / landscape chrome as BettingOverlay:
 * Balance | CURRENT BETS | Potential Win. Open sheet = read-only board.
 */
export function RaceOverlay({ balance = DEFAULT_BALANCE }) {
  const { scale: viewportScale, compact, orientation } = useHudViewport()
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
  const { roundId: betsRoundId, bets, crazyCombo: publishedCrazyCombo } =
    usePublishedRoundBets()
  const [betsOpenForKey, setBetsOpenForKey] = useState(null)
  const betsOpen = Boolean(isRaceUiVisible && betsOpenForKey === raceKey)

  const visibleBets =
    round?.id != null && String(round.id) === String(betsRoundId ?? '')
      ? bets
      : []

  const showCrazyCombos = shouldShowRaceCrazyCombos({
    crazyCombo:
      round?.id != null && String(round.id) === String(betsRoundId ?? '')
        ? publishedCrazyCombo
        : false,
    bets: visibleBets,
  })

  useEffect(() => {
    if (!betsOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') setBetsOpenForKey(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [betsOpen])

  if (!isRaceUiVisible) {
    return null
  }

  const currentBetsToggle = (
    <button
      type="button"
      className={`race-overlay__current-bets${betsOpen ? ' is-open' : ''}`}
      style={{ backgroundImage: `url(${uiAssets.hatsGlassesBar})` }}
      aria-label="Current bets"
      aria-expanded={betsOpen}
      onClick={() => setBetsOpenForKey(betsOpen ? null : raceKey)}
    >
      <span className="race-overlay__current-bets-handle" aria-hidden="true">
        <img src={uiAssets.scrollPositionThumb} alt="" draggable={false} />
      </span>
      CURRENT BETS
    </button>
  )

  return (
    <div
      className={`race-overlay${betsOpen ? ' is-bets-open' : ''}`}
      data-compact={compact ? 'true' : undefined}
      data-orient={orientation}
      data-round-id={round?.id ?? undefined}
      data-round-status={status ?? undefined}
      style={{ '--hud-scale': viewportScale }}
    >
      <BettingBanner secondsLeft={elapsedLabel} />

      {compact ? (
        <button
          type="button"
          className="betting-overlay__menu-top"
          style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
          aria-label="Menu"
        >
          <span className="betting-footer__menu-icon" aria-hidden="true" />
        </button>
      ) : null}

      {betsOpen ? (
        <button
          type="button"
          className="race-bets-sheet__darken"
          style={{ backgroundImage: `url(${uiAssets.darkenGradientDown})` }}
          aria-label="Close current bets"
          onClick={() => setBetsOpenForKey(null)}
        />
      ) : null}

      <div className="betting-overlay__bottom">
        <div className="betting-overlay__hud">
          {betsOpen ? (
            <div
              className="race-bets-sheet__panel"
              role="dialog"
              aria-label="Current bets"
            >
              <CurrentBetsBoard
                bets={visibleBets}
                toggle={currentBetsToggle}
                showCrazyCombos={showCrazyCombos}
              />
            </div>
          ) : null}

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
              {!betsOpen ? currentBetsToggle : (
                <span className="race-overlay__mid-spacer" aria-hidden="true" />
              )}
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

            {compact ? null : (
              <button
                type="button"
                className="betting-footer__menu"
                style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
                aria-label="Menu"
              >
                <span className="betting-footer__menu-icon" aria-hidden="true" />
              </button>
            )}
          </footer>
        </div>
      </div>

      <button
        type="button"
        className={`betting-overlay__fullscreen${isFullscreen ? ' is-active' : ''}`}
        aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        aria-pressed={isFullscreen}
        onClick={toggleFullscreen}
      >
        <img
          src={uiAssets.fullscreen}
          alt=""
          className="betting-overlay__fullscreen-icon"
          draggable={false}
        />
      </button>
    </div>
  )
}
