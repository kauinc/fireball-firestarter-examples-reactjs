/**
 * Timer bar from product mockup:
 * title above a gold metallic pill with the countdown number inside.
 */
export function BettingBanner({ label, secondsLeft }) {
  return (
    <div className="betting-banner" role="status" aria-live="polite">
      <p className="betting-banner__label">{label}</p>
      <div className="betting-banner__pill">
        <span className="betting-banner__value">{secondsLeft}</span>
      </div>
    </div>
  )
}
