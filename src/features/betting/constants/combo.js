import { POSITION_OPTIONS } from './doofs.js'

/**
 * When regular COMBO mode is active, all color/pattern/accessory bars highlight.
 * Positions stay dimmed via `.mid-controls-stack.is-combo-active`.
 */

/** @returns {Record<'1st' | '2nd' | '3rd', { color: string, pattern: string } | null>} */
export function emptyCrazyComboPicks() {
  return Object.fromEntries(POSITION_OPTIONS.map((pos) => [pos, null]))
}

export function hasCrazyComboPicks(picks) {
  if (!picks) return false
  return POSITION_OPTIONS.some((pos) => picks[pos] != null)
}

export function isCrazyComboComplete(picks) {
  if (!picks) return false
  return POSITION_OPTIONS.every((pos) => picks[pos] != null)
}

export function isCrazyComboDoofTaken(picks, color, pattern) {
  if (!picks) return false
  return Object.values(picks).some(
    (pick) => pick?.color === color && pick?.pattern === pattern,
  )
}

/** @returns {'1st' | '2nd' | '3rd' | null} */
export function nextCrazyComboSlot(picks) {
  if (!picks) return '1st'
  return POSITION_OPTIONS.find((pos) => !picks[pos]) ?? null
}

/** Combo / crazy-combo bar bets require a regular COMBO pick when crazy combo mode is on. */
export function requiresComboPickBeforeBet(crazyCombo, comboPick) {
  return Boolean(crazyCombo && !comboPick)
}

export function canPlaceBetTarget(target, { crazyCombo, comboPick, crazyComboPicks }) {
  if (!target) return false
  if (target.type === 'combo') {
    return !requiresComboPickBeforeBet(crazyCombo, comboPick)
  }
  if (target.type === 'crazyCombo') {
    return isCrazyComboComplete(crazyComboPicks)
  }
  return true
}
