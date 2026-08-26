import { getDoofBoardCell } from '../../betting/assets/doofImages.js'
import { getBetTotal } from '../../betting/hooks/useChipBets.js'

/** Mock payout multipliers by target type (roulette-style odds feel). */
const PAYOUT_BY_TYPE = Object.freeze({
  doof: 15.5,
  split2: 7,
  split4: 3.5,
  color: 2.5,
  pattern: 3,
  accessory: 1.5,
})

/**
 * Whether a single bet hits any podium winner for its selected positions.
 * @param {object} bet
 * @param {ReadonlyArray<{ place: string, color: string, pattern: string }>} winners
 */
export function doesBetWin(bet, winners) {
  const target = bet?.target
  if (!target || !winners?.length) return false

  const places =
    Array.isArray(bet.positions) && bet.positions.length > 0
      ? bet.positions
      : ['1st', '2nd', '3rd']

  const relevant = winners.filter((w) => places.includes(w.place))
  if (relevant.length === 0) return false

  switch (target.type) {
    case 'doof':
      return relevant.some(
        (w) => w.color === target.color && w.pattern === target.pattern,
      )
    case 'split':
      return relevant.some((w) =>
        (target.cells ?? []).some(
          (cell) => cell.color === w.color && cell.pattern === w.pattern,
        ),
      )
    case 'color':
      return relevant.some((w) => w.color === target.color)
    case 'pattern':
      return relevant.some((w) => w.pattern === target.pattern)
    case 'accessory':
      return relevant.some((w) => {
        const cell = getDoofBoardCell(w.color, w.pattern)
        return cell?.accessory === target.accessory
      })
    default:
      return false
  }
}

function payoutMultiplier(target) {
  if (!target) return 1
  if (target.type === 'split') {
    return target.coverage === 4 ? PAYOUT_BY_TYPE.split4 : PAYOUT_BY_TYPE.split2
  }
  return PAYOUT_BY_TYPE[target.type] ?? 1
}

/**
 * Resolve each bet to win/lose + stake/payout against podium winners.
 * @param {ReadonlyArray<object>} bets
 * @param {ReadonlyArray<{ place: string, color: string, pattern: string }>} winners
 */
export function resolveBetOutcomes(bets, winners) {
  /** @type {Record<string, { won: boolean, stake: number, payout: number }>} */
  const byId = {}
  let totalWin = 0
  let winCount = 0

  for (const bet of bets ?? []) {
    const stake = getBetTotal(bet)
    const won = doesBetWin(bet, winners)
    const payout = won
      ? Math.round(stake * payoutMultiplier(bet.target) * 100) / 100
      : 0
    byId[bet.id] = { won, stake, payout }
    if (won) {
      winCount += 1
      totalWin += payout
    }
  }

  return Object.freeze({
    byId: Object.freeze(byId),
    didWin: winCount > 0,
    totalWin: Math.round(totalWin * 100) / 100,
    winCount,
  })
}
