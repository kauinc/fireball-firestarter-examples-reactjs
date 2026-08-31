import { DOOF_ACCESSORIES, POSITION_OPTIONS } from '../constants/doofs.js'
import {
  maxSelectedPosition,
  POSITION_FILL_WIDTH,
  POSITION_LABELS,
  POSITION_THUMB_LEFT,
} from '../constants/positions.js'
import { uiAssets } from '../assets/uiAssets.js'
import { accessoryTarget } from '../utils/betTargets.js'
import { getComboBarState, comboAccessoryPickBarBackground } from '../utils/comboBars.js'
import { ChipStack } from './ChipStack.jsx'
import { HistoryControl } from './HistoryControl.jsx'
import { CrazyCombos } from './CrazyCombos.jsx'

/**
 * HISTORY + Hats / Glasses + POSITION(S) stay fixed.
 * Crazy Combo only adds payout bars below — HUD shifts up, nothing jumps.
 */
export function MidControls({
  accessory: _accessory,
  onAccessoryChange,
  selectedPositions,
  onSelectPosition,
  disabled = false,
  bets = [],
  onPlaceBet,
  historyOpen = false,
  onHistoryOpenChange,
  crazyCombo = false,
  comboActive = false,
  onComboBarPick,
  onComboToggle,
  comboPick = null,
  comboBet = null,
  crazyComboBet = null,
  onPlaceComboBet,
  crazyComboPickActive = false,
  crazyComboActiveSlot = null,
  crazyComboPicks = {},
  onCrazyComboBarClick,
  comboPickRequired = false,
}) {
  const thumbPos = maxSelectedPosition(selectedPositions)
  const fillWidth = POSITION_FILL_WIDTH[thumbPos] || POSITION_FILL_WIDTH['1st']

  return (
    <div
      className={`mid-controls-stack${crazyCombo ? ' is-crazy' : ''}${comboActive ? ' is-combo-active' : ''}${crazyComboPickActive ? ' is-crazy-combo-active' : ''}`}
    >
      <div className="mid-controls">
        <HistoryControl open={historyOpen} onOpenChange={onHistoryOpenChange} />

        <div className="mid-controls__accessories">
          {DOOF_ACCESSORIES.map((item) => {
            const stack = bets.find(
              (bet) =>
                bet.target.type === 'accessory' &&
                bet.target.accessory === item,
            )
            const target = accessoryTarget(item)
            const iconSrc =
              item === 'Hats' ? uiAssets.hatIcon : uiAssets.glassesIcon
            const { highlight: accessoryHighlight } = getComboBarState(comboActive)
            const barAsset =
              comboActive && accessoryHighlight
                ? comboAccessoryPickBarBackground()
                : uiAssets.hatsGlassesBar

            function handleAccessoryActivate() {
              if (disabled) return
              if (comboActive && accessoryHighlight) {
                onComboBarPick?.('accessories', item)
                return
              }
              if (onPlaceBet) onPlaceBet(target)
              onAccessoryChange?.(item)
            }

            return (
              <button
                key={item}
                type="button"
                className={`mid-controls__accessory${comboActive && accessoryHighlight ? ' is-combo-inactive' : ''}`}
                style={{ backgroundImage: `url(${barAsset})` }}
                disabled={disabled || crazyComboPickActive}
                data-bet-drop={comboActive ? undefined : JSON.stringify(target)}
                onPointerUp={(event) => {
                  if (disabled || event.button !== 0) return
                  handleAccessoryActivate()
                }}
                onClick={(event) => {
                  if (disabled || event.detail !== 0) return
                  handleAccessoryActivate()
                }}
              >
                <span className="mid-controls__accessory-label">{item}</span>
                <img
                  src={iconSrc}
                  alt=""
                  className={`mid-controls__accessory-icon${
                    item === 'Glasses'
                      ? ' mid-controls__accessory-icon--glasses'
                      : ''
                  }`}
                  draggable={false}
                />
                {stack ? (
                  <span className="mid-controls__accessory-chip">
                    <ChipStack chips={stack.chips} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mid-controls__positions" role="group" aria-label="Positions">
          <span className="mid-controls__positions-title">POSITION(S)</span>

          <div className="mid-controls__positions-frame-wrap">
            <div className="mid-controls__positions-frame">
              <div className="mid-controls__positions-track">
                <div
                  className="mid-controls__positions-fill"
                  data-pos={thumbPos}
                  style={{ width: fillWidth }}
                  aria-hidden="true"
                />
              </div>

              <div className="mid-controls__position-tabs">
                {POSITION_OPTIONS.map((pos) => {
                  const selected = selectedPositions.includes(pos)
                  return (
                    <button
                      key={pos}
                      type="button"
                      className={`mid-controls__position${selected ? ' is-selected' : ''}`}
                      disabled={disabled || comboActive || crazyComboPickActive}
                      aria-pressed={selected}
                      onClick={() => onSelectPosition(pos)}
                    >
                      <span>{POSITION_LABELS[pos] ?? pos}</span>
                    </button>
                  )
                })}
              </div>

              <img
                src={uiAssets.positionFrame}
                alt=""
                className="mid-controls__positions-frame-art"
                draggable={false}
              />
            </div>

            <img
              src={uiAssets.scrollPositionThumb}
              alt=""
              className="mid-controls__scroll-thumb"
              style={{ left: POSITION_THUMB_LEFT[thumbPos] }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {crazyCombo ? (
        <div className="crazy-combos-row">
          <CrazyCombos
            comboActive={comboActive}
            onComboToggle={onComboToggle}
            comboDisabled={disabled}
            comboPick={comboPick}
            comboBet={comboBet}
            crazyComboBet={crazyComboBet}
            onPlaceBet={onPlaceComboBet}
            crazyComboPickActive={crazyComboPickActive}
            crazyComboActiveSlot={crazyComboActiveSlot}
            crazyComboPicks={crazyComboPicks}
            onCrazyComboBarClick={onCrazyComboBarClick}
            crazyComboDisabled={disabled || comboActive}
            comboPickRequired={comboPickRequired}
          />
        </div>
      ) : null}
    </div>
  )
}
