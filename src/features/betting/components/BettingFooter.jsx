import { CHIP_VALUES } from '../constants/doofs.js'
import { uiAssets } from '../assets/uiAssets.js'
import { formatMoney } from '../utils/formatMoney.js'

/**
 * Bottom chrome:
 * Desktop — Balance · Crazy Combo · Clear · chips · x2 · Total Bet · menu
 * Portrait — chip tray above; Balance | Crazy Combo | Total Bet below
 */
export function BettingFooter({
  disabled = false,
  selectedChip,
  onSelectChip,
  onChipDragStart,
  crazyCombo,
  onToggleCrazyCombo,
  onClear,
  onDouble,
  balance = 5100,
  totalBet = 0,
  hideMenu = false,
}) {
  return (
    <footer className="betting-footer">
      <div className="betting-footer__balance-wrap">
        <span className="betting-footer__caption">BALANCE:</span>
        <div
          className="betting-footer__meter"
          style={{ backgroundImage: `url(${uiAssets.balanceBar})` }}
        >
          {formatMoney(balance)}
        </div>
      </div>

      <div className="betting-footer__combo-wrap">
        <span className="betting-footer__caption">CRAZY COMBO</span>
        <button
          type="button"
          className={`betting-footer__combo${crazyCombo ? ' is-on' : ''}`}
          disabled={disabled}
          aria-pressed={crazyCombo}
          onClick={onToggleCrazyCombo}
        >
          <span
            className="betting-footer__switch"
            style={{ backgroundImage: `url(${uiAssets.toggleFrame})` }}
          >
            <img
              src={uiAssets.activeToggle}
              alt=""
              className="betting-footer__switch-active"
              draggable={false}
            />
            <img
              src={uiAssets.toggleSlide}
              alt=""
              className="betting-footer__knob"
              draggable={false}
            />
          </span>
        </button>
      </div>

      <div className="betting-footer__tray">
        <button
          type="button"
          className="betting-footer__round"
          style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
          disabled={disabled || !onClear}
          onClick={onClear}
        >
          CLEAR
        </button>

        <div className="betting-footer__chips" role="group" aria-label="Chips">
          {CHIP_VALUES.map((value) => {
            const src = uiAssets.chips[value]
            const selected = selectedChip === value
            return (
              <button
                key={value}
                type="button"
                className={`betting-footer__chip${selected ? ' is-selected' : ''}`}
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onSelectChip(value)}
                onPointerDown={(event) => {
                  if (disabled || event.button !== 0) return
                  onSelectChip(value)
                  onChipDragStart?.(event, value)
                }}
              >
                {selected ? (
                  <img
                    src={uiAssets.chipHighlighter}
                    alt=""
                    className="betting-footer__chip-glow"
                    draggable={false}
                  />
                ) : null}
                {src ? <img src={src} alt="" draggable={false} /> : null}
                <span>{value}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="betting-footer__round"
          style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
          disabled={disabled || !onDouble}
          onClick={onDouble}
        >
          x2
        </button>
      </div>

      <div className="betting-footer__total-wrap">
        <span className="betting-footer__caption">TOTAL BET:</span>
        <div
          className="betting-footer__meter"
          style={{ backgroundImage: `url(${uiAssets.balanceBar})` }}
        >
          {formatMoney(totalBet)}
        </div>
      </div>

      {hideMenu ? null : (
        <button
          type="button"
          className="betting-footer__menu"
          style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
          aria-label="Menu"
          disabled={disabled}
        >
          <span className="betting-footer__menu-icon" aria-hidden="true" />
        </button>
      )}
    </footer>
  )
}
