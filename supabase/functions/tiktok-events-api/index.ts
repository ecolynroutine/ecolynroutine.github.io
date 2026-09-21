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

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

Deno.serve(async request => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return response({ error: 'METHOD_NOT_ALLOWED' }, 405, origin)
  if (origin && !allowedOrigins.has(origin)) return response({ error: 'ORIGIN_NOT_ALLOWED' }, 403, origin)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 8_192) return response({ error: 'PAYLOAD_TOO_LARGE' }, 413, origin)

  const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN')?.trim()
  const pixelCode = Deno.env.get('TIKTOK_PIXEL_CODE')?.trim()
  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  if (!accessToken || !pixelCode || !supabaseUrl || !serviceRoleKey) {
    return response({ error: 'TIKTOK_EAPI_NOT_CONFIGURED' }, 503, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return response({ error: 'INVALID_JSON' }, 400, origin)
  }

  const eventName = body.event_name === 'SubmitForm' || body.event_name === 'Purchase'
    ? body.event_name
    : ''
  const eventId = text(body.event_id, 100)
  const reference = text(body.reference, 64)
  const eventSourceUrl = text(body.event_source_url, 2_000)
  const referrer = text(body.referrer, 2_000)
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
  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .select('reference,source,answers')
    .eq('reference', reference)
    .maybeSingle()

  if (prospectError) {
    console.error('TikTok Events API database lookup failed', { code: prospectError.code })
    return response({ error: 'PROSPECT_LOOKUP_FAILED' }, 500, origin)
  }
  if (!prospect) return response({ error: 'REFERENCE_NOT_FOUND' }, 404, origin)

  const user: Record<string, string> = {}
  const ttclid = text(body.ttclid, 512)
  const ttp = text(body.ttp, 512)
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) || ''
  if (ttclid) user.ttclid = ttclid
  if (ttp) user.ttp = ttp
  if (forwardedFor) user.ip = forwardedFor
  if (userAgent) user.user_agent = userAgent

  const properties: Record<string, unknown> = {}
  const answers = prospect.answers && typeof prospect.answers === 'object' && !Array.isArray(prospect.answers)
    ? prospect.answers as Record<string, unknown>
    : {}
  if (prospect.source === 'ecolyn_pack_builder' && answers.type === 'pack_order') {
    const selectedIds = Array.isArray(answers.selectedProductIds)
      ? answers.selectedProductIds.filter((value): value is string => typeof value === 'string').slice(0, 4)
      : []
    const value = Number(answers.promoTotalDh)
    properties.currency = 'MAD'
    properties.content_type = 'product'
    if (Number.isFinite(value) && value >= 0) properties.value = value
    if (selectedIds.length) {
      properties.contents = selectedIds.map(contentId => ({ content_id: contentId, quantity: 1 }))
    }
  }

  const event: Record<string, unknown> = {
    event: eventName,
    event_time: eventTime,
    event_id: eventId,
    user,
    properties,
    page: { url: eventSourceUrl, ...(referrer ? { referrer } : {}) },
  }
  const tiktokPayload: Record<string, unknown> = {
    event_source: 'web',
    event_source_id: pixelCode,
    data: [event],
  }
  const testCode = Deno.env.get('TIKTOK_TEST_EVENT_CODE')?.trim()
  if (body.test === true && testCode) tiktokPayload.test_event_code = testCode

  const tiktokResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tiktokPayload),
  })
  const tiktokResult = await tiktokResponse.json().catch(() => ({})) as Record<string, unknown>
  if (!tiktokResponse.ok || (typeof tiktokResult.code === 'number' && tiktokResult.code !== 0)) {
    console.error('TikTok Events API rejected an event', {
      status: tiktokResponse.status,
      code: tiktokResult.code,
      event_name: eventName,
      event_id: eventId.slice(0, 12),
    })
    return response({ error: 'TIKTOK_REJECTED_EVENT' }, 502, origin)
  }

  console.info('TikTok Events API event accepted', {
    event_name: eventName,
    event_id: eventId.slice(0, 12),
    request_id: tiktokResult.request_id,
  })
  return response({ accepted: true, request_id: tiktokResult.request_id ?? null }, 200, origin)
})
