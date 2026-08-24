import { useCallback, useMemo, useState } from 'react'
import { CHIP_VALUES } from '../constants/doofs.js'
import { betTargetKey } from '../utils/betTargets.js'

let betSeq = 0

function nextBetId() {
  betSeq += 1
  return `bet-${betSeq}`
}

function stackTotal(chips) {
  return chips.reduce((sum, chip) => sum + chip.value * chip.count, 0)
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

/**
 * Re-express a stack as the fewest / highest denominations for its total.
 * e.g. 1 + 2 + 2 → 5, and 2×0.5 → 1.
 */
export function consolidateChips(chips) {
  let cents = Math.round(stackTotal(chips) * 100)
  if (cents <= 0) return []

  const result = []
  for (let i = CHIP_VALUES.length - 1; i >= 0; i -= 1) {
    const value = CHIP_VALUES[i]
    const valueCents = Math.round(value * 100)
    const count = Math.floor(cents / valueCents)
    if (count > 0) {
      result.push({ value, count })
      cents -= count * valueCents
    }
  }

  // Keep visual order small → large (stack reads bottom → top).
  return result.reverse()
}

/**
 * Local chip placements. Same denomination stacks, then consolidates
 * into higher chips when exact combinations are possible.
 */
export function useChipBets(selectedPositions, roundId = null) {
  const [bets, setBets] = useState([])
  const [trackedRoundId, setTrackedRoundId] = useState(roundId)

  if (trackedRoundId !== roundId) {
    setTrackedRoundId(roundId)
    setBets([])
  }

  const totalBet = useMemo(
    () => roundMoney(bets.reduce((sum, bet) => sum + stackTotal(bet.chips), 0)),
    [bets],
  )

  const placeBet = useCallback(
    (amount, target) => {
      if (!amount || !target) return
      const key = betTargetKey(target)
      const positions = [...selectedPositions]

      setBets((prev) => {
        const existing = prev.find((bet) => bet.key === key)
        if (existing) {
          return prev.map((bet) => {
            if (bet.key !== key) return bet
            const same = bet.chips.find((chip) => chip.value === amount)
            const nextChips = same
              ? bet.chips.map((chip) =>
                  chip.value === amount
                    ? { ...chip, count: chip.count + 1 }
                    : chip,
                )
              : [...bet.chips, { value: amount, count: 1 }]
            return {
              ...bet,
              chips: consolidateChips(nextChips),
              positions,
            }
          })
        }
        return [
          ...prev,
          {
            id: nextBetId(),
            key,
            chips: consolidateChips([{ value: amount, count: 1 }]),
            target,
            positions,
          },
        ]
      })
    },
    [selectedPositions],
  )

  const clearBets = useCallback(() => {
    setBets([])
  }, [])

  const doubleBets = useCallback(() => {
    setBets((prev) =>
      prev.map((bet) => ({
        ...bet,
        chips: consolidateChips(
          bet.chips.map((chip) => ({
            ...chip,
            count: chip.count * 2,
          })),
        ),
      })),
    )
  }, [])

  return {
    bets,
    totalBet,
    placeBet,
    clearBets,
    doubleBets,
  }
}

export function getBetTotal(bet) {
  return roundMoney(stackTotal(bet.chips))
}
