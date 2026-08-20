import {
  VideoTrack,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'

const VIDEO_SOURCES = [
  Track.Source.Camera,
  Track.Source.ScreenShare,
  Track.Source.Unknown,
]

/**
 * Renders the first subscribed remote video track edge-to-edge without cropping.
 */
export function StreamViewport() {
  const tracks = useTracks(VIDEO_SOURCES, { onlySubscribed: true })
  const videoTracks = tracks.filter(
    (trackRef) => trackRef.publication?.kind === Track.Kind.Video,
  )

  if (videoTracks.length === 0) {
    return <div className="stream-viewport stream-viewport--empty" />
  }

  // Prefer a single primary feed; WHIP/OBS publishes one video track.
  const primary = videoTracks[0]

  return (
    <div className="stream-viewport">
      <VideoTrack
        trackRef={primary}
        className="stream-viewport__video"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
