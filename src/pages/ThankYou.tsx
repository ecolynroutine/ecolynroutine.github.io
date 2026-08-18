import { useEffect } from 'react'
import { ArrowLeft, ArrowUpRight, Check, HeartHandshake, MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { routeUrl } from '../lib/navigation'
import { initializeTracking, track } from '../lib/tracking'
import './system-pages.css'

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
  const queryReference = query.get('ref') || ''
  const confirmed = Boolean(saved.reference && (!queryReference || queryReference === saved.reference))
  const reference = confirmed ? saved.reference || '' : ''
  const number = (window.ECOLYN_CONFIG?.whatsappNumber || '212699072913').replace(/\D/g, '')
  const whatsappUrl = saved.whatsappUrl || `https://wa.me/${number}`
  const groupUrl = window.ECOLYN_CONFIG?.whatsappGroupUrl || 'https://chat.whatsapp.com/IbrwixzaySqLYawg3D7WiP?s=cl&p=a&ilr=1'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    void initializeTracking('thank_you')
    track('view_content', { content_name: confirmed ? 'lead_thank_you' : 'thank_you_direct_access', submission_confirmed: confirmed })
  }, [confirmed, lang])

  return (
    <main className="thank-you-page">
      <div className="thank-you-orbit thank-you-orbit--one" />
      <div className="thank-you-orbit thank-you-orbit--two" />
      <a className="thank-you-brand" href={routeUrl('home')}><span>ECOLYN</span><small>{lang === 'fr' ? 'COMPRENDRE SA PEAU' : 'فهم بشرتك'}</small></a>
      <section className="thank-you-card">
        <div className="thank-you-check">{confirmed ? <Check /> : <MessageCircle />}</div>
        <p className="thank-you-kicker">{confirmed ? (lang === 'fr' ? 'Demande enregistrée' : 'تم تسجيل الطلب') : (lang === 'fr' ? 'Espace de confirmation' : 'صفحة التأكيد')}</p>
        <h1>{confirmed ? (lang === 'fr' ? 'Votre demande a bien été reçue ✅' : 'تم استلام طلبك بنجاح ✅') : (lang === 'fr' ? 'Vous n’avez pas encore envoyé de demande.' : 'لم ترسلي أي طلب بعد.')}</h1>
        <p className="thank-you-copy">
          {confirmed ? (lang === 'fr'
            ? 'Hanane dispose maintenant de vos coordonnées et, si vous avez effectué les 3 choix, de vos réponses. Elle pourra vous contacter personnellement sur WhatsApp afin d’étudier votre situation avec vous.'
            : 'أصبحت لدى حنان الآن معلومات التواصل الخاصة بك، وإذا أكملتِ الاختيارات الثلاثة فستتوفر أيضاً على إجاباتك. وستتواصل معك شخصياً عبر WhatsApp لفهم حالتك معك بشكل أفضل.') : (lang === 'fr'
              ? 'Cette page confirme uniquement les demandes réellement envoyées. Commencez le formulaire et laissez simplement vos coordonnées.'
              : 'تؤكد هذه الصفحة الطلبات التي تم إرسالها فعلاً. ابدئي النموذج واتركي فقط معلومات التواصل الخاصة بك.')}
        </p>
        {confirmed && reference && <span className="thank-you-reference">{reference}</span>}
        {confirmed && <div className="thank-you-timeline">
          <div><span><Check /></span><p><strong>{lang === 'fr' ? 'Demande reçue' : 'تم استلام الطلب'}</strong><small>{lang === 'fr' ? 'Vos informations sont protégées.' : 'معلوماتك محمية.'}</small></p></div>
          <div><span><HeartHandshake /></span><p><strong>{lang === 'fr' ? 'Échange avec Hanane' : 'التواصل مع حنان'}</strong><small>{lang === 'fr' ? 'Hanane prendra le temps de comprendre votre situation avec vous.' : 'ستأخذ حنان الوقت لفهم حالتك معك.'}</small></p></div>
          <div><span><MessageCircle /></span><p><strong>{lang === 'fr' ? 'Conseils sur WhatsApp' : 'نصائح عبر WhatsApp'}</strong><small>{lang === 'fr' ? 'Vous recevrez les prochaines étapes.' : 'ستصلك الخطوات التالية.'}</small></p></div>
        </div>}
        {confirmed && <section className="thank-you-group">
          <p>{lang === 'fr' ? 'En attendant, rejoignez notre groupe gratuit de conseils skincare.' : 'في انتظار الرد، انضمي إلى مجموعتنا المجانية لنصائح العناية بالبشرة.'}</p>
          <ul>
            {(lang === 'fr'
              ? ['Conseils réguliers', 'Réponses aux questions fréquentes', 'Lives', 'Expériences de la communauté', 'Nouveaux contenus']
              : ['نصائح منتظمة', 'إجابات عن الأسئلة المتكررة', 'لقاءات مباشرة', 'تجارب المجتمع', 'محتوى جديد']).map(item => <li key={item}><Check /> {item}</li>)}
          </ul>
          <a href={groupUrl} target="_blank" rel="noreferrer" onClick={() => track('join_whatsapp_group', { source: 'thank_you_group' })}>
            <MessageCircle /> {lang === 'fr' ? 'Rejoindre le groupe WhatsApp' : 'انضمي لمجموعة WhatsApp'} <ArrowUpRight />
          </a>
        </section>}
        <div className="thank-you-actions">
          {confirmed ? <>
            <a className="thank-you-secondary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'thank_you' })}>
              {lang === 'fr' ? 'Ouvrir WhatsApp' : 'فتح واتساب'} <MessageCircle />
            </a>
          </> : <a className="thank-you-primary" href={`${routeUrl('home')}#personnalisation`}>{lang === 'fr' ? 'Remplir le formulaire' : 'ملء النموذج'} <ArrowUpRight /></a>}
        </div>
        <a className="thank-you-return" href={routeUrl('home')}><ArrowLeft /> {lang === 'fr' ? 'Retourner aux conseils' : 'العودة إلى النصائح'}</a>
        <p className="thank-you-privacy"><ShieldCheck /> {lang === 'fr' ? 'Vos données ne sont accessibles qu’aux administrateurs autorisés.' : 'لا يمكن الاطلاع على بياناتك إلا من طرف المسؤولين المصرح لهم.'}</p>
      </section>
    </main>
  )
}
