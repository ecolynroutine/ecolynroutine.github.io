export interface LeadResult {
  ok: boolean
  reference: string
  mode: 'endpoint' | 'whatsapp'
  whatsappUrl: string
}

function createReference() {
  return `ECO-${Date.now().toString(36).slice(-6).toUpperCase()}`
}

function buildWhatsAppUrl(payload: Record<string, unknown>, reference: string) {
  const number = (window.ECOLYN_CONFIG?.whatsappNumber || '212699072913').replace(/\D/g, '')
  const message = [
    `Bonjour ECOLYN — demande de conseils ${reference}`,
    `Prénom : ${payload.firstName || ''}`,
    `Ville : ${payload.city || ''}`,
    `WhatsApp : ${payload.whatsapp || ''}`,
    `Problème principal : ${payload.primaryConcern || ''}`,
    `Type de peau : ${payload.skinType || ''}`,
    `Objectif : ${payload.goal || ''}`,
    `Routine / situation : ${payload.description || ''}`,
    'Je confirme vouloir être contactée au sujet de cette demande.'
  ].join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export async function submitLead(form: HTMLFormElement): Promise<LeadResult> {
  const reference = createReference()
  const data = new FormData(form)
  const payload = Object.fromEntries(data.entries())
  const endpoint = window.ECOLYN_CONFIG?.leadEndpoint?.trim()
  const whatsappUrl = buildWhatsAppUrl(payload, reference)

  data.set('reference', reference)
  data.set('source', 'ecolyn-advice-platform')
  data.set('submittedAt', new Date().toISOString())
  data.set('language', document.documentElement.lang)

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) throw new Error(`Lead endpoint returned ${response.status}`)
    return { ok: true, reference, mode: 'endpoint', whatsappUrl }
  }

  const localQueue = JSON.parse(localStorage.getItem('ecolyn-pending-leads') || '[]')
  localQueue.push({
    ...payload,
    reference,
    submittedAt: new Date().toISOString(),
    photo: data.get('photo') instanceof File && (data.get('photo') as File).size > 0 ? 'not-stored-locally' : ''
  })
  localStorage.setItem('ecolyn-pending-leads', JSON.stringify(localQueue.slice(-10)))

  return { ok: true, reference, mode: 'whatsapp', whatsappUrl }
}
