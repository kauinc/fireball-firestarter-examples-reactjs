import { useEffect } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { LogLevel, setLogLevel } from 'livekit-client'
import { StreamViewport } from './StreamViewport.jsx'

// LiveKit logs "already connected" at info when React re-renders reconnect;
// keep warnings/errors only.
setLogLevel(LogLevel.warn)

/**
 * Keep stream audio on: unlock playback on connect + any user gesture.
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
 * Lazy-loaded LiveKit room shell (keeps livekit out of the initial chunk).
 */
export default function StreamRoom({
  session,
  onVideoAvailableChange,
  onRoomError,
  onDisconnected,
}) {
  return (
    <LiveKitRoom
      serverUrl={session.url}
      token={session.token}
      connect
      audio={false}
      video={false}
      onError={(err) => {
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
        onRoomError?.(msg)
      }}
      onDisconnected={onDisconnected}
      className="stream-shell__room"
    >
      <StreamViewport onVideoAvailableChange={onVideoAvailableChange} />
      <StreamAudio />
    </LiveKitRoom>
  )
}
