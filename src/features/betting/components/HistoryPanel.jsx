import { useMemo } from 'react'
import { POSITION_OPTIONS } from '../constants/doofs.js'
import { pickRandomDoofUrls } from '../assets/doofImages.js'
import { uiAssets } from '../assets/uiAssets.js'

const HISTORY_ROWS = 10

/**
 * Round history sheet (10 × 1st/2nd/3rd) over the History bar asset.
 * Placeholder random roster until live results are wired.
 */
export function HistoryPanel({ open }) {
  const cells = useMemo(() => {
    if (!open) return []
    return pickRandomDoofUrls(HISTORY_ROWS * POSITION_OPTIONS.length)
  }, [open])

  if (!open) return null

  return (
    <div className="history-sheet">
      <div className="history-sheet__cols" aria-hidden="true">
        {POSITION_OPTIONS.map((pos) => (
          <span key={pos}>{pos}</span>
        ))}
      </div>

      <div
        className="history-panel"
        role="table"
        aria-label="Round history"
        style={{ backgroundImage: `url(${uiAssets.historyBar})` }}
      >
        {Array.from({ length: HISTORY_ROWS }, (_, row) => (
          <div key={row} className="history-panel__row" role="row">
            {POSITION_OPTIONS.map((pos, col) => {
              const src = cells[row * POSITION_OPTIONS.length + col]
              return (
                <div
                  key={`${row}-${pos}`}
                  className="history-panel__cell"
                  role="cell"
                >
                  {src ? <img src={src} alt="" draggable={false} /> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
