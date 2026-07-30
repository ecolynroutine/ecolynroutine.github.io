/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_LEAD_ENDPOINT?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_WHATSAPP_GROUP_URL?: string
  readonly VITE_META_PIXEL_ID?: string
  readonly VITE_TIKTOK_PIXEL_ID?: string
  readonly VITE_GA4_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface EcolynConfig {
  supabaseUrl?: string
  supabaseAnonKey?: string
  leadEndpoint?: string
  whatsappNumber?: string
  whatsappGroupUrl?: string
  responseDelay?: string
  responseDelayAr?: string
  metaPixelId?: string
  tiktokPixelId?: string
  ga4MeasurementId?: string
  siteUrl?: string
}

interface TikTokQueue extends Array<unknown> {
  track: (...args: unknown[]) => void
  page: (...args: unknown[]) => void
}

interface Window {
  ECOLYN_CONFIG?: EcolynConfig
  dataLayer?: unknown[]
  fbq?: (...args: unknown[]) => void
  _fbq?: (...args: unknown[]) => void
  gtag?: (...args: unknown[]) => void
  ttq?: TikTokQueue
}
