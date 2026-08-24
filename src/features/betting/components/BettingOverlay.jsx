import { useState } from 'react'
import { BettingBanner } from './BettingBanner.jsx'
import { DoofGrid } from './DoofGrid.jsx'
import { MidControls } from './MidControls.jsx'
import { BettingFooter } from './BettingFooter.jsx'
import { useCurrentRound } from '../hooks/useCurrentRound.js'
import { useBettingOverlayState } from '../hooks/useBettingOverlayState.js'
import { useChipBets } from '../hooks/useChipBets.js'
import { useChipDrag } from '../hooks/useChipDrag.js'
import { useHudScale } from '../hooks/useHudScale.js'
import { useFullscreen } from '../hooks/useFullscreen.js'
import { uiAssets } from '../assets/uiAssets.js'
import { positionsUpTo } from '../constants/positions.js'
import { RoundState } from '../../../domain/round/index.js'
import '../../loading/styles/fonts.css'
import '../styles/betting.css'

/**
 * Betting HUD driven by Supabase `rounds.status` (Realtime).
 * Visible only while status === BETTING_OPEN.
 */
export function BettingOverlay() {
  const viewportScale = useHudScale()
  const { round, status } = useCurrentRound()
  const { phase, secondsLeft, bannerLabel, isBettingUiVisible, disabled } =
    useBettingOverlayState({ status, round })

  const sessionKey =
    status === RoundState.BETTING_OPEN && round?.id ? String(round.id) : null

  const [trackedSessionKey, setTrackedSessionKey] = useState(sessionKey)
  const [accessory, setAccessory] = useState(null)
  const [selectedChip, setSelectedChip] = useState(5)
  const [crazyCombo, setCrazyCombo] = useState(false)
  const [selectedPositions, setSelectedPositions] = useState(['1st'])
  const [historyOpen, setHistoryOpen] = useState(false)

  const { bets, totalBet, placeBet, clearBets, doubleBets } = useChipBets(
    selectedPositions,
    sessionKey,
  )
  const { dragChip, startDrag, clearDrag, isDragPlacement } = useChipDrag({
    disabled,
    placeBet,
  })
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  if (trackedSessionKey !== sessionKey) {
    setTrackedSessionKey(sessionKey)
    setAccessory(null)
    setSelectedPositions(['1st'])
    setHistoryOpen(false)
  }

  function handlePlaceBet(target) {
    if (isDragPlacement()) return
    clearDrag()
    if (disabled || !target) return
    placeBet(selectedChip, target)
  }

  if (!isBettingUiVisible) {
    return null
  }

  const labelBets = bets.filter(
    (bet) => bet.target.type === 'color' || bet.target.type === 'pattern',
  )
  const accessoryBets = bets.filter((bet) => bet.target.type === 'accessory')
  const ghostSrc =
    dragChip?.moved && dragChip ? uiAssets.chips[dragChip.value] : null

  return (
    <div
      className="betting-overlay"
      data-phase={phase}
      data-round-id={round?.id ?? undefined}
      data-round-number={round?.round_number ?? undefined}
      data-round-status={status ?? undefined}
      style={{ '--hud-scale': viewportScale }}
    >
      <BettingBanner label={bannerLabel} secondsLeft={secondsLeft} />

      <div className="betting-overlay__bottom">
        <div className="betting-overlay__fade" aria-hidden="true" />

        <div className="betting-overlay__hud">
          <DoofGrid
            disabled={disabled}
            bets={bets}
            labelBets={labelBets}
            onPlaceBet={handlePlaceBet}
          />

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
          />

          <BettingFooter
            disabled={disabled}
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            onChipDragStart={startDrag}
            crazyCombo={crazyCombo}
            onToggleCrazyCombo={() => setCrazyCombo((v) => !v)}
            onClear={clearBets}
            onDouble={doubleBets}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            totalBet={totalBet}
          />
        </div>
      </div>

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
