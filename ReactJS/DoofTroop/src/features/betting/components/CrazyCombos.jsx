import { ComboBar } from './ComboBar.jsx'
import { CrazyComboBar } from './CrazyComboBar.jsx'

/**
 * Combo payout bars — regular COMBO (C_Bar) + CRAZY COMBO row.
 */
export function CrazyCombos({
  comboActive = false,
  onComboToggle,
  comboDisabled = false,
  comboPick = null,
  comboBet = null,
  crazyComboBet = null,
  onPlaceBet,
  settleClass = '',
  crazyComboSettleClass = '',
  readOnly = false,
  showComboBar = true,
  showCrazyComboBar = true,
  comboPickRequired = false,
  crazyComboPickActive = false,
  crazyComboActiveSlot = null,
  crazyComboPicks = {},
  onCrazyComboBarClick,
  crazyComboDisabled = false,
}) {
  if (!showComboBar && !showCrazyComboBar) return null

  return (
    <div className="crazy-combos" role="group" aria-label="Combo payouts">
      {showComboBar ? (
        <ComboBar
          active={comboActive}
          onToggle={onComboToggle}
          disabled={comboDisabled}
          readOnly={readOnly}
        comboPick={comboPick}
        comboBet={comboBet}
        onPlaceBet={onPlaceBet}
        settleClass={settleClass}
        comboPickRequired={comboPickRequired}
        />
      ) : null}
      {showCrazyComboBar ? (
        <CrazyComboBar
          readOnly={readOnly}
          disabled={crazyComboDisabled}
          pickActive={crazyComboPickActive}
          activeSlot={crazyComboActiveSlot}
          picks={crazyComboPicks}
          onBarClick={onCrazyComboBarClick}
          crazyComboBet={crazyComboBet}
          onPlaceBet={onPlaceBet}
          settleClass={crazyComboSettleClass}
        />
      ) : null}
    </div>
  )
}
