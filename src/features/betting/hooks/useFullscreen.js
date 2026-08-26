import { useCallback, useSyncExternalStore } from 'react'

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    null
  )
}

/** @type {{ isFullscreen: boolean }} */
let snapshot = Object.freeze({ isFullscreen: false })
const listeners = new Set()
let bound = false

function emit() {
  const next = Object.freeze({
    isFullscreen: Boolean(getFullscreenElement()),
  })
  if (next.isFullscreen === snapshot.isFullscreen) return
  snapshot = next
  for (const listener of listeners) listener()
}

function ensureBound() {
  if (bound || typeof document === 'undefined') return
  bound = true
  document.addEventListener('fullscreenchange', emit)
  document.addEventListener('webkitfullscreenchange', emit)
  emit()
}

function releaseBound() {
  if (!bound || listeners.size > 0) return
  bound = false
  document.removeEventListener('fullscreenchange', emit)
  document.removeEventListener('webkitfullscreenchange', emit)
}

function subscribe(listener) {
  listeners.add(listener)
  ensureBound()
  return () => {
    listeners.delete(listener)
    releaseBound()
  }
}

function getSnapshot() {
  return snapshot
}

const SERVER_SNAPSHOT = Object.freeze({ isFullscreen: false })

/**
 * Document fullscreen toggle (Fullscreen API + webkit prefix for Safari).
 * Shared store — one pair of document listeners for all overlays.
 */
export function useFullscreen() {
  const { isFullscreen } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT,
  )

  const toggleFullscreen = useCallback(async () => {
    const node = document.documentElement
    try {
      if (getFullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
        return
      }
      if (node.requestFullscreen) await node.requestFullscreen()
      else if (node.webkitRequestFullscreen) node.webkitRequestFullscreen()
    } catch (err) {
      console.warn('[fullscreen]', err?.message || err)
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
