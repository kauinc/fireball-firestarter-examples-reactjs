import { DoofGrid } from '../../betting/components/DoofGrid.jsx'
import { ChipStack } from '../../betting/components/ChipStack.jsx'
import { CrazyCombos } from '../../betting/components/CrazyCombos.jsx'
import { uiAssets } from '../../betting/assets/uiAssets.js'
import { DOOF_ACCESSORIES } from '../../betting/constants/doofs.js'
import { accessoryTarget } from '../../betting/utils/betTargets.js'

/**
 * Read-only board body under the CURRENT BETS toggle.
 * Crazy Combo bars when the round had combo-mode activity.
 */
export function CurrentBetsBoard({
  bets = [],
  tableRef = null,
  showCrazyCombos = false,
  showComboBar = false,
  showCrazyComboBar = false,
  comboPick = null,
  crazyComboPicks = null,
}) {
  const labelBets = bets.filter(
    (bet) => bet.target.type === 'color' || bet.target.type === 'pattern',
  )
  const accessoryBets = bets.filter((bet) => bet.target.type === 'accessory')
  const comboBet = bets.find((bet) => bet.target.type === 'combo') ?? null
  const crazyComboBet = bets.find((bet) => bet.target.type === 'crazyCombo') ?? null

  return (
    <div className="race-bets-sheet__board betting-overlay__hud">
      <div className="race-bets-sheet__table" ref={tableRef}>
        <DoofGrid disabled bets={bets} labelBets={labelBets} />
      </div>

      <div
        className={`mid-controls-stack${showCrazyCombos ? ' is-crazy' : ''}`}
      >
        <div className="mid-controls">
          <div className="mid-controls__accessories" aria-label="Accessory bets">
            {DOOF_ACCESSORIES.map((item) => {
              const stack = accessoryBets.find(
                (bet) =>
                  bet.target.type === 'accessory' &&
                  bet.target.accessory === item,
              )
              const iconSrc =
                item === 'Hats' ? uiAssets.hatIcon : uiAssets.glassesIcon
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
                    <span className="mid-controls__accessory-chip">
                      <ChipStack chips={stack.chips} />
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {showCrazyCombos ? (
          <div className="crazy-combos-row">
            <CrazyCombos
              readOnly
              showComboBar={showComboBar}
              showCrazyComboBar={showCrazyComboBar}
              comboPick={comboPick}
              comboBet={comboBet}
              crazyComboBet={crazyComboBet}
              crazyComboPicks={crazyComboPicks ?? {}}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
