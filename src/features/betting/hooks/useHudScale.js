import { useSyncExternalStore } from 'react'

/**
 * HUD viewport metrics (single shared window/visualViewport subscription).
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
  maxScale: 1.0,
  minScale: 0.35,
  pad: 10,
})

const SERVER_VIEWPORT = Object.freeze({
  scale: 1,
  compact: false,
  orientation: 'landscape',
})

/** @type {{ scale: number, compact: boolean, orientation: 'portrait' | 'landscape' }} */
let snapshot = SERVER_VIEWPORT
const listeners = new Set()
let windowBound = false

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

function refreshViewport() {
  const next = computeHudViewport()
  if (
    next.scale === snapshot.scale &&
    next.compact === snapshot.compact &&
    next.orientation === snapshot.orientation
  ) {
    return
  }
  snapshot = Object.freeze(next)
  for (const listener of listeners) listener()
}

function ensureWindowBound() {
  if (windowBound || typeof window === 'undefined') return
  windowBound = true
  window.addEventListener('resize', refreshViewport)
  window.addEventListener('orientationchange', refreshViewport)
  const vv = window.visualViewport
  vv?.addEventListener('resize', refreshViewport)
  vv?.addEventListener('scroll', refreshViewport)
  refreshViewport()
}

function releaseWindowBound() {
  if (!windowBound || listeners.size > 0) return
  windowBound = false
  window.removeEventListener('resize', refreshViewport)
  window.removeEventListener('orientationchange', refreshViewport)
  const vv = window.visualViewport
  vv?.removeEventListener('resize', refreshViewport)
  vv?.removeEventListener('scroll', refreshViewport)
}

function subscribe(listener) {
  listeners.add(listener)
  ensureWindowBound()
  return () => {
    listeners.delete(listener)
    releaseWindowBound()
  }
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return SERVER_VIEWPORT
}

export function useHudViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useHudScale() {
  return useHudViewport().scale
}
