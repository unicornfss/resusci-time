import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from './theme'
import './index.css'
import App from './App.tsx'

initTheme()

document.documentElement.style.setProperty(
  '--brand-bg-image',
  `url('${import.meta.env.BASE_URL}ambulance-service-logo.png')`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
