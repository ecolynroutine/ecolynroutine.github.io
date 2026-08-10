import { getSupabase, isSupabaseConfigured } from './supabase'

type EventPayload = Record<string, string | number | boolean | undefined>
type ScriptState = 'idle' | 'loading' | 'ready' | 'blocked'

interface TrackingSettings {
  metaPixelId: string
  metaEnabled: boolean
  tiktokPixelId: string
  tiktokEnabled: boolean
  ga4MeasurementId: string
  ga4Enabled: boolean
}

export interface TrackingDiagnostics {
  settingsSource: 'pending' | 'supabase' | 'fallback'
  settingsError: string
  meta: { enabled: boolean; id: string; script: ScriptState }
  tiktok: { enabled: boolean; id: string; script: ScriptState }
  ga4: { enabled: boolean; id: string; script: ScriptState }
  lastEvent: string
  lastEventId: string
  capi: { state: 'idle' | 'sending' | 'accepted' | 'skipped' | 'error'; message: string }
}

interface TrackOptions {
  metaCapi?: boolean
  metaCapiReference?: string
  gaDebug?: boolean
}

const metaMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  article_open: 'ViewContent',
  pack_view: 'ViewContent',
  generate_lead: 'Lead',
  whatsapp_click: 'Contact',
  initiate_checkout: 'InitiateCheckout',
  order_submit: 'Lead',
}

const metaCustomMap: Record<string, string> = {
  select_skin_concern: 'SkinConcernSelected',
  join_whatsapp_group: 'JoinWhatsappGroup',
}

const tiktokMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  article_open: 'ViewContent',
  pack_view: 'ViewContent',
  form_start: 'InitiateCheckout',
  generate_lead: 'SubmitForm',
  whatsapp_click: 'Contact',
  initiate_checkout: 'InitiateCheckout',
  order_submit: 'SubmitForm',
}

let settingsPromise: Promise<TrackingSettings> | null = null
const pageViews = new Set<string>()
const diagnostics: TrackingDiagnostics = {
  settingsSource: 'pending',
  settingsError: '',
  meta: { enabled: false, id: '', script: 'idle' },
  tiktok: { enabled: false, id: '', script: 'idle' },
  ga4: { enabled: false, id: '', script: 'idle' },
  lastEvent: '',
  lastEventId: '',
  capi: { state: 'idle', message: '' },
}

function masked(value: string) {
  if (!value) return ''
  return value.length <= 6 ? value : `${value.slice(0, 3)}…${value.slice(-4)}`
}

function notifyDiagnostics() {
  window.dispatchEvent(new CustomEvent('ecolyn:tracking-status'))
}

function updateDiagnostics(settings: TrackingSettings) {
  diagnostics.meta.enabled = settings.metaEnabled
  diagnostics.meta.id = masked(settings.metaPixelId)
  diagnostics.tiktok.enabled = settings.tiktokEnabled
  diagnostics.tiktok.id = masked(settings.tiktokPixelId)
  diagnostics.ga4.enabled = settings.ga4Enabled
  diagnostics.ga4.id = masked(settings.ga4MeasurementId)
  notifyDiagnostics()
}

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
  if (!isSupabaseConfigured()) {
    diagnostics.settingsSource = 'fallback'
    diagnostics.settingsError = 'Supabase non configuré'
    const settings = fallbackSettings()
    updateDiagnostics(settings)
    return settings
  }
  const supabase = getSupabase()
  if (!supabase) {
    diagnostics.settingsSource = 'fallback'
    diagnostics.settingsError = 'Client Supabase indisponible'
    const settings = fallbackSettings()
    updateDiagnostics(settings)
    return settings
  }

  const { data, error } = await supabase
    .from('tracking_settings')
    .select('meta_pixel_id,meta_enabled,tiktok_pixel_id,tiktok_enabled,ga4_measurement_id,ga4_enabled')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) {
    diagnostics.settingsSource = 'fallback'
    diagnostics.settingsError = error?.message || 'Configuration absente'
    const settings = fallbackSettings()
    updateDiagnostics(settings)
    return settings
  }

  const settings = {
    metaPixelId: data.meta_pixel_id?.trim() || '',
    metaEnabled: Boolean(data.meta_enabled && data.meta_pixel_id?.trim()),
    tiktokPixelId: data.tiktok_pixel_id?.trim() || '',
    tiktokEnabled: Boolean(data.tiktok_enabled && data.tiktok_pixel_id?.trim()),
    ga4MeasurementId: data.ga4_measurement_id?.trim().toUpperCase() || '',
    ga4Enabled: Boolean(data.ga4_enabled && data.ga4_measurement_id?.trim()),
  }
  diagnostics.settingsSource = 'supabase'
  diagnostics.settingsError = ''
  updateDiagnostics(settings)
  return settings
}

function isDebugMode() {
  return new URLSearchParams(window.location.search).get('tracking_debug') === '1'
}

function attachScript(src: string, platform: 'meta' | 'tiktok' | 'ga4') {
  diagnostics[platform].script = 'loading'
  notifyDiagnostics()
  const script = document.createElement('script')
  script.async = true
  script.src = src
  script.onload = () => {
    diagnostics[platform].script = 'ready'
    notifyDiagnostics()
  }
  script.onerror = () => {
    diagnostics[platform].script = 'blocked'
    notifyDiagnostics()
  }
  document.head.appendChild(script)
}

