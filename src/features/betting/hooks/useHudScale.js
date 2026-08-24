import { useSyncExternalStore } from 'react'

/**
 * Design footprint for the betting HUD, including the HISTORY rail
 * that hangs left of the 980px board.
 */
export const HUD_DESIGN = Object.freeze({
  width: 1200,
  height: 640,
  maxScale: 1.12,
  minScale: 0.28,
  pad: 12,
})

function subscribeToViewport(onChange) {
  window.addEventListener('resize', onChange)
  const vv = window.visualViewport
  vv?.addEventListener('resize', onChange)
  vv?.addEventListener('scroll', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    vv?.removeEventListener('resize', onChange)
    vv?.removeEventListener('scroll', onChange)
  }
}

function readViewportScale() {
  const vv = window.visualViewport
  const width = (vv?.width ?? window.innerWidth) - HUD_DESIGN.pad * 2
  const height = (vv?.height ?? window.innerHeight) - HUD_DESIGN.pad * 2
  const fitted = Math.min(width / HUD_DESIGN.width, height / HUD_DESIGN.height)
  return Math.min(Math.max(fitted, HUD_DESIGN.minScale), HUD_DESIGN.maxScale)
}

function getServerViewportScale() {
  return 1
}

/** Live `--hud-scale` factor fitted to the current viewport. */
export function useHudScale() {
  return useSyncExternalStore(
    subscribeToViewport,
    readViewportScale,
    getServerViewportScale,
  )
}
