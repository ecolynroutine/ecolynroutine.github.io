/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEAD_ENDPOINT?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_WHATSAPP_GROUP_URL?: string
  readonly VITE_META_PIXEL_ID?: string
  readonly VITE_GA4_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface EcolynConfig {
  leadEndpoint?: string
  whatsappNumber?: string
  whatsappGroupUrl?: string
  responseDelay?: string
  responseDelayAr?: string
  metaPixelId?: string
  ga4MeasurementId?: string
  siteUrl?: string
}

interface Window {
  ECOLYN_CONFIG?: EcolynConfig
  dataLayer?: Record<string, unknown>[]
  fbq?: (...args: unknown[]) => void
  gtag?: (...args: unknown[]) => void
}
