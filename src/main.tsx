import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import App from './App'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ThankYou from './pages/ThankYou'
import { getAppRoute } from './lib/navigation'
import './styles.css'
import './admin/admin.css'
import './pages/system-pages.css'

const runtimeValue = (value?: string) => value?.startsWith('__VITE_') ? '' : value

window.ECOLYN_CONFIG = {
  ...window.ECOLYN_CONFIG,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || runtimeValue(window.ECOLYN_CONFIG?.supabaseUrl),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || runtimeValue(window.ECOLYN_CONFIG?.supabaseAnonKey),
  leadEndpoint: import.meta.env.VITE_LEAD_ENDPOINT || runtimeValue(window.ECOLYN_CONFIG?.leadEndpoint),
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || window.ECOLYN_CONFIG?.whatsappNumber,
  whatsappGroupUrl: import.meta.env.VITE_WHATSAPP_GROUP_URL || window.ECOLYN_CONFIG?.whatsappGroupUrl,
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || runtimeValue(window.ECOLYN_CONFIG?.metaPixelId),
  tiktokPixelId: import.meta.env.VITE_TIKTOK_PIXEL_ID || runtimeValue(window.ECOLYN_CONFIG?.tiktokPixelId),
  ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || runtimeValue(window.ECOLYN_CONFIG?.ga4MeasurementId),
}

function RootApp() {
  const [route, setRoute] = useState(getAppRoute)

  useEffect(() => {
    const syncRoute = () => setRoute(getAppRoute())
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  if (route === 'admin-login') return <AdminLogin />
  if (route === 'admin') return <AdminDashboard />
  if (route === 'thank-you') return <ThankYou />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
