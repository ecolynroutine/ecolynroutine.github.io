import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check,
  ChevronDown, CirclePlay, Clock3, Droplets, Eye, FileText, HeartHandshake,
  Languages, LockKeyhole, Menu, MessageCircle, MoonStar, MoveRight, Play, ShieldCheck,
  Sparkles, Sun, Upload, X
} from 'lucide-react'
import type { Article, Language, Localized } from './types'
import { articles, quickTips } from './data/articles'
import { skinCases } from './data/cases'
import { testimonials } from './data/testimonials'
import { videoSlots } from './data/videos'
import { faqs } from './data/faqs'
import { events } from './data/events'
import { initializeTracking, track } from './lib/tracking'
import { submitLead, type LeadResult } from './lib/submitLead'

const concerns = [
  {
    id: 'taches',
    label: { fr: 'Taches et teint irrégulier', ar: 'البقع ولون غير موحد' },
    short: { fr: 'Taches', ar: 'البقع' },
    summary: { fr: 'Comprendre les habitudes qui peuvent entretenir les irrégularités visibles.', ar: 'فهم العادات اللي تقدر تخلي اللون غير موحد.' },
    tips: { fr: ['Protéger chaque matin', 'Éviter le frottement', 'Évaluer sur plusieurs semaines'], ar: ['الحماية كل صباح', 'تجنب الحك', 'التقييم على أسابيع'] }
  },
  {
    id: 'traces',
    label: { fr: 'Traces après les boutons', ar: 'آثار من بعد الحبوب' },
    short: { fr: 'Traces de boutons', ar: 'آثار الحبوب' },
    summary: { fr: 'Distinguer les traces de couleur, l’inflammation et les cicatrices en relief.', ar: 'الفرق بين آثار اللون، الالتهاب والندوب البارزة.' },
    tips: { fr: ['Ne pas manipuler', 'Introduire un actif à la fois', 'Maintenir le SPF'], ar: ['ما تلمسيش الحبوب', 'مادة فعالة وحدة فكل مرة', 'الاستمرار مع SPF'] }
  },
  {
    id: 'grasse',
    label: { fr: 'Peau grasse', ar: 'البشرة الدهنية' },
    short: { fr: 'Excès de sébum', ar: 'الدهون الزائدة' },
    summary: { fr: 'Apaiser la brillance sans décaper ni assécher la peau.', ar: 'نقص اللمعان بلا ما نجففو أو نجهدو البشرة.' },
    tips: { fr: ['Nettoyant doux', 'Hydratant léger', 'Observer la zone T'], ar: ['منظف لطيف', 'مرطب خفيف', 'مراقبة منطقة T'] }
  },
  {
    id: 'seche',
    label: { fr: 'Peau sèche', ar: 'البشرة الجافة' },
    short: { fr: 'Sécheresse', ar: 'الجفاف' },
    summary: { fr: 'Retrouver du confort sans accumuler des couches inutiles.', ar: 'نرجعو الراحة بلا طبقات ومنتجات كثيرة.' },
    tips: { fr: ['Limiter l’eau chaude', 'Renforcer la crème', 'Tamponner pour sécher'], ar: ['نقص الماء السخون', 'كريم مريح أكثر', 'التنشيف بالتربيت'] }
  },
  {
    id: 'sensible',
    label: { fr: 'Peau sensible', ar: 'البشرة الحساسة' },
    short: { fr: 'Sensibilité', ar: 'الحساسية' },
    summary: { fr: 'Repérer les déclencheurs et simplifier avant d’ajouter.', ar: 'نعرفو المحفزات ونبسطو قبل ما نزيدو.' },
    tips: { fr: ['Journal de réactions', 'Test localisé', 'Routine courte'], ar: ['دفتر للتفاعلات', 'اختبار فبلاصة صغيرة', 'روتين قصير'] }
  },
  {
    id: 'terne',
    label: { fr: 'Teint terne', ar: 'البشرة الباهتة' },
    short: { fr: 'Peau terne', ar: 'البشرة الباهتة' },
    summary: { fr: 'Revenir aux gestes réguliers avant de chercher un produit miracle.', ar: 'نرجعو للعادات المنتظمة قبل ما نقلبو على منتج سحري.' },
    tips: { fr: ['Hydratation régulière', 'Sommeil et confort', 'Protection solaire'], ar: ['ترطيب منتظم', 'النوم والراحة', 'الحماية من الشمس'] }
  },
  {
    id: 'spf',
    label: { fr: 'Protection solaire', ar: 'الحماية من الشمس' },
    short: { fr: 'Protection solaire', ar: 'الحماية من الشمس' },
    summary: { fr: 'Transformer le SPF en vraie habitude quotidienne.', ar: 'نخليو SPF عادة يومية حقيقية.' },
    tips: { fr: ['Dernière étape du matin', 'Quantité suffisante', 'Renouveler selon l’exposition'], ar: ['آخر خطوة فالصباح', 'كمية كافية', 'التجديد حسب التعرض'] }
  },
  {
    id: 'routine',
    label: { fr: 'Routine matin et soir', ar: 'روتين الصباح والليل' },
    short: { fr: 'Routine confuse', ar: 'روتين مخربق' },
    summary: { fr: 'Donner un rôle clair à chaque étape pour alléger la routine.', ar: 'نعطيو دور واضح لكل مرحلة باش نبسطو الروتين.' },
    tips: { fr: ['Nettoyer', 'Hydrater', 'Protéger le matin'], ar: ['تنظيف', 'ترطيب', 'حماية فالصباح'] }
  },
  {
    id: 'produits',
    label: { fr: 'Choix des produits', ar: 'اختيار المنتجات' },
    short: { fr: 'Choix des produits', ar: 'اختيار المنتجات' },
    summary: { fr: 'Choisir selon le besoin prioritaire plutôt que selon la tendance.', ar: 'نختارو حسب الحاجة الرئيسية ماشي حسب الترند.' },
    tips: { fr: ['Un objectif principal', 'Une nouveauté à la fois', 'Lire les indications'], ar: ['هدف رئيسي واحد', 'جديد واحد فكل مرة', 'قراية التعليمات'] }
  },
  {
    id: 'inconnue',
    label: { fr: 'Je ne connais pas mon type de peau', ar: 'ما عارفاش نوع البشرة ديالي' },
    short: { fr: 'Type de peau ?', ar: 'نوع البشرة؟' },
    summary: { fr: 'Observer les sensations, les zones et les moments de la journée.', ar: 'نراقبو الإحساس، المناطق وأوقات النهار.' },
    tips: { fr: ['Observer sans produit 30 min', 'Comparer zone T et joues', 'Noter les tiraillements'], ar: ['مراقبة 30 دقيقة بلا منتج', 'مقارنة T مع الخدود', 'كتابة الإحساس بالشد'] }
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
  }, [lang])
  return lang
}

