import { uiAssets } from '../assets/uiAssets.js'
import { HistoryPanel } from './HistoryPanel.jsx'
import { playSfx } from '../../../shared/audio/index.js'

/**
 * HISTORY button + expandable sheet — shared by betting MidControls and settlement.
 */
export function HistoryControl({
  open = false,
  onOpenChange,
  panelRef = null,
  landed = false,
}) {
  return (
    <div className={`mid-controls__history-slot${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`mid-controls__history${open ? ' is-open' : ''}`}
        style={{ backgroundImage: `url(${uiAssets.myBetsHistory})` }}
        aria-expanded={open}
        onClick={() => {
          const next = !open
          onOpenChange?.(next)
          playSfx(next ? 'sheetOpen' : 'sheetClose')
        }}
      >
        <span className="mid-controls__history-handle" aria-hidden="true">
          <img src={uiAssets.historyBetsToggleArrow} alt="" draggable={false} />
        </span>
        HISTORY
      </button>
      <HistoryPanel open={open} panelRef={panelRef} landed={landed} />
    </div>
  )
}
