import type { Language } from '../types'
import { getSupabase } from './supabase'
import { track } from './tracking'

export interface LiveSettings {
  id: number
  is_published: boolean
  title_fr: string
  title_ar: string
  description_fr: string | null
  description_ar: string | null
  starts_at: string
  ends_at: string | null
  timezone: string
  location: string | null
  meeting_url: string | null
}

const LIVE_COLUMNS = [
  'id',
  'is_published',
  'title_fr',
  'title_ar',
  'description_fr',
  'description_ar',
  'starts_at',
  'ends_at',
  'timezone',
  'location',
  'meeting_url',
].join(',')

export async function getPublishedLive(): Promise<LiveSettings | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('live_settings')
    .select(LIVE_COLUMNS)
    .eq('id', 1)
    .eq('is_published', true)
    .maybeSingle()

  if (error) return null
  return data as LiveSettings | null
}

function utcCalendarDate(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function localizedLive(live: LiveSettings, lang: Language) {
  const title = lang === 'fr' ? live.title_fr : live.title_ar
  const description = lang === 'fr' ? live.description_fr : live.description_ar
  return {
    title: title || live.title_fr,
    description: description || live.description_fr || '',
  }
}

export function downloadLiveCalendar(live: LiveSettings, lang: Language) {
  const { title, description } = localizedLive(live, lang)
  const start = utcCalendarDate(live.starts_at)
  const end = utcCalendarDate(live.ends_at || new Date(new Date(live.starts_at).getTime() + 60 * 60 * 1000).toISOString())
  const details = [description, live.meeting_url].filter(Boolean).join('\n\n')
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ECOLYN//Live ECOLYN//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:ecolyn-live-1@ecolyn.com',
    `DTSTAMP:${utcCalendarDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(details)}`,
    `LOCATION:${escapeCalendarText(live.location || 'En ligne')}`,
    live.meeting_url ? `URL:${live.meeting_url}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeCalendarText(lang === 'fr' ? 'Le live ECOLYN commence dans 30 minutes.' : 'لايف إيكولين غادي يبدا من بعد 30 دقيقة.')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'live-ecolyn.ics'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  track('live_calendar_click', { calendar_type: 'ics', live_id: live.id })
}

export function googleCalendarUrl(live: LiveSettings, lang: Language) {
  const { title, description } = localizedLive(live, lang)
  const start = utcCalendarDate(live.starts_at)
  const end = utcCalendarDate(live.ends_at || new Date(new Date(live.starts_at).getTime() + 60 * 60 * 1000).toISOString())
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: [description, live.meeting_url].filter(Boolean).join('\n\n'),
    location: live.location || 'En ligne',
  })
  return `https://calendar.google.com/calendar/render?${query.toString()}`
}
