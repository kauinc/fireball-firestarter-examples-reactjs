import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@livekit/components-styles'
import './styles/global.css'
import App from './app/App.jsx'
import { installSfxUnlock } from './shared/audio/index.js'

installSfxUnlock()

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
