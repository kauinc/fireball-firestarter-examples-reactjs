import { CHIP_VALUES } from '../constants/doofs.js'

function stackTotal(chips) {
  return chips.reduce((sum, chip) => sum + chip.value * chip.count, 0)
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

/**
 * Re-express a stack as the fewest / highest denominations for its total.
 * e.g. 1 + 2 + 2 → 5, and 2×0.5 → 1.
 * Skips consolidation when the total cannot be represented exactly
 * (e.g. 3×0.2 = 0.6 must stay three 0.2 chips, not a single 0.5).
 */
export function consolidateChips(chips) {
  let cents = Math.round(stackTotal(chips) * 100)
  if (cents <= 0) return []

  const result = []
  let remaining = cents
  for (let i = CHIP_VALUES.length - 1; i >= 0; i -= 1) {
    const value = CHIP_VALUES[i]
    const valueCents = Math.round(value * 100)
    const count = Math.floor(remaining / valueCents)
    if (count > 0) {
      result.push({ value, count })
      remaining -= count * valueCents
    }
  }

  if (remaining !== 0) return chips

  return result.reverse()
}

export function getBetTotal(bet) {
  return roundMoney(stackTotal(bet?.chips ?? []))
}

export { stackTotal, roundMoney }
