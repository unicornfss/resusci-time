import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { serviceConfig } from './config'
import { initTheme } from './theme'
import { publicAssetUrl } from './publicAssetUrl'
import { registerServiceWorker } from './registerServiceWorker'
import './index.css'
import { TimingConfigProvider } from './context/TimingConfigContext'
import { AccessGateProvider } from './components/AccessGateProvider'
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
    <TimingConfigProvider>
      <AccessGateProvider>
        <App />
      </AccessGateProvider>
    </TimingConfigProvider>
  </StrictMode>,
)
