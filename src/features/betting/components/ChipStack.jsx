import { uiAssets } from '../assets/uiAssets.js'
import { getBetTotal } from '../utils/chipMath.js'

function formatChipTotal(value) {
  if (Number.isInteger(value)) return String(value)
  return String(value)
}

/** Expand merged denominations into individual stacked faces (cap depth). */
function expandChipLayers(chips, maxLayers = 8) {
  const layers = []
  for (const chip of chips) {
    for (let i = 0; i < chip.count; i += 1) {
      layers.push(chip.value)
      if (layers.length >= maxLayers) return layers
    }
  }
  return layers
}

/**
 * Chips stack with rightward offset.
 * Same denomination merges in state, but each unit still gets an offset face.
 * Total amount appears only on hover.
 */
export function ChipStack({ chips, className = '' }) {
  if (!chips?.length) return null

  const total = getBetTotal({ chips })
  const layers = expandChipLayers(chips)

  return (
    <span
      className={`chip-stack ${className}`.trim()}
      title={formatChipTotal(total)}
    >
      {layers.map((value, index) => {
        const src = uiAssets.chips[value]
        const isTop = index === layers.length - 1
        return (
          <span
            key={`${value}-${index}`}
            className={`chip-stack__chip${isTop ? ' is-top' : ''}`}
            style={{
              zIndex: index + 1,
              transform: `translate(calc(${index} * 7px * var(--hud-scale)), calc(${index} * -2px * var(--hud-scale)))`,
            }}
          >
            {src ? <img src={src} alt="" draggable={false} /> : null}
            {isTop ? (
              <span className="chip-stack__total">{formatChipTotal(total)}</span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}
