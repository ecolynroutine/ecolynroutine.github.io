import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check,
  ChevronDown, Clock3, Droplets, Eye, FileText, HeartHandshake,
  Languages, LockKeyhole, Menu, MessageCircle, MoonStar, MoveRight, Pause, Play,
  ShieldCheck, Sparkles, Sun, Upload, Utensils, Volume2, X
} from 'lucide-react'
import type { Article, EvidenceLevel, Language, Localized, Testimonial } from './types'
import { articles, quickTips } from './data/articles'
import { skinCases } from './data/cases'
import { testimonials } from './data/testimonials'
import { nutritionChapters } from './data/nutrition'
import { siteConfig } from './data/site'
import { faqs } from './data/faqs'
import { initializeTracking, track, trackOncePerSession } from './lib/tracking'
import { submitLead, type LeadResult } from './lib/submitLead'
import { navigate, packUrl } from './lib/navigation'
import DiscoveryExperience, { DiscoveryAfterForm } from './components/DiscoveryExperience'
import { concernOptions, lifestyleTopics, skinProfiles, type LifestyleId, type SkinProfileId } from './data/discovery'
import type { ComplexionId } from './data/advice'
import {
  downloadLiveCalendar,
  getPublishedLive,
  googleCalendarUrl,
  type LiveSettings,
} from './lib/live'

const packHref = packUrl()
const whatsappGroupHref = 'https://chat.whatsapp.com/IbrwixzaySqLYawg3D7WiP?s=cl&p=a&ilr=1'

const concerns = [
  {
    id: 'taches',
    label: { fr: 'Taches', ar: 'التصبغات' },
    short: { fr: 'Taches', ar: 'التصبغات' },
    summary: { fr: 'Les taches ont besoin de régularité et de protection, pas d’une succession de produits agressifs.', ar: 'التصبغات كتحتاج الاستمرار والحماية، ماشي تبديل المنتجات القوية.' },
    mistakes: { fr: ['Oublier la protection solaire', 'Changer d’actif trop vite', 'Frotter ou exfolier trop fort'], ar: ['نسيان الواقي الشمسي', 'تبديل المواد الفعالة بسرعة', 'الحك أو التقشير القوي'] },
    quickTip: { fr: 'Gardez une base douce et un SPF chaque matin pendant plusieurs semaines avant de juger.', ar: 'خلي روتين لطيف وSPF كل صباح لعدة أسابيع قبل ما تحكمي.' },
    caseStudy: { fr: '« Mes taches reviennent malgré mon sérum. » Souvent, la protection quotidienne manque de régularité.', ar: '« التصبغات كترجع رغم السيروم. » غالباً الحماية اليومية ماشي منتظمة.' },
  },
  {
    id: 'traces',
    label: { fr: 'Traces de boutons', ar: 'آثار الحبوب' },
    short: { fr: 'Traces de boutons', ar: 'آثار الحبوب' },
    summary: { fr: 'Une trace colorée, une inflammation et une cicatrice en relief ne se travaillent pas de la même façon.', ar: 'الأثر الملون، الالتهاب والندبة البارزة ما كيتعاملوش بنفس الطريقة.' },
    mistakes: { fr: ['Toucher les boutons', 'Cumuler plusieurs exfoliants', 'Négliger le SPF'], ar: ['لمس الحبوب', 'جمع بزاف ديال المقشرات', 'إهمال SPF'] },
    quickTip: { fr: 'Commencez par ne plus manipuler, protéger le matin et introduire un seul actif à la fois.', ar: 'بداي بلا لمس، الحماية فالصباح، ومادة فعالة وحدة فكل مرة.' },
    caseStudy: { fr: '« Mes traces restent visibles longtemps. » Le toucher et le soleil peuvent entretenir leur couleur.', ar: '« آثار الحبوب كتبقى مدة طويلة. » اللمس والشمس يقدرو يزيدو يثبتو اللون.' },
  },
  {
    id: 'grasse',
    label: { fr: 'Peau grasse', ar: 'البشرة الدهنية' },
    short: { fr: 'Peau grasse', ar: 'البشرة الدهنية' },
    summary: { fr: 'Apaiser la brillance sans décaper ni assécher la peau.', ar: 'نقص اللمعان بلا ما نجففو أو نجهدو البشرة.' },
    mistakes: { fr: ['Nettoyer trop souvent', 'Sauter l’hydratant', 'Utiliser de l’eau très chaude'], ar: ['الغسيل بزاف', 'حبس المرطب', 'استعمال الماء السخون بزاف'] },
    quickTip: { fr: 'Testez un nettoyant doux et un hydratant léger, puis observez la zone T.', ar: 'جربي منظف لطيف ومرطب خفيف وراقبي منطقة T.' },
    caseStudy: { fr: '« Ma peau brille mais tire après le nettoyage. » Le nettoyage peut être trop intense.', ar: '« بشرتي كتلمع ولكن كتشّد بعد الغسيل. » ممكن التنظيف قوي بزاف.' },
  },
  {
    id: 'seche',
    label: { fr: 'Peau sèche', ar: 'البشرة الجافة' },
    short: { fr: 'Peau sèche', ar: 'البشرة الجافة' },
    summary: { fr: 'Retrouver du confort sans accumuler des couches inutiles.', ar: 'نرجعو الراحة بلا طبقات ومنتجات كثيرة.' },
    mistakes: { fr: ['Eau trop chaude', 'Nettoyant décapant', 'Ajouter trop d’actifs'], ar: ['الماء السخون بزاف', 'منظف قوي', 'زيادة مواد فعالة كثيرة'] },
    quickTip: { fr: 'Réduisez les agressions et appliquez une crème confortable sur peau légèrement humide.', ar: 'نقصي الحوايج القوية وديري كريم مريح والبشرة مازال رطبة شوية.' },
    caseStudy: { fr: '« Ma peau tire juste après le lavage. » La barrière cutanée a peut-être surtout besoin de douceur.', ar: '« بشرتي كتشّد مباشرة بعد الغسيل. » ممكن الحاجز ديال البشرة محتاج اللطف.' },
  },
  {
    id: 'terne',
    label: { fr: 'Teint terne', ar: 'البشرة الباهتة' },
    short: { fr: 'Teint terne', ar: 'بهتان البشرة' },
    summary: { fr: 'Revenir aux gestes réguliers avant de chercher un produit miracle.', ar: 'نرجعو للعادات المنتظمة قبل ما نقلبو على منتج سحري.' },
    mistakes: { fr: ['Changer souvent de routine', 'Chercher un résultat immédiat', 'Négliger hydratation et SPF'], ar: ['تبديل الروتين بزاف', 'تسناي نتيجة سريعة', 'إهمال الترطيب وSPF'] },
    quickTip: { fr: 'Stabilisez une routine simple deux semaines et observez le confort avant d’ajouter.', ar: 'ثبتي روتين بسيط جوج سيمانات وراقبي الراحة قبل ما تزيدي.' },
    caseStudy: { fr: '« J’utilise plusieurs produits mais mon teint reste terne. » Trop d’objectifs peuvent brouiller la routine.', ar: '« كنستعمل منتجات كثيرة والبشرة باقا باهتة. » كثرة الأهداف تقدر تخربق الروتين.' },
  },
  {
    id: 'sensible',
    label: { fr: 'Peau sensible', ar: 'البشرة الحساسة' },
    short: { fr: 'Peau sensible', ar: 'البشرة الحساسة' },
    summary: { fr: 'Repérer les déclencheurs et simplifier avant d’ajouter.', ar: 'نعرفو المحفزات ونبسطو قبل ما نزيدو.' },
    mistakes: { fr: ['Tester plusieurs nouveautés', 'Ignorer les picotements', 'Exfolier pendant une réaction'], ar: ['تجريب بزاف ديال الجديد', 'تجاهل اللسع', 'التقشير وقت التفاعل'] },
    quickTip: { fr: 'Revenez à une routine courte et testez toute nouveauté sur une petite zone.', ar: 'رجعي لروتين قصير وجربي أي جديد فبلاصة صغيرة.' },
    caseStudy: { fr: '« Tout me pique depuis quelques jours. » Une pause des nouveautés aide à identifier le déclencheur.', ar: '« كلشي كيحرقني هاد الأيام. » وقفي الجديد شوية باش تعرفي السبب.' },
  },
  {
    id: 'spf',
    label: { fr: 'Protection solaire', ar: 'الحماية من الشمس' },
    short: { fr: 'Protection solaire', ar: 'الحماية من الشمس' },
    summary: { fr: 'Transformer le SPF en vraie habitude quotidienne.', ar: 'نخليو SPF عادة يومية حقيقية.' },
    mistakes: { fr: ['L’appliquer seulement à la plage', 'Mettre une quantité minime', 'Oublier de renouveler si exposée'], ar: ['استعمالو غير فالبحر', 'كمية قليلة بزاف', 'نسيان التجديد مع التعرض'] },
    quickTip: { fr: 'Placez-le avec vos gestes du matin : dernière étape, quantité suffisante.', ar: 'خليه مع حاجيات الصباح: آخر خطوة وبكمية كافية.' },
    caseStudy: { fr: '« J’utilise un sérum mais j’oublie le SPF. » L’actif ne remplace pas la protection quotidienne.', ar: '« كنستعمل سيروم ولكن كنسى SPF. » السيروم ما كيعوضش الحماية اليومية.' },
  },
  {
    id: 'inconnue',
    label: { fr: 'Je ne comprends pas ma peau', ar: 'ما فاهمتش بشرتي' },
    short: { fr: 'Je ne sais pas', ar: 'ما فاهمتش بشرتي' },
    summary: { fr: 'Observer les sensations, les zones et les moments de la journée.', ar: 'نراقبو الإحساس، المناطق وأوقات النهار.' },
    mistakes: { fr: ['Se fier à une seule journée', 'Confondre type et réaction', 'Acheter avant d’observer'], ar: ['الحكم من نهار واحد', 'الخلط بين النوع والتفاعل', 'الشراء قبل المراقبة'] },
    quickTip: { fr: 'Observez la zone T, les joues et les tiraillements 30 minutes après un nettoyage doux.', ar: 'راقبي منطقة T والخدود والشد 30 دقيقة من بعد تنظيف لطيف.' },
    caseStudy: { fr: '« Je brille à certains endroits et je tire ailleurs. » Il peut s’agir d’une peau mixte ou déshydratée.', ar: '« كنلمع فبلايص وكنحس بالشد فبلايص. » ممكن بشرة مختلطة أو ناقصة ترطيب.' },
  }
]

const beforeAfterFilters: Localized[] = [
  { fr: 'Taches', ar: 'البقع' }, { fr: 'Traces de boutons', ar: 'آثار الحبوب' },
  { fr: 'Hydratation', ar: 'الترطيب' }, { fr: 'Éclat', ar: 'الإشراق' },
  { fr: 'Routine', ar: 'الروتين' }, { fr: 'Protection solaire', ar: 'الحماية من الشمس' }
]

const sectionMotion = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: .8, ease: [0.22, 1, 0.36, 1] as const } }
}

function useLanguage() {
  const { i18n } = useTranslation()
  const lang = (i18n.language.startsWith('ar') ? 'ar' : 'fr') as Language
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('ecolyn-language', lang)
    const title = lang === 'fr' ? 'ECOLYN — Conseils gratuits pour mieux comprendre votre peau' : 'ECOLYN — نصائح مجانية لفهم بشرتك والعناية بها'
    const description = lang === 'fr'
      ? 'Découvrez des conseils gratuits, prudents et sourcés selon votre peau, vos préoccupations et votre mode de vie.'
      : 'اكتشفي نصائح مجانية وحذرة ومدعومة بالمصادر حسب بشرتك واهتماماتك وسياقك اليومي.'
    document.title = title
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.setAttribute('content', lang === 'fr' ? 'fr_MA' : 'ar_MA')
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', 'https://ecolyn.ma/og-ecolyn-3-choices.png')
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title)
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description)
    document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', 'https://ecolyn.ma/og-ecolyn-3-choices.png')
  }, [lang])
  return lang
}