function loadGa4(id: string) {
  if (!id || window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer?.push(arguments as unknown as unknown[])
  }
  window.gtag('js', new Date())
  window.gtag('config', id, {
    anonymize_ip: true,
    debug_mode: isDebugMode(),
    page_title: document.title,
    page_location: window.location.href,
  })
  attachScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, 'ga4')
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
  attachScript('https://connect.facebook.net/en_US/fbevents.js', 'meta')
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
  attachScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`, 'tiktok')
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

function cookieValue(name: string) {
  const match = document.cookie.split('; ').find(item => item.startsWith(`${name}=`))
  return match?.slice(name.length + 1) || undefined
}

async function sendMetaCapi(eventName: string, eventId: string, reference?: string) {
  const supabase = getSupabase()
  if (!supabase) {
    diagnostics.capi = { state: 'error', message: 'Supabase indisponible' }
    notifyDiagnostics()
    return
  }
  diagnostics.capi = { state: 'sending', message: 'Envoi en cours' }
  notifyDiagnostics()
  const { data, error } = await supabase.functions.invoke('meta-capi', {
    body: {
      event_name: eventName,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      reference,
      fbp: cookieValue('_fbp'),
      fbc: cookieValue('_fbc'),
      test: isDebugMode(),
    },
  })
  if (error) {
    diagnostics.capi = { state: 'error', message: error.message.slice(0, 160) }
    console.warn('[ECOLYN tracking] Meta CAPI', { event: eventName, status: 'error', event_id: eventId.slice(0, 12) })
  } else if (data?.accepted === true) {
    diagnostics.capi = { state: 'accepted', message: 'Événement accepté par Meta' }
    console.info('[ECOLYN tracking] Meta CAPI', { event: eventName, status: 'accepted', event_id: eventId.slice(0, 12) })
  } else {
    diagnostics.capi = { state: 'skipped', message: data?.reason === 'CONSENT_REQUIRED' ? 'Consentement Meta non donné' : 'Événement non envoyé' }
    console.info('[ECOLYN tracking] Meta CAPI', { event: eventName, status: 'skipped', event_id: eventId.slice(0, 12) })
  }
  notifyDiagnostics()
}

function sendToPlatforms(event: string, payload: EventPayload, settings: TrackingSettings, eventId: string, options: TrackOptions) {
  const pageContext = {
    page_title: document.title,
    page_location: window.location.href,
    ...payload,
  }
  if (settings.ga4Enabled && event !== 'page_view') {
    window.gtag?.('event', event, { ...pageContext, debug_mode: Boolean(options.gaDebug || isDebugMode()) })
  }

  const metaEvent = metaMap[event]
  const metaCustomEvent = metaCustomMap[event]
  if (settings.metaEnabled && window.fbq) {
    if (metaEvent) window.fbq('track', metaEvent, payload, { eventID: eventId })
    else window.fbq('trackCustom', metaCustomEvent || event, payload, { eventID: eventId })
  }
  if (settings.metaEnabled && metaEvent && options.metaCapi) {
    void sendMetaCapi(metaEvent, eventId, options.metaCapiReference)
  }

  const tiktokEvent = tiktokMap[event]
  if (settings.tiktokEnabled && window.ttq) {
    const tiktokPayload = { ...payload, event_id: eventId }
    if (tiktokEvent === 'PageView') window.ttq.page(tiktokPayload)
    else window.ttq.track(tiktokEvent || event, tiktokPayload)
  }
}

export async function initializeTracking(pageType = 'advice_home') {
  await ensureTracking()
  const viewKey = `${window.location.pathname}|${pageType}`
  if (pageViews.has(viewKey)) return
  pageViews.add(viewKey)
  track('page_view', { page_type: pageType })
}

export function track(event: string, payload: EventPayload = {}, options: TrackOptions = {}) {
  const blockedKeys = /^(?:first_?name|last_?name|full_?name|email|phone|telephone|whatsapp|description|photo|message|free_?text|reference)$/i
  const safePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !blockedKeys.test(key))) as EventPayload
  const eventId = globalThis.crypto?.randomUUID?.() || `ecolyn-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const normalized = {
    event,
    event_id: eventId,
    page_path: window.location.pathname,
    language: document.documentElement.lang || 'fr',
    ...safePayload,
  }

  diagnostics.lastEvent = event
  diagnostics.lastEventId = eventId
  notifyDiagnostics()
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(normalized)
  void ensureTracking().then(settings => sendToPlatforms(event, safePayload, settings, eventId, options))
  return eventId
}

export function getTrackingDiagnostics(): TrackingDiagnostics {
  return structuredClone(diagnostics)
}

export function resetTrackingForTests() {
  settingsPromise = null
  pageViews.clear()
  diagnostics.settingsSource = 'pending'
  diagnostics.settingsError = ''
  diagnostics.lastEvent = ''
  diagnostics.lastEventId = ''
  diagnostics.capi = { state: 'idle', message: '' }
  for (const platform of ['meta', 'tiktok', 'ga4'] as const) {
    diagnostics[platform] = { enabled: false, id: '', script: 'idle' }
  }
}
