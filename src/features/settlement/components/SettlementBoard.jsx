import { DoofGrid } from '../../betting/components/DoofGrid.jsx'
import { ChipStack } from '../../betting/components/ChipStack.jsx'
import { HistoryControl } from '../../betting/components/HistoryControl.jsx'
import { uiAssets } from '../../betting/assets/uiAssets.js'
import { DOOF_ACCESSORIES } from '../../betting/constants/doofs.js'
import { accessoryTarget } from '../../betting/utils/betTargets.js'
import { formatMoney } from '../../betting/utils/formatMoney.js'

/**
 * Read-only results board — same geometry as betting / race CURRENT BETS.
 * Includes HISTORY control so podium winners can animate into the sheet
 * (desktop / landscape). Portrait uses a top HistoryPanel instead.
 */
export function SettlementBoard({
  bets = [],
  didWin = false,
  displayedWin = 0,
  settleByBetId = null,
  hideSettledChips = false,
  boardRef = null,
  winBarRef = null,
  historyOpen = false,
  onHistoryOpenChange,
  historyPanelRef = null,
  historyLanded = false,
  showHistoryControl = true,
}) {
  const labelBets = bets.filter(
    (bet) => bet.target.type === 'color' || bet.target.type === 'pattern',
  )
  const accessoryBets = bets.filter((bet) => bet.target.type === 'accessory')
  const showWinBar = didWin

  return (
    <div className="settlement-board" ref={boardRef}>
      {showWinBar ? (
        <div className="settlement-win" role="status">
          <span className="settlement-win__label">TOTAL WIN:</span>
          <div className="settlement-win__bar" ref={winBarRef}>
            <strong className="settlement-win__amount">
              {formatMoney(displayedWin)}
            </strong>
          </div>
        </div>
      ) : null}

      <DoofGrid
        disabled
        bets={bets}
        labelBets={labelBets}
        settleByBetId={settleByBetId}
        hideSettledChips={hideSettledChips}
      />

      <div className="mid-controls-stack">
        <div className="mid-controls">
          {showHistoryControl ? (
            <HistoryControl
              open={historyOpen}
              onOpenChange={onHistoryOpenChange}
              panelRef={historyPanelRef}
              landed={historyLanded}
            />
          ) : null}

          <div className="mid-controls__accessories" aria-label="Accessory bets">
            {DOOF_ACCESSORIES.map((item) => {
              const stack = accessoryBets.find(
                (bet) =>
                  bet.target.type === 'accessory' &&
                  bet.target.accessory === item,
              )
              const iconSrc =
                item === 'Hats' ? uiAssets.hatIcon : uiAssets.glassesIcon
              const outcome = stack ? settleByBetId?.[stack.id] : null
              const settleClass = outcome
                ? ` is-settle-${outcome}${hideSettledChips ? ' is-settle-gone' : ''}`
                : ''
              return (
                <div
                  key={item}
                  className="mid-controls__accessory"
                  style={{ backgroundImage: `url(${uiAssets.hatsGlassesBar})` }}
                  data-bet-drop={JSON.stringify(accessoryTarget(item))}
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
                    <span
                      className={`mid-controls__accessory-chip${settleClass}`}
                      data-bet-id={stack.id}
                    >
                      <ChipStack chips={stack.chips} />
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
