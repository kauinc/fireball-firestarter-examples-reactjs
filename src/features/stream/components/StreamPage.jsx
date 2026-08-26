import { useCallback, useEffect, useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { BettingOverlay } from '../../betting/index.js'
import { RaceOverlay } from '../../race/index.js'
import { SettlementOverlay } from '../../settlement/index.js'
import { LoadingScreen, LoadingStatus } from '../../loading/index.js'
import { StreamViewport } from './StreamViewport.jsx'
import { useViewerSession } from '../hooks/useViewerSession.js'
import '../styles/stream.css'

/**
 * Keep stream audio on: unlock playback on connect + any user gesture.
 * Mute UI will live in the menu later.
 */
function StreamAudio() {
  const room = useRoomContext()

  useEffect(() => {
    function unlock() {
      room.startAudio().catch(() => {})
    }

    unlock()
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [room])

  return <RoomAudioRenderer volume={1} muted={false} />
}

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
          // LiveKit fires this on intentional teardown (React remount / HMR /
          // Strict Mode / session reload). Not a real stream failure.
          const msg = err?.message || String(err)
          if (
            err?.reason === 'CLIENT_INITIATED' ||
            /client initiated disconnect/i.test(msg)
          ) {
            if (import.meta.env.DEV) {
              console.debug('[stream] LiveKit disconnect (client)', msg)
            }
            return
          }
          console.error('[stream] LiveKit error', err)
          setHasVideo(false)
          setRoomError(msg)
        }}
        onDisconnected={() => setHasVideo(false)}
        className="stream-shell__room"
      >
        <StreamViewport onVideoAvailableChange={handleVideoAvailableChange} />
        <StreamAudio />
      </LiveKitRoom>

      {/* Overlays follow rounds.status Realtime (betting / race / settlement). */}
      <BettingOverlay key="betting-round" />
      <RaceOverlay key="race-round" />
      <SettlementOverlay key="settlement-round" />
    </div>
  )
}
