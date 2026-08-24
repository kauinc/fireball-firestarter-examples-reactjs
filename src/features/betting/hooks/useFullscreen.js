import { useCallback, useEffect, useState } from 'react'

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    null
  )
}

/**
 * Document fullscreen toggle (Fullscreen API + webkit prefix for Safari).
 */
export function useFullscreen(targetRef = null) {
  const [isFullscreen, setIsFullscreen] = useState(() =>
    Boolean(getFullscreenElement()),
  )

  useEffect(() => {
    function sync() {
      setIsFullscreen(Boolean(getFullscreenElement()))
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const node = targetRef?.current || document.documentElement
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
  }, [targetRef])

  return { isFullscreen, toggleFullscreen }
}
