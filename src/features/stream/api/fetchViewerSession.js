const DEFAULT_TOKEN_URL = '/api/livekit-token'

/**
 * Fetches a LiveKit viewer session from the dt-dashboard token endpoint.
 * @param {{ tokenUrl?: string, signal?: AbortSignal }} [options]
 * @returns {Promise<{ url: string, token: string, room: string }>}
 */
export async function fetchViewerSession({
  tokenUrl = import.meta.env.VITE_LIVEKIT_TOKEN_URL ?? DEFAULT_TOKEN_URL,
  signal,
} = {}) {
  if (!tokenUrl) {
    throw new Error(
      'LiveKit token URL is not configured (set VITE_LIVEKIT_TOKEN_URL)',
    )
  }

  const url = `${tokenUrl}?ts=${Date.now()}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      body.error ||
        `Stream token unavailable (${response.status}). Check VITE_LIVEKIT_TOKEN_URL / proxy.`,
    )
  }

  const data = await response.json()

  if (typeof data.url !== 'string' || typeof data.token !== 'string') {
    throw new Error('Invalid LiveKit token response')
  }

  return {
    url: data.url,
    token: data.token,
    room: data.room ?? 'unknown',
  }
}
