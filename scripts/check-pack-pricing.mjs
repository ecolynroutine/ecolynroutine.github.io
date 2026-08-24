import assert from 'node:assert/strict'
import { DEFAULT_COMMERCE, PRODUCT_ORDER, isOfferAvailable, nextAddition, normaliseCommerce, summaryFor } from '../public/pack/pricing.mjs'

const expected = new Map([
  ['cream', 99], ['cleanser', 103], ['sunscreen', 108], ['serum', 113],
  ['cream+cleanser', 152], ['cream+sunscreen', 155], ['cream+serum', 157],
  ['cleanser+sunscreen', 159], ['cleanser+serum', 161], ['sunscreen+serum', 164],
  ['cream+cleanser+sunscreen', 208], ['cream+cleanser+serum', 210],
  ['cream+sunscreen+serum', 213], ['cleanser+sunscreen+serum', 217],
  ['cream+cleanser+sunscreen+serum', 266],
])

function combinations(items) {
  return items.flatMap((_, index) => {
    const head = items[index]
    const tail = items.slice(index + 1)
    return [[head], ...combinations(tail).map(combo => [head, ...combo])]
  })
}

for (const ids of combinations(PRODUCT_ORDER)) {
  const result = summaryFor(ids, DEFAULT_COMMERCE)
  assert.equal(result.promoPrice, expected.get(result.key), `Prix incorrect pour ${result.key}`)
  assert.equal(result.separateValue - result.promoPrice, result.savings, `Économie incorrecte pour ${result.key}`)
  assert.equal(result.shipping, 0, `Livraison non offerte pour ${result.key}`)
  if (ids.length < 4) assert.ok(nextAddition(ids, DEFAULT_COMMERCE)?.increment >= 0, `Palier incorrect pour ${result.key}`)
}

const complete = summaryFor(PRODUCT_ORDER, DEFAULT_COMMERCE)
assert.deepEqual({ separate: complete.separateValue, promo: complete.promoPrice, saving: complete.savings }, { separate: 423, promo: 266, saving: 157 })
assert.equal(isOfferAvailable(normaliseCommerce({ offer_active: false })), false, 'Une offre désactivée ne doit pas être disponible')
assert.equal(isOfferAvailable(normaliseCommerce({ offer_active: true, offer_end_at: '2020-01-01T00:00:00Z' })), false, 'Une offre expirée ne doit pas être disponible')
assert.equal(summaryFor(['cream'], normaliseCommerce({ free_shipping: false, shipping_fee_dh: 40 })).total, 139, 'Les frais hors offre doivent rester configurables')
console.log(`OK — ${expected.size} combinaisons, économies et paliers vérifiés.`)