function local<T extends Localized>(value: T, lang: Language) {
  return value[lang]
}

function Reveal({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.section
      id={id}
      className={className}
      variants={reduced ? undefined : sectionMotion}
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-12% 0px' }}
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

function Header({ lang, menuOpen, setMenuOpen }: { lang: Language; menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
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
    ['#accueil', t('nav.home')], ['#conseils', t('nav.advice')], ['#cas', t('nav.cases')],
    ['#experiences', t('nav.stories')], ['#lives', t('nav.lives')]
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
          <span>{lang === 'fr' ? 'Comprendre sa peau' : 'نفهمو البشرة'}</span>
        </a>
        <nav className="desktop-nav" aria-label={lang === 'fr' ? 'Navigation principale' : 'التنقل الرئيسي'}>
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          <a className="pack-link" href="./pack/">{t('nav.pack')} <ArrowUpRight size={14} /></a>
        </nav>
        <div className="nav-actions">
          <button className="language-button" onClick={changeLanguage} aria-label="Changer de langue">
            <Languages size={17} /> <span>{lang === 'fr' ? 'عربي' : 'FR'}</span>
          </button>
          <a className="nav-cta" href="#formulaire">{t('nav.cta')}</a>
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
              <a href="#formulaire" onClick={() => setMenuOpen(false)}><span>06</span>{t('nav.ask')}</a>
              <a href="./pack/"><span>07</span>{t('nav.pack')} <ArrowUpRight /></a>
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
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, .22], [0, reduced ? 0 : 85])
  return (
    <section className="hero" id="accueil">
      <div className="hero-noise" />
      <motion.div className="hero-orbit hero-orbit--one" animate={reduced ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 36, ease: 'linear' }} />
      <motion.div className="hero-layout">
        <motion.div className="hero-copy" initial={reduced ? undefined : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .85 }}>
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1>
            <span>{t('hero.titleA')}</span>
            <em>{t('hero.titleB')}</em>
          </h1>
          <p className="hero-lede">{t('hero.copy')}</p>
          <p className="free-badge"><Sparkles size={16} /> {t('hero.badge')}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#formulaire" onClick={() => track('form_start', { source: 'hero' })}>{t('hero.primary')} <ArrowDown size={17} /></a>
            <a className="button button--ghost" href="#conseils">{t('hero.secondary')} <MoveRight size={17} /></a>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck /> {lang === 'fr' ? 'Approche informative' : 'مقاربة توعوية'}</span>
            <span><LockKeyhole /> {lang === 'fr' ? 'Données confidentielles' : 'معلومات خاصة'}</span>
          </div>
        </motion.div>
        <motion.div className="hero-visual" style={{ y }}>
          <div className="image-frame">
            <img src="./assets/hero-editorial.webp" alt={lang === 'fr' ? 'Portrait éditorial illustrant l’observation de la peau' : 'صورة توضيحية لمراقبة البشرة'} width="1536" height="1024" />
            <span className="visual-label">{lang === 'fr' ? 'Illustration éditoriale • image non testimoniale' : 'صورة توضيحية • ماشي شهادة'}</span>
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
      <a className="scroll-cue" href="#besoins"><span>{t('hero.scroll')}</span><ArrowDown /></a>
    </section>
  )
}

