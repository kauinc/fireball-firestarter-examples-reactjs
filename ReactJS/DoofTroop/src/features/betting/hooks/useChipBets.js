import { useCallback, useEffect, useMemo, useState } from 'react'
import { publishRoundBets } from '../state/roundBetsStore.js'
import { betTargetKey } from '../utils/betTargets.js'
import { consolidateChips, getBetTotal, roundMoney, stackTotal } from '../utils/chipMath.js'

let betSeq = 0

function nextBetId() {
  betSeq += 1
  return `bet-${betSeq}`
}

/**
 * Local chip placements. Same denomination stacks, then consolidates
 * into higher chips when exact combinations are possible.
 * Remount the consumer with `key={roundId}` to clear bets for a new round.
 */
export function useChipBets(
  selectedPositions,
  roundId = null,
  crazyCombo = false,
  comboPick = null,
  crazyComboPicks = null,
) {
  const [bets, setBets] = useState([])

  const totalBet = useMemo(
    () => roundMoney(bets.reduce((sum, bet) => sum + stackTotal(bet.chips), 0)),
    [bets],
  )

  useEffect(() => {
    publishRoundBets(roundId, bets, { crazyCombo, comboPick, crazyComboPicks })
  }, [roundId, bets, crazyCombo, comboPick, crazyComboPicks])

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

export { getBetTotal, consolidateChips }
