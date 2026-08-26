import { useRef, useState } from 'react'
import { BettingBanner } from './BettingBanner.jsx'
import { DoofGrid } from './DoofGrid.jsx'
import { MidControls } from './MidControls.jsx'
import { BettingFooter } from './BettingFooter.jsx'
import { HistoryPanel } from './HistoryPanel.jsx'
import { useCurrentRound } from '../hooks/useCurrentRound.js'
import { useBettingOverlayState } from '../hooks/useBettingOverlayState.js'
import { useChipBets } from '../hooks/useChipBets.js'
import { useChipDrag } from '../hooks/useChipDrag.js'
import { useHudViewport } from '../hooks/useHudScale.js'
import { useFullscreen } from '../hooks/useFullscreen.js'
import { uiAssets } from '../assets/uiAssets.js'
import { positionsUpTo } from '../constants/positions.js'
import {
  HudFade,
  HudFullscreenButton,
  HudMenuChrome,
} from '../../hud/index.js'
import '../styles/betting.css'

/**
 * Round-scoped betting UI — remounts on new round via `key={sessionKey}`.
 */
function BettingRoundSession({
  sessionKey,
  phase,
  secondsLeft,
  bannerLabel,
  disabled,
  compact,
  orientation,
  viewportScale,
  round,
  status,
  isFullscreen,
  toggleFullscreen,
  hidden = false,
}) {
  const boardRef = useRef(null)
  const [accessory, setAccessory] = useState(null)
  const [selectedChip, setSelectedChip] = useState(5)
  const [crazyCombo, setCrazyCombo] = useState(false)
  const [advancedMenu, setAdvancedMenu] = useState(false)
  const [selectedPositions, setSelectedPositions] = useState(['1st'])
  const [historyOpen, setHistoryOpen] = useState(false)

  const { bets, totalBet, placeBet, clearBets, doubleBets } = useChipBets(
    selectedPositions,
    sessionKey,
    crazyCombo,
  )
  const { dragChip, startDrag, clearDrag, isDragPlacement } = useChipDrag({
    disabled: disabled || hidden,
    placeBet,
    boardRef,
  })

  // Round-scoped state remounts via parent `key={sessionKey}` — no render reset.

  if (hidden) return null

  function handlePlaceBet(target) {
    if (isDragPlacement()) return
    clearDrag()
    if (disabled || !target) return
    placeBet(selectedChip, target)
  }

  const labelBets = bets.filter(
    (bet) => bet.target.type === 'color' || bet.target.type === 'pattern',
  )
  const accessoryBets = bets.filter((bet) => bet.target.type === 'accessory')
  const ghostSrc =
    dragChip?.moved && dragChip ? uiAssets.chips[dragChip.value] : null

  const showAdvancedChrome = compact ? advancedMenu || crazyCombo : true
  const showPortraitTopHistory =
    compact && orientation === 'portrait' && advancedMenu

  return (
    <div
      className="betting-overlay"
      data-phase={phase}
      data-compact={compact ? 'true' : undefined}
      data-orient={orientation}
      data-advanced={showAdvancedChrome ? 'true' : 'false'}
      data-crazy={crazyCombo ? 'true' : 'false'}
      data-round-id={round?.id ?? undefined}
      data-round-number={round?.round_number ?? undefined}
      data-round-status={status ?? undefined}
      style={{ '--hud-scale': viewportScale }}
    >
      <BettingBanner label={bannerLabel} secondsLeft={secondsLeft} />

      {compact ? <HudMenuChrome placement="top" /> : null}

      {showPortraitTopHistory ? (
        <>
          <div className="hud-history-top__darken" aria-hidden="true" />
          <div className="betting-overlay__history-top">
            <HistoryPanel open />
          </div>
        </>
      ) : null}

      <div className="betting-overlay__bottom">
        <HudFade />

        <div className="betting-overlay__hud" ref={boardRef}>
          <DoofGrid
            disabled={disabled}
            bets={bets}
            labelBets={labelBets}
            onPlaceBet={handlePlaceBet}
          />

          {showAdvancedChrome ? (
            <MidControls
              accessory={accessory}
              onAccessoryChange={setAccessory}
              selectedPositions={selectedPositions}
              onSelectPosition={(pos) => {
                if (disabled) return
                const next = positionsUpTo(pos)
                if (next) setSelectedPositions(next)
              }}
              disabled={disabled}
              bets={accessoryBets}
              onPlaceBet={handlePlaceBet}
              historyOpen={historyOpen}
              onHistoryOpenChange={setHistoryOpen}
              crazyCombo={crazyCombo}
            />
          ) : null}

          <BettingFooter
            disabled={disabled}
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            onChipDragStart={startDrag}
            crazyCombo={compact ? advancedMenu : crazyCombo}
            onToggleCrazyCombo={() => {
              if (compact) {
                setAdvancedMenu((v) => {
                  const next = !v
                  setCrazyCombo(next)
                  if (!next) setHistoryOpen(false)
                  else if (orientation === 'landscape') setHistoryOpen(true)
                  return next
                })
                return
              }
              setCrazyCombo((v) => !v)
            }}
            switchLabel={compact ? 'ADVANCED MENU' : 'CRAZY COMBO'}
            onClear={clearBets}
            onDouble={doubleBets}
            totalBet={totalBet}
            hideMenu={compact}
          />
        </div>
      </div>

      <HudFullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
      />

      {ghostSrc ? (
        <div
          className="betting-chip-ghost"
          style={{
            left: dragChip.x,
            top: dragChip.y,
            backgroundImage: `url(${ghostSrc})`,
          }}
          aria-hidden="true"
        >
          <span>{dragChip.value}</span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Betting HUD driven by Supabase `rounds.status` (Realtime).
 * Visible only while status === BETTING_OPEN.
 *
 * Mobile (compact): portrait / landscape layouts match product refs.
 * Advanced Menu toggles HISTORY (landscape left / portrait top table) + Hats/Glasses/Positions.
 */
export function BettingOverlay() {
  const { scale: viewportScale, compact, orientation } = useHudViewport()
  const { round, status } = useCurrentRound()
  const { phase, secondsLeft, bannerLabel, isBettingUiVisible, disabled } =
    useBettingOverlayState({ status, round })
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  // Keep bets for the whole round (race HUD reads the same placements).
  const sessionKey = round?.id ? String(round.id) : 'no-round'

  return (
    <BettingRoundSession
      key={sessionKey}
      sessionKey={sessionKey}
      phase={phase}
      secondsLeft={secondsLeft}
      bannerLabel={bannerLabel}
      disabled={disabled}
      compact={compact}
      orientation={orientation}
      viewportScale={viewportScale}
      round={round}
      status={status}
      isFullscreen={isFullscreen}
      toggleFullscreen={toggleFullscreen}
      hidden={!isBettingUiVisible}
    />
  )
}
