import { PRODUCT_ORDER, DEFAULT_COMMERCE, normaliseCommerce, summaryFor, nextAddition, isOfferAvailable } from './pricing.mjs'

const appConfig = window.ECOLYN_CONFIG || {}
const clean = value => String(value || '').trim().replace(/^__VITE_[A-Z_]+__$/, '')
const supabaseUrl = clean(appConfig.supabaseUrl)
const supabaseKey = clean(appConfig.supabaseAnonKey)
const supabaseReady = /^https:\/\//.test(supabaseUrl) && supabaseKey.length > 20
const language = () => document.documentElement.lang === 'ar' ? 'ar' : 'fr'
const safeHeaders = () => ({ apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' })
const uuid = () => crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((Math.random() * 16 | 0) & (c === 'x' ? 15 : 3) | (c === 'x' ? 0 : 8)).toString(16))
const qs = new URLSearchParams(location.search)
const selected = new Set()
let commerce = normaliseCommerce(DEFAULT_COMMERCE)
let tracking = null
let countdownTimer = 0
let lastSummary = summaryFor([], commerce)
let toastTimer = 0

const products = {
  cream: { fr: 'Crème hydratante', ar: 'كريم مرطب', image: './Asset/products/cream.webp', useFr: 'Appliquez après le sérum, matin et/ou soir selon votre routine.', useAr: 'ديريها من بعد السيروم صباحاً و/أو مساءً حسب الروتين.' },
  cleanser: { fr: 'Mousse nettoyante', ar: 'غسول الوجه', image: './Asset/products/cleanser.webp', useFr: 'Utilisez sur peau humide puis rincez soigneusement.', useAr: 'استعمليه على بشرة مبللة ومن بعد شلليه مزيان.' },
  sunscreen: { fr: 'Écran solaire SPF50', ar: 'واقي شمسي SPF50', image: './Asset/products/sunscreen.webp', useFr: 'Appliquez le matin en dernière étape et renouvelez selon l’exposition.', useAr: 'ديريه صباحاً كآخر خطوة وعاودي الاستعمال حسب التعرض.' },
  serum: { fr: 'Sérum visage', ar: 'سيروم الوجه', image: './Asset/products/serum.webp', useFr: 'Quelques gouttes sur peau propre avant la crème.', useAr: 'ديري قطرات قليلة على بشرة نقية قبل الكريم.' },
}

function fallbackTracking() {
  return {
    meta_pixel_id: clean(appConfig.metaPixelId), meta_enabled: Boolean(clean(appConfig.metaPixelId)),
    tiktok_pixel_id: clean(appConfig.tiktokPixelId), tiktok_enabled: Boolean(clean(appConfig.tiktokPixelId)),
    ga4_measurement_id: clean(appConfig.ga4MeasurementId), ga4_enabled: Boolean(clean(appConfig.ga4MeasurementId)),
  }
}

async function getRows(table, select = '*') {
  if (!supabaseReady) return []
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}&id=eq.1`, { headers: safeHeaders() })
  if (!response.ok) throw new Error(`${table.toUpperCase()}_FETCH_FAILED`)
  return response.json()
}

async function loadConfiguration() {
  const [trackingResult, commerceResult] = await Promise.allSettled([
    getRows('tracking_settings', 'meta_pixel_id,meta_enabled,tiktok_pixel_id,tiktok_enabled,ga4_measurement_id,ga4_enabled'),
    getRows('commerce_settings'),
  ])
  tracking = trackingResult.status === 'fulfilled' && trackingResult.value[0] ? trackingResult.value[0] : fallbackTracking()
  commerce = normaliseCommerce(commerceResult.status === 'fulfilled' && commerceResult.value[0] ? commerceResult.value[0] : DEFAULT_COMMERCE)
  loadTrackers()
  applyCommerce()
}

function loadTrackers() {
  if (tracking.ga4_enabled && clean(tracking.ga4_measurement_id) && !window.gtag) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', clean(tracking.ga4_measurement_id), { anonymize_ip: true, page_title: document.title, page_location: location.href })
    const script = document.createElement('script'); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(clean(tracking.ga4_measurement_id))}`; document.head.append(script)
  }
  if (tracking.meta_enabled && clean(tracking.meta_pixel_id) && !window.fbq) {
    const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments) }
    fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; window.fbq = fbq; window._fbq = fbq
    fbq('init', clean(tracking.meta_pixel_id))
    const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script)
  }
  if (tracking.tiktok_enabled && clean(tracking.tiktok_pixel_id) && !window.ttq) {
    const ttq = []; ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'].forEach(method => { ttq[method] = (...args) => ttq.push([method, ...args]) })
    window.ttq = ttq
    const script = document.createElement('script'); script.async = true; script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(clean(tracking.tiktok_pixel_id))}&lib=ttq`; document.head.append(script)
  }
}

const metaEvents = { page_view: 'PageView', pack_view: 'ViewContent', cart_view: 'ViewContent', checkout_start: 'InitiateCheckout', initiate_checkout: 'InitiateCheckout', order_submit: 'Lead', whatsapp_click: 'Contact' }
const tiktokEvents = { page_view: 'PageView', pack_view: 'ViewContent', cart_view: 'ViewContent', checkout_start: 'InitiateCheckout', initiate_checkout: 'InitiateCheckout', order_submit: 'SubmitForm', whatsapp_click: 'Contact' }
function track(eventName, raw = {}, eventId = uuid()) {
  const blocked = /^(first_?name|last_?name|full_?name|nom|email|phone|telephone|tel|whatsapp|address|adresse|description|photo|message|free_?text|reference)$/i
  const payload = Object.fromEntries(Object.entries(raw).filter(([key, value]) => !blocked.test(key) && ['string', 'number', 'boolean'].includes(typeof value)))
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, event_id: eventId, page_path: location.pathname, language: language(), ...payload })
  if (tracking?.ga4_enabled && window.gtag && eventName !== 'page_view') window.gtag('event', eventName, payload)
  if (tracking?.meta_enabled && window.fbq) metaEvents[eventName] ? window.fbq('track', metaEvents[eventName], payload, { eventID: eventId }) : window.fbq('trackCustom', eventName, payload, { eventID: eventId })
  if (tracking?.tiktok_enabled && window.ttq) tiktokEvents[eventName] === 'PageView' ? window.ttq.page({ ...payload, event_id: eventId }) : window.ttq.track(tiktokEvents[eventName] || eventName, { ...payload, event_id: eventId })
  return eventId
}
window.ecolynTrack = track

function safeProductPayload(id, summary) {
  return { product_id: id, product_name: products[id].fr, quantity: 1, number_of_products: summary.count, value: summary.promoPrice, currency: 'MAD' }
}

function applyCommerce() {
  document.querySelectorAll('[data-unit-price]').forEach(node => { node.textContent = commerce.productPrices[node.dataset.unitPrice] })
  const number = commerce.whatsappNumber || clean(appConfig.whatsappNumber)
  const message = language() === 'ar' ? commerce.whatsappMessageAr : commerce.whatsappMessageFr
  const whatsapp = document.querySelector('#expertWhatsapp')
  whatsapp.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
  clearInterval(countdownTimer)
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
  render()
}

function updateCountdown() {
  const end = new Date(commerce.offerEndAt).getTime()
  const remaining = end - Date.now()
  const available = isOfferAvailable(commerce)
  document.querySelector('#offerBar').classList.toggle('is-ended', !available)
  if (!available) {
    document.querySelector('#countdown').innerHTML = language() === 'ar' ? 'العرض منتهي' : 'Offre terminée'
    document.querySelectorAll('[data-add],#checkoutButton').forEach(button => { button.disabled = true })
    return
  }
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000)); const days = Math.floor(totalSeconds / 86400); const hours = Math.floor(totalSeconds % 86400 / 3600); const minutes = Math.floor(totalSeconds % 3600 / 60); const seconds = totalSeconds % 60
  const set = (name, value) => { const node = document.querySelector(`[data-time=${name}]`); if (node) node.textContent = String(value).padStart(2, '0') }
  set('days', days); set('hours', hours); set('minutes', minutes); set('seconds', seconds)
  const showSeconds = remaining <= 86400000
  document.querySelectorAll('[data-time="seconds"],[data-time="seconds-label"]').forEach(node => { node.hidden = !showSeconds })
}

function render() {
  const ids = PRODUCT_ORDER.filter(id => selected.has(id)); lastSummary = summaryFor(ids, commerce)
  document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = lastSummary.count })
  document.querySelectorAll('[data-separate]').forEach(node => { node.textContent = lastSummary.separateValue })
  document.querySelectorAll('[data-savings]').forEach(node => { node.textContent = lastSummary.savings })
  document.querySelectorAll('[data-sticky-savings]').forEach(node => { node.textContent = lastSummary.savings })
  document.querySelectorAll('[data-total]').forEach(node => { node.textContent = lastSummary.total })
  document.querySelectorAll('[data-product-card]').forEach(card => { const active = selected.has(card.dataset.productCard); card.classList.toggle('is-selected', active); card.querySelector('[data-add]').setAttribute('aria-pressed', active) })
  const bag = document.querySelector('#bagProducts')
  bag.innerHTML = ids.length ? ids.map(id => `<img src="${products[id].image}" alt="${products[id][language()]}">`).join('') : `<p class="bag-empty">${language() === 'ar' ? 'اختياراتك غتبان هنا.' : 'Votre sélection apparaîtra ici.'}</p>`
  const checkout = document.querySelector('#checkoutButton'); checkout.disabled = !ids.length || !isOfferAvailable(commerce)
  const sticky = document.querySelector('#stickyCart'); sticky.hidden = !ids.length
  renderMilestone(ids)
}

function renderMilestone(ids) {
  const node = document.querySelector('#milestone')
  if (!ids.length) node.textContent = language() === 'ar' ? 'زيدي أول منتج أساسي.' : 'Ajoutez votre premier essentiel.'
  else if (ids.length === 4) node.textContent = language() === 'ar' ? 'فتحتي أحسن ثمن إيكولين ✨' : 'Meilleur tarif ECOLYN débloqué ✨'
  else if (ids.length === 1) node.textContent = language() === 'ar' ? 'زيدي منتج ثاني باش تستافدي من ثمن الديو.' : 'Ajoutez un 2e soin pour débloquer le tarif Duo.'
  else if (ids.length === 2) node.textContent = language() === 'ar' ? 'زيدي منتج ثالث ووفري أكثر.' : 'Ajoutez un 3e soin et économisez encore davantage.'
  else {
    const next = nextAddition(ids, commerce); const name = products[next.id][language()]
    node.textContent = language() === 'ar' ? `زيدي ${name} غير بـ ${next.increment} درهم إضافية.` : `Ajoutez ${name} pour seulement +${next.increment} DH.`
  }
}

function flyToBag(card) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const source = card.querySelector('img'); const target = document.querySelector('[data-cart-open]'); const a = source.getBoundingClientRect(); const b = target.getBoundingClientRect(); const clone = source.cloneNode(); clone.className = 'flying-product'; clone.style.left = `${a.left}px`; clone.style.top = `${a.top}px`; document.body.append(clone)
  requestAnimationFrame(() => { clone.style.transform = `translate(${b.left - a.left}px,${b.top - a.top}px) scale(.2) rotate(12deg)`; clone.style.opacity = '0' })
  setTimeout(() => clone.remove(), 700)
}

function toggleProduct(id, card) {
  if (!isOfferAvailable(commerce)) return showToast(language() === 'ar' ? 'العرض منتهي.' : 'L’offre est terminée.')
  if (selected.has(id)) { selected.delete(id); render(); track('product_remove', safeProductPayload(id, lastSummary)); showToast(language() === 'ar' ? 'تحيد المنتج.' : 'Produit retiré.') }
  else { selected.add(id); flyToBag(card); render(); track('product_add', safeProductPayload(id, lastSummary)); showToast(language() === 'ar' ? 'تزاد فـ الروتين ✓' : 'Ajouté à votre routine ✓') }
}

function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800) }
function openCheckout() {
  if (!selected.size) return document.querySelector('#compose').scrollIntoView()
  const ids = PRODUCT_ORDER.filter(id => selected.has(id)); const recap = document.querySelector('#checkoutRecap')
  recap.innerHTML = `<div class="checkout-recap__products">${ids.map(id => `<img src="${products[id].image}" alt="">`).join('')}</div><div class="checkout-recap__lines"><span><b>${ids.length} ${language() === 'ar' ? 'منتج' : 'produit(s)'}</b></span><span><small>${language() === 'ar' ? 'الثمن منفصل' : 'Valeur séparée'}</small><s>${lastSummary.separateValue} DH</s></span><span><small>${language() === 'ar' ? 'التوفير' : 'Économie'}</small><b>−${lastSummary.savings} DH</b></span><span><small>${language() === 'ar' ? 'التوصيل' : 'Livraison'}</small><b>${lastSummary.shipping ? `${lastSummary.shipping} DH` : (language() === 'ar' ? 'مجاني' : 'Offerte')}</b></span><strong>Total · ${lastSummary.total} DH</strong></div>`
  document.querySelector('#checkoutDialog').showModal()
  const data = { number_of_products: ids.length, value: lastSummary.total, currency: 'MAD', content_ids: ids.join(',') }
  track('cart_view', data); track('checkout_start', data); track('initiate_checkout', data)
}

async function submitOrder(form) {
  if (!supabaseReady) throw new Error('SUPABASE_NOT_CONFIGURED')
  const data = new FormData(form); const ids = PRODUCT_ORDER.filter(id => selected.has(id)); const reference = `ECO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const record = {
    id: uuid(), reference, status: 'nouveau', first_name: String(data.get('name')).trim(), whatsapp: String(data.get('whatsapp')).trim(), email: null, city: String(data.get('city')).trim(), primary_concern: 'commande_routine_ecolyn', skin_type: null, goal: 'Commander une routine ECOLYN personnalisée', description: null,
    answers: { type: 'pack_order', selectedProductIds: ids, selectedProducts: ids.map(id => products[id].fr), numberOfProducts: ids.length, separateValueDh: lastSummary.separateValue, promoTotalDh: lastSummary.promoPrice, savingsDh: lastSummary.savings, shippingDh: lastSummary.shipping, deliveryAddress: String(data.get('address')).trim() },
    photo_data_url: null, photo_name: null, photo_consent: false, contact_consent: true, marketing_consent: Boolean(data.get('consent')), language: language(), source: 'ecolyn_pack_builder', page_url: location.href.slice(0, 2000), referrer: document.referrer.slice(0, 2000) || null, utm_source: qs.get('utm_source'), utm_medium: qs.get('utm_medium'), utm_campaign: qs.get('utm_campaign'), utm_term: qs.get('utm_term'), utm_content: qs.get('utm_content')
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/prospects`, { method: 'POST', headers: { ...safeHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(record) })
  if (!response.ok) throw new Error('ORDER_INSERT_FAILED')
  const eventId = track('order_submit', { number_of_products: ids.length, value: lastSummary.total, currency: 'MAD', content_ids: ids.join(',') })
  sendCapi(reference, eventId)
  sessionStorage.setItem('ecolyn-last-lead', JSON.stringify({ reference }))
  return reference
}

async function sendCapi(reference, eventId) {
  try {
    const cookie = name => document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=').slice(1).join('=') || ''
    await fetch(`${supabaseUrl}/functions/v1/meta-capi`, { method: 'POST', headers: safeHeaders(), body: JSON.stringify({ event_name: 'Lead', event_id: eventId, reference, event_time: Math.floor(Date.now() / 1000), event_source_url: location.href, fbp: cookie('_fbp'), fbc: cookie('_fbc') }) })
  } catch { /* L'enregistrement de la commande reste prioritaire si un outil tiers est indisponible. */ }
}

function switchLanguage() {
  const next = language() === 'fr' ? 'ar' : 'fr'; document.documentElement.lang = next; document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('ecolyn-lang', next); document.querySelector('#langButton').textContent = next === 'ar' ? 'FR' : 'ع'; document.title = next === 'ar' ? 'ركّبي روتينك ECOLYN' : 'Composez votre routine ECOLYN'; applyCommerce(); track('language_change', { language: next })
}

function bind() {
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => toggleProduct(button.dataset.add, button.closest('[data-product-card]'))))
  document.querySelectorAll('[data-cart-open]').forEach(button => button.addEventListener('click', openCheckout))
  document.querySelector('#checkoutButton').addEventListener('click', openCheckout)
  document.querySelectorAll('[data-pack-cta]').forEach(link => link.addEventListener('click', () => track('pack_cta_click', { cta_location: link.dataset.packCta })))
  document.querySelector('#langButton').addEventListener('click', switchLanguage)
  document.querySelector('#expertWhatsapp').addEventListener('click', () => track('whatsapp_click', { cta_location: 'pack_expert' }))
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()))
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() }))
  document.querySelectorAll('[data-details]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation(); const id = button.dataset.details; const product = products[id]; const title = product[language()]; const content = document.querySelector('#detailsContent')
    content.innerHTML = `<p class="kicker">ECOLYN</p><h2>${title}</h2><img src="${product.image}" alt="${title}" style="width:150px;height:200px;object-fit:contain;margin:auto"><p>${language() === 'ar' ? product.useAr : product.useFr}</p><p><b>${language() === 'ar' ? 'نصيحة:' : 'Conseil :'}</b> ${language() === 'ar' ? 'اختبري المنتج على منطقة صغيرة وتوقفي عن الاستعمال إذا وقع تهيج.' : 'Testez le produit sur une petite zone et arrêtez en cas d’irritation.'}</p>`
    document.querySelector('#detailsDialog').showModal(); track('view_content', { product_id: id, product_name: product.fr })
  }))
  const range = document.querySelector('#comparisonRange'); range.addEventListener('input', () => document.querySelector('#beforeAfter').style.setProperty('--split', `${range.value}%`)); range.addEventListener('change', () => track('real_before_after_interaction', { position: Number(range.value) }), { once: true })
  const media = [...document.querySelectorAll('video,audio')]
  media.forEach(item => { item.addEventListener('play', () => { media.forEach(other => { if (other !== item) other.pause() }); track(item.tagName === 'VIDEO' ? 'product_video_play' : 'testimonial_audio_play', { media_name: item.parentElement.textContent.trim() }) }) })
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting && !entry.target.paused) entry.target.pause() }), { threshold: .15 })
  document.querySelectorAll('video').forEach(video => observer.observe(video))
  document.querySelector('#checkoutForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button[type=submit]'); const status = document.querySelector('#formStatus'); button.disabled = true; status.textContent = language() === 'ar' ? 'جاري تسجيل الطلب…' : 'Enregistrement de votre commande…'
    try { const reference = await submitOrder(form); status.textContent = language() === 'ar' ? 'تسجل الطلب بنجاح ✓' : 'Commande enregistrée ✓'; setTimeout(() => { location.href = `../merci?ref=${encodeURIComponent(reference)}` }, 650) } catch { status.textContent = language() === 'ar' ? 'وقع مشكل. عاودي المحاولة.' : 'Une erreur est survenue. Réessayez.'; button.disabled = false }
  })
}

const initialLang = localStorage.getItem('ecolyn-lang') === 'ar' ? 'ar' : 'fr'
document.documentElement.lang = initialLang; document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr'; document.querySelector('#langButton').textContent = initialLang === 'ar' ? 'FR' : 'ع'
bind()
loadConfiguration().finally(() => { track('page_view', { page_type: 'pack_builder' }); track('pack_view', { content_name: 'Routine ECOLYN personnalisable' }) })
