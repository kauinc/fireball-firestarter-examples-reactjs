import { DOOF_COLORS, DOOF_PATTERNS, POSITION_OPTIONS } from '../../betting/constants/doofs.js'
import { getDoofImageUrl } from '../../betting/assets/doofImages.js'
import { resolveBetOutcomes } from './resolveBetOutcomes.js'

/**
 * Stable mock settlement for a round until backend results land.
 * Podium lineup is seeded by roundId; chip win/lose follows bet vs winners.
 *
 * @param {string | null | undefined} roundId
 * @param {{ bets?: ReadonlyArray<object> }} [options]
 */
export function mockSettlementForRound(roundId, { bets = [] } = {}) {
  const seed = hashSeed(String(roundId ?? 'demo'))
  const winners = POSITION_OPTIONS.map((place, index) => {
    const color = DOOF_COLORS[(seed + index * 3) % DOOF_COLORS.length]
    const pattern = DOOF_PATTERNS[(seed + index * 5) % DOOF_PATTERNS.length]
    return {
      place,
      color,
      pattern,
      src: getDoofImageUrl(color, pattern),
      timeLabel: '32:15',
    }
  })

  const outcomes = resolveBetOutcomes(bets, winners)

  return Object.freeze({
    didWin: outcomes.didWin,
    totalWin: outcomes.totalWin,
    winners: Object.freeze(winners),
    outcomes,
  })
}

function hashSeed(value) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
