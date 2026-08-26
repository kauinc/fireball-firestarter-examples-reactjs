import { uiAssets } from '../../betting/assets/uiAssets.js'

/**
 * Shared fullscreen control for betting / race / settlement overlays.
 */
export function HudFullscreenButton({ isFullscreen, onToggle }) {
  return (
    <button
      type="button"
      className={`betting-overlay__fullscreen${isFullscreen ? ' is-active' : ''}`}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      aria-pressed={isFullscreen}
      onClick={onToggle}
    >
      <img
        src={uiAssets.fullscreen}
        alt=""
        className="betting-overlay__fullscreen-icon"
        draggable={false}
      />
    </button>
  )
}

/**
 * Decorative menu chrome — no handler in this prototype.
 * Kept out of the tab order so it does not look interactive.
 */
export function HudMenuChrome({ placement = 'footer' }) {
  const className =
    placement === 'top' ? 'betting-overlay__menu-top' : 'betting-footer__menu'

  return (
    <div
      className={className}
      style={{ backgroundImage: `url(${uiAssets.roundButton})` }}
      role="presentation"
      aria-hidden="true"
    >
      <span className="betting-footer__menu-icon" aria-hidden="true" />
    </div>
  )
}

export function HudFade() {
  return <div className="betting-overlay__fade" aria-hidden="true" />
}