function ConcernExplorer({ lang, selected, setSelected, describe }: { lang: Language; selected: string; setSelected: (id: string) => void; describe: (id: string) => void }) {
  const { t } = useTranslation()
  const active = concerns.find(c => c.id === selected) || concerns[0]
  return (
    <Reveal className="concern-section" id="besoins">
      <div className="organic-line" />
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Point de départ' : 'نقطة البداية'}
          title={lang === 'fr' ? 'Qu’aimeriez-vous mieux comprendre aujourd’hui ?' : 'شنو بغيتي تفهمي أكثر اليوم؟'}
          copy={lang === 'fr' ? 'Choisissez le signe qui vous parle. La réponse se construit sans rechargement et sans vous enfermer dans une étiquette.' : 'اختاري الإشارة اللي كتشبه ليك. الجواب كيبان بلا تحميل وبلا ما نحكمو على نوع البشرة.'}
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
                  track('select_skin_concern', { skin_concern: concern.id })
                }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {local(concern.label, lang)}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article className="concern-answer" key={active.id} initial={{ opacity: 0, x: lang === 'ar' ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} transition={{ duration: .35 }}>
              <p className="answer-index">ECOLYN / {active.id.toUpperCase()}</p>
              <h3>{local(active.label, lang)}</h3>
              <p>{local(active.summary, lang)}</p>
              <ol>{active.tips[lang].map(tip => <li key={tip}><Check size={15} />{tip}</li>)}</ol>
              <div className="answer-actions">
                <a href="#conseils" className="text-link">{t('common.related')} <ArrowDown size={15} /></a>
                <button onClick={() => describe(active.id)}>{t('common.describe')} <MessageCircle size={16} /></button>
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
  return (
    <Reveal className="advice-section" id="conseils">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Gestes essentiels' : 'خطوات أساسية'}
            title={lang === 'fr' ? 'Commencez par ces gestes simples' : 'بداي بهاد الخطوات البسيطة'}
            copy={lang === 'fr' ? 'Des repères courts à lire maintenant, et des articles complets à ouvrir sans quitter la page.' : 'نقاط قصيرة دابا، ومقالات كاملة كتفتحيها بلا ما تخرجي من الصفحة.'}
          />
          <div className="rail-hint"><MoveRight /> {lang === 'fr' ? 'Faites glisser pour explorer' : 'جرّي باش تشوفي أكثر'}</div>
        </div>
        <div className="advice-rail">
          {quickTips.map(({ article, id, symbol }, index) => (
            <motion.article className={`advice-card advice-card--${(index % 3) + 1}`} key={article.slug} whileHover={{ y: -8 }}>
              <div className="advice-card-top"><span>{String(id).padStart(2, '0')}</span><b>{symbol}</b></div>
              <p className="advice-category">{article.category}</p>
              <h3>{local(article.title, lang)}</h3>
              <p>{local(article.summary, lang)}</p>
              <button onClick={() => openArticle(article)}>{t('common.read')} <ArrowUpRight size={17} /></button>
            </motion.article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

function Cases({ lang, describe }: { lang: Language; describe: (id: string) => void }) {
  return (
    <Reveal className="cases-section" id="cas">
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Cas pratiques' : 'حالات واقعية'}
          title={lang === 'fr' ? 'Des situations que beaucoup de femmes rencontrent' : 'حالات كيدوزو منها بزاف ديال النساء'}
          copy={lang === 'fr' ? 'Chaque peau peut réagir différemment. Ces cas servent à mieux formuler votre situation, pas à poser un diagnostic.' : 'كل بشرة كتقدر تتفاعل بشكل مختلف. هاد الحالات باش نوضحو الوضع، ماشي باش نديرو تشخيص.'}
          dark
        />
        <div className="case-timeline">
          {skinCases.map((item, index) => (
            <article className="case-row" key={item.id}>
              <div className="case-number">0{index + 1}</div>
              <div className="case-statement"><span>{item.category}</span><h3>« {local(item.statement, lang)} »</h3></div>
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
  const [filter, setFilter] = useState(0)
  return (
    <Reveal className="proofs-section">
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Preuves avec intégrité' : 'دلائل بكل وضوح'}
          title={lang === 'fr' ? 'Des routines plus claires, des habitudes mieux comprises' : 'روتين أوضح وعادات مفهومة أكثر'}
          copy={lang === 'fr' ? 'Aucun faux avant/après. Cet espace est prêt à recevoir uniquement des cas autorisés par les utilisatrices.' : 'ما كاين حتى قبل/بعد مزيف. هاد المساحة واجدة غير للحالات اللي عندها موافقة.'}
        />
        <div className="filter-row">
          {beforeAfterFilters.map((item, index) => <button className={filter === index ? 'is-active' : ''} key={item.fr} onClick={() => setFilter(index)}>{local(item, lang)}</button>)}
        </div>
        <div className="proof-editorial">
          <div className="proof-visual" aria-label={lang === 'fr' ? 'Emplacement avant après' : 'مكان قبل وبعد'}>
            <div className="skin-texture skin-texture--before"><span>{lang === 'fr' ? 'AVANT' : 'قبل'}</span></div>
            <div className="skin-divider"><Eye /></div>
            <div className="skin-texture skin-texture--after"><span>{lang === 'fr' ? 'APRÈS' : 'بعد'}</span></div>
          </div>
          <div className="proof-copy">
            <p className="proof-badge">{lang === 'fr' ? 'STRUCTURE EN ATTENTE DE MÉDIAS AUTORISÉS' : 'الهيكلة كتسنى وسائط عندها موافقة'}</p>
            <h3>{local(beforeAfterFilters[filter], lang)}</h3>
            <p>{lang === 'fr' ? 'Le cas publié ici pourra préciser la durée, les habitudes modifiées, le retour personnel et la variabilité des résultats.' : 'الحالة اللي غتنشر هنا تقدر توضح المدة، العادات اللي تبدلات، الرأي الشخصي واختلاف النتائج.'}</p>
            <div className="proof-meta"><span><Clock3 /> {lang === 'fr' ? 'Durée documentée' : 'مدة موثقة'}</span><span><ShieldCheck /> {lang === 'fr' ? 'Autorisation séparée' : 'موافقة مستقلة'}</span></div>
            <small>{lang === 'fr' ? 'Illustration éditoriale — ne représente pas un résultat réel.' : 'توضيح بصري — ما كيمثلش نتيجة حقيقية.'}</small>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function Experiences({ lang }: { lang: Language }) {
  const railRef = useRef<HTMLDivElement>(null)
  const scrollRail = (direction: number) => railRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' })
  return (
    <Reveal className="experiences-section" id="experiences">
      <div className="section-wrap">
        <div className="intro-split">
          <SectionIntro
            eyebrow={lang === 'fr' ? 'Voix & expériences' : 'أصوات وتجارب'}
            title={lang === 'fr' ? 'Elles racontent leur expérience' : 'كيحكيو على التجربة ديالهم'}
            copy={lang === 'fr' ? 'Les médias existants sont conservés. Les verbatims et autorisations doivent être validés avant publication définitive.' : 'الوسائط الموجودة محفوظة. خاص تأكيد الكلام والموافقات قبل النشر النهائي.'}
          />
          <div className="rail-controls"><button onClick={() => scrollRail(-1)} aria-label="Précédent"><ArrowLeft /></button><button onClick={() => scrollRail(1)} aria-label="Suivant"><ArrowRight /></button></div>
        </div>
        <div className="experience-rail" ref={railRef}>
          {testimonials.map((item, index) => (
            <article className={`experience-card experience-card--${index % 3}`} key={item.id}>
              <img src={item.image} loading="lazy" alt="" />
              <div className="experience-shade" />
              <button className="play-button" aria-label={lang === 'fr' ? 'Voir le témoignage' : 'نشوف التجربة'} onClick={() => track('video_start', { video_id: item.id, status: 'media_pending' })}><Play fill="currentColor" /></button>
              <div className="experience-copy"><span>{item.name}</span><h3>{local(item.category, lang)}</h3><p>{local(item.note, lang)}</p></div>
            </article>
          ))}
        </div>
        <div className="video-slots-summary"><CirclePlay /><p><b>{videoSlots.length} {lang === 'fr' ? 'emplacements vidéo configurés' : 'أماكن فيديو واجدة'}</b><span>{lang === 'fr' ? 'Ajoutez les fichiers ou URL dans src/data/videos.' : 'زيدو الملفات أو الروابط فـ src/data/videos.'}</span></p></div>
      </div>
    </Reveal>
  )
}

function Expert({ lang }: { lang: Language }) {
  return (
    <Reveal className="expert-section">
      <div className="expert-backdrop">
        <div className="expert-monogram"><span>E</span><small>{lang === 'fr' ? 'Portrait de l’experte à ajouter' : 'خاص إضافة صورة الخبيرة'}</small></div>
        <div className="expert-copy">
          <p className="eyebrow">{lang === 'fr' ? 'Une présence humaine' : 'مواكبة إنسانية'}</p>
          <h2>{lang === 'fr' ? 'Conseillère experte en soins et routines du visage' : 'خبيرة في روتين والعناية ببشرة الوجه'}</h2>
          <p>{lang === 'fr' ? 'Son approche part des informations que vous partagez : votre confort, vos habitudes, vos réactions et votre objectif. Elle simplifie avant d’ajouter et oriente vers un dermatologue lorsque la situation le nécessite.' : 'المقاربة كتبدا من المعلومات اللي كتعطي: الراحة، العادات، التفاعلات والهدف. كتبسط قبل ما تزيد، وكتوجه لطبيب الجلد ملي الحالة كتحتاج.'}</p>
          <ul>
            {(lang === 'fr'
              ? ['Écouter avant de conseiller', 'Simplifier les routines', 'Éviter les promesses irréalistes', 'Adapter les recommandations', 'Orienter quand c’est nécessaire']
              : ['الاستماع قبل النصيحة', 'تبسيط الروتين', 'بلا وعود غير واقعية', 'تكييف النصائح', 'التوجيه وقت الحاجة']
            ).map(item => <li key={item}><Check />{item}</li>)}
          </ul>
          <a href="#formulaire" className="button button--light">{lang === 'fr' ? 'Poser ma question à l’experte' : 'نسول الخبيرة'} <MessageCircle /></a>
        </div>
      </div>
    </Reveal>
  )
}

function Library({ lang, openArticle }: { lang: Language; openArticle: (article: Article) => void }) {
  const [category, setCategory] = useState('Tout')
  const categories = ['Tout', ...Array.from(new Set(articles.map(article => article.category)))]
  const visible = category === 'Tout' ? articles : articles.filter(article => article.category === category)
  return (
    <Reveal className="library-section" id="bibliotheque">
      <div className="section-wrap">
        <SectionIntro
          eyebrow={lang === 'fr' ? 'Mini-bibliothèque' : 'مكتبة صغيرة'}
          title={lang === 'fr' ? 'Lire, comprendre, puis choisir' : 'قراي، فهمي، ومن بعد اختاري'}
          copy={lang === 'fr' ? 'Des contenus structurés, conçus pour être utiles sans dramatiser ni promettre l’impossible.' : 'محتوى منظم ومفيد، بلا تهويل وبلا وعود مستحيلة.'}
        />
        <div className="category-tabs" role="tablist">
          {categories.map(item => <button role="tab" aria-selected={category === item} className={category === item ? 'is-active' : ''} key={item} onClick={() => setCategory(item)}>{item === 'Tout' && lang === 'ar' ? 'الكل' : item}</button>)}
        </div>
        <motion.div className="article-grid" layout>
          <AnimatePresence mode="popLayout">
            {visible.map((article, index) => (
              <motion.article className={`article-teaser article-teaser--${index % 4}`} layout key={article.slug} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
                <div className="article-visual"><span>{article.category.slice(0, 2).toUpperCase()}</span><div /></div>
                <p className="article-meta">{article.category} <i /> {article.time} {lang === 'fr' ? 'min' : 'دقائق'}</p>
                <h3>{local(article.title, lang)}</h3>
                <p>{local(article.summary, lang)}</p>
                <button onClick={() => openArticle(article)}>{lang === 'fr' ? 'Lire l’article' : 'نقرا المقال'} <ArrowUpRight /></button>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
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
          <span><Clock3 /> {lang === 'ar' ? (window.ECOLYN_CONFIG?.responseDelayAr || '24 حتى 48 ساعة') : (window.ECOLYN_CONFIG?.responseDelay || '24 à 48 heures')}</span>
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
    setStep(value => Math.min(total - 1, value + 1))
  }
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateCurrent() || !formRef.current) return
    setSending(true)
    setError('')
    try {
      const nextResult = await submitLead(formRef.current)
      setResult(nextResult)
      track('generate_lead', { skin_concern: concern, submission_mode: nextResult.mode })
    } catch {
      setError(lang === 'fr' ? 'L’envoi sécurisé n’a pas abouti. Réessayez ou utilisez WhatsApp.' : 'الإرسال الآمن ما كملش. عاودي أو استعملي واتساب.')
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} className="form-step" data-form-step={step} initial={{ opacity: 0, x: lang === 'ar' ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === 'ar' ? 24 : -24 }} transition={{ duration: .3 }}>
              <div className="form-step-heading"><span>0{step + 1}</span><div><p>{lang === 'fr' ? 'Étape' : 'المرحلة'}</p><h3>{labels[step]}</h3></div></div>
              {step === 0 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Type de peau' : 'نوع البشرة'}><select name="skinType" required defaultValue=""><option value="" disabled>{lang === 'fr' ? 'Sélectionner' : 'اختاري'}</option><option>Normale</option><option>Sèche / جافة</option><option>Grasse / دهنية</option><option>Mixte / مختلطة</option><option>Sensible / حساسة</option><option>Je ne sais pas / ما عارفاش</option></select></Field>
                <Field label={lang === 'fr' ? 'Âge approximatif' : 'العمر التقريبي'}><select name="ageRange" required defaultValue=""><option value="" disabled>—</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></Field>
                <Field label={lang === 'fr' ? 'Ville' : 'المدينة'}><input name="city" required autoComplete="address-level2" /></Field>
                <Field label={lang === 'fr' ? 'Depuis combien de temps ?' : 'من شحال هاد المشكل؟'}><select name="duration" required defaultValue=""><option value="" disabled>—</option><option>Moins d’un mois</option><option>1–6 mois</option><option>6–12 mois</option><option>Plus d’un an</option></select></Field>
              </div>}
              {step === 1 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Problème principal' : 'المشكل الرئيسي'} wide><select name="primaryConcern" value={concern} onChange={e => setConcern(e.target.value)} required>{concerns.map(item => <option value={item.id} key={item.id}>{local(item.label, lang)}</option>)}</select></Field>
                <Field label={lang === 'fr' ? 'Problèmes secondaires' : 'مشاكل أخرى'}><input name="secondaryConcerns" placeholder={lang === 'fr' ? 'Optionnel' : 'اختياري'} /></Field>
                <Field label={lang === 'fr' ? 'Zone concernée' : 'المنطقة'}><select name="area" defaultValue=""><option value="">—</option><option>Visage entier</option><option>Joues</option><option>Front</option><option>Menton</option><option>Contour des yeux</option></select></Field>
                <Field label={lang === 'fr' ? 'Niveau de gêne' : 'مستوى الإزعاج'}><input name="discomfort" type="range" min="1" max="5" defaultValue="3" aria-label="Niveau de gêne" /></Field>
                <Field label={lang === 'fr' ? 'Objectif principal' : 'الهدف الرئيسي'}><input name="goal" required /></Field>
              </div>}
              {step === 2 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Produits utilisés' : 'المنتجات المستعملة'} wide><textarea name="products" rows={3} placeholder={lang === 'fr' ? 'Nettoyant, sérum, crème…' : 'منظف، سيروم، كريم…'} /></Field>
                <Field label={lang === 'fr' ? 'Fréquence de nettoyage' : 'مرات التنظيف'}><select name="cleansing" defaultValue=""><option value="">—</option><option>Une fois / مرة</option><option>Deux fois / جوج مرات</option><option>Plus de deux fois / أكثر</option></select></Field>
                <Field label={lang === 'fr' ? 'Utilisez-vous un SPF ?' : 'كتستعملي SPF؟'}><select name="spf" required defaultValue=""><option value="" disabled>—</option><option>Tous les jours / كل نهار</option><option>Parfois / مرات</option><option>Jamais / أبداً</option></select></Field>
                <Field label={lang === 'fr' ? 'Nouveau produit récent' : 'منتج جديد مؤخراً'}><input name="newProducts" /></Field>
                <Field label={lang === 'fr' ? 'Réactions connues' : 'تفاعلات معروفة'}><input name="reactions" /></Field>
              </div>}
              {step === 3 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Expliquez avec vos mots' : 'شرحي بكلامك'} wide><textarea name="description" rows={6} required placeholder={lang === 'fr' ? 'Ce que vous observez, ce qui vous gêne, ce que vous avez déjà essayé…' : 'شنو كتشوفي، شنو كيقلقك، وشنو جربتي…'} /></Field>
                <Field label={lang === 'fr' ? 'Photo facultative' : 'صورة اختيارية'} wide><span className="file-input"><Upload /><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><b>{lang === 'fr' ? 'JPG, PNG ou WebP • 8 Mo max' : 'JPG, PNG أو WebP • حتى 8MB'}</b></span></Field>
                <label className="check-field field--wide"><input type="checkbox" name="photoConsent" value="yes" /><span>{lang === 'fr' ? 'Si j’ajoute une photo, j’autorise son utilisation uniquement pour examiner cette demande. Aucune publication ou publicité sans autorisation séparée.' : 'إلا زدت صورة، كنوافق تستعمل غير لهاد الطلب. ما كاين لا نشر لا إشهار بلا موافقة أخرى.'}</span></label>
              </div>}
              {step === 4 && <div className="form-grid">
                <Field label={lang === 'fr' ? 'Prénom' : 'الاسم'}><input name="firstName" required autoComplete="given-name" /></Field>
                <Field label={lang === 'fr' ? 'Numéro WhatsApp' : 'رقم واتساب'}><input name="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" /></Field>
                <Field label={lang === 'fr' ? 'Email facultatif' : 'الإيميل اختياري'} wide><input name="email" type="email" autoComplete="email" /></Field>
                <label className="check-field field--wide"><input type="checkbox" name="contactConsent" value="yes" required /><span>{lang === 'fr' ? 'J’accepte d’être contactée au sujet de cette demande de conseils.' : 'كنوافق يتواصلو معايا بخصوص هاد الطلب.'}</span></label>
                <label className="check-field field--wide"><input type="checkbox" name="marketingConsent" value="yes" /><span>{lang === 'fr' ? 'J’accepte séparément de recevoir de futurs contenus et offres. Optionnel.' : 'كنوافق بشكل منفصل نتوصل بمحتوى وعروض مستقبلاً. اختياري.'}</span></label>
              </div>}
            </motion.div>
          </AnimatePresence>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-navigation">
            <button type="button" className="button button--back" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0}>{t('form.back')}</button>
            {step < total - 1
              ? <button type="button" className="button button--primary" onClick={next}>{t('form.next')} {lang === 'fr' ? <ArrowRight /> : <ArrowLeft />}</button>
              : <button type="submit" className="button button--primary" disabled={sending}>{sending ? (lang === 'fr' ? 'Envoi…' : 'الإرسال…') : t('form.submit')} <ArrowUpRight /></button>}
          </div>
        </form>
      </div>
    </Reveal>
  )
}

function Events({ lang }: { lang: Language }) {
  return (
    <Reveal className="events-section" id="lives">
      <div className="section-wrap">
        <SectionIntro eyebrow={lang === 'fr' ? 'Agenda' : 'المواعيد'} title={lang === 'fr' ? 'Les prochains rendez-vous ECOLYN' : 'المواعيد الجاية ديال ECOLYN'} copy={lang === 'fr' ? 'Lives Instagram, sessions questions/réponses et mini-webinaires.' : 'لايفات إنستغرام، أسئلة وأجوبة ولقاءات قصيرة.'} />
        {events.length ? <div>{events.map(event => <article key={event.id}>{lang === 'fr' ? event.titleFr : event.titleAr}</article>)}</div> : (
          <div className="empty-event">
            <CalendarDays />
            <div><p>{lang === 'fr' ? 'Agenda en préparation' : 'الأجندة كتوجد'}</p><h3>{lang === 'fr' ? 'Aucun live programmé pour le moment.' : 'ما كاين حتى لايف مبرمج دابا.'}</h3><span>{lang === 'fr' ? 'Laissez votre numéro pour recevoir la prochaine invitation.' : 'خلي الرقم باش توصلك الدعوة الجاية.'}</span></div>
            <a href="#formulaire">{lang === 'fr' ? 'Me prévenir' : 'خبروني'} <ArrowDown /></a>
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
          <h2>{lang === 'fr' ? 'Avant de nous parler de votre peau' : 'قبل ما تحكي لينا على بشرتك'}</h2>
          <p>{lang === 'fr' ? 'Des réponses claires sur le service, la confidentialité et les limites des conseils.' : 'أجوبة واضحة على الخدمة، الخصوصية وحدود النصائح.'}</p>
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

function Footer({ lang, openLegal }: { lang: Language; openLegal: (type: 'privacy' | 'terms') => void }) {
  const { i18n } = useTranslation()
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand"><img src="./assets/brand/logo.webp" alt="ECOLYN" /><p>{lang === 'fr' ? 'Une plateforme marocaine pour mieux comprendre sa peau, simplifier sa routine et recevoir des conseils gratuits.' : 'منصة مغربية باش تفهمي بشرتك، تبسطي الروتين وتستافدي من نصائح مجانية.'}</p><span>{lang === 'fr' ? 'Conseillère experte en soins et routines du visage' : 'خبيرة في روتين والعناية ببشرة الوجه'}</span></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Explorer' : 'تصفحي'}</h3><a href="#conseils">{lang === 'fr' ? 'Conseils' : 'النصائح'}</a><a href="#cas">{lang === 'fr' ? 'Cas pratiques' : 'حالات واقعية'}</a><a href="#experiences">{lang === 'fr' ? 'Expériences' : 'التجارب'}</a><a href="#lives">{lang === 'fr' ? 'Lives' : 'اللقاءات'}</a></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Agir' : 'تواصلي'}</h3><a href="#formulaire">{lang === 'fr' ? 'Demander des conseils' : 'طلب نصائح'}</a><a href="./pack/">{lang === 'fr' ? 'Routine ECOLYN' : 'روتين ECOLYN'} <ArrowUpRight /></a><a href="mailto:contact@ecolyn.com">contact@ecolyn.com</a></div>
        <div className="footer-links"><h3>{lang === 'fr' ? 'Confiance' : 'الثقة'}</h3><button onClick={() => openLegal('privacy')}>{lang === 'fr' ? 'Politique de confidentialité' : 'سياسة الخصوصية'}</button><button onClick={() => openLegal('terms')}>{lang === 'fr' ? 'Conditions' : 'الشروط'}</button><button onClick={() => i18n.changeLanguage(lang === 'fr' ? 'ar' : 'fr')}>{lang === 'fr' ? 'العربية' : 'Français'} <Languages /></button></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} ECOLYN</span><p>{lang === 'fr' ? 'Les conseils sont informatifs et ne remplacent pas l’avis d’un dermatologue.' : 'النصائح توعوية وما كتعوضش رأي طبيب الجلد.'}</p><a href="#accueil"><ArrowDown /> {lang === 'fr' ? 'Retour en haut' : 'نرجعو للفوق'}</a></div>
    </footer>
  )
}

function ArticleDrawer({ article, lang, close, next }: { article: Article; lang: Language; close: () => void; next: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [close])
  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.currentTarget === event.target && close()}>
      <motion.article className="article-drawer" initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
        <div className="drawer-top"><div><span>{article.category}</span><p><Clock3 /> {article.time} {lang === 'fr' ? 'min de lecture' : 'دقائق للقراءة'}</p></div><button onClick={close} aria-label="Fermer"><X /></button></div>
        <div className="drawer-hero"><p>ECOLYN / CONSEILS</p><h2>{local(article.title, lang)}</h2><b>{local(article.summary, lang)}</b></div>
        <div className="article-body">
          <p className="article-intro">{local(article.introduction, lang)}</p>
          <h3>{lang === 'fr' ? 'Ce qu’il faut comprendre' : 'شنو خاص نفهمو'}</h3><p>{local(article.explanation, lang)}</p>
          <h3>{lang === 'fr' ? 'Erreurs fréquentes' : 'أخطاء متكررة'}</h3><ul>{article.mistakes[lang].map(item => <li key={item}><X />{item}</li>)}</ul>
          <h3>{lang === 'fr' ? 'Gestes utiles' : 'خطوات مفيدة'}</h3><ul className="positive">{article.gestures[lang].map(item => <li key={item}><Check />{item}</li>)}</ul>
          <div className="watch-box"><Eye /><div><h3>{lang === 'fr' ? 'Point à surveiller' : 'نقطة خاص نراقبوها'}</h3><p>{local(article.watch, lang)}</p></div></div>
          <div className="professional-box"><ShieldCheck /><p>{local(article.professional, lang)}</p></div>
          <a href="#formulaire" className="button button--primary" onClick={close}>{lang === 'fr' ? 'Demander des conseils personnalisés' : 'نطلب نصائح مناسبة'} <MessageCircle /></a>
        </div>
        <button className="drawer-next" onClick={next}>{lang === 'fr' ? 'Article suivant' : 'المقال التالي'} <ArrowRight /></button>
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
        <h2>{privacy ? (lang === 'fr' ? 'Vos informations restent les vôtres' : 'المعلومات ديالك كتبقى ديالك') : (lang === 'fr' ? 'Cadre du service de conseils' : 'إطار خدمة النصائح')}</h2>
        {privacy ? <>
          <p>{lang === 'fr' ? 'Les informations servent uniquement à examiner votre demande, vous contacter et, si vous y consentez séparément, vous envoyer de futurs contenus.' : 'المعلومات كتستعمل غير لمراجعة الطلب، التواصل معاك، وإلا وافقتي بوحدها، إرسال محتوى مستقبلي.'}</p>
          <h3>{lang === 'fr' ? 'Photos facultatives' : 'الصور اختيارية'}</h3><p>{lang === 'fr' ? 'Aucune photo n’est obligatoire, publiée ou utilisée dans une publicité sans autorisation séparée et explicite.' : 'حتى صورة ما إجبارية، وما تنشرش وما تستعملش فالإشهار بلا موافقة واضحة بوحدها.'}</p>
          <h3>{lang === 'fr' ? 'Stockage' : 'التخزين'}</h3><p>{lang === 'fr' ? 'En production, configurez un endpoint sécurisé dans config.js. Ne stockez jamais les leads dans un dépôt public.' : 'فالإطلاق، خاص تضبطو endpoint آمن فـ config.js. عمر البيانات تتخزن فمستودع عمومي.'}</p>
          <h3>{lang === 'fr' ? 'Vos droits' : 'الحقوق ديالك'}</h3><p>{lang === 'fr' ? 'Vous pouvez demander l’accès, la correction ou la suppression de vos données à contact@ecolyn.com.' : 'تقدري تطلبي الاطلاع، التصحيح أو الحذف عبر contact@ecolyn.com.'}</p>
        </> : <>
          <p>{lang === 'fr' ? 'Le service fournit des informations de routine à partir des éléments déclarés. Il ne constitue ni un diagnostic ni une consultation médicale.' : 'الخدمة كتقدم معلومات للروتين حسب المعطيات اللي قلتي. ماشي تشخيص ولا استشارة طبية.'}</p>
          <h3>{lang === 'fr' ? 'Limites' : 'الحدود'}</h3><p>{lang === 'fr' ? 'Les résultats et la tolérance varient selon les personnes. Aucun résultat n’est garanti.' : 'النتائج والتحمل كيختلفو من شخص لآخر. ما كاين حتى ضمان للنتيجة.'}</p>
          <h3>{lang === 'fr' ? 'Urgence et persistance' : 'الحالات القوية أو المستمرة'}</h3><p>{lang === 'fr' ? 'Toute situation sévère, inhabituelle ou persistante doit être présentée à un dermatologue.' : 'أي حالة قوية، غريبة أو مستمرة خاصها طبيب الجلد.'}</p>
        </>}
      </motion.article>
    </motion.div>
  )
}

export default function App() {
  const lang = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedConcern, setSelectedConcern] = useState('taches')
  const [formConcern, setFormConcern] = useState('taches')
  const [article, setArticle] = useState<Article | null>(null)
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: .001 })
  const reduced = useReducedMotion()

  useEffect(() => initializeTracking(), [])

  const openArticle = (nextArticle: Article) => {
    setArticle(nextArticle)
    track('article_open', { article_slug: nextArticle.slug, article_category: nextArticle.category })
  }
  const nextArticle = () => {
    if (!article) return
    const index = articles.findIndex(item => item.slug === article.slug)
    const next = articles[(index + 1) % articles.length]
    setArticle(next)
    track('article_open', { article_slug: next.slug, article_category: next.category, source: 'drawer_next' })
  }
  const describe = (id: string) => {
    const mapped = concerns.find(item => item.id === id)?.id
      || (id === 'grasse-tire' ? 'grasse' : id === 'spf-oublie' ? 'spf' : id === 'routine-change' ? 'routine' : id)
    setFormConcern(mapped)
    setTimeout(() => document.getElementById('formulaire')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 40)
  }
  const selectHeroConcern = (id: string) => {
    setSelectedConcern(id)
    setTimeout(() => document.getElementById('besoins')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 40)
    track('select_skin_concern', { skin_concern: id, source: 'hero' })
  }

  const currentConcernLabel = useMemo(() => local(concerns.find(item => item.id === formConcern)?.short || concerns[0].short, lang), [formConcern, lang])

  return (
    <>
      <motion.div className="page-progress" style={{ scaleX: progress }} />
      <Header lang={lang} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero lang={lang} onConcern={selectHeroConcern} />
        <ConcernExplorer lang={lang} selected={selectedConcern} setSelected={setSelectedConcern} describe={describe} />
        <AdviceRail lang={lang} openArticle={openArticle} />
        <Cases lang={lang} describe={describe} />
        <Proofs lang={lang} />
        <Experiences lang={lang} />
        <Expert lang={lang} />
        <Library lang={lang} openArticle={openArticle} />
        <HowItWorks lang={lang} />
        <LeadForm lang={lang} concern={formConcern} setConcern={setFormConcern} />
        <Events lang={lang} />
        <FAQ lang={lang} />
      </main>
      <Footer lang={lang} openLegal={setLegal} />
      <a className="sticky-advice" href="#formulaire" onClick={() => track('form_start', { source: 'sticky' })}>
        <span><MessageCircle /></span><b>{currentConcernLabel}</b><em>{lang === 'fr' ? 'Recevoir mes conseils' : 'نستافد من النصائح'}</em><ArrowUpRight />
      </a>
      <AnimatePresence>
        {article && <ArticleDrawer article={article} lang={lang} close={() => setArticle(null)} next={nextArticle} />}
        {legal && <LegalModal type={legal} lang={lang} close={() => setLegal(null)} />}
      </AnimatePresence>
    </>
  )
}
