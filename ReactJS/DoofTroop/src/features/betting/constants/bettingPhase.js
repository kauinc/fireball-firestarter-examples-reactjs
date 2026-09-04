/**
 * Local betting-window phases for the betting HUD.
 */
export const BettingPhase = Object.freeze({
  /** PLACE YOUR BETS — countdown running */
  OPEN: 'open',
  /** BETS CLOSING — final seconds before the window closes */
  CLOSING: 'closing',
  /** NO MORE BETS — timer at 0 while status is still BETTING_OPEN */
  CLOSED: 'closed',
  /** Betting UI hidden — not BETTING_OPEN */
  HIDDEN: 'hidden',
})

/** Client-side betting window length while `rounds.status === BETTING_OPEN`. */
export const BETTING_WINDOW_SECONDS = 30

/** Show BETS CLOSING when this many seconds (or fewer) remain. */
export const BETTING_CLOSING_THRESHOLD_SECONDS = 5

export const BETTING_BANNER = Object.freeze({
  [BettingPhase.OPEN]: 'PLACE YOUR BETS',
  [BettingPhase.CLOSING]: 'BETS CLOSING',
  [BettingPhase.CLOSED]: 'NO MORE BETS',
})
