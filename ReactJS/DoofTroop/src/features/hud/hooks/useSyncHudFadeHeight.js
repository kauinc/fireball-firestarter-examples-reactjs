import { useLayoutEffect } from 'react'

/**
 * Keep `.betting-overlay__fade` height from overlay bottom up to an anchor
 * (e.g. color bars), so the fade never covers above that line.
 *
 * Sets `--hud-fade-h` on `overlayRef`.
 *
 * @param {{
 *   enabled?: boolean,
 *   overlayRef: React.RefObject<HTMLElement | null>,
 *   getAnchorTop: () => number | null,
 *   deps?: unknown[],
 * }} args
 */
export function useSyncHudFadeHeight({
  enabled = true,
  overlayRef,
  getAnchorTop,
  deps = [],
}) {
  useLayoutEffect(() => {
    const root = overlayRef.current
    if (!enabled || !root) {
      root?.style.removeProperty('--hud-fade-h')
      return undefined
    }

    let frame = 0

    function sync() {
      const overlay = overlayRef.current
      if (!overlay) return
      const anchorTop = getAnchorTop()
      if (anchorTop == null || !Number.isFinite(anchorTop)) {
        overlay.style.removeProperty('--hud-fade-h')
        return
      }
      const overlayBottom = overlay.getBoundingClientRect().bottom
      const height = Math.max(0, Math.round(overlayBottom - anchorTop))
      overlay.style.setProperty('--hud-fade-h', `${height}px`)
    }

    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(sync)
      })
    }

    schedule()

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : null
    observer?.observe(root)
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
      root.style.removeProperty('--hud-fade-h')
    }
    // Caller passes explicit deps for layout triggers (viewport, chrome, etc.).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, overlayRef, getAnchorTop, ...deps])
}

/**
 * Top edge for fade under doof color bars (Red / Yellow / …).
 * Anchors slightly above the color-row top so the fade clears the pills.
 * @param {ParentNode | null | undefined} scope
 * @returns {number | null}
 */
export function getDoofColorBarsFadeAnchorTop(scope) {
  const colors = scope?.querySelector?.('.doof-grid__colors')
  if (!colors) return null
  const rect = colors.getBoundingClientRect()
  // A bit above the Red/Yellow/… row (was colors.bottom — too low).
  const lift = Math.min(36, Math.max(16, rect.height * 0.55))
  return rect.top - lift
}
