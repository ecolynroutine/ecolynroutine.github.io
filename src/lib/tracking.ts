import { getSupabase, isSupabaseConfigured } from './supabase'

type EventPayload = Record<string, string | number | boolean | undefined>

interface TrackingSettings {
  metaPixelId: string
  metaEnabled: boolean
  tiktokPixelId: string
  tiktokEnabled: boolean
  ga4MeasurementId: string
  ga4Enabled: boolean
}

const metaMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  article_open: 'ViewContent',
  form_submit: 'Lead',
  generate_lead: 'Lead',
  whatsapp_click: 'Contact',
  pack_cta_click: 'InitiateCheckout',
}

const tiktokMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  article_open: 'ViewContent',
  form_start: 'InitiateCheckout',
  form_submit: 'SubmitForm',
  generate_lead: 'SubmitForm',
  whatsapp_click: 'Contact',
  pack_cta_click: 'InitiateCheckout',
}

let settingsPromise: Promise<TrackingSettings> | null = null
const pageViews = new Set<string>()

function fallbackSettings(): TrackingSettings {
  const config = window.ECOLYN_CONFIG || {}
  return {
    metaPixelId: config.metaPixelId?.trim() || '',
    metaEnabled: Boolean(config.metaPixelId?.trim()),
    tiktokPixelId: config.tiktokPixelId?.trim() || '',
    tiktokEnabled: Boolean(config.tiktokPixelId?.trim()),
    ga4MeasurementId: config.ga4MeasurementId?.trim() || '',
    ga4Enabled: Boolean(config.ga4MeasurementId?.trim()),
  }
}

async function fetchSettings(): Promise<TrackingSettings> {
  if (!isSupabaseConfigured()) return fallbackSettings()
  const supabase = getSupabase()
  if (!supabase) return fallbackSettings()

  const { data, error } = await supabase
    .from('tracking_settings')
    .select('meta_pixel_id,meta_enabled,tiktok_pixel_id,tiktok_enabled,ga4_measurement_id,ga4_enabled')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return fallbackSettings()
  return {
    metaPixelId: data.meta_pixel_id || '',
    metaEnabled: Boolean(data.meta_enabled),
    tiktokPixelId: data.tiktok_pixel_id || '',
    tiktokEnabled: Boolean(data.tiktok_enabled),
    ga4MeasurementId: data.ga4_measurement_id || '',
    ga4Enabled: Boolean(data.ga4_enabled),
  }
}

function loadGa4(id: string) {
  if (!id || window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args)
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

function loadMeta(id: string) {
  if (!id || window.fbq) return
  type MetaQueue = ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void
    queue: unknown[][]
    loaded: boolean
    version: string
    push: (...args: unknown[]) => void
  }
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  }) as MetaQueue
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
  window._fbq = fbq
  window.fbq('init', id)

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
}

function loadTikTok(id: string) {
  if (!id || window.ttq) return
  const queue = [] as unknown as TikTokQueue
  const methods = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
    'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent',
    'revokeConsent', 'grantConsent',
  ]
  const dynamicQueue = queue as unknown as Record<string, (...args: unknown[]) => void>
  for (const method of methods) {
    dynamicQueue[method] = (...args: unknown[]) => queue.push([method, ...args])
  }
  window.ttq = queue

  const script = document.createElement('script')
  script.async = true
  script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`
  document.head.appendChild(script)
}

async function ensureTracking() {
  if (!settingsPromise) {
    settingsPromise = fetchSettings().then(settings => {
      if (settings.ga4Enabled) loadGa4(settings.ga4MeasurementId)
      if (settings.metaEnabled) loadMeta(settings.metaPixelId)
      if (settings.tiktokEnabled) loadTikTok(settings.tiktokPixelId)
      return settings
    })
  }
  return settingsPromise
}

function sendToPlatforms(event: string, payload: EventPayload, settings: TrackingSettings) {
  if (settings.ga4Enabled) window.gtag?.('event', event, payload)

  const metaEvent = metaMap[event]
  if (settings.metaEnabled && window.fbq) {
    if (metaEvent) window.fbq('track', metaEvent, payload)
    else window.fbq('trackCustom', event, payload)
  }

  const tiktokEvent = tiktokMap[event]
  if (settings.tiktokEnabled && window.ttq) {
    if (tiktokEvent === 'PageView') window.ttq.page(payload)
    else window.ttq.track(tiktokEvent || event, payload)
  }
}

export async function initializeTracking(pageType = 'advice_home') {
  await ensureTracking()
  const viewKey = `${window.location.pathname}|${pageType}`
  if (pageViews.has(viewKey)) return
  pageViews.add(viewKey)
  track('page_view', { page_type: pageType })
}

export function track(event: string, payload: EventPayload = {}) {
  const normalized = {
    event,
    page_path: window.location.pathname,
    language: document.documentElement.lang || 'fr',
    ...payload,
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(normalized)
  void ensureTracking().then(settings => sendToPlatforms(event, payload, settings))
}

export function resetTrackingForTests() {
  settingsPromise = null
  pageViews.clear()
}
