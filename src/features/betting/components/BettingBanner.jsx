/**
 * Timer bar from product mockup:
 * optional title above a gold metallic pill with the value inside.
 * Race HUD reuses the same pill (MM:SS, no title).
 */
export function BettingBanner({ label = null, secondsLeft }) {
  return (
    <div className="betting-banner" role="status" aria-live="polite">
      {label != null && label !== '' ? (
        <p className="betting-banner__label">{label}</p>
      ) : null}
      <div className="betting-banner__pill">
        <span className="betting-banner__value">{secondsLeft}</span>
      </div>
    </div>
  )
}
