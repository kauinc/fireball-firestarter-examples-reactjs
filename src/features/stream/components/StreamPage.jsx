import { useCallback, useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { BettingOverlay } from '../../betting/index.js'
import { LoadingScreen, LoadingStatus } from '../../loading/index.js'
import { StreamViewport } from './StreamViewport.jsx'
import { useViewerSession } from '../hooks/useViewerSession.js'
import '../styles/stream.css'

/**
 * Full-viewport LiveKit viewer for the Doof Troop WHIP ingress room.
 * Loading/CONNECTING are local boot UI. Overlays follow Supabase `rounds.status` (Realtime).
 */
export function StreamPage() {
  const { session, error: sessionError, isLoading, reload } = useViewerSession()
  const [roomError, setRoomError] = useState(null)
  const [hasVideo, setHasVideo] = useState(false)
  const error = roomError || sessionError

  const handleVideoAvailableChange = useCallback((available) => {
    setHasVideo(available)
  }, [])

  if (error) {
    return (
      <div className="stream-shell">
        <LoadingScreen status={LoadingStatus.LOADING} label="TAP TO RETRY..." />
        <button
          type="button"
          className="stream-shell__retry"
          aria-label={error}
          title={error}
          onClick={() => {
            setRoomError(null)
            setHasVideo(false)
            reload()
          }}
        />
      </div>
    )
  }

  if (isLoading || !session) {
    return (
      <div className="stream-shell">
        <LoadingScreen status={LoadingStatus.LOADING} />
      </div>
    )
  }

  return (
    <div className="stream-shell">
      {!hasVideo && <LoadingScreen status={LoadingStatus.CONNECTING} />}

      <LiveKitRoom
        serverUrl={session.url}
        token={session.token}
        connect
        audio={false}
        video={false}
        onError={(err) => {
          console.error('[stream] LiveKit error', err)
          setHasVideo(false)
          setRoomError(err?.message || String(err))
        }}
        onDisconnected={() => setHasVideo(false)}
        className="stream-shell__room"
      >
        <StreamViewport onVideoAvailableChange={handleVideoAvailableChange} />
        <RoomAudioRenderer />
      </LiveKitRoom>

      {/* rounds Realtime early; HUD only when status === BETTING_OPEN. */}
      <BettingOverlay key="betting-round" />
    </div>
  )
}
