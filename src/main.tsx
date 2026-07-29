import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import App from './App'
import './styles.css'

window.ECOLYN_CONFIG = {
  ...window.ECOLYN_CONFIG,
  leadEndpoint: import.meta.env.VITE_LEAD_ENDPOINT || window.ECOLYN_CONFIG?.leadEndpoint,
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || window.ECOLYN_CONFIG?.whatsappNumber,
  whatsappGroupUrl: import.meta.env.VITE_WHATSAPP_GROUP_URL || window.ECOLYN_CONFIG?.whatsappGroupUrl,
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || window.ECOLYN_CONFIG?.metaPixelId,
  ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || window.ECOLYN_CONFIG?.ga4MeasurementId,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
