import { useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { StreamViewport } from './StreamViewport.jsx'
import { useViewerSession } from '../hooks/useViewerSession.js'
import '../styles/stream.css'

/**
 * Full-viewport LiveKit viewer for the Doof Troop WHIP ingress room.
 */
export function StreamPage() {
  const { session, error: sessionError, isLoading, reload } = useViewerSession()
  const [roomError, setRoomError] = useState(null)
  const error = roomError || sessionError

  if (error) {
    return (
      <div
        className="stream-shell"
        role="alert"
        title={error}
        onClick={() => {
          setRoomError(null)
          reload()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            setRoomError(null)
            reload()
          }
        }}
        tabIndex={0}
      />
    )
  }

  if (isLoading || !session) {
    return <div className="stream-shell" />
  }

  return (
    <div className="stream-shell">
      <LiveKitRoom
        serverUrl={session.url}
        token={session.token}
        connect
        audio={false}
        video={false}
        onError={(err) => {
          console.error('[stream] LiveKit error', err)
          setRoomError(err?.message || String(err))
        }}
        className="stream-shell__room"
      >
        <StreamViewport />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
