import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from './theme'
import { publicAssetUrl } from './publicAssetUrl'
import { registerServiceWorker } from './registerServiceWorker'
import './index.css'
import App from './App.tsx'

initTheme()
registerServiceWorker()

document.documentElement.style.setProperty(
  '--brand-bg-image',
  `url('${publicAssetUrl('ambulance-service-logo.png')}')`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
