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
import { useFullscreen } from '../hooks/useFullscreen.js'
import { uiAssets } from '../assets/uiAssets.js'
import { positionsUpTo } from '../constants/positions.js'
import { emptyCrazyComboPicks, isCrazyComboComplete, isCrazyComboDoofTaken, nextCrazyComboSlot, requiresComboPickBeforeBet, canPlaceBetTarget } from '../constants/combo.js'
import {
  HudFade,
  HudFullscreenButton,
  HudMenuChrome,
  useHudViewportContext,
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
  const [comboActive, setComboActive] = useState(false)
  const [comboPick, setComboPick] = useState(null)
  const [crazyComboPickActive, setCrazyComboPickActive] = useState(false)
  const [crazyComboActiveSlot, setCrazyComboActiveSlot] = useState(null)
  const [crazyComboPicks, setCrazyComboPicks] = useState(emptyCrazyComboPicks)

  function handleComboToggle() {
    setCrazyComboPickActive(false)
    setCrazyComboActiveSlot(null)
    setComboActive((active) => !active)
  }

  function handleComboBarPick(kind, key) {
    setComboPick({ kind, key })
    setComboActive(false)
  }

  function handleCrazyComboBarClick(requestedSlot = null) {
    if (disabled || comboActive) return

    if (crazyComboPickActive) {
      if (requestedSlot && requestedSlot !== crazyComboActiveSlot) {
        setCrazyComboActiveSlot(requestedSlot)
        return
      }
      setCrazyComboPickActive(false)
      setCrazyComboActiveSlot(null)
      return
    }

    const resumePicks = isCrazyComboComplete(crazyComboPicks)
      ? emptyCrazyComboPicks()
      : crazyComboPicks

    if (resumePicks !== crazyComboPicks) {
      setCrazyComboPicks(resumePicks)
    }

    const slot = requestedSlot ?? nextCrazyComboSlot(resumePicks) ?? '1st'
    setCrazyComboActiveSlot(slot)
    setCrazyComboPickActive(true)
  }

  function handleCrazyComboDoofPick(color, pattern) {
    if (!crazyComboPickActive || !crazyComboActiveSlot) return
    if (isCrazyComboDoofTaken(crazyComboPicks, color, pattern)) return

    const nextPicks = {
      ...crazyComboPicks,
      [crazyComboActiveSlot]: { color, pattern },
    }
    setCrazyComboPicks(nextPicks)

    const nextSlot = nextCrazyComboSlot(nextPicks)
    if (nextSlot) {
      setCrazyComboActiveSlot(nextSlot)
      return
    }

    setCrazyComboPickActive(false)
    setCrazyComboActiveSlot(null)
  }

  function resetComboSelections() {
    setComboActive(false)
    setComboPick(null)
    setCrazyComboPickActive(false)
    setCrazyComboActiveSlot(null)
    setCrazyComboPicks(emptyCrazyComboPicks())
  }

  const { bets, totalBet, placeBet, clearBets, doubleBets } = useChipBets(
    selectedPositions,
    sessionKey,
    crazyCombo,
    comboPick,
    crazyComboPicks,
  )
  const { dragChip, startDrag, clearDrag, isDragPlacement } = useChipDrag({
    disabled: disabled || hidden || comboActive || crazyComboPickActive,
    placeBet: (amount, target) => {
      if (
        !canPlaceBetTarget(target, { crazyCombo, comboPick, crazyComboPicks })
      ) {
        return
      }
      placeBet(amount, target)
    },
    boardRef,
  })

  function handleClear() {
    resetComboSelections()
    clearBets()
  }

  // Round-scoped state remounts via parent `key={sessionKey}` — no render reset.

  if (hidden) return null

  const comboPickRequired = requiresComboPickBeforeBet(crazyCombo, comboPick)
  const boardBettingDisabled = disabled

  function handlePlaceBet(target) {
    if (isDragPlacement()) return
    clearDrag()
    if (disabled || comboActive || crazyComboPickActive || !target) {
      return
    }
    if (!canPlaceBetTarget(target, { crazyCombo, comboPick, crazyComboPicks })) {
      return
    }
    placeBet(selectedChip, target)
  }

  const labelBets = bets.filter(
    (bet) => bet.target.type === 'color' || bet.target.type === 'pattern',
  )
  const accessoryBets = bets.filter((bet) => bet.target.type === 'accessory')
  const comboBet =
    bets.find((bet) => bet.target.type === 'combo') ?? null
  const crazyComboBet =
    bets.find((bet) => bet.target.type === 'crazyCombo') ?? null
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
      data-combo={comboActive ? 'true' : 'false'}
      data-crazy-combo-pick={crazyComboPickActive ? 'true' : 'false'}
      data-combo-pick-required={comboPickRequired ? 'true' : 'false'}
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
            disabled={boardBettingDisabled}
            bets={bets}
            labelBets={labelBets}
            onPlaceBet={handlePlaceBet}
            comboActive={comboActive}
            crazyComboPickActive={crazyComboPickActive}
            crazyComboActiveSlot={crazyComboActiveSlot}
            crazyComboPicks={crazyComboPicks}
            onCrazyComboDoofPick={handleCrazyComboDoofPick}
            onComboBarPick={handleComboBarPick}
          />

          {showAdvancedChrome ? (
            <MidControls
              accessory={accessory}
              onAccessoryChange={setAccessory}
              selectedPositions={selectedPositions}
              onSelectPosition={(pos) => {
                if (disabled || comboActive) return
                const next = positionsUpTo(pos)
                if (next) setSelectedPositions(next)
              }}
              disabled={disabled}
              bets={accessoryBets}
              onPlaceBet={handlePlaceBet}
              historyOpen={historyOpen}
              onHistoryOpenChange={setHistoryOpen}
              crazyCombo={crazyCombo}
              comboActive={comboActive}
              onComboBarPick={handleComboBarPick}
              onComboToggle={handleComboToggle}
              comboPick={comboPick}
              comboBet={comboBet}
              crazyComboBet={crazyComboBet}
              onPlaceComboBet={handlePlaceBet}
              crazyComboPickActive={crazyComboPickActive}
              crazyComboActiveSlot={crazyComboActiveSlot}
              crazyComboPicks={crazyComboPicks}
              onCrazyComboBarClick={handleCrazyComboBarClick}
              comboPickRequired={comboPickRequired}
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
                  if (!next) {
                    setHistoryOpen(false)
                    setComboActive(false)
                    setComboPick(null)
                    setCrazyComboPickActive(false)
                    setCrazyComboActiveSlot(null)
                    setCrazyComboPicks(emptyCrazyComboPicks())
                  } else if (orientation === 'landscape') setHistoryOpen(true)
                  return next
                })
                return
              }
              setCrazyCombo((v) => {
                const next = !v
                if (!next) {
                  setComboActive(false)
                  setComboPick(null)
                  setCrazyComboPickActive(false)
                  setCrazyComboActiveSlot(null)
                  setCrazyComboPicks(emptyCrazyComboPicks())
                }
                return next
              })
            }}
            switchLabel={compact ? 'ADVANCED MENU' : 'CRAZY COMBO'}
            onClear={handleClear}
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
  const { scale: viewportScale, compact, orientation } = useHudViewportContext()
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
