import { useSyncExternalStore } from 'react'

/**
 * HUD viewport metrics.
 * Desktop: fit 1200×640 (board + HISTORY rail).
 * Compact landscape / portrait: fit narrower footprints used by mobile.css.
 */
export const HUD_DESIGN = Object.freeze({
  width: 1200,
  height: 640,
  landscapeWidth: 900,
  landscapeHeight: 420,
  portraitWidth: 390,
  portraitHeight: 720,
  compactBreakpoint: 900,
  maxScale: 1.15,
  minScale: 0.35,
  pad: 10,
})

/** @type {{ scale: number, compact: boolean, orientation: 'portrait' | 'landscape' }} */
let cachedViewport = Object.freeze({
  scale: 1,
  compact: false,
  orientation: 'landscape',
})

function subscribeToViewport(onChange) {
  window.addEventListener('resize', onChange)
  window.addEventListener('orientationchange', onChange)
  const vv = window.visualViewport
  vv?.addEventListener('resize', onChange)
  vv?.addEventListener('scroll', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
    vv?.removeEventListener('resize', onChange)
    vv?.removeEventListener('scroll', onChange)
  }
}

function computeHudViewport() {
  const vv = window.visualViewport
  const width = Math.max(0, (vv?.width ?? window.innerWidth) - HUD_DESIGN.pad * 2)
  const height = Math.max(
    0,
    (vv?.height ?? window.innerHeight) - HUD_DESIGN.pad * 2,
  )

  if (width <= 0 || height <= 0) {
    return {
      scale: HUD_DESIGN.minScale,
      compact: true,
      orientation: 'portrait',
    }
  }

  const orientation = height > width ? 'portrait' : 'landscape'
  const compact =
    width < HUD_DESIGN.compactBreakpoint || orientation === 'portrait'

  let designW = HUD_DESIGN.width
  let designH = HUD_DESIGN.height
  if (compact && orientation === 'portrait') {
    designW = HUD_DESIGN.portraitWidth
    designH = HUD_DESIGN.portraitHeight
  } else if (compact) {
    designW = HUD_DESIGN.landscapeWidth
    designH = HUD_DESIGN.landscapeHeight
  }

  const fitted = Math.min(width / designW, height / designH)
  const scale = Math.min(
    Math.max(fitted, HUD_DESIGN.minScale),
    HUD_DESIGN.maxScale,
  )

  return { scale, compact, orientation }
}

function readHudViewport() {
  const next = computeHudViewport()
  if (
    next.scale === cachedViewport.scale &&
    next.compact === cachedViewport.compact &&
    next.orientation === cachedViewport.orientation
  ) {
    return cachedViewport
  }
  cachedViewport = Object.freeze(next)
  return cachedViewport
}

const SERVER_VIEWPORT = Object.freeze({
  scale: 1,
  compact: false,
  orientation: 'landscape',
})

export function useHudViewport() {
  return useSyncExternalStore(
    subscribeToViewport,
    readHudViewport,
    () => SERVER_VIEWPORT,
  )
}

export function useHudScale() {
  return useHudViewport().scale
}
