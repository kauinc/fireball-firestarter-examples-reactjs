import { useRef } from 'react'
import { DOOF_COLORS, DOOF_PATTERNS } from '../constants/doofs.js'
import { getDoofBoardCell } from '../assets/doofImages.js'
import { uiAssets } from '../assets/uiAssets.js'
import { ChipStack } from './ChipStack.jsx'
import {
  colorTarget,
  fieldChipStyle,
  patternTarget,
  resolveFieldTarget,
} from '../utils/betTargets.js'

function ChipLabel({ children, onPlace, disabled, betDrop }) {
  return (
    <button
      type="button"
      className="doof-grid__chip-label"
      style={{ '--chip-bar': `url(${uiAssets.textBar})` }}
      disabled={disabled}
      data-bet-drop={betDrop ? JSON.stringify(betDrop) : undefined}
      onPointerUp={(event) => {
        if (disabled || event.button !== 0) return
        onPlace?.()
      }}
      onClick={(event) => {
        if (disabled || event.detail !== 0) return
        onPlace?.()
      }}
    >
      <span>{children}</span>
    </button>
  )
}

/**
 * Color × pattern board (6×3) with roulette-style chip drop targets.
 */
export function DoofGrid({
  disabled = false,
  bets = [],
  onPlaceBet,
  labelBets = [],
}) {
  const playableRef = useRef(null)

  const fieldBets = bets.filter(
    (bet) => bet.target.type === 'doof' || bet.target.type === 'split',
  )

  function placeFromFieldPointer(clientX, clientY) {
    if (disabled || !onPlaceBet || !playableRef.current) {
      onPlaceBet?.(null)
      return
    }
    // Coords are relative to the PNG inner grid (doof-grid__playable),
    // not the full texture — so split chips sit on the drawn lines.
    const rect = playableRef.current.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      onPlaceBet(null)
      return
    }

    const nx = (clientX - rect.left) / rect.width
    const ny = (clientY - rect.top) / rect.height
    if (nx < 0 || ny < 0 || nx > 1 || ny > 1) {
      onPlaceBet(null)
      return
    }

    onPlaceBet(resolveFieldTarget(nx, ny))
  }

  return (
    <div
      className="doof-grid"
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? 'true' : 'false'}
    >
      <div className="doof-grid__spacer" aria-hidden="true" />
      <div className="doof-grid__colors">
        {DOOF_COLORS.map((color) => {
          const stack = labelBets.find(
            (bet) => bet.target.type === 'color' && bet.target.color === color,
          )
          return (
            <div key={color} className="doof-grid__label-slot">
              <ChipLabel
                disabled={disabled}
                betDrop={colorTarget(color)}
                onPlace={() => onPlaceBet?.(colorTarget(color))}
              >
                {color}
              </ChipLabel>
              {stack ? (
                <span
                  className="doof-grid__label-chip"
                  onPointerUp={(event) => {
                    if (disabled || event.button !== 0) return
                    event.stopPropagation()
                    onPlaceBet?.(colorTarget(color))
                  }}
                >
                  <ChipStack chips={stack.chips} />
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="doof-grid__odds-spacer" aria-hidden="true" />

      <div className="doof-grid__patterns">
        {DOOF_PATTERNS.map((pattern) => {
          const stack = labelBets.find(
            (bet) =>
              bet.target.type === 'pattern' && bet.target.pattern === pattern,
          )
          return (
            <div key={pattern} className="doof-grid__label-slot">
              <ChipLabel
                disabled={disabled}
                betDrop={patternTarget(pattern)}
                onPlace={() => onPlaceBet?.(patternTarget(pattern))}
              >
                {pattern}
              </ChipLabel>
              {stack ? (
                <span
                  className="doof-grid__label-chip"
                  onPointerUp={(event) => {
                    if (disabled || event.button !== 0) return
                    event.stopPropagation()
                    onPlaceBet?.(patternTarget(pattern))
                  }}
                >
                  <ChipStack chips={stack.chips} />
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div
        className="doof-grid__field"
        style={{ backgroundImage: `url(${uiAssets.betField})` }}
        onPointerUp={(event) => {
          if (event.button !== 0) return
          placeFromFieldPointer(event.clientX, event.clientY)
        }}
      >
        <div ref={playableRef} className="doof-grid__playable">
          {DOOF_PATTERNS.flatMap((pattern) =>
            DOOF_COLORS.map((color) => {
              const cell = getDoofBoardCell(color, pattern)
              const accessoryClass =
                cell?.accessory === 'Hats' ? 'is-hat' : 'is-glasses'
              return (
                <div
                  key={`${color}-${pattern}`}
                  className={`doof-grid__cell ${accessoryClass}`}
                  aria-label={`${color} ${pattern}`}
                >
                  {cell ? (
                    <img src={cell.src} alt="" draggable={false} />
                  ) : (
                    <span className="doof-grid__missing">?</span>
                  )}
                </div>
              )
            }),
          )}

          <div className="doof-grid__chip-layer">
            {fieldBets.map((bet) => {
              if (!bet.target.anchor) return null
              return (
                <span
                  key={bet.id}
                  className="doof-grid__chip-anchor"
                  style={fieldChipStyle(bet.target.anchor)}
                  onPointerUp={(event) => {
                    if (disabled || event.button !== 0) return
                    // Re-resolve from cursor so corners/edges still work
                    // even when a stack is under the pointer.
                    event.stopPropagation()
                    placeFromFieldPointer(event.clientX, event.clientY)
                  }}
                >
                  <ChipStack chips={bet.chips} />
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="doof-grid__odds">
        <div className="doof-grid__odds-item">
          <span className="doof-grid__odds-label">MAX</span>
          <span className="doof-grid__odds-value">x1.5</span>
        </div>
        <div className="doof-grid__odds-item">
          <span className="doof-grid__odds-label">MIN</span>
          <span className="doof-grid__odds-value">x15.5</span>
        </div>
      </div>
    </div>
  )
}
