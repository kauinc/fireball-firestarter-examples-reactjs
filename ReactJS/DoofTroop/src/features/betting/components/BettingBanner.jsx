/**
 * Timer bar from product mockup:
 * optional title above a gold metallic pill with the value inside.
 * Race HUD reuses the same pill (MM:SS, no title).
 *
 * Tick values are not announced (would spam every second). Phase/label
 * changes use polite live region.
 */
import { BETTING_CLOSING_THRESHOLD_SECONDS } from '../constants/bettingPhase.js'

export function BettingBanner({ label = null, secondsLeft }) {
  const numericSeconds =
    typeof secondsLeft === 'number' && Number.isFinite(secondsLeft)
      ? secondsLeft
      : null
  const isClosing =
    numericSeconds != null &&
    numericSeconds > 0 &&
    numericSeconds <= BETTING_CLOSING_THRESHOLD_SECONDS

  return (
    <div className="betting-banner">
      {label != null && label !== '' ? (
        <p className="betting-banner__label" role="status" aria-live="polite">
          {label}
        </p>
      ) : null}
      <div
        className={`betting-banner__pill${isClosing ? ' is-closing' : ''}`}
        data-blink={isClosing ? String(numericSeconds % 2) : undefined}
        aria-hidden="true"
      >
        <span className="betting-banner__value">{secondsLeft}</span>
      </div>
    </div>
  )
}
