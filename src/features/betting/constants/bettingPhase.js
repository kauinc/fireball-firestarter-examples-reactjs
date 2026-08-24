/**
 * Local betting-window phases for the betting HUD.
 */
export const BettingPhase = Object.freeze({
  /** PLACE YOUR BETS — countdown running */
  OPEN: 'open',
  /** NO MORE BETS — timer at 0 while status is still BETTING_OPEN */
  CLOSED: 'closed',
  /** Betting UI hidden — not BETTING_OPEN */
  HIDDEN: 'hidden',
})

/** Client-side betting window length while `rounds.status === BETTING_OPEN`. */
export const BETTING_WINDOW_SECONDS = 10

export const BETTING_BANNER = Object.freeze({
  [BettingPhase.OPEN]: 'PLACE YOUR BETS',
  [BettingPhase.CLOSED]: 'NO MORE BETS',
})
