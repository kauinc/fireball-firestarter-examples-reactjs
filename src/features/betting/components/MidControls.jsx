import { DOOF_ACCESSORIES, POSITION_OPTIONS } from '../constants/doofs.js'
import {
  maxSelectedPosition,
  POSITION_FILL_ART_WIDTH,
  POSITION_FILL_WIDTH,
  POSITION_THUMB_LEFT,
} from '../constants/positions.js'
import { uiAssets } from '../assets/uiAssets.js'
import { accessoryTarget } from '../utils/betTargets.js'
import { ChipStack } from './ChipStack.jsx'
import { HistoryPanel } from './HistoryPanel.jsx'
import { CrazyCombos } from './CrazyCombos.jsx'

/**
 * HISTORY + Hats / Glasses + POSITION(S) stay fixed.
 * Crazy Combo only adds payout bars below — HUD shifts up, nothing jumps.
 */
export function MidControls({
  accessory,
  onAccessoryChange,
  selectedPositions,
  onSelectPosition,
  disabled = false,
  bets = [],
  onPlaceBet,
  historyOpen = false,
  onHistoryOpenChange,
  crazyCombo = false,
}) {
  const thumbPos = maxSelectedPosition(selectedPositions)
  const fillWidth = POSITION_FILL_WIDTH[thumbPos] || POSITION_FILL_WIDTH['1st']
  const fillArtWidth =
    POSITION_FILL_ART_WIDTH[thumbPos] || POSITION_FILL_ART_WIDTH['1st']

  return (
    <div className={`mid-controls-stack${crazyCombo ? ' is-crazy' : ''}`}>
      <div className="mid-controls">
        <div
          className={`mid-controls__history-slot${historyOpen ? ' is-open' : ''}`}
        >
          <button
            type="button"
            className={`mid-controls__history${historyOpen ? ' is-open' : ''}`}
            style={{ backgroundImage: `url(${uiAssets.hatsGlassesBar})` }}
            aria-expanded={historyOpen}
            onClick={() => onHistoryOpenChange?.(!historyOpen)}
          >
            <span className="mid-controls__history-handle" aria-hidden="true">
              <img
                src={uiAssets.scrollPositionThumb}
                alt=""
                draggable={false}
              />
            </span>
            HISTORY
          </button>
          <HistoryPanel open={historyOpen} />
        </div>

        <div className="mid-controls__accessories">
          {DOOF_ACCESSORIES.map((item) => {
            const selected = accessory === item
            const stack = bets.find(
              (bet) =>
                bet.target.type === 'accessory' &&
                bet.target.accessory === item,
            )
            const target = accessoryTarget(item)
            const iconSrc =
              item === 'Hats' ? uiAssets.hatIcon : uiAssets.glassesIcon
            return (
              <button
                key={item}
                type="button"
                className={`mid-controls__accessory${selected ? ' is-selected' : ''}`}
                style={{ backgroundImage: `url(${uiAssets.hatsGlassesBar})` }}
                disabled={disabled}
                aria-pressed={selected}
                data-bet-drop={JSON.stringify(target)}
                onPointerUp={(event) => {
                  if (disabled || event.button !== 0) return
                  if (onPlaceBet) {
                    onPlaceBet(target)
                    return
                  }
                  onAccessoryChange(selected ? null : item)
                }}
                onClick={(event) => {
                  if (disabled || event.detail !== 0) return
                  if (onPlaceBet) onPlaceBet(target)
                  else onAccessoryChange(selected ? null : item)
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
                  style={{ width: fillWidth }}
                >
                  <span className="mid-controls__positions-fill-clip">
                    <span
                      className="mid-controls__positions-fill-art"
                      style={{
                        backgroundImage: `url(${uiAssets.scrollPositionBar})`,
                        width: fillArtWidth,
                      }}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>

              <div className="mid-controls__position-tabs">
                {POSITION_OPTIONS.map((pos) => {
                  const selected = selectedPositions.includes(pos)
                  return (
                    <button
                      key={pos}
                      type="button"
                      className={`mid-controls__position${selected ? ' is-selected' : ''}`}
                      disabled={disabled}
                      aria-pressed={selected}
                      onClick={() => onSelectPosition(pos)}
                    >
                      <span>{pos}</span>
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
          <CrazyCombos />
        </div>
      ) : null}
    </div>
  )
}
