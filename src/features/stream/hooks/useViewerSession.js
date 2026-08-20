import { useCallback, useEffect, useState } from 'react'
import { fetchViewerSession } from '../api/fetchViewerSession.js'

/**
 * Loads a LiveKit viewer session once on mount (and on `reload`).
 */
export function useViewerSession() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState({
    status: 'loading',
    session: null,
    error: null,
  })

  const reload = useCallback(() => {
    setResult({ status: 'loading', session: null, error: null })
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetchViewerSession({ signal: controller.signal })
      .then((session) => {
        setResult({ status: 'ready', session, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setResult({
          status: 'error',
          session: null,
          error: err?.message || String(err),
        })
      })

    return () => controller.abort()
  }, [reloadKey])

  return {
    session: result.session,
    error: result.error,
    isLoading: result.status === 'loading',
    reload,
  }
}