function local<T extends Localized>(value: T, lang: Language) {
  return value[lang]
}

function Reveal({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const reduced = useReducedMotion()
  const mobile = window.matchMedia('(max-width: 820px)').matches
  return (
    <motion.section
      id={id}
      className={className}
      variants={reduced ? undefined : mobile ? { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: .42 } } } : sectionMotion}
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, margin: mobile ? '12% 0px' : '4% 0px' }}
    >
      {children}
    </motion.section>
  )
}

function SectionIntro({ eyebrow, title, copy, dark = false }: { eyebrow: string; title: string; copy?: string; dark?: boolean }) {
  return (
    <div className={`section-intro${dark ? ' section-intro--dark' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className="section-lede">{copy}</p>}
    </div>
  )
}

function evidenceLabel(level: EvidenceLevel, lang: Language) {
  const labels: Record<EvidenceLevel, Localized> = {
    established: { fr: 'Bien établi', ar: 'معلومة مثبتة' },
    encouraging: { fr: 'Données encourageantes', ar: 'معطيات مشجعة' },
    limited: { fr: 'Preuves limitées', ar: 'الدليل محدود' },
    myth: { fr: 'Idée reçue', ar: 'فكرة منتشرة' },
  }
  return local(labels[level], lang)
}

function RailNavigation({ railRef, count, lang, label }: {
  railRef: React.RefObject<HTMLDivElement | null>
  count: number
  lang: Language
  label: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const update = () => {
      const children = Array.from(rail.children) as HTMLElement[]
      const railBox = rail.getBoundingClientRect()
      const start = lang === 'ar' ? railBox.right : railBox.left
      let nearest = 0
      let distance = Number.POSITIVE_INFINITY
      children.forEach((child, childIndex) => {
        const box = child.getBoundingClientRect()
        const childStart = lang === 'ar' ? box.right : box.left
        const nextDistance = Math.abs(childStart - start)
        if (nextDistance < distance) {
          distance = nextDistance
          nearest = childIndex
        }
      })
      setIndex(nearest)
    }
    update()
    rail.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      rail.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [lang, railRef])

  const move = (delta: number) => {
    const next = Math.max(0, Math.min(count - 1, index + delta))
    const target = railRef.current?.children[next] as HTMLElement | undefined
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    setIndex(next)
  }

  if (count < 2) return null
  return (
    <div className="rail-navigation" aria-label={label}>
      <div className="rail-controls">
        <button type="button" onClick={() => move(-1)} disabled={index === 0} aria-label={lang === 'fr' ? 'Élément précédent' : 'العنصر السابق'}>
          {lang === 'fr' ? <ArrowLeft /> : <ArrowRight />}
        </button>
        <button type="button" onClick={() => move(1)} disabled={index === count - 1} aria-label={lang === 'fr' ? 'Élément suivant' : 'العنصر التالي'}>
          {lang === 'fr' ? <ArrowRight /> : <ArrowLeft />}
        </button>
      </div>
      <span aria-live="polite">{index + 1} / {count}</span>
      <i><b style={{ width: `${((index + 1) / count) * 100}%` }} /></i>
    </div>
  )
}

function Header({ lang, menuOpen, setMenuOpen, journeyComplete }: { lang: Language; menuOpen: boolean; setMenuOpen: (open: boolean) => void; journeyComplete: boolean }) {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])
  const links = [
    ['#accueil', t('nav.home')],
    ['#personnalisation', lang === 'fr' ? 'Ma peau' : 'بشرتي'],
    ...(journeyComplete ? [
      ['#conseils', t('nav.advice')],
      ['#histoires', t('nav.stories')],
      ['#hanane', lang === 'fr' ? 'Hanane' : 'حنان'],
    ] : []),
  ]
  const changeLanguage = () => {
    i18n.changeLanguage(lang === 'fr' ? 'ar' : 'fr')
    track('language_change', { language_to: lang === 'fr' ? 'ar' : 'fr' })
  }
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav-shell">
        <a className="brand" href="#accueil" aria-label="ECOLYN">
          <img src="./assets/brand/logo.webp" width="232" height="120" alt="ECOLYN" />
          <span>{lang === 'fr' ? 'Comprendre sa peau' : 'فهم البشرة'}</span>
        </a>
        <nav className="desktop-nav" aria-label={lang === 'fr' ? 'Navigation principale' : 'التنقل الرئيسي'}>
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          <a className="pack-link" href={packHref} onClick={() => { track('pack_cta_click', { cta_location: 'desktop_nav' }); track('initiate_checkout', { cta_location: 'desktop_nav' }) }}>{t('nav.pack')} <ArrowUpRight size={14} /></a>
        </nav>
        <div className="nav-actions">
          <button className="language-button" onClick={changeLanguage} aria-label="Changer de langue">
            <Languages size={17} /> <span>{lang === 'fr' ? 'عربي' : 'FR'}</span>
          </button>
          <a className="nav-cta" href="#personnalisation">{t('nav.cta')}</a>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu /></button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu" initial={{ clipPath: 'circle(0% at 90% 4%)' }} animate={{ clipPath: 'circle(150% at 90% 4%)' }} exit={{ clipPath: 'circle(0% at 90% 4%)' }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mobile-menu-top">
              <img src="./assets/brand/logo.webp" alt="ECOLYN" />
              <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu"><X /></button>
            </div>
            <nav>
              {links.map(([href, label], index) => <a key={href} href={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}</a>)}
              <a href="#personnalisation" onClick={() => setMenuOpen(false)}><span>{String(links.length + 1).padStart(2, '0')}</span>{t('nav.ask')}</a>
              <a href={packHref} onClick={() => { track('pack_cta_click', { cta_location: 'mobile_menu' }); track('initiate_checkout', { cta_location: 'mobile_menu' }) }}><span>{String(links.length + 2).padStart(2, '0')}</span>{t('nav.pack')} <ArrowUpRight /></a>
            </nav>
            <button className="mobile-language" onClick={changeLanguage}>{lang === 'fr' ? 'النسخة العربية' : 'Version française'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero({ lang, onConcern }: { lang: Language; onConcern: (id: string) => void }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const mobile = window.matchMedia('(max-width: 820px)').matches
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, .22], [0, reduced || mobile ? 0 : 85])
  return (
    <section className="hero" id="accueil">
      <div className="hero-noise" />
      <motion.div className="hero-orbit hero-orbit--one" animate={reduced ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 36, ease: 'linear' }} />
      <motion.div className="hero-layout">
        <motion.div className="hero-copy" initial={reduced ? undefined : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .85 }}>
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <div className="hero-concern-hook" aria-labelledby="hero-concern-question">
            <h2 id="hero-concern-question">{lang === 'fr' ? 'Qu’est-ce qui vous dérange le plus avec votre peau aujourd’hui ?' : 'شنو أكثر حاجة مقلقاك فبشرتك دابا؟'}</h2>
            <div className="hero-concern-grid">
              {concerns.map(concern => (
                <button type="button" key={concern.id} onClick={() => onConcern(concern.id)}>
                  {local(concern.label, lang)} <ArrowUpRight />
                </button>
              ))}
            </div>
          </div>
          <h1>
            <span>{t('hero.titleA')}</span>
            <em>{t('hero.titleB')}</em>
          </h1>
          <p className="hero-lede">{t('hero.copy')}</p>
          <p className="free-badge"><Sparkles size={16} /> {t('hero.badge')}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#personnalisation" onClick={() => trackOncePerSession('journey_start', { source: 'hero' })}>{t('hero.primary')} <ArrowDown size={17} /></a>
            <a className="button button--ghost" href="#personnalisation">{t('hero.secondary')} <MoveRight size={17} /></a>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck /> {lang === 'fr' ? 'Approche informative' : 'مقاربة توعوية'}</span>
            <span><LockKeyhole /> {lang === 'fr' ? 'Données confidentielles' : 'معلومات خاصة'}</span>
          </div>
        </motion.div>
        <motion.div className="hero-visual" style={{ y }}>
          <div className="image-frame">
            <img
              src={siteConfig.assets.expertHero}
              alt={lang === 'fr' ? 'Conseillère ECOLYN spécialisée en soins et routines du visage' : 'مستشارة إيكولين متخصصة في العناية وروتين بشرة الوجه'}
              width="1200"
              height="1500"
              fetchPriority="high"
              decoding="async"
            />
            <span className="visual-label">{local(siteConfig.expert.role, lang)}</span>
          </div>
          <div className="skin-map" aria-label={lang === 'fr' ? 'Choisir un sujet' : 'اختيار موضوع'}>
            {concerns.slice(0, 8).map((concern, index) => (
              <motion.button
                key={concern.id}
                className={`skin-word skin-word--${index + 1}`}
                onClick={() => onConcern(concern.id)}
                initial={reduced ? undefined : { opacity: 0, scale: .7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: .6 + index * .08 }}
              >
                {local(concern.short, lang)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <a className="scroll-cue" href="#personnalisation"><span>{t('hero.scroll')}</span><ArrowDown /></a>
    </section>
  )
}

function ConcernExplorer({ lang, selected, setSelected, describe }: { lang: Language; selected: string; setSelected: (id: string) => void; describe: (id: string) => void }) {
  const active = concerns.find(c => c.id === selected) || concerns[0]
  return (
    <Reveal className="concern-section" id="besoins">
      <div className="organic-line" />
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Point de départ' : 'نقطة البداية'}
          title={lang === 'fr' ? 'Qu’est-ce qui vous dérange le plus avec votre peau aujourd’hui ?' : 'شنو أكثر حاجة مقلقاك فبشرتك دابا؟'}
          copy={lang === 'fr' ? 'Choisissez votre priorité : vous verrez tout de suite les erreurs fréquentes, une première piste et un cas qui ressemble au vôtre.' : 'اختاري المشكل الرئيسي: غادي تشوفي دابا الأخطاء الشائعة، أول نصيحة وحالة قريبة ليك.'}
        />
        <div className="concern-stage">
          <div className="concern-cloud" role="list">
            {concerns.map((concern, index) => (
              <button
                key={concern.id}
                role="listitem"
                className={`concern-pill concern-pill--${(index % 4) + 1}${selected === concern.id ? ' is-active' : ''}`}
                onClick={() => {
                  setSelected(concern.id)
                  track('select_skin_concern', { selection_source: 'explorer', concern_id: concern.id })
                }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {local(concern.label, lang)}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article className="concern-answer" key={active.id} initial={{ opacity: 0, x: lang === 'ar' ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} transition={{ duration: .35 }}>
              <p className="answer-index">ECOLYN / {local(active.short, lang).toUpperCase()}</p>
              <h3>{local(active.label, lang)}</h3>
              <p>{local(active.summary, lang)}</p>
              <div className="concern-mini-path">
                <div>
                  <b>{lang === 'fr' ? '3 erreurs fréquentes' : '3 أخطاء شائعة'}</b>
                  <ol>{active.mistakes[lang].map(mistake => <li key={mistake}><X size={15} />{mistake}</li>)}</ol>
                </div>
                <div className="concern-quick-tip">
                  <b>{lang === 'fr' ? 'Conseil rapide' : 'نصيحة سريعة'}</b>
                  <p>{local(active.quickTip, lang)}</p>
                </div>
                <div className="concern-case">
                  <b>{lang === 'fr' ? 'Cas concret' : 'حالة واقعية'}</b>
                  <p>{local(active.caseStudy, lang)}</p>
                  <a href="#histoires" onClick={() => track('similar_case_open', { concern_id: active.id })}>{lang === 'fr' ? 'Voir une expérience de la communauté' : 'نشوف تجربة من المجتمع'} <ArrowDown /></a>
                </div>
              </div>
              <div className="answer-actions">
                <button onClick={() => describe(active.id)}>{lang === 'fr' ? 'Ma situation ressemble à ça' : 'حالتي كتشبه لهادي'} <MessageCircle size={16} /></button>
                <a href="#personnalisation" className="text-link" onClick={() => describe(active.id)}>{lang === 'fr' ? 'Recevoir mes conseils personnalisés' : 'نتوصل بالنصائح المناسبة ليا'} <ArrowDown size={15} /></a>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  )
}

function AdviceRail({ lang, openArticle }: { lang: Language; openArticle: (article: Article) => void }) {
  const { t } = useTranslation()
  const railRef = useRef<HTMLDivElement>(null)
  return (
    <Reveal className="advice-section" id="conseils">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Gestes essentiels' : 'خطوات أساسية'}
            title={lang === 'fr' ? 'Commencez par ces gestes simples' : 'بداي بهاد الخطوات البسيطة'}
            copy={lang === 'fr' ? 'Des repères courts à lire maintenant, et des articles complets à ouvrir sans quitter la page.' : 'نقاط قصيرة دابا، ومقالات كاملة كتفتحيها بلا ما تخرجي من الصفحة.'}
          />
          <RailNavigation railRef={railRef} count={quickTips.length} lang={lang} label={lang === 'fr' ? 'Navigation des conseils' : 'التنقل بين النصائح'} />
        </div>
        <div className="advice-rail" ref={railRef}>
          {quickTips.map(({ article, id, symbol }, index) => (
            <motion.article className={`advice-card advice-card--${(index % 3) + 1}`} key={article.slug} whileHover={{ y: -8 }}>
              <div className="advice-card-top"><span>{String(id).padStart(2, '0')}</span><b>{symbol}</b></div>
              <p className="advice-category">{local(article.category, lang)}</p>
              <h3>{local(article.title, lang)}</h3>
              <p>{local(article.summary, lang)}</p>
              <span className={`evidence-badge evidence-badge--${article.evidence}`}>{evidenceLabel(article.evidence, lang)}</span>
              <button onClick={() => openArticle(article)}>{lang === 'fr' ? 'Voir pourquoi' : 'نفهمو علاش'} <ArrowUpRight size={17} /></button>
            </motion.article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

function Cases({ lang, describe }: { lang: Language; describe: (id: string) => void }) {
  const railRef = useRef<HTMLDivElement>(null)
  return (
    <Reveal className="cases-section" id="cas">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Cas pratiques' : 'حالات واقعية'}
            title={lang === 'fr' ? 'Des situations que beaucoup de femmes rencontrent' : 'حالات كيدوزو منها بزاف ديال النساء'}
            copy={lang === 'fr' ? 'Chaque peau peut réagir différemment. Ces cas servent à mieux formuler votre situation, pas à poser un diagnostic.' : 'كل بشرة كتقدر تتفاعل بشكل مختلف. هاد الحالات باش نوضحو الوضع، ماشي باش نديرو تشخيص.'}
            dark
          />
          <div className="mobile-only-navigation">
            <RailNavigation railRef={railRef} count={skinCases.length} lang={lang} label={lang === 'fr' ? 'Navigation des cas pratiques' : 'التنقل بين الحالات'} />
          </div>
        </div>
        <div className="case-timeline" ref={railRef}>
          {skinCases.map((item, index) => (
            <article className="case-row" key={item.id}>
              <div className="case-number">0{index + 1}</div>
              <div className="case-statement"><span>{local(item.category, lang)}</span><h3>« {local(item.statement, lang)} »</h3></div>
              <div className="case-analysis">
                <p><b>{lang === 'fr' ? 'Ce qui peut se jouer' : 'شنو ممكن يكون'}</b>{local(item.possible, lang)}</p>
                <p><b>{lang === 'fr' ? 'Première piste' : 'أول خطوة'}</b>{local(item.guidance, lang)}</p>
              </div>
              <button onClick={() => describe(item.id)}>{lang === 'fr' ? 'Ma situation ressemble à celle-ci' : 'حالتي كتشبه لهادي'} <ArrowDown size={16} /></button>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

function Proofs({ lang }: { lang: Language }) {
  const [position, setPosition] = useState(50)
  const tracked = useRef(false)
  const update = (value: number) => {
    setPosition(value)
    if (!tracked.current) {
      tracked.current = true
      track('before_after_interaction', { interaction_type: 'slider' })
    }
  }
  return (
    <Reveal className="proofs-section" id="preuves">
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Preuves avec intégrité' : 'دلائل بكل وضوح'}
          title={lang === 'fr' ? 'Comparer sans déformer la réalité' : 'مقارنة من دون تشويه الواقع'}
          copy={lang === 'fr' ? 'Même cadrage, même espace, aucun titre médical inventé. Faites glisser pour observer cette expérience individuelle.' : 'الإطار والمكان نفسهما، ومن دون ادعاء طبي. حرّكي المؤشر لمشاهدة هذه التجربة الفردية.'}
        />
        <div className="proof-editorial">
          <div className="before-after" style={{ '--position': `${position}%` } as React.CSSProperties}>
            <img className="before-after__after" src={siteConfig.assets.after} loading="lazy" decoding="async" width="900" height="1125" alt={lang === 'fr' ? 'Photographie après, expérience individuelle' : 'صورة بعد، تجربة فردية'} />
            <div className="before-after__before">
              <img src={siteConfig.assets.before} loading="lazy" decoding="async" width="900" height="1125" alt={lang === 'fr' ? 'Photographie avant, expérience individuelle' : 'صورة قبل، تجربة فردية'} />
            </div>
            <span className="before-after__label before-after__label--before">{lang === 'fr' ? 'Avant' : 'قبل'}</span>
            <span className="before-after__label before-after__label--after">{lang === 'fr' ? 'Après' : 'بعد'}</span>
            <div className="before-after__line"><span><ArrowLeft /><ArrowRight /></span></div>
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={event => update(Number(event.target.value))}
              aria-label={lang === 'fr' ? 'Comparer la photographie avant et après' : 'قارني الصورة قبل وبعد'}
            />
          </div>
          <div className="proof-copy">
            <p className="proof-badge">{lang === 'fr' ? 'EXPÉRIENCE INDIVIDUELLE' : 'تجربة فردية'}</p>
            <h3>{lang === 'fr' ? 'Une comparaison, pas une promesse' : 'مقارنة وليست وعداً'}</h3>
            <p>{lang === 'fr' ? 'Expérience partagée à titre individuel. L’évolution de la peau peut varier selon la personne, les habitudes et la régularité.' : 'تجربة فردية، وقد تختلف النتائج من شخص إلى آخر حسب البشرة والعادات والاستمرارية.'}</p>
            <div className="proof-buttons">
              <button type="button" onClick={() => update(100)}>{lang === 'fr' ? 'Voir avant' : 'عرض قبل'}</button>
              <button type="button" onClick={() => update(0)}>{lang === 'fr' ? 'Voir après' : 'عرض بعد'}</button>
            </div>
            <small><ShieldCheck /> {lang === 'fr' ? 'Les résultats peuvent varier. Ces images ne constituent ni un diagnostic ni une garantie.' : 'قد تختلف النتائج. هذه الصور ليست تشخيصاً ولا ضماناً.'}</small>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function formatAudioTime(value: number) {
  if (!Number.isFinite(value)) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function AudioCard({ item, lang, active, setActive }: {
  item: Testimonial
  lang: Language
  active: boolean
  setActive: (id: number | null) => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const sentMilestones = useRef(new Set<number>())
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(.85)

  useEffect(() => {
    if (!active && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [active])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || error) return
    if (!audio.paused) {
      audio.pause()
      setPlaying(false)
      setActive(null)
      return
    }
    setLoading(true)
    setActive(item.id)
    try {
      await audio.play()
      setPlaying(true)
      setLoading(false)
      track('audio_play', { audio_id: item.id })
    } catch {
      setLoading(false)
      setError(true)
    }
  }

  const updateTime = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrent(audio.currentTime)
    if (!audio.duration) return
    const percent = (audio.currentTime / audio.duration) * 100
    ;[25, 50, 75].forEach(milestone => {
      if (percent >= milestone && !sentMilestones.current.has(milestone)) {
        sentMilestones.current.add(milestone)
        track(`audio_progress_${milestone}`, { audio_id: item.id })
      }
    })
  }

  return (
    <article className="audio-card">
      <img src={item.image} loading="lazy" decoding="async" width="560" height="700" alt={`${item.name} — ${lang === 'fr' ? 'témoignage audio' : 'تجربة صوتية'}`} />
      <div className="audio-card__body">
        <div className="audio-card__identity"><span>{item.name}</span><small>{lang === 'fr' ? 'Témoignage audio' : 'تجربة صوتية'}</small></div>
        <button type="button" className="audio-play" onClick={toggle} aria-label={playing ? (lang === 'fr' ? `Mettre le témoignage de ${item.name} en pause` : `وقفي تجربة ${item.name}`) : (lang === 'fr' ? `Écouter le témoignage de ${item.name}` : `سمعي تجربة ${item.name}`)}>
          {loading ? <i /> : playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </button>
        <audio
          ref={audioRef}
          src={item.audio}
          preload="none"
          onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
          onTimeUpdate={updateTime}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setActive(null)
            track('audio_complete', { audio_id: item.id })
          }}
          onError={() => { setLoading(false); setError(true) }}
        />
        {error ? <p className="audio-error" role="status">{lang === 'fr' ? 'L’audio ne peut pas être chargé pour le moment.' : 'الصوت ما قدرش يتحمل دابا.'}</p> : (
          <>
            <input
              className="audio-progress"
              type="range"
              min="0"
              max={duration || 0}
              step=".1"
              value={Math.min(current, duration || 0)}
              onChange={event => {
                const value = Number(event.target.value)
                if (audioRef.current) audioRef.current.currentTime = value
                setCurrent(value)
              }}
              aria-label={lang === 'fr' ? `Progression du témoignage de ${item.name}` : `تقدم تجربة ${item.name}`}
            />
            <div className="audio-meta">
              <span>{formatAudioTime(current)} / {formatAudioTime(duration)}</span>
              <label><Volume2 /><input type="range" min="0" max="1" step=".05" value={volume} onChange={event => {
                const value = Number(event.target.value)
                setVolume(value)
                if (audioRef.current) audioRef.current.volume = value
              }} aria-label={lang === 'fr' ? `Volume du témoignage de ${item.name}` : `صوت تجربة ${item.name}`} /></label>
            </div>
          </>
        )}
      </div>
    </article>
  )
}

function Experiences({ lang }: { lang: Language }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  return (
    <Reveal className="experiences-section" id="experiences">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Voix & expériences' : 'أصوات وتجارب'}
            title={lang === 'fr' ? 'Écoutez leurs expériences' : 'سمعي تجاربهم'}
            copy={lang === 'fr' ? 'Six témoignages à lancer uniquement quand vous le souhaitez. Un seul audio joue à la fois.' : 'ست تجارب صوتية كتسمعيهم غير ملي بغيتي. كيتشغل غير صوت واحد فكل مرة.'}
          />
          <RailNavigation railRef={railRef} count={testimonials.length} lang={lang} label={lang === 'fr' ? 'Navigation des témoignages audio' : 'التنقل بين التجارب الصوتية'} />
        </div>
        <div className="audio-rail" ref={railRef}>
          {testimonials.map(item => <AudioCard item={item} lang={lang} active={active === item.id} setActive={setActive} key={item.id} />)}
        </div>
      </div>
    </Reveal>
  )
}

function Expert({ lang }: { lang: Language }) {
  return (
    <Reveal className="expert-section" id="experte">
      <div className="expert-backdrop">
        <div className="expert-portrait">
          <img src={siteConfig.assets.expertProfile} loading="lazy" decoding="async" width="1200" height="1500" alt={lang === 'fr' ? 'Conseillère ECOLYN spécialisée en soins et routines du visage' : 'مستشارة إيكولين متخصصة في العناية وروتين بشرة الوجه'} />
          <small>{local(siteConfig.expert.role, lang)}</small>
        </div>
        <div className="expert-copy">
          <p className="eyebrow">{lang === 'fr' ? 'Une présence humaine' : 'مواكبة إنسانية'}</p>
          <h2>{local(siteConfig.expert.role, lang)}</h2>
          <p>{lang === 'fr' ? 'Son approche part des informations que vous partagez : votre confort, vos habitudes, vos réactions et votre objectif. Elle simplifie avant d’ajouter et oriente vers un dermatologue lorsque la situation le nécessite.' : 'المقاربة كتبدا من المعلومات اللي كتعطي: الراحة، العادات، التفاعلات والهدف. كتبسط قبل ما تزيد، وكتوجه لطبيب الجلد ملي الحالة كتحتاج.'}</p>
          <ul>
            {(lang === 'fr'
              ? ['Écouter avant de conseiller', 'Simplifier les routines', 'Éviter les promesses irréalistes', 'Adapter les recommandations', 'Orienter quand c’est nécessaire']
              : ['الاستماع قبل النصيحة', 'تبسيط الروتين', 'بلا وعود غير واقعية', 'تكييف النصائح', 'التوجيه وقت الحاجة']
            ).map(item => <li key={item}><Check />{item}</li>)}
          </ul>
          <a href="#form-fields" className="button button--light">{lang === 'fr' ? 'Poser ma question à l’experte' : 'نسول الخبيرة'} <MessageCircle /></a>
        </div>
      </div>
    </Reveal>
  )
}

function Library({ lang, openArticle }: { lang: Language; openArticle: (article: Article) => void }) {
  const [category, setCategory] = useState('all')
  const railRef = useRef<HTMLDivElement>(null)
  const categories = [
    { key: 'all', label: lang === 'fr' ? 'Tout' : 'الكل' },
    ...Array.from(new Map(articles.map(article => [article.category.fr, { key: article.category.fr, label: local(article.category, lang) }])).values()),
  ]
  const visible = category === 'all' ? articles : articles.filter(article => article.category.fr === category)
  return (
    <Reveal className="library-section" id="bibliotheque">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Mini-bibliothèque' : 'مكتبة صغيرة'}
            title={lang === 'fr' ? 'Lire, comprendre, puis choisir' : 'قراي، فهمي، ومن بعد اختاري'}
            copy={lang === 'fr' ? 'Des contenus structurés, conçus pour être utiles sans dramatiser ni promettre l’impossible.' : 'محتوى منظم ومفيد، بلا تهويل وبلا وعود مستحيلة.'}
          />
          <div className="mobile-only-navigation">
            <RailNavigation railRef={railRef} count={visible.length} lang={lang} label={lang === 'fr' ? 'Navigation de la bibliothèque' : 'التنقل في المكتبة'} />
          </div>
        </div>
        <div className="category-tabs" role="tablist">
          {categories.map(item => <button role="tab" aria-selected={category === item.key} className={category === item.key ? 'is-active' : ''} key={item.key} onClick={() => setCategory(item.key)}>{item.label}</button>)}
        </div>
        <motion.div className="article-grid" layout ref={railRef}>
          <AnimatePresence mode="popLayout">
            {visible.map((article, index) => (
              <motion.article className={`article-teaser article-teaser--${index % 4}`} layout key={article.slug} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
                <div className="article-visual"><span>{local(article.category, lang).slice(0, 2).toUpperCase()}</span><div /></div>
                <p className="article-meta">{local(article.category, lang)} <i /> {article.time} {lang === 'fr' ? 'min' : 'دقائق'}</p>
                <h3>{local(article.title, lang)}</h3>
                <p>{local(article.summary, lang)}</p>
                <span className={`evidence-badge evidence-badge--${article.evidence}`}>{evidenceLabel(article.evidence, lang)}</span>
                <button onClick={() => openArticle(article)}>{lang === 'fr' ? 'Comprendre en profondeur' : 'نفهمو بالتفصيل'} <ArrowUpRight /></button>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </Reveal>
  )
}

function Nutrition({ lang }: { lang: Language }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState('')
  return (
    <Reveal className="nutrition-section" id="nutrition">
      <div className="section-wrap">
        <div className="nutrition-heading">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Nutrition & peau' : 'التغذية والبشرة'}
            title={lang === 'fr' ? 'Ce que votre assiette peut — et ne peut pas — faire pour votre peau' : 'شنو يقدر يدير الماكلة لبشرتك… وشنو ما تقدرش تدير'}
            copy={lang === 'fr' ? 'L’alimentation peut soutenir le fonctionnement normal de la peau, mais elle ne remplace ni une routine adaptée, ni la protection solaire, ni l’avis d’un professionnel lorsque le problème persiste.' : 'التغذية المتوازنة تقدر تعاون وظائف البشرة الطبيعية، ولكن ما كتبدلش روتين مناسب، ولا الحماية من الشمس، ولا رأي الطبيب إلا كان المشكل مستمر.'}
          />
          <div className="simple-plate" aria-label={lang === 'fr' ? 'Exemple d’une assiette simple et équilibrée' : 'مثال ديال طبسيل بسيط ومتوازن'}>
            <span className="simple-plate__veg">{lang === 'fr' ? 'Légumes colorés' : 'خضر ملونة'}</span>
            <span className="simple-plate__protein">{lang === 'fr' ? 'Protéines' : 'بروتين'}</span>
            <span className="simple-plate__starch">{lang === 'fr' ? 'Féculent' : 'نشويات'}</span>
            <span className="simple-plate__fat">{lang === 'fr' ? 'Un peu de bon gras' : 'شوية دهون مزيانة'}</span>
            <i><Droplets /> {lang === 'fr' ? 'Eau selon les besoins' : 'الماء حسب الحاجة'}</i>
          </div>
        </div>
        <div className="nutrition-toolbar">
          <p><Utensils /> {lang === 'fr' ? 'Huit chapitres, sans menu miracle ni interdictions générales.' : 'ثمانية فصول، بلا منيو سحري وبلا ممنوعات عامة.'}</p>
          <RailNavigation railRef={railRef} count={nutritionChapters.length} lang={lang} label={lang === 'fr' ? 'Navigation des chapitres nutrition' : 'التنقل بين فصول التغذية'} />
        </div>
        <div className="nutrition-rail" ref={railRef}>
          {nutritionChapters.map((chapter, index) => {
            const expanded = open === chapter.id
            return (
              <article className={`nutrition-card${expanded ? ' is-open' : ''}`} key={chapter.id}>
                <div className="nutrition-card__top"><span>{String(index + 1).padStart(2, '0')}</span><b className={`evidence-badge evidence-badge--${chapter.evidence}`}>{evidenceLabel(chapter.evidence, lang)}</b></div>
                <h3>{local(chapter.title, lang)}</h3>
                <p className="nutrition-fact">{local(chapter.fact, lang)}</p>
                <button type="button" aria-expanded={expanded} onClick={() => {
                  setOpen(expanded ? '' : chapter.id)
                  if (!expanded) track('nutrition_content_open', { nutrition_chapter: chapter.id })
                }}>{expanded ? (lang === 'fr' ? 'Réduire' : 'نقص التفاصيل') : (lang === 'fr' ? 'Comprendre en profondeur' : 'نفهمو بالتفصيل')} <ChevronDown /></button>
                {expanded && (
                  <div className="nutrition-details">
                    <dl>
                      <div><dt>{lang === 'fr' ? 'Comment ça fonctionne' : 'كيفاش كيخدم'}</dt><dd>{local(chapter.mechanism, lang)}</dd></div>
                      <div><dt>{lang === 'fr' ? 'Exemples accessibles' : 'أمثلة موجودة'}</dt><dd>{local(chapter.foods, lang)}</dd></div>
                      <div><dt>{lang === 'fr' ? 'Ce que nous savons' : 'شنو عارفين'}</dt><dd>{local(chapter.known, lang)}</dd></div>
                      <div><dt>{lang === 'fr' ? 'Ce qui reste incertain' : 'شنو باقي ما واضحش'}</dt><dd>{local(chapter.uncertain, lang)}</dd></div>
                      <div><dt>{lang === 'fr' ? 'Sans excès' : 'بلا إفراط'}</dt><dd>{local(chapter.apply, lang)}</dd></div>
                    </dl>
                    <p className="nutrition-myth"><X /> {local(chapter.myth, lang)}</p>
                    <div className="source-links">{chapter.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight /></a>)}</div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
        <p className="nutrition-disclaimer"><ShieldCheck /> {lang === 'fr' ? 'Ces informations sont éducatives. En cas d’allergie, de grossesse, de traitement, de maladie chronique ou de changement alimentaire important, demandez l’avis d’un professionnel qualifié.' : 'هاد المعلومات للتوعية فقط. إلا كانت عندك حساسية، حمل، مرض مزمن، علاج معين، أو بغيتي تديري تغيير كبير فالتغذية ديالك، استاشري مع مختص مؤهل.'}</p>
      </div>
    </Reveal>
  )
}

function HowItWorks({ lang }: { lang: Language }) {
  const steps = lang === 'fr'
    ? [
        ['01', 'Expliquez-nous votre situation', 'Vos habitudes, votre besoin et votre objectif principal.'],
        ['02', 'Notre experte examine vos informations', 'Une lecture informative, sans diagnostic médical.'],
        ['03', 'Recevez des conseils sur WhatsApp', 'Des recommandations de routine adaptées aux éléments fournis.'],
        ['+', 'Continuez avec la communauté', 'Conseils, lives et nouveaux contenus si vous le souhaitez.']
      ]
    : [
        ['01', 'شرحي لينا الحالة ديالك', 'العادات، الحاجة والهدف الرئيسي ديالك.'],
        ['02', 'الخبيرة كتشوف المعلومات', 'قراءة توعوية بلا تشخيص طبي.'],
        ['03', 'توصلي بالنصائح فواتساب', 'نصائح للروتين مناسبة للمعلومات اللي عطيتينا.'],
        ['+', 'كملي مع المجموعة', 'نصائح، لايفات ومحتوى جديد إلا بغيتي.']
      ]
  return (
    <Reveal className="how-section">
      <div className="section-wrap">
        <SectionIntro eyebrow={lang === 'fr' ? 'Simple & transparent' : 'بسيط وواضح'} title={lang === 'fr' ? 'Recevez vos conseils en trois étapes' : 'توصلي بالنصائح فثلاث مراحل'} />
        <div className="steps-path">
          {steps.map(([number, title, copy], index) => (
            <article key={number} className={index === 3 ? 'is-optional' : ''}>
              <span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div>
            </article>
          ))}
        </div>
        <div className="service-notes">
          <span><Sparkles /> {lang === 'fr' ? 'Gratuit' : 'مجاني'}</span>
          <span><HeartHandshake /> {lang === 'fr' ? 'Sans obligation d’achat' : 'بلا إجبار على الشراء'}</span>
          <span><Clock3 /> {lang === 'ar' ? (window.ECOLYN_CONFIG?.responseDelayAr || 'الجواب في أقرب وقت ممكن') : (window.ECOLYN_CONFIG?.responseDelay || 'Réponse dès que possible')}</span>
          <span><LockKeyhole /> {lang === 'fr' ? 'Confidentiel' : 'خاص'}</span>
        </div>
      </div>
    </Reveal>
  )
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`field${wide ? ' field--wide' : ''}`}><span>{label}</span>{children}</label>
}

function LeadForm({ lang, concern, setConcern }: { lang: Language; concern: string; setConcern: (value: string) => void }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<LeadResult | null>(null)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const total = 5
  const labels = lang === 'fr' ? ['Votre peau', 'Votre besoin', 'Votre routine', 'Expliquez-nous', 'Contact'] : ['بشرتك', 'الحاجة ديالك', 'الروتين ديالك', 'شرحي لينا', 'التواصل']

  useEffect(() => {
    const section = document.getElementById('formulaire')
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('form-in-view', entry.isIntersecting)
    }, { threshold: .08 })
    observer.observe(section)
    return () => {
      observer.disconnect()
      document.body.classList.remove('form-in-view')
    }
  }, [])

  const goToStep = (nextStep: number) => {
    setStep(Math.max(0, Math.min(total - 1, nextStep)))
    if (window.matchMedia('(max-width: 820px)').matches) {
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  const begin = () => {
    if (!started) {
      setStarted(true)
      track('form_start', { source: 'inline_form' })
    }
  }
  const validateCurrent = () => {
    const current = formRef.current?.querySelector(`[data-form-step="${step}"]`)
    const fields = Array.from(current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea') || [])
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity()
        return false
      }
    }
    return true
  }
  const next = () => {
    begin()
    if (!validateCurrent()) return
    track('form_step_complete', { form_step: step + 1, form_step_name: labels[step] })
    goToStep(step + 1)
  }
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateCurrent() || !formRef.current) return
    setSending(true)
    setError('')
    try {
      const nextResult = await submitLead(formRef.current)
      const marketingConsent = new FormData(formRef.current).get('marketingConsent') === 'yes'
      track('form_submit', { submission_mode: nextResult.mode })
      track('generate_lead', { submission_mode: nextResult.mode }, {
        metaCapi: marketingConsent && (nextResult.mode === 'supabase' || nextResult.mode === 'endpoint'),
        metaCapiReference: nextResult.reference,
      })
      if (nextResult.mode === 'supabase' || nextResult.mode === 'endpoint') {
        sessionStorage.setItem('ecolyn-last-lead', JSON.stringify({
          reference: nextResult.reference,
          whatsappUrl: nextResult.whatsappUrl,
        }))
        navigate('thank-you', { ref: nextResult.reference })
      } else {
        setResult(nextResult)
      }
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : ''
      setError(
        code === 'PHOTO_TOO_LARGE'
          ? (lang === 'fr' ? 'La photo est trop lourde après compression. Choisissez une image plus légère.' : 'الصورة كبيرة بزاف. اختاري صورة أخف.')
          : code === 'PHOTO_CONSENT_REQUIRED'
            ? (lang === 'fr' ? 'Cochez le consentement photo pour joindre cette image.' : 'وافقي على استعمال الصورة باش تزيديها.')
            : (lang === 'fr' ? 'L’envoi sécurisé n’a pas abouti. Réessayez ou utilisez WhatsApp.' : 'الإرسال الآمن ما كملش. عاودي أو استعملي واتساب.'),
      )
    } finally {
      setSending(false)
    }
  }

  if (result) {
    const groupUrl = window.ECOLYN_CONFIG?.whatsappGroupUrl
    return (
      <Reveal className="form-section form-section--success" id="formulaire">
        <div className="success-orbit"><Check /></div>
        <p className="eyebrow">{lang === 'fr' ? 'Demande reçue' : 'توصلنا بالطلب'}</p>
        <h2>{t('form.successTitle')}</h2>
        <p>{t('form.successCopy')}</p>
        <span className="reference">{result.reference}</span>
        <div className="success-actions">
          <a className="button button--primary" href={result.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'lead_success' })}>{t('form.whatsapp')} <MessageCircle /></a>
          {groupUrl && <a className="button button--ghost" href={groupUrl} target="_blank" rel="noreferrer" onClick={() => track('join_whatsapp_group', { source: 'lead_success' })}>{t('form.group')} <ArrowUpRight /></a>}
        </div>
        {!groupUrl && <small>{lang === 'fr' ? 'Le lien du groupe apparaîtra ici une fois configuré — jamais avant la soumission.' : 'رابط المجموعة غيبان هنا من بعد ما يتضبط — وعمره يبان قبل الإرسال.'}</small>}
      </Reveal>
    )
  }

  return (
    <Reveal className="form-section" id="formulaire">
      <div className="form-shell">
        <div className="form-aside">
          <p className="eyebrow">{t('form.eyebrow')}</p>
          <h2>{t('form.title')}</h2>
          <p>{t('form.copy')}</p>
          <div className="form-progress" aria-label={`${step + 1}/${total}`}>
            <span><b>{String(step + 1).padStart(2, '0')}</b> / 05</span>
            <div><i style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
          </div>
          <ol>{labels.map((label, index) => <li key={label} className={index === step ? 'is-active' : index < step ? 'is-done' : ''}><span>{index < step ? <Check /> : index + 1}</span>{label}</li>)}</ol>
          <p className="medical-note">{lang === 'fr' ? 'Les conseils proposés sont informatifs et ne remplacent pas l’avis d’un dermatologue en cas de problème sévère, inhabituel ou persistant.' : 'هذه النصائح توعوية ولا تعوض استشارة طبيب الجلد في حالة وجود مشكلة قوية، غير عادية أو مستمرة.'}</p>
        </div>
        <form ref={formRef} onSubmit={onSubmit} onFocus={begin} className="lead-form">
          {Array.from({ length: total }, (_, formStep) => (
            <motion.div
              key={formStep}
              className="form-step"
              data-form-step={formStep}
              hidden={formStep !== step}
              aria-hidden={formStep !== step}
              initial={false}
              animate={{ opacity: formStep === step ? 1 : 0, x: formStep === step ? 0 : (lang === 'ar' ? -18 : 18) }}
              transition={{ duration: .3 }}
            >
              <div className="form-step-heading"><span>0{formStep + 1}</span><div><p>{lang === 'fr' ? 'Étape' : 'المرحلة'}</p><h3>{labels[formStep]}</h3></div></div>
              {formStep === 0 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Type de peau' : 'نوع البشرة'}><select name="skinType" required defaultValue=""><option value="" disabled>{lang === 'fr' ? 'Sélectionner' : 'اختاري'}</option><option value="normal">{lang === 'fr' ? 'Normale' : 'عادية'}</option><option value="dry">{lang === 'fr' ? 'Sèche' : 'جافة'}</option><option value="oily">{lang === 'fr' ? 'Grasse' : 'دهنية'}</option><option value="combination">{lang === 'fr' ? 'Mixte' : 'مختلطة'}</option><option value="sensitive">{lang === 'fr' ? 'Sensible' : 'حساسة'}</option><option value="unknown">{lang === 'fr' ? 'Je ne sais pas' : 'ما عارفاش'}</option></select></Field>
                <Field label={lang === 'fr' ? 'Âge approximatif' : 'العمر التقريبي'}><select name="ageRange" required defaultValue=""><option value="" disabled>—</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></Field>
                <Field label={lang === 'fr' ? 'Ville' : 'المدينة'}><input name="city" required autoComplete="address-level2" /></Field>
                <Field label={lang === 'fr' ? 'Depuis combien de temps ?' : 'من شحال هاد المشكل؟'}><select name="duration" required defaultValue=""><option value="" disabled>—</option><option value="under-1-month">{lang === 'fr' ? 'Moins d’un mois' : 'أقل من شهر'}</option><option value="1-6-months">{lang === 'fr' ? '1–6 mois' : 'من شهر حتى 6 شهور'}</option><option value="6-12-months">{lang === 'fr' ? '6–12 mois' : 'من 6 حتى 12 شهر'}</option><option value="over-1-year">{lang === 'fr' ? 'Plus d’un an' : 'أكثر من عام'}</option></select></Field>
              </div>}
              {formStep === 1 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Problème principal' : 'المشكل الرئيسي'} wide><select name="primaryConcern" value={concern} onChange={e => setConcern(e.target.value)} required>{concerns.map(item => <option value={item.id} key={item.id}>{local(item.label, lang)}</option>)}</select></Field>
                <Field label={lang === 'fr' ? 'Problèmes secondaires' : 'مشاكل أخرى'}><input name="secondaryConcerns" placeholder={lang === 'fr' ? 'Optionnel' : 'اختياري'} /></Field>
                <Field label={lang === 'fr' ? 'Zone concernée' : 'المنطقة'}><select name="area" defaultValue=""><option value="">—</option><option value="whole-face">{lang === 'fr' ? 'Visage entier' : 'الوجه كامل'}</option><option value="cheeks">{lang === 'fr' ? 'Joues' : 'الخدود'}</option><option value="forehead">{lang === 'fr' ? 'Front' : 'الجبهة'}</option><option value="chin">{lang === 'fr' ? 'Menton' : 'الذقن'}</option><option value="eye-area">{lang === 'fr' ? 'Contour des yeux' : 'محيط العينين'}</option></select></Field>
                <Field label={lang === 'fr' ? 'Niveau de gêne' : 'مستوى الإزعاج'}><input name="discomfort" type="range" min="1" max="5" defaultValue="3" aria-label={lang === 'fr' ? 'Niveau de gêne' : 'مستوى الإزعاج'} /></Field>
                <Field label={lang === 'fr' ? 'Objectif principal' : 'الهدف الرئيسي'}><input name="goal" required /></Field>
              </div>}
              {formStep === 2 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Produits utilisés' : 'المنتجات المستعملة'} wide><textarea name="products" rows={3} placeholder={lang === 'fr' ? 'Nettoyant, sérum, crème…' : 'منظف، سيروم، كريم…'} /></Field>
                <Field label={lang === 'fr' ? 'Fréquence de nettoyage' : 'مرات التنظيف'}><select name="cleansing" defaultValue=""><option value="">—</option><option value="once">{lang === 'fr' ? 'Une fois' : 'مرة وحدة'}</option><option value="twice">{lang === 'fr' ? 'Deux fois' : 'جوج مرات'}</option><option value="more">{lang === 'fr' ? 'Plus de deux fois' : 'أكثر من جوج مرات'}</option></select></Field>
                <Field label={lang === 'fr' ? 'Utilisez-vous un SPF ?' : 'كتستعملي SPF؟'}><select name="spf" required defaultValue=""><option value="" disabled>—</option><option value="daily">{lang === 'fr' ? 'Tous les jours' : 'كل نهار'}</option><option value="sometimes">{lang === 'fr' ? 'Parfois' : 'مرات'}</option><option value="never">{lang === 'fr' ? 'Jamais' : 'أبداً'}</option></select></Field>
                <Field label={lang === 'fr' ? 'Nouveau produit récent' : 'منتج جديد مؤخراً'}><input name="newProducts" /></Field>
                <Field label={lang === 'fr' ? 'Réactions connues' : 'تفاعلات معروفة'}><input name="reactions" /></Field>
              </div>}
              {formStep === 3 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Expliquez avec vos mots' : 'شرحي بكلامك'} wide><textarea name="description" rows={6} required placeholder={lang === 'fr' ? 'Ce que vous observez, ce qui vous gêne, ce que vous avez déjà essayé…' : 'شنو كتشوفي، شنو كيقلقك، وشنو جربتي…'} /></Field>
                <Field label={lang === 'fr' ? 'Photo facultative' : 'صورة اختيارية'} wide><span className="file-input"><Upload /><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><b>{lang === 'fr' ? 'JPG, PNG ou WebP • 8 Mo max' : 'JPG, PNG أو WebP • حتى 8MB'}</b></span></Field>
                <label className="check-field field--wide"><input type="checkbox" name="photoConsent" value="yes" /><span>{lang === 'fr' ? 'Si j’ajoute une photo, j’autorise son utilisation uniquement pour examiner cette demande. Aucune publication ou publicité sans autorisation séparée.' : 'إلا زدت صورة، كنوافق تستعمل غير لهاد الطلب. ما كاين لا نشر لا إشهار بلا موافقة أخرى.'}</span></label>
              </div>}
              {formStep === 4 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Prénom' : 'الاسم'}><input name="firstName" required autoComplete="given-name" /></Field>
                <Field label={lang === 'fr' ? 'Numéro WhatsApp' : 'رقم واتساب'}><input name="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" /></Field>
                <Field label={lang === 'fr' ? 'Email facultatif' : 'الإيميل اختياري'} wide><input name="email" type="email" autoComplete="email" /></Field>
                <input type="hidden" name="contactConsent" value="yes" />
                <p className="contact-consent-note field--wide">{lang === 'fr' ? 'En envoyant ce formulaire, vous acceptez d’être contactée par notre experte au sujet de votre demande.' : 'بإرسال هاد الاستمارة، كتوافقي تتواصل معاك الخبيرة ديالنا بخصوص الطلب ديالك.'}</p>
                <label className="check-field field--wide"><input type="checkbox" name="marketingConsent" value="yes" defaultChecked /><span>{lang === 'fr' ? 'J’autorise ECOLYN à transmettre à Meta, de façon sécurisée, les informations nécessaires pour mesurer si cette demande provient d’une publicité. Vous pouvez décocher cette autorisation.' : 'كنسمح لإيكولين ترسل لميتا بشكل آمن المعلومات الضرورية باش تقيس واش هاد الطلب جا من إشهار. تقدري تحيدي هاد الموافقة.'}</span></label>
              </div>}
            </motion.div>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-navigation">
            <button type="button" className="button button--back" onClick={() => goToStep(step - 1)} disabled={step === 0}>{t('form.back')}</button>
            {step < total - 1
              ? <button type="button" className="button button--primary" onClick={next}>{t('form.next')} {lang === 'fr' ? <ArrowRight /> : <ArrowLeft />}</button>
              : <button type="submit" className="button button--primary" disabled={sending}>{sending ? (lang === 'fr' ? 'Envoi…' : 'الإرسال…') : t('form.submit')} <ArrowUpRight /></button>}
          </div>
        </form>
      </div>
    </Reveal>
  )
}

function SimpleLeadForm({ lang, concerns: selectedConcerns, profiles, contexts, onModifyChoices }: {
  lang: Language
  concerns: string[]
  profiles: SkinProfileId[]
  contexts: LifestyleId[]
  onModifyChoices: () => void
}) {
  const { t } = useTranslation()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<LeadResult | null>(null)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const summaryChoices = [
    profiles[0] ? local(skinProfiles.find(item => item.id === profiles[0])?.label || { fr: profiles[0], ar: profiles[0] }, lang) : '',
    selectedConcerns[0] ? local(concernOptions.find(item => item.id === selectedConcerns[0])?.label || { fr: selectedConcerns[0], ar: selectedConcerns[0] }, lang) : '',
    contexts[0] ? local(lifestyleTopics.find(item => item.id === contexts[0])?.label || { fr: contexts[0], ar: contexts[0] }, lang) : '',
  ].filter(Boolean)

  useEffect(() => {
    const section = document.getElementById('formulaire')
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('form-in-view', entry.isIntersecting)
    }, { threshold: .08 })
    observer.observe(section)
    return () => {
      observer.disconnect()
      document.body.classList.remove('form-in-view')
    }
  }, [])

  useEffect(() => {
    const fields = document.getElementById('form-fields')
    if (!fields) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      trackOncePerSession('form_view', { source: 'short_form' })
      observer.disconnect()
    }, { threshold: .08, rootMargin: '0px 0px -18% 0px' })
    observer.observe(fields)
    return () => observer.disconnect()
  }, [])

  const begin = (event: React.SyntheticEvent<HTMLFormElement>) => {
    const target = event.target as HTMLElement
    if (!target.matches('input:not([type="hidden"]), textarea, select')) return
    trackOncePerSession('form_start', { source: 'short_form' })
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formRef.current || !formRef.current.reportValidity()) return
    setSending(true)
    setError('')
    try {
      const nextResult = await submitLead(formRef.current)
      const marketingConsent = new FormData(formRef.current).get('marketingConsent') === 'yes'
      if (nextResult.mode === 'supabase' || nextResult.mode === 'endpoint') {
        track('form_submit', { submission_mode: nextResult.mode })
        track('generate_lead', { submission_mode: nextResult.mode }, {
          metaCapi: marketingConsent && nextResult.mode === 'supabase',
          metaCapiReference: nextResult.reference,
        })
        sessionStorage.setItem('ecolyn-last-lead', JSON.stringify({
          reference: nextResult.reference,
          whatsappUrl: nextResult.whatsappUrl,
        }))
        navigate('thank-you', { ref: nextResult.reference })
      } else {
        setResult(nextResult)
      }
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : ''
      setError(code === 'PHOTO_TOO_LARGE'
        ? (lang === 'fr' ? 'La photo est trop lourde. Choisissez une image plus légère.' : 'حجم الصورة كبير جداً. اختاري صورة أصغر.')
        : code === 'PHOTO_CONSENT_REQUIRED'
          ? (lang === 'fr' ? 'Cochez l’autorisation photo pour joindre cette image.' : 'وافقي على استخدام الصورة حتى تتمكني من إرفاقها.')
          : (lang === 'fr' ? 'L’envoi sécurisé n’a pas abouti. Vérifiez votre connexion puis réessayez.' : 'لم يكتمل الإرسال الآمن. تحققي من اتصالك ثم حاولي مجدداً.'))
    } finally {
      setSending(false)
    }
  }

  if (result) {
    return (
      <Reveal className="form-section form-section--success" id="formulaire">
        <div className="success-orbit"><Check /></div>
        <p className="eyebrow">{lang === 'fr' ? 'Demande prête' : 'الطلب جاهز'}</p>
        <h2>{t('form.successTitle')}</h2>
        <p>{lang === 'fr' ? 'Ouvrez WhatsApp pour nous transmettre votre demande.' : 'افتحي WhatsApp لإرسال طلبك إلينا.'}</p>
        <a className="button button--primary" href={result.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'lead_fallback' })}>{t('form.whatsapp')} <MessageCircle /></a>
      </Reveal>
    )
  }

  return (
    <Reveal className="form-section form-section--short" id="formulaire">
      <div className="form-trust">
        <img src={siteConfig.assets.expertProfile} alt="Hanane — ECOLYN" width="160" height="160" loading="lazy" />
        <div><p>{lang === 'fr' ? 'Votre demande sera examinée par Hanane' : 'ستراجع حنان طلبك'}</p><span>{lang === 'fr' ? 'Elle vous aide à clarifier votre routine et vos priorités, sans poser de diagnostic médical.' : 'تساعدك على توضيح روتينك وأولويات العناية ببشرتك، من دون تشخيص طبي.'}</span></div>
        <ul><li><Check /> {lang === 'fr' ? 'Conseils gratuits' : 'نصائح مجانية'}</li><li><Check /> {lang === 'fr' ? 'Sans obligation d’achat' : 'من دون إلزام بالشراء'}</li><li><MessageCircle /> {lang === 'fr' ? 'Contact via WhatsApp' : 'تواصل عبر WhatsApp'}</li></ul>
      </div>
      <div className="form-shell">
        <div className="form-aside">
          <p className="eyebrow">{t('form.eyebrow')}</p>
          <h2>{lang === 'fr' ? 'Vous voulez des conseils plus personnalisés ?' : 'هل تريدين نصائح أكثر تخصيصاً؟'}</h2>
          <p>{lang === 'fr' ? 'Expliquez brièvement votre situation à Hanane. Vos trois choix sont déjà repris pour ne pas vous demander deux fois la même chose.' : 'اشرحي حالتك لحنان باختصار. اختياراتك الثلاثة موجودة مسبقاً حتى لا نطلب منك المعلومات نفسها مرتين.'}</p>
          <div className="short-form-benefits">
            <span><Check /> {lang === 'fr' ? 'Moins de 2 minutes' : 'أقل من دقيقتين'}</span>
            <span><Sparkles /> {lang === 'fr' ? 'Vos choix déjà préremplis' : 'اختياراتك معبأة مسبقاً'}</span>
            <span><LockKeyhole /> {lang === 'fr' ? 'Informations confidentielles' : 'معلوماتك خاصة'}</span>
            <span><MessageCircle /> {lang === 'fr' ? 'Contact sur WhatsApp' : 'تواصل عبر WhatsApp'}</span>
          </div>
          <p className="medical-note">{lang === 'fr' ? 'Ces conseils sont informatifs. Une situation sévère, inhabituelle ou persistante doit être présentée à un dermatologue.' : 'هذه النصائح تثقيفية. يجب عرض أي حالة شديدة أو غير معتادة أو مستمرة على طبيب جلد.'}</p>
        </div>
        <form ref={formRef} onSubmit={onSubmit} onFocusCapture={begin} onInputCapture={begin} onChangeCapture={begin} className="lead-form lead-form--short">
          <div className="form-step-heading"><span>01</span><div><p>{lang === 'fr' ? 'Votre demande' : 'طلبك'}</p><h3>{lang === 'fr' ? 'Parlez-nous brièvement de votre peau' : 'حدّثينا باختصار عن بشرتك'}</h3></div></div>
          <div className="form-choice-summary">
            <div><p>{lang === 'fr' ? 'Nous avons retenu :' : 'اختياراتك:'}</p><span>{summaryChoices.map(choice => <b key={choice}><Check /> {choice}</b>)}</span></div>
            <button type="button" onClick={onModifyChoices}>{lang === 'fr' ? 'Modifier mes choix' : 'تعديل اختياراتي'}</button>
          </div>
          <div className="form-grid short-form-grid" id="form-fields">
            <Field label={lang === 'fr' ? 'Prénom' : 'الاسم'}><input name="firstName" required autoComplete="given-name" /></Field>
            <Field label={lang === 'fr' ? 'Numéro WhatsApp' : 'رقم واتساب'}><input name="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" pattern="[+0-9 ()-]{9,20}" /></Field>
            <input type="hidden" name="primaryConcern" value={selectedConcerns[0] || ''} />
            <input type="hidden" name="skinType" value={profiles[0] || ''} />
            <input type="hidden" name="lifestyleContext" value={contexts[0] || ''} />
            <input type="hidden" name="selectedConcernsJson" value={JSON.stringify(selectedConcerns)} />
            <input type="hidden" name="selectedSkinProfilesJson" value={JSON.stringify(profiles)} />
            <input type="hidden" name="selectedContextsJson" value={JSON.stringify(contexts)} />
            <Field label={lang === 'fr' ? 'Expliquez-nous brièvement ce qui vous dérange avec votre peau.' : 'اشرحي لنا باختصار ما الذي يزعجك في بشرتك.'} wide><textarea name="description" rows={4} required minLength={10} maxLength={1200} placeholder={lang === 'fr' ? 'Exemple : mes traces restent visibles et ma peau réagit facilement…' : 'مثال: تبقى آثار الحبوب ظاهرة وتتفاعل بشرتي بسهولة…'} /></Field>
            <Field label={lang === 'fr' ? 'Email facultatif' : 'الإيميل اختياري'} wide><input name="email" type="email" autoComplete="email" /></Field>
            <details className="optional-photo field--wide">
              <summary><Upload /> {lang === 'fr' ? 'Ajouter une photo (facultatif)' : 'إضافة صورة (اختياري)'}</summary>
              <span className="file-input"><Upload /><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><b>{lang === 'fr' ? 'JPG, PNG ou WebP • 8 Mo max' : 'JPG, PNG أو WebP • حتى 8MB'}</b></span>
              <label className="check-field"><input type="checkbox" name="photoConsent" value="yes" /><span>{lang === 'fr' ? 'J’autorise l’utilisation de cette photo uniquement pour examiner ma demande.' : 'أوافق على استخدام هذه الصورة فقط لمراجعة طلبي.'}</span></label>
            </details>
            <input type="hidden" name="contactConsent" value="yes" />
            <p className="contact-consent-note field--wide">{lang === 'fr' ? 'En envoyant ce formulaire, vous acceptez d’être contactée par notre experte au sujet de votre demande.' : 'بإرسال هذا النموذج، توافقين على أن تتواصل معك خبيرتنا بخصوص طلبك.'}</p>
            <label className="check-field field--wide"><input type="checkbox" name="marketingConsent" value="yes" defaultChecked /><span>{lang === 'fr' ? 'J’autorise ECOLYN à transmettre à Meta, de façon sécurisée, les informations nécessaires pour mesurer si cette demande provient d’une publicité. Vous pouvez décocher cette autorisation.' : 'أسمح لـ ECOLYN بإرسال المعلومات اللازمة إلى Meta بشكل آمن لقياس ما إذا كان هذا الطلب ناتجاً عن إعلان. يمكنك إلغاء هذا الخيار.'}</span></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-navigation short-form-submit">
            <p><ShieldCheck /> {lang === 'fr' ? 'Enregistrement sécurisé avant toute mesure de conversion.' : 'يتم تسجيل الطلب بأمان قبل قياس التحويل.'}</p>
            <button type="submit" className="button button--primary" disabled={sending}>{sending ? (lang === 'fr' ? 'Envoi sécurisé…' : 'الإرسال الآمن…') : t('form.submit')} <ArrowUpRight /></button>
          </div>
        </form>
      </div>
    </Reveal>
  )
}

function Events({ lang }: { lang: Language }) {
  const [live, setLive] = useState<LiveSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getPublishedLive()
      .then(setLive)
      .finally(() => setLoading(false))
  }, [])

  const locale = lang === 'fr' ? 'fr-MA' : 'ar-MA'
  const liveDate = live ? new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: live.timezone || 'Africa/Casablanca',
  }).format(new Date(live.starts_at)) : ''
  const title = live ? (lang === 'fr' ? live.title_fr : live.title_ar) || live.title_fr : ''
  const description = live ? (lang === 'fr' ? live.description_fr : live.description_ar) || live.description_fr : ''

  return (
    <Reveal className="events-section" id="lives">
      <div className="section-wrap">
        <SectionIntro eyebrow={lang === 'fr' ? 'Agenda' : 'المواعيد'} title={live ? (lang === 'fr' ? 'Le prochain rendez-vous ECOLYN' : 'موعد ECOLYN القادم') : (lang === 'fr' ? 'Soyez prévenue du prochain live' : 'تلقي تنبيهاً بموعد البث القادم')} copy={live ? (lang === 'fr' ? 'Ajoutez le rendez-vous à votre calendrier en un geste.' : 'أضيفي الموعد إلى تقويمك بخطوة واحدة.') : (lang === 'fr' ? 'Aucune date n’est annoncée pour le moment. Laissez votre demande pour recevoir les prochaines actualités.' : 'لا يوجد موعد معلن حالياً. اتركي طلبك لتصلك آخر المستجدات.')} />
        {loading ? <div className="live-loading" aria-label={lang === 'fr' ? 'Chargement du prochain live' : 'تحميل موعد اللايف'} /> : live ? (
          <article className="live-event">
            <div className="live-date">
              <CalendarDays />
              <span>{lang === 'fr' ? 'Prochain live' : 'البث القادم'}</span>
              <strong>{liveDate}</strong>
            </div>
            <div className="live-copy">
              <p>{live.location || (lang === 'fr' ? 'En ligne' : 'عن بعد')}</p>
              <h3>{title}</h3>
              {description && <span>{description}</span>}
            </div>
            <div className="live-actions">
              <button type="button" onClick={() => downloadLiveCalendar(live, lang)}>
                <CalendarDays /> {lang === 'fr' ? 'Me prévenir' : 'ذكّريني'}
              </button>
              <a
                href={googleCalendarUrl(live, lang)}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('live_calendar_click', { calendar_type: 'google', live_id: live.id })}
              >
                Google Agenda <ArrowUpRight />
              </a>
              <small>{lang === 'fr' ? 'Un rappel sera ajouté 30 min avant.' : 'سيُضاف تذكير قبل الموعد بـ30 دقيقة.'}</small>
            </div>
          </article>
        ) : (
          <div className="empty-event">
            <CalendarDays />
            <div><p>{lang === 'fr' ? 'Prochain rendez-vous' : 'الموعد القادم'}</p><h3>{lang === 'fr' ? 'Nous vous préviendrons dès que la date sera fixée.' : 'سنخبرك فور تحديد الموعد.'}</h3></div>
            <a href="#form-fields">{lang === 'fr' ? 'Me tenir informée' : 'أخبروني بالمستجدات'} <ArrowDown /></a>
          </div>
        )}
      </div>
    </Reveal>
  )
}

function FAQ({ lang }: { lang: Language }) {
  const [open, setOpen] = useState(0)
  return (
    <Reveal className="faq-section">
      <div className="section-wrap faq-layout">
        <div className="faq-heading">
          <p className="eyebrow">FAQ / {lang === 'fr' ? 'Conseils' : 'النصائح'}</p>
          <h2>{lang === 'fr' ? 'Avant de nous parler de votre peau' : 'قبل أن تحدّثينا عن بشرتك'}</h2>
          <p>{lang === 'fr' ? 'Des réponses claires sur le service, la confidentialité et les limites des conseils.' : 'إجابات واضحة عن الخدمة والخصوصية وحدود النصائح.'}</p>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <article key={item.q.fr} className={open === index ? 'is-open' : ''}>
              <button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{String(index + 1).padStart(2, '0')}</span><b>{local(item.q, lang)}</b><ChevronDown /></button>
              <div className="faq-answer"><p>{local(item.a, lang)}</p></div>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

function Footer({ lang, openLegal, journeyComplete }: { lang: Language; openLegal: (type: 'privacy' | 'terms') => void; journeyComplete: boolean }) {
  const { i18n } = useTranslation()
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand"><img src="./assets/brand/logo.webp" alt="ECOLYN" /><p>{lang === 'fr' ? 'Une plateforme marocaine pour mieux comprendre sa peau, simplifier sa routine et recevoir des conseils gratuits.' : 'منصة مغربية تساعدك على فهم بشرتك وتبسيط روتينك والاستفادة من نصائح مجانية.'}</p><span>{local(siteConfig.expert.role, lang)}</span></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Explorer' : 'تصفحي'}</h3><a href="#personnalisation">{lang === 'fr' ? 'Mes 3 choix' : 'اختياراتي الثلاثة'}</a><a href={journeyComplete ? '#conseils' : '#personnalisation'}>{lang === 'fr' ? 'Conseils' : 'النصائح'}</a><a href={journeyComplete ? '#articles' : '#personnalisation'}>{lang === 'fr' ? 'Articles' : 'المقالات'}</a><a href={journeyComplete ? '#histoires' : '#personnalisation'}>{lang === 'fr' ? 'Témoignages' : 'التجارب'}</a><a href={journeyComplete ? '#hanane' : '#personnalisation'}>{lang === 'fr' ? 'Hanane' : 'حنان'}</a><a href="#lives">{lang === 'fr' ? 'Prochain live' : 'البث القادم'}</a></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Agir' : 'تواصلي'}</h3><a href="#form-fields">{lang === 'fr' ? 'Demander des conseils' : 'طلب نصائح'}</a><a href={packHref} onClick={() => { track('pack_cta_click', { cta_location: 'footer' }); track('initiate_checkout', { cta_location: 'footer' }) }}>{lang === 'fr' ? 'Routine ECOLYN' : 'روتين ECOLYN'} <ArrowUpRight /></a><a href="mailto:ecolyn@proton.me">ecolyn@proton.me</a></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Confiance' : 'الثقة'}</h3><button onClick={() => openLegal('privacy')}>{lang === 'fr' ? 'Politique de confidentialité' : 'سياسة الخصوصية'}</button><button onClick={() => openLegal('terms')}>{lang === 'fr' ? 'Conditions' : 'الشروط'}</button><button onClick={() => i18n.changeLanguage(lang === 'fr' ? 'ar' : 'fr')}>{lang === 'fr' ? 'العربية' : 'Français'} <Languages /></button></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} ECOLYN</span><p>{lang === 'fr' ? 'Les conseils sont informatifs et ne remplacent pas l’avis d’un dermatologue.' : 'النصائح توعوية ولا تغني عن رأي طبيب الجلد.'}</p><a href="#accueil"><ArrowDown /> {lang === 'fr' ? 'Retour en haut' : 'العودة إلى الأعلى'}</a></div>
    </footer>
  )
}

function ArticleDrawer({ article, lang, close, next }: { article: Article; lang: Language; close: () => void; next: () => void }) {
  const completed = useRef(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [close])
  useEffect(() => { completed.current = false }, [article.slug])
  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.currentTarget === event.target && close()}>
      <motion.article className="article-drawer" initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} onScroll={event => {
        const target = event.currentTarget
        if (!completed.current && target.scrollTop + target.clientHeight >= target.scrollHeight * .85) {
          completed.current = true
          track('article_complete', { article_slug: article.slug })
        }
      }}>
        <div className="drawer-top"><div><span>{local(article.category, lang)}</span><p><Clock3 /> {article.time} {lang === 'fr' ? 'min de lecture' : 'دقائق للقراءة'}</p></div><button onClick={close} aria-label={lang === 'fr' ? 'Fermer l’article' : 'إغلاق المقال'}><X /></button></div>
        <div className="drawer-hero"><p>ECOLYN / {lang === 'fr' ? 'CONSEILS' : 'نصائح'}</p><h2>{local(article.title, lang)}</h2><b>{local(article.summary, lang)}</b><span className={`evidence-badge evidence-badge--${article.evidence}`}>{evidenceLabel(article.evidence, lang)}</span></div>
        <div className="article-body">
          <p className="article-intro">{local(article.introduction, lang)}</p>
          <h3>{lang === 'fr' ? 'Ce qu’il faut comprendre' : 'ما الذي ينبغي فهمه؟'}</h3><p>{local(article.explanation, lang)}</p>
          <h3>{lang === 'fr' ? 'Ce que vous pouvez observer' : 'ما الذي يمكنك ملاحظته؟'}</h3><p>{local(article.observe, lang)}</p>
          <h3>{lang === 'fr' ? 'Erreurs fréquentes' : 'أخطاء متكررة'}</h3><ul>{article.mistakes[lang].map(item => <li key={item}><X />{item}</li>)}</ul>
          <h3>{lang === 'fr' ? 'Gestes utiles' : 'خطوات مفيدة'}</h3><ul className="positive">{article.gestures[lang].map(item => <li key={item}><Check />{item}</li>)}</ul>
          <div className="watch-box"><Eye /><div><h3>{lang === 'fr' ? 'Point à surveiller' : 'نقطة ينبغي مراقبتها'}</h3><p>{local(article.watch, lang)}</p></div></div>
          <div className="professional-box"><ShieldCheck /><p>{local(article.professional, lang)}</p></div>
          <div className="article-sources"><h3>{lang === 'fr' ? 'Sources' : 'المصادر'}</h3>{article.sources.map(source => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label} <ArrowUpRight /></a>)}</div>
          <a href="#form-fields" className="button button--primary" onClick={close}>{lang === 'fr' ? 'Demander des conseils personnalisés' : 'طلب نصائح مخصصة'} <MessageCircle /></a>
        </div>
        <button className="drawer-next" onClick={next}>{lang === 'fr' ? 'Article suivant' : 'المقال التالي'} {lang === 'fr' ? <ArrowRight /> : <ArrowLeft />}</button>
      </motion.article>
    </motion.div>
  )
}

function LegalModal({ type, lang, close }: { type: 'privacy' | 'terms'; lang: Language; close: () => void }) {
  const privacy = type === 'privacy'
  return (
    <motion.div className="legal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.currentTarget === event.target && close()}>
      <motion.article initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
        <button onClick={close} aria-label="Fermer"><X /></button>
        <p className="eyebrow">{privacy ? 'CONFIDENTIALITÉ' : 'CONDITIONS'}</p>
        <h2>{privacy ? (lang === 'fr' ? 'Vos informations restent les vôtres' : 'معلوماتك تبقى ملكاً لك') : (lang === 'fr' ? 'Cadre du service de conseils' : 'إطار خدمة النصائح')}</h2>
        {privacy ? <>
          <p>{lang === 'fr' ? 'Les informations servent uniquement à examiner votre demande, vous contacter et, si vous y consentez séparément, vous envoyer de futurs contenus.' : 'تُستخدم المعلومات فقط لمراجعة طلبك والتواصل معك، وإذا وافقتِ بشكل منفصل، لإرسال محتوى مستقبلي.'}</p>
          <h3>{lang === 'fr' ? 'Photos facultatives' : 'الصور اختيارية'}</h3><p>{lang === 'fr' ? 'Aucune photo n’est obligatoire, publiée ou utilisée dans une publicité sans autorisation séparée et explicite.' : 'لا توجد صورة إلزامية، ولا تُنشر الصور أو تُستخدم في الإعلانات من دون موافقة منفصلة وصريحة.'}</p>
          <h3>{lang === 'fr' ? 'Stockage' : 'التخزين'}</h3><p>{lang === 'fr' ? 'Les demandes sont enregistrées dans un espace sécurisé. Les visiteurs ne peuvent ni lire, ni modifier, ni supprimer ces informations.' : 'تُحفظ الطلبات في مساحة آمنة، ولا يستطيع الزوار قراءة هذه المعلومات أو تعديلها أو حذفها.'}</p>
          <h3>{lang === 'fr' ? 'Mesure publicitaire facultative' : 'قياس الإعلانات اختياري'}</h3><p>{lang === 'fr' ? 'Seulement si vous cochez le consentement marketing séparé, vos coordonnées normalisées et hachées peuvent être transmises à Meta pour mesurer la demande. Les identifiants publicitaires restent désactivables depuis l’administration.' : 'فقط عند الموافقة المنفصلة على القياس الإعلاني، يمكن إرسال بيانات التواصل بعد توحيدها وتشفيرها إلى Meta لقياس مصدر الطلب. ويمكن تعطيل أدوات القياس من لوحة الإدارة.'}</p>
          <h3>{lang === 'fr' ? 'Vos droits' : 'حقوقك'}</h3><p>{lang === 'fr' ? 'Vous pouvez demander l’accès, la correction ou la suppression de vos données à ecolyn@proton.me.' : 'يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر ecolyn@proton.me.'}</p>
        </> : <>
          <p>{lang === 'fr' ? 'Le service fournit des informations de routine à partir des éléments déclarés. Il ne constitue ni un diagnostic ni une consultation médicale.' : 'تقدم الخدمة معلومات عن الروتين انطلاقاً من المعطيات التي تصرّحين بها، ولا تُعد تشخيصاً أو استشارة طبية.'}</p>
          <h3>{lang === 'fr' ? 'Limites' : 'الحدود'}</h3><p>{lang === 'fr' ? 'Les résultats et la tolérance varient selon les personnes. Aucun résultat n’est garanti.' : 'تختلف النتائج وقدرة البشرة على التحمل من شخص إلى آخر، ولا توجد نتيجة مضمونة.'}</p>
          <h3>{lang === 'fr' ? 'Urgence et persistance' : 'الحالات الشديدة أو المستمرة'}</h3><p>{lang === 'fr' ? 'Toute situation sévère, inhabituelle ou persistante doit être présentée à un dermatologue.' : 'يجب عرض أي حالة شديدة أو غير معتادة أو مستمرة على طبيب جلد.'}</p>
        </>}
      </motion.article>
    </motion.div>
  )
}

export default function App() {
  const lang = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const savedConcern = localStorage.getItem('ecolyn-skin-concern') || 'taches'
  const initialConcern = concerns.some(item => item.id === savedConcern) ? savedConcern : 'taches'
  const readSavedArray = <T extends string>(key: string, fallback: T[], allowed: readonly T[]) => {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const safe = parsed.filter((value): value is T => allowed.includes(value))
        if (safe.length) return safe
      }
    } catch { /* rétrocompatibilité avec les anciennes valeurs simples */ }
    return allowed.includes(raw as T) ? [raw as T] : fallback
  }
  const concernIds = concernOptions.map(item => item.id)
  const profileIds: SkinProfileId[] = ['oily', 'dry', 'sensitive', 'combination', 'unknown']
  const contextIds: LifestyleId[] = ['pregnancy', 'sleep', 'stress', 'motherhood', 'emotional', 'diet', 'sun', 'hair-products', 'none']
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(() => {
    const hasSavedChoice = Boolean(localStorage.getItem('ecolyn-skin-concerns') || localStorage.getItem('ecolyn-skin-concern'))
    return readSavedArray('ecolyn-skin-concerns', hasSavedChoice ? [initialConcern] : [], concernIds).slice(0, 1)
  })
  const savedProfile = localStorage.getItem('ecolyn-skin-profile') as SkinProfileId | null
  const initialProfile: SkinProfileId = ['oily', 'dry', 'sensitive', 'combination', 'unknown'].includes(savedProfile || '') ? savedProfile as SkinProfileId : 'unknown'
  const [skinProfilesSelected, setSkinProfilesSelected] = useState<SkinProfileId[]>(() => {
    const hasSavedChoice = Boolean(localStorage.getItem('ecolyn-skin-profiles') || localStorage.getItem('ecolyn-skin-profile'))
    const saved = readSavedArray('ecolyn-skin-profiles', hasSavedChoice ? [initialProfile] : [], profileIds)
    return (saved.includes('unknown') && saved.length > 1 ? saved.filter(value => value !== 'unknown') : saved).slice(0, 1)
  })
  const savedLifestyle = localStorage.getItem('ecolyn-lifestyle-topic') as LifestyleId | null
  const initialLifestyle: LifestyleId | '' = ['pregnancy', 'sleep', 'stress', 'motherhood', 'emotional', 'diet', 'sun', 'hair-products', 'none'].includes(savedLifestyle || '') ? savedLifestyle as LifestyleId : ''
  const [lifestyleContexts, setLifestyleContexts] = useState<LifestyleId[]>(() => {
    const saved = readSavedArray('ecolyn-lifestyle-topics', initialLifestyle ? [initialLifestyle] : [], contextIds)
    return (saved.includes('none') && saved.length > 1 ? saved.filter(value => value !== 'none') : saved).slice(0, 1)
  })
  const [journeyComplete, setJourneyComplete] = useState(false)
  const [journeyEditToken, setJourneyEditToken] = useState(0)
  const savedComplexion = localStorage.getItem('ecolyn-complexion') as ComplexionId | null
  const [complexion] = useState<ComplexionId>(['medium-dark', 'not-medium-dark', 'unspecified'].includes(savedComplexion || '') ? savedComplexion as ComplexionId : 'unspecified')
  const [article, setArticle] = useState<Article | null>(null)
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: .001 })
  const reduced = useReducedMotion()

  useEffect(() => { void initializeTracking('advice_home') }, [])
  useEffect(() => {
    const handleFunnelAnchors = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return
      if (anchor.getAttribute('href') === '#personnalisation') {
        trackOncePerSession('journey_start', { source: anchor.dataset.journeySource || 'navigation' })
      }
      if (anchor.getAttribute('href') !== '#form-fields') return
      event.preventDefault()
      track('form_cta_click', { source: anchor.dataset.formCta || 'page_link' })
      const target = document.getElementById('form-fields') || document.getElementById('personnalisation')
      target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
    document.addEventListener('click', handleFunnelAnchors)
    return () => document.removeEventListener('click', handleFunnelAnchors)
  }, [reduced])

  const openArticle = (nextArticle: Article) => {
    setArticle(nextArticle)
    track('article_open', { article_slug: nextArticle.slug, article_category: nextArticle.category.fr })
  }
  const nextArticle = () => {
    if (!article) return
    const index = articles.findIndex(item => item.slug === article.slug)
    const next = articles[(index + 1) % articles.length]
    setArticle(next)
    track('article_open', { article_slug: next.slug, article_category: next.category.fr, source: 'drawer_next' })
  }
  const describe = (id: string) => {
    const mapped = concerns.find(item => item.id === id)?.id
      || (id === 'grasse-tire' ? 'grasse' : id === 'spf-oublie' ? 'spf' : id === 'routine-change' ? 'inconnue' : id)
    if (concerns.some(item => item.id === mapped)) {
      setSelectedConcerns([mapped])
      localStorage.setItem('ecolyn-skin-concern', mapped)
      localStorage.setItem('ecolyn-skin-concerns', JSON.stringify([mapped]))
    }
    track('form_cta_click', { source: 'concern_path', concern_id: mapped })
    setTimeout(() => document.getElementById('form-fields')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 40)
  }
  const chooseConcerns = (ids: string[]) => {
    const next = ids.slice(0, 1)
    setSelectedConcerns(next)
    localStorage.setItem('ecolyn-skin-concerns', JSON.stringify(next))
    if (next[0]) localStorage.setItem('ecolyn-skin-concern', next[0])
  }
  const chooseProfiles = (ids: SkinProfileId[]) => {
    const next = ids.slice(0, 1)
    setSkinProfilesSelected(next)
    localStorage.setItem('ecolyn-skin-profiles', JSON.stringify(next))
    if (next[0]) localStorage.setItem('ecolyn-skin-profile', next[0])
  }
  const chooseContexts = (ids: LifestyleId[]) => {
    const next = ids.slice(0, 1)
    setLifestyleContexts(next)
    localStorage.setItem('ecolyn-lifestyle-topics', JSON.stringify(next))
    if (next[0]) localStorage.setItem('ecolyn-lifestyle-topic', next[0])
  }
  const selectHeroConcern = (id: string) => {
    chooseConcerns([id])
    setTimeout(() => document.getElementById('besoins')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 40)
    track('select_skin_concern', { selection_source: 'hero', concern_id: id })
  }

  const currentConcernLabel = useMemo(() => local(concerns.find(item => item.id === selectedConcerns[0])?.short || concerns[0].short, lang), [selectedConcerns, lang])

  const modifyJourneyChoices = () => {
    setJourneyComplete(false)
    setJourneyEditToken(value => value + 1)
    window.setTimeout(() => document.getElementById('personnalisation')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), 30)
  }

  return (
    <>
      <motion.div className="page-progress" style={{ scaleX: progress }} />
      <Header lang={lang} menuOpen={menuOpen} setMenuOpen={setMenuOpen} journeyComplete={journeyComplete} />
      <main>
        <DiscoveryExperience
          lang={lang}
          profiles={skinProfilesSelected}
          concerns={selectedConcerns}
          contexts={lifestyleContexts}
          complexion={complexion}
          setProfiles={chooseProfiles}
          setConcerns={chooseConcerns}
          setContexts={chooseContexts}
          onComplete={() => setJourneyComplete(true)}
          editToken={journeyEditToken}
        />
        {journeyComplete && <>
          <SimpleLeadForm lang={lang} concerns={selectedConcerns} profiles={skinProfilesSelected} contexts={lifestyleContexts} onModifyChoices={modifyJourneyChoices} />
          <DiscoveryAfterForm lang={lang} openArticle={openArticle} />
        </>}
        <Proofs lang={lang} />
        <Events lang={lang} />
        <FAQ lang={lang} />
      </main>
      <Footer lang={lang} openLegal={setLegal} journeyComplete={journeyComplete} />
      <a className="sticky-advice" href={journeyComplete ? '#form-fields' : '#personnalisation'} data-form-cta="sticky" data-journey-source="sticky">
        <span>{journeyComplete ? <MessageCircle /> : <Sparkles />}</span><b>{journeyComplete ? currentConcernLabel : 'ECOLYN'}</b><em>{journeyComplete ? (lang === 'fr' ? 'Contacter Hanane' : 'التواصل مع حنان') : (lang === 'fr' ? 'Faire mes 3 choix' : 'ابدئي اختياراتك الثلاثة')}</em><ArrowUpRight />
      </a>
      <a
        className="whatsapp-group-float"
        href={whatsappGroupHref}
        target="_blank"
        rel="noreferrer"
        onClick={() => track('join_whatsapp_group', { source: 'floating_button' })}
        aria-label={lang === 'fr' ? 'Rejoindre le groupe conseils sur WhatsApp' : 'انضمي لمجموعة النصائح على واتساب'}
      >
        <MessageCircle /><span>{lang === 'fr' ? 'Rejoindre le groupe conseils' : 'انضمي لمجموعة النصائح'}</span>
      </a>
      <AnimatePresence>
        {article && <ArticleDrawer article={article} lang={lang} close={() => setArticle(null)} next={nextArticle} />}
        {legal && <LegalModal type={legal} lang={lang} close={() => setLegal(null)} />}
      </AnimatePresence>
    </>
  )
}
