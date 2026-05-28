import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { serviceConfig } from './config'
import { initTheme } from './theme'
import { publicAssetUrl } from './publicAssetUrl'
import { registerServiceWorker } from './registerServiceWorker'
import './index.css'
import App from './App.tsx'

document.title = serviceConfig.pageTitle

initTheme()
registerServiceWorker()

document.documentElement.style.setProperty(
  '--brand-bg-image',
  `url('${publicAssetUrl(serviceConfig.brandBackgroundAsset)}')`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
