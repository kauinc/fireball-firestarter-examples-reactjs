import { useEffect, useState } from 'react'
import { RoundState } from '../../../domain/round/index.js'

/**
 * Race HUD visibility from `rounds.status`.
 * Prototype: RACE_RUNNING only (TRACK_READY stays clear for Unreal countdown).
 *
 * @param {{ status: string | null, round?: Record<string, unknown> | null }} args
 */
export function useRaceOverlayState({ status, round = null }) {
  const isRace = status === RoundState.RACE_RUNNING
  const raceKey = `${round?.id ?? ''}:${status ?? ''}`

  return {
    isRaceUiVisible: isRace,
    raceKey,
    raceStartedAt: round?.race_started_at ?? null,
  }
}

/**
 * Resolve a usable race start ms.
 * Prefer server `race_started_at` only when it is in the past (or near-now);
 * otherwise start locally so the clock always ticks.
 *
 * @param {string | null | undefined} raceStartedAt
 * @param {number} fallbackMs
 */
function resolveStartedAtMs(raceStartedAt, fallbackMs) {
  if (!raceStartedAt) return fallbackMs
  const parsed = Date.parse(raceStartedAt)
  if (!Number.isFinite(parsed)) return fallbackMs
  // Future / wildly skewed clocks would freeze the display at 00:00.
  if (parsed > fallbackMs + 1500) return fallbackMs
  return parsed
}

/**
 * Elapsed race clock as MM:SS.
 * Same tick pattern as betting overlay (`queueMicrotask` + interval).
 *
 * @param {{
 *   active: boolean,
 *   raceStartedAt?: string | null,
 *   raceKey?: string,
 * }} args
 */
export function useRaceElapsed({ active, raceStartedAt = null, raceKey = '' }) {
  const [now, setNow] = useState(null)
  const [startedAt, setStartedAt] = useState(null)

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => {
        setStartedAt(null)
        setNow(null)
      })
      return undefined
    }
    // Capture start once per race open; ignore later race_started_at churn.
    queueMicrotask(() => {
      const openMs = Date.now()
      setStartedAt(resolveStartedAtMs(raceStartedAt, openMs))
      setNow(openMs)
    })
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps -- raceStartedAt read on open only
  }, [active, raceKey])

  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => setNow(Date.now()), 200)
    queueMicrotask(() => setNow(Date.now()))
    return () => clearInterval(id)
  }, [active])

  const elapsedMs =
    active && startedAt != null && now != null
      ? Math.max(0, now - startedAt)
      : 0
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { label, totalSeconds }
}

/**
 * Prototype potential-win flicker (random €0–1000 every few seconds).
 * @param {{ active: boolean, intervalMs?: number, maxAmount?: number }} args
 */
export function useMockPotentialWin({
  active,
  intervalMs = 3000,
  maxAmount = 1000,
}) {
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => setAmount(0))
      return undefined
    }

    function roll() {
      const cents = Math.floor(Math.random() * (maxAmount * 100 + 1))
      setAmount(cents / 100)
    }

    queueMicrotask(roll)
    const id = setInterval(roll, intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs, maxAmount])

  return amount
}
