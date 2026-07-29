type EventPayload = Record<string, string | number | boolean | undefined>

const metaMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  article_open: 'ArticleRead',
  video_start: 'VideoView',
  case_study_view: 'CaseStudyView',
  form_start: 'FormStart',
  generate_lead: 'Lead',
  whatsapp_click: 'Contact',
  join_whatsapp_group: 'JoinWhatsappGroup',
  pack_view: 'PackView',
  pack_cta_click: 'InitiateCheckout'
}

export function initializeTracking() {
  window.dataLayer = window.dataLayer || []
  const config = window.ECOLYN_CONFIG || {}

  if (config.ga4MeasurementId && !window.gtag) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`
    document.head.appendChild(script)
    window.gtag = (...args: unknown[]) => window.dataLayer?.push({ gtag: args })
    window.gtag('js', new Date())
    window.gtag('config', config.ga4MeasurementId)
  }

  if (config.metaPixelId && !window.fbq) {
    const fbq = (...args: unknown[]) => {
      ;(fbq as unknown as { queue: unknown[][] }).queue.push(args)
    }
    ;(fbq as unknown as { queue: unknown[][] }).queue = []
    window.fbq = fbq
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
    window.fbq('init', config.metaPixelId)
  }

  track('page_view', { page_type: 'advice_home' })
}

export function track(event: string, payload: EventPayload = {}) {
  const normalized = {
    event,
    page_path: window.location.pathname,
    language: document.documentElement.lang || 'fr',
    ...payload
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(normalized)
  window.gtag?.('event', event, payload)

  const metaEvent = metaMap[event]
  if (metaEvent && window.fbq) {
    const standard = ['PageView', 'ViewContent', 'Lead', 'Contact', 'InitiateCheckout'].includes(metaEvent)
    window.fbq(standard ? 'track' : 'trackCustom', metaEvent, payload)
  }
}
