import { StreamPage } from '../features/stream/index.js'
import { StreamErrorBoundary } from '../features/hud/index.js'
import '../features/loading/styles/fonts.css'

export default function App() {
  return (
    <StreamErrorBoundary>
      <StreamPage />
    </StreamErrorBoundary>
  )
}
