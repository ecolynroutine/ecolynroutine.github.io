export const PRODUCT_ORDER = ['cream', 'cleanser', 'sunscreen', 'serum']

export const DEFAULT_COMMERCE = Object.freeze({
  offerActive: true,
  offerEndAt: '2026-08-31T23:59:59+01:00',
  freeShipping: true,
  shippingFeeDh: 40,
  whatsappNumber: '212699072913',
  whatsappMessageFr: 'Bonjour Hanane, j’ai une question avant de composer ma routine ECOLYN.',
  whatsappMessageAr: 'سلام حنان، عندي سؤال قبل ما نختار روتين إيكولين ديالي.',
  productPrices: {
    cream: 99,
    cleanser: 103,
    sunscreen: 108,
    serum: 113,
  },
  bundlePrices: {
    'cream+cleanser': 152,
    'cream+sunscreen': 155,
    'cream+serum': 157,
    'cleanser+sunscreen': 159,
    'cleanser+serum': 161,
    'sunscreen+serum': 164,
    'cream+cleanser+sunscreen': 208,
    'cream+cleanser+serum': 210,
    'cream+sunscreen+serum': 213,
    'cleanser+sunscreen+serum': 217,
    'cream+cleanser+sunscreen+serum': 266,
  },
})

const positivePrice = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback
}

const objectValue = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export function combinationKey(ids) {
  const selected = new Set(ids)
  return PRODUCT_ORDER.filter(id => selected.has(id)).join('+')
}

export function normaliseCommerce(raw = {}) {
  const productPrices = objectValue(raw.product_prices || raw.productPrices)
  const bundlePrices = objectValue(raw.bundle_prices || raw.bundlePrices)
  return {
    offerActive: typeof raw.offer_active === 'boolean' ? raw.offer_active : typeof raw.offerActive === 'boolean' ? raw.offerActive : DEFAULT_COMMERCE.offerActive,
    offerEndAt: String(raw.offer_end_at || raw.offerEndAt || DEFAULT_COMMERCE.offerEndAt),
    freeShipping: typeof raw.free_shipping === 'boolean' ? raw.free_shipping : typeof raw.freeShipping === 'boolean' ? raw.freeShipping : DEFAULT_COMMERCE.freeShipping,
    shippingFeeDh: positivePrice(raw.shipping_fee_dh ?? raw.shippingFeeDh, DEFAULT_COMMERCE.shippingFeeDh),
    whatsappNumber: String(raw.whatsapp_number || raw.whatsappNumber || DEFAULT_COMMERCE.whatsappNumber).replace(/\D/g, ''),
    whatsappMessageFr: String(raw.whatsapp_message_fr || raw.whatsappMessageFr || DEFAULT_COMMERCE.whatsappMessageFr),
    whatsappMessageAr: String(raw.whatsapp_message_ar || raw.whatsappMessageAr || DEFAULT_COMMERCE.whatsappMessageAr),
    productPrices: Object.fromEntries(PRODUCT_ORDER.map(id => [id, positivePrice(productPrices[id], DEFAULT_COMMERCE.productPrices[id])])),
    bundlePrices: Object.fromEntries(Object.keys(DEFAULT_COMMERCE.bundlePrices).map(key => [key, positivePrice(bundlePrices[key], DEFAULT_COMMERCE.bundlePrices[key])])),
  }
}

export function priceFor(ids, commerce = DEFAULT_COMMERCE) {
  const key = combinationKey(ids)
  if (!key) return 0
  if (!key.includes('+')) return commerce.productPrices[key]
  return commerce.bundlePrices[key] ?? key.split('+').reduce((sum, id) => sum + commerce.productPrices[id], 0)
}

export function summaryFor(ids, commerce = DEFAULT_COMMERCE) {
  const key = combinationKey(ids)
  const selected = key ? key.split('+') : []
  const separateValue = selected.reduce((sum, id) => sum + commerce.productPrices[id], 0)
  const promoPrice = priceFor(selected, commerce)
  const savings = Math.max(0, separateValue - promoPrice)
  const shipping = commerce.freeShipping || !selected.length ? 0 : commerce.shippingFeeDh
  return {
    key,
    count: selected.length,
    separateValue,
    promoPrice,
    savings,
    shipping,
    total: promoPrice + shipping,
  }
}

export function nextAddition(ids, commerce = DEFAULT_COMMERCE) {
  const key = combinationKey(ids)
  const selected = key ? key.split('+') : []
  if (!selected.length || selected.length === PRODUCT_ORDER.length) return null
  const current = priceFor(selected, commerce)
  return PRODUCT_ORDER
    .filter(id => !selected.includes(id))
    .map(id => ({ id, increment: priceFor([...selected, id], commerce) - current }))
    .sort((a, b) => a.increment - b.increment)[0]
}

export function isOfferAvailable(commerce, now = Date.now()) {
  if (!commerce.offerActive) return false
  const end = new Date(commerce.offerEndAt).getTime()
  return Number.isFinite(end) && end > now
}
