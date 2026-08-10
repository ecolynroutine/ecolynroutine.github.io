import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0'

const allowedOrigins = new Set([
  'https://ecolyn.ma',
  'https://www.ecolyn.ma',
  'https://ecolynroutine.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://ecolyn.ma',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function response(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (/^0[67]\d{8}$/.test(digits)) return `212${digits.slice(1)}`
  if (/^[67]\d{8}$/.test(digits)) return `212${digits}`
  return digits.replace(/^00/, '')
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async request => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return response({ error: 'METHOD_NOT_ALLOWED' }, 405, origin)
  if (origin && !allowedOrigins.has(origin)) return response({ error: 'ORIGIN_NOT_ALLOWED' }, 403, origin)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 8_192) return response({ error: 'PAYLOAD_TOO_LARGE' }, 413, origin)

  const accessToken = Deno.env.get('META_CAPI_ACCESS_TOKEN')?.trim()
  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  if (!accessToken || !supabaseUrl || !serviceRoleKey) {
    return response({ error: 'CAPI_NOT_CONFIGURED' }, 503, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return response({ error: 'INVALID_JSON' }, 400, origin)
  }

  const eventName = body.event_name === 'Lead' ? 'Lead' : ''
  const eventId = typeof body.event_id === 'string' ? body.event_id.slice(0, 100) : ''
  const reference = typeof body.reference === 'string' ? body.reference.trim().slice(0, 64) : ''
  const eventSourceUrl = typeof body.event_source_url === 'string' ? body.event_source_url.slice(0, 2_000) : ''
  const requestedTime = Number(body.event_time)
  const now = Math.floor(Date.now() / 1_000)
  const eventTime = Number.isInteger(requestedTime) && Math.abs(now - requestedTime) < 300 ? requestedTime : now

  if (!eventName || !eventId || !/^ECO-[A-Z0-9-]{4,32}$/.test(reference)) {
    return response({ error: 'INVALID_EVENT' }, 400, origin)
  }

  let sourceOrigin = ''
  try {
    sourceOrigin = new URL(eventSourceUrl).origin
  } catch {
    return response({ error: 'INVALID_SOURCE_URL' }, 400, origin)
  }
  if (!allowedOrigins.has(sourceOrigin)) return response({ error: 'SOURCE_NOT_ALLOWED' }, 403, origin)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const [{ data: prospect, error: prospectError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('prospects').select('email,whatsapp,marketing_consent').eq('reference', reference).maybeSingle(),
    supabase.from('tracking_settings').select('meta_pixel_id,meta_enabled').eq('id', 1).maybeSingle(),
  ])

  if (prospectError || settingsError) {
    console.error('Meta CAPI database lookup failed', { prospect: prospectError?.code, settings: settingsError?.code })
    return response({ error: 'CONFIGURATION_LOOKUP_FAILED' }, 500, origin)
  }
  if (!prospect?.marketing_consent) {
    console.info('Meta CAPI event skipped', { event_name: eventName, event_id: eventId.slice(0, 12), reason: 'CONSENT_REQUIRED' })
    return response({ accepted: false, reason: 'CONSENT_REQUIRED' }, 202, origin)
  }

  const pixelId = settings?.meta_enabled && typeof settings.meta_pixel_id === 'string'
    ? settings.meta_pixel_id.trim()
    : ''
  if (!/^\d{5,32}$/.test(pixelId)) return response({ error: 'PIXEL_NOT_CONFIGURED' }, 503, origin)

  const email = typeof prospect.email === 'string' ? prospect.email.trim().toLowerCase() : ''
  const phone = typeof prospect.whatsapp === 'string' ? normalizePhone(prospect.whatsapp) : ''
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) || ''
  const fbp = typeof body.fbp === 'string' ? body.fbp.slice(0, 255) : ''
  const fbc = typeof body.fbc === 'string' ? body.fbc.slice(0, 255) : ''

  const userData: Record<string, string | string[]> = {}
  if (email) userData.em = [await sha256(email)]
  if (phone) userData.ph = [await sha256(phone)]
  if (forwardedFor) userData.client_ip_address = forwardedFor
  if (userAgent) userData.client_user_agent = userAgent
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc

  const graphVersion = Deno.env.get('META_GRAPH_API_VERSION')?.trim() || 'v21.0'
  const metaPayload: Record<string, unknown> = {
    data: [{
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
    }],
  }
  const testCode = Deno.env.get('META_CAPI_TEST_EVENT_CODE')?.trim()
  if (body.test === true && testCode) metaPayload.test_event_code = testCode

  const metaResponse = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaPayload),
    },
  )
  const metaResult = await metaResponse.json().catch(() => ({})) as Record<string, unknown>
  if (!metaResponse.ok) {
    console.error('Meta CAPI rejected an event', { status: metaResponse.status, event_name: eventName, event_id: eventId.slice(0, 12) })
    return response({ error: 'META_REJECTED_EVENT' }, 502, origin)
  }

  console.info('Meta CAPI event accepted', { event_name: eventName, event_id: eventId.slice(0, 12), events_received: metaResult.events_received ?? 1 })
  return response({ accepted: true, events_received: metaResult.events_received ?? 1 }, 200, origin)
})
