import { createContext, useContext } from 'react'
import { useHudViewport } from './hooks/useHudScale.js'

const HudViewportContext = createContext(null)

/**
 * One viewport scale/layout for betting, race, and settlement overlays.
 */
export function HudViewportProvider({ children }) {
  const viewport = useHudViewport()
  return (
    <HudViewportContext.Provider value={viewport}>
      {children}
    </HudViewportContext.Provider>
  )
}

export function useHudViewportContext() {
  const value = useContext(HudViewportContext)
  if (!value) {
    throw new Error('useHudViewportContext requires HudViewportProvider')
  }
  return value
}
