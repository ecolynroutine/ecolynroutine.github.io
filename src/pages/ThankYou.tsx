import { useEffect } from 'react'
import { ArrowLeft, ArrowUpRight, Check, HeartHandshake, MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { routeUrl } from '../lib/navigation'
import { initializeTracking, track } from '../lib/tracking'

interface SavedLead {
  reference?: string
  whatsappUrl?: string
}

function readSavedLead(): SavedLead {
  try {
    return JSON.parse(sessionStorage.getItem('ecolyn-last-lead') || '{}') as SavedLead
  } catch {
    return {}
  }
}

export default function ThankYou() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'fr'
  const query = new URLSearchParams(window.location.search)
  const saved = readSavedLead()
  const reference = query.get('ref') || saved.reference || ''
  const number = (window.ECOLYN_CONFIG?.whatsappNumber || '212699072913').replace(/\D/g, '')
  const whatsappUrl = saved.whatsappUrl || `https://wa.me/${number}`
  const groupUrl = window.ECOLYN_CONFIG?.whatsappGroupUrl

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    void initializeTracking('thank_you')
    track('view_content', { content_name: 'lead_thank_you', reference_present: Boolean(reference) })
  }, [lang, reference])

  return (
    <main className="thank-you-page">
      <div className="thank-you-orbit thank-you-orbit--one" />
      <div className="thank-you-orbit thank-you-orbit--two" />
      <a className="thank-you-brand" href={routeUrl('home')}><span>ECOLYN</span><small>{lang === 'fr' ? 'COMPRENDRE SA PEAU' : 'نفهمو البشرة'}</small></a>
      <section className="thank-you-card">
        <div className="thank-you-check"><Check /></div>
        <p className="thank-you-kicker">{lang === 'fr' ? 'Demande enregistrée' : 'تسجل الطلب ديالك'}</p>
        <h1>{lang === 'fr' ? 'Merci pour votre confiance.' : 'شكراً على الثقة ديالك.'}</h1>
        <p className="thank-you-copy">
          {lang === 'fr'
            ? 'Votre demande est maintenant enregistrée de façon sécurisée. Notre équipe l’examinera avant de vous contacter.'
            : 'الطلب ديالك تسجل بطريقة آمنة. الفريق ديالنا غادي يراجعو قبل ما يتواصل معاك.'}
        </p>
        {reference && <span className="thank-you-reference">{reference}</span>}
        <div className="thank-you-timeline">
          <div><span><Check /></span><p><strong>{lang === 'fr' ? 'Demande reçue' : 'توصلنا بالطلب'}</strong><small>{lang === 'fr' ? 'Vos informations sont protégées.' : 'المعلومات ديالك محمية.'}</small></p></div>
          <div><span><HeartHandshake /></span><p><strong>{lang === 'fr' ? 'Analyse personnalisée' : 'مراجعة شخصية'}</strong><small>{lang === 'fr' ? 'Une conseillère étudie votre situation.' : 'مستشارة غادي تشوف الحالة ديالك.'}</small></p></div>
          <div><span><MessageCircle /></span><p><strong>{lang === 'fr' ? 'Réponse sur WhatsApp' : 'الجواب فالواتساب'}</strong><small>{lang === 'fr' ? 'Vous recevrez les prochaines étapes.' : 'غادي توصلك الخطوات الجاية.'}</small></p></div>
        </div>
        <div className="thank-you-actions">
          <a className="thank-you-primary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'thank_you' })}>
            {lang === 'fr' ? 'Ouvrir WhatsApp' : 'فتح واتساب'} <MessageCircle />
          </a>
          {groupUrl && <a className="thank-you-secondary" href={groupUrl} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'thank_you_group' })}>{lang === 'fr' ? 'Rejoindre la communauté' : 'الانضمام للمجموعة'} <ArrowUpRight /></a>}
        </div>
        <a className="thank-you-return" href={routeUrl('home')}><ArrowLeft /> {lang === 'fr' ? 'Retourner aux conseils' : 'الرجوع للنصائح'}</a>
        <p className="thank-you-privacy"><ShieldCheck /> {lang === 'fr' ? 'Vos données ne sont accessibles qu’aux administrateurs autorisés.' : 'غير المسؤولين المسموح لهم يقدرو يشوفو المعلومات ديالك.'}</p>
      </section>
    </main>
  )
}
