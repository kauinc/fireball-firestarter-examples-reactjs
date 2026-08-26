/**
 * Timer bar from product mockup:
 * optional title above a gold metallic pill with the value inside.
 * Race HUD reuses the same pill (MM:SS, no title).
 *
 * Tick values are not announced (would spam every second). Phase/label
 * changes use polite live region.
 */
export function BettingBanner({ label = null, secondsLeft }) {
  return (
    <div className="betting-banner">
      {label != null && label !== '' ? (
        <p className="betting-banner__label" role="status" aria-live="polite">
          {label}
        </p>
      ) : null}
      <div className="betting-banner__pill" aria-hidden="true">
        <span className="betting-banner__value">{secondsLeft}</span>
      </div>
    </div>
  )
}
