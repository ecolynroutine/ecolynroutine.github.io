import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import { getAppRoute } from './lib/navigation'
import './styles.css'

const App = lazy(() => import('./App'))
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const ThankYou = lazy(() => import('./pages/ThankYou'))

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

  const page = route === 'admin-login'
    ? <AdminLogin />
    : route === 'admin'
      ? <AdminDashboard />
      : route === 'thank-you'
        ? <ThankYou />
        : <App />
  return <Suspense fallback={<main className="route-loading" aria-label="Chargement"><span>ECOLYN</span></main>}>{page}</Suspense>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
