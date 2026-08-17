import { getSupabase } from './supabase'

const MAX_INPUT_PHOTO_BYTES = 8 * 1024 * 1024
const MAX_STORED_PHOTO_BYTES = 3 * 1024 * 1024

export interface ProspectInsert {
  id: string
  reference: string
  status: 'nouveau'
  first_name: string
  whatsapp: string
  email: string | null
  city: string
  primary_concern: string
  skin_type: string | null
  goal: string | null
  description: string | null
  answers: Record<string, string | boolean | string[]>
  photo_data_url: string | null
  photo_name: string | null
  photo_consent: boolean
  contact_consent: boolean
  marketing_consent: boolean
  language: 'fr' | 'ar'
  source: string
  page_url: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

export function createReference() {
  const time = Date.now().toString(36).slice(-6).toUpperCase()
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-4).toUpperCase()
  return `ECO-${time}-${random}`
}

function scalar(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function checked(form: FormData, key: string) {
  return scalar(form, key) === 'yes'
}

function fileAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('PHOTO_READ_FAILED'))
    reader.readAsDataURL(blob)
  })
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('PHOTO_INVALID'))
    }
    image.src = objectUrl
  })
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('PHOTO_COMPRESSION_FAILED')),
      'image/jpeg',
      quality,
    )
  })
}

async function preparePhoto(file: File | null) {
  if (!file || file.size === 0) return { dataUrl: null, name: null }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('PHOTO_INVALID')
  }
  if (file.size > MAX_INPUT_PHOTO_BYTES) throw new Error('PHOTO_TOO_LARGE')

  const image = await loadImage(file)
  const maxDimension = 1600
  const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('PHOTO_COMPRESSION_FAILED')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  let blob = await canvasBlob(canvas, .82)
  if (blob.size > MAX_STORED_PHOTO_BYTES) blob = await canvasBlob(canvas, .64)
  if (blob.size > MAX_STORED_PHOTO_BYTES) throw new Error('PHOTO_TOO_LARGE')

  return {
    dataUrl: await fileAsDataUrl(blob),
    name: file.name.slice(0, 255),
  }
}

function collectAnswers(form: FormData) {
  const answers: Record<string, string | boolean | string[]> = {}
  for (const [key, value] of form.entries()) {
    if (value instanceof File) continue
    if (key.endsWith('Json')) {
      try {
        const parsed = JSON.parse(value)
        answers[key.replace(/Json$/, '')] = Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : value
      } catch { answers[key] = value }
    } else {
      answers[key] = value === 'yes' ? true : value
    }
  }
  return answers
}

export async function buildProspectInsert(
  formElement: HTMLFormElement,
  reference: string,
): Promise<ProspectInsert> {
  const form = new FormData(formElement)
  const primaryConcern = scalar(form, 'primaryConcern')
  const photoEntry = form.get('photo')
  if (photoEntry instanceof File && photoEntry.size > 0 && !checked(form, 'photoConsent')) {
    throw new Error('PHOTO_CONSENT_REQUIRED')
  }
  const photo = await preparePhoto(photoEntry instanceof File ? photoEntry : null)
  const query = new URLSearchParams(window.location.search)
  const language = document.documentElement.lang === 'ar' ? 'ar' : 'fr'

  return {
    id: crypto.randomUUID(),
    reference,
    status: 'nouveau',
    first_name: scalar(form, 'firstName'),
    whatsapp: scalar(form, 'whatsapp'),
    email: scalar(form, 'email') || null,
    city: scalar(form, 'city') || (language === 'ar' ? 'غير محددة' : 'Non renseignée'),
    primary_concern: primaryConcern || 'non-renseigne',
    skin_type: scalar(form, 'skinType') || null,
    goal: scalar(form, 'goal') || null,
    description: scalar(form, 'description') || null,
    answers: collectAnswers(form),
    photo_data_url: photo.dataUrl,
    photo_name: photo.name,
    photo_consent: checked(form, 'photoConsent'),
    contact_consent: checked(form, 'contactConsent'),
    marketing_consent: checked(form, 'marketingConsent'),
    language,
    source: 'ecolyn-advice-platform',
    page_url: window.location.href.slice(0, 2000),
    referrer: document.referrer ? document.referrer.slice(0, 2000) : null,
    utm_source: query.get('utm_source')?.slice(0, 255) || null,
    utm_medium: query.get('utm_medium')?.slice(0, 255) || null,
    utm_campaign: query.get('utm_campaign')?.slice(0, 255) || null,
    utm_term: query.get('utm_term')?.slice(0, 255) || null,
    utm_content: query.get('utm_content')?.slice(0, 255) || null,
  }
}

export async function insertProspect(form: HTMLFormElement, reference: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED')

  const prospect = await buildProspectInsert(form, reference)
  const { error } = await supabase.from('prospects').insert(prospect)
  if (error) throw new Error('SUPABASE_INSERT_FAILED')
  return prospect
}
