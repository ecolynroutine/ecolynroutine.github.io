import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown, ArrowUpRight, AudioLines, BookOpen, Check, ChevronDown,
  HeartHandshake, MessageCircle, Pause, Play, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import type { Article, Language, Localized, Testimonial } from '../types'
import { articles } from '../data/articles'
import { testimonials } from '../data/testimonials'
import { customerStories } from '../data/stories'
import { siteConfig } from '../data/site'
import {
  concernOptions, lifestyleTopics, skinProfiles,
  type LifestyleId, type SkinProfileId,
} from '../data/discovery'
import { recommendAdvice } from '../data/advice/engine'
import type { AdviceItem, ComplexionId } from '../data/advice'
import { track } from '../lib/tracking'

const whatsappGroupHref = 'https://chat.whatsapp.com/IbrwixzaySqLYawg3D7WiP?s=cl&p=a&ilr=1'

function local(value: Localized, lang: Language) {
  return value[lang]
}

function optionLabel<T extends string>(items: { id: T; label: Localized }[], id: T, lang: Language) {
  return items.find(item => item.id === id)?.label[lang] || id
}

function DiscoveryHero({ lang, start }: { lang: Language; start: () => void }) {
  const steps = lang === 'fr'
    ? [['01', 'Votre type de peau'], ['02', 'Votre préoccupation'], ['03', 'Votre contexte quotidien']]
    : [['01', 'نوع بشرتك'], ['02', 'المشكلة الأساسية'], ['03', 'سياقك اليومي']]
  return (
    <section className="journey-hero" id="accueil">
      <div className="journey-hero__glow" />
      <div className="journey-wrap journey-hero__grid">
        <div className="journey-hero__copy">
          <p className="journey-kicker"><Sparkles /> ECOLYN <span>{lang === 'fr' ? 'Conseils personnalisés' : 'نصائح مخصصة'}</span></p>
          <h1>{lang === 'fr' ? <>Comprenez mieux votre peau, <em>en 3 choix.</em></> : <>افهمي بشرتك بشكل أفضل <em>من خلال 3 اختيارات.</em></>}</h1>
          <p className="journey-hero__lead">{lang === 'fr'
            ? 'Faites 3 choix simples sur votre peau et recevez immédiatement des conseils adaptés à votre situation.'
            : 'اختاري 3 أشياء بسيطة عن بشرتك، وسنعرض لك فوراً نصائح وخطوات تناسب حالتك.'}</p>
          <p className="journey-hero__sub">{lang === 'fr'
            ? 'Si vous souhaitez aller plus loin, vous pourrez ensuite expliquer votre situation à Hanane dans un formulaire très court afin qu’elle puisse vous contacter sur WhatsApp.'
            : 'وإذا أردتِ مساعدة أكثر تخصيصاً، يمكنك بعد ذلك شرح حالتك لحنان عبر نموذج قصير، وستتواصل معك على WhatsApp.'}</p>
          <button className="journey-primary" type="button" onClick={start}>{lang === 'fr' ? 'Commencer mes 3 choix' : 'ابدئي الاختيارات الثلاثة'} <ArrowDown /></button>
          <span className="journey-free"><ShieldCheck /> {lang === 'fr' ? '100% gratuit • Sans obligation d’achat' : 'نصائح مجانية 100% • دون إلزام بالشراء'}</span>
        </div>
        <div className="journey-hero__steps" aria-label={lang === 'fr' ? 'Les trois étapes' : 'الخطوات الثلاث'}>
          <div className="journey-hero__cardtop"><span>{lang === 'fr' ? 'Votre lecture personnalisée' : 'قراءتك المخصصة'}</span><Sparkles /></div>
          {steps.map(([number, label], index) => <div className="journey-hero__step" key={number}><b>{number}</b><span>{label}</span>{index < 2 && <i />}</div>)}
          <div className="journey-hero__promise"><HeartHandshake /><span><b>{lang === 'fr' ? 'Immédiat et prudent' : 'فوري وحذر'}</b><small>{lang === 'fr' ? 'Des gestes concrets, avec leur source.' : 'خطوات عملية مع مصادرها.'}</small></span></div>
        </div>
      </div>
    </section>
  )
}

function ChoiceButton<T extends string>({ id, label, hint, active, choose }: {
  id: T; label: string; hint: string; active: boolean; choose: (id: T) => void
}) {
  return <button type="button" className={`journey-choice${active ? ' is-active' : ''}`} onClick={() => choose(id)} aria-pressed={active}>
    <i>{active ? <Check /> : <span />}</i><b>{label}</b><small>{hint}</small>
  </button>
}

interface QuestionnaireProps {
  lang: Language
  profile: SkinProfileId
  concern: string
  lifestyle: LifestyleId | ''
  complexion: ComplexionId
  setProfile: (id: SkinProfileId) => void
  setConcern: (id: string) => void
  setLifestyle: (id: LifestyleId) => void
  setComplexion: (id: ComplexionId) => void
  onFinished: () => void
}

function Questionnaire({ lang, profile, concern, lifestyle, complexion, setProfile, setConcern, setLifestyle, setComplexion, onFinished }: QuestionnaireProps) {
  const [step, setStep] = useState(1)
  const [chosenProfile, setChosenProfile] = useState(false)
  const [chosenConcern, setChosenConcern] = useState(false)
  const reduced = useReducedMotion()
  const advance = (next: number) => window.setTimeout(() => setStep(next), reduced ? 0 : 260)
  const progress = `${step * 33.333}%`
  const steps = [
    { eyebrow: { fr: 'Type de peau', ar: 'نوع البشرة' }, title: { fr: 'Qu’est-ce qui vous ressemble le plus ?', ar: 'ما الوصف الأقرب إلى بشرتك؟' } },
    { eyebrow: { fr: 'Préoccupation principale', ar: 'المشكلة الأساسية' }, title: { fr: 'Qu’aimeriez-vous comprendre d’abord ?', ar: 'ما الذي تريدين فهمه أولاً؟' } },
    { eyebrow: { fr: 'Contexte quotidien', ar: 'السياق اليومي' }, title: { fr: 'Quel élément ressemble le plus à votre quotidien ?', ar: 'ما العنصر الأقرب إلى حياتك اليومية؟' } },
  ]
  const chooseProfile = (id: SkinProfileId) => {
    setProfile(id); setChosenProfile(true)
    track('select_skin_type', { skin_type_id: id, step: 1 })
    advance(2)
  }
  const chooseConcern = (id: string) => {
    setConcern(id); setChosenConcern(true)
    track('select_skin_concern', { concern_id: id, step: 2 })
    advance(3)
  }
  const chooseLifestyle = (id: LifestyleId) => {
    setLifestyle(id)
    track('select_lifestyle_context', { context_id: id, step: 3 })
    window.setTimeout(onFinished, reduced ? 0 : 320)
  }
  const chooseComplexion = (id: ComplexionId) => {
    setComplexion(id)
    track('select_complexion', { complexion_id: id })
  }

  return <section className="journey-questionnaire" id="personnalisation">
    <div className="journey-wrap journey-questionnaire__shell">
      <div className="journey-progress"><div><span style={{ width: progress }} /></div><p><b>{step}/3</b>{lang === 'fr' ? 'Votre parcours' : 'مسارك'}</p></div>
      <AnimatePresence mode="wait">
        <motion.div className="journey-step" key={step} initial={{ opacity: 0, x: lang === 'ar' ? -18 : 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === 'ar' ? 12 : -12 }} transition={{ duration: reduced ? 0 : .28 }}>
          <div className="journey-step__head"><span>0{step}</span><div><p>{local(steps[step - 1].eyebrow, lang)}</p><h2>{local(steps[step - 1].title, lang)}</h2></div></div>
          <div className={`journey-choices journey-choices--${step}`}>
            {step === 1 && skinProfiles.map(item => <ChoiceButton key={item.id} id={item.id} label={local(item.label, lang)} hint={local(item.hint, lang)} active={chosenProfile && profile === item.id} choose={chooseProfile} />)}
            {step === 2 && concernOptions.map(item => <ChoiceButton key={item.id} id={item.id} label={local(item.label, lang)} hint={local(item.hint, lang)} active={chosenConcern && concern === item.id} choose={chooseConcern} />)}
            {step === 3 && lifestyleTopics.map(item => <ChoiceButton key={item.id} id={item.id} label={local(item.label, lang)} hint={local(item.hint, lang)} active={lifestyle === item.id} choose={chooseLifestyle} />)}
          </div>
        </motion.div>
      </AnimatePresence>
      {chosenProfile && <div className="complexion-optional">
        <div><b>{lang === 'fr' ? 'Votre peau est-elle mate à foncée ?' : 'هل بشرتك متوسطة إلى داكنة؟'}</b><small>{lang === 'fr' ? 'Facultatif — ce n’est pas un type de peau.' : 'اختياري — هذا ليس نوع البشرة.'}</small></div>
        <div>{([
          ['medium-dark', lang === 'fr' ? 'Oui' : 'نعم'],
          ['not-medium-dark', lang === 'fr' ? 'Non' : 'لا'],
          ['unspecified', lang === 'fr' ? 'Ne pas préciser' : 'أفضل عدم التحديد'],
        ] as [ComplexionId, string][]).map(([id, label]) => <button type="button" className={complexion === id ? 'is-active' : ''} onClick={() => chooseComplexion(id)} key={id}>{label}</button>)}</div>
      </div>}
      {step > 1 && <button className="journey-back" type="button" onClick={() => setStep(step - 1)}>{lang === 'fr' ? '← Modifier le choix précédent' : 'تعديل الاختيار السابق →'}</button>}
    </div>
  </section>
}

function EvidenceBadge({ item, lang }: { item: AdviceItem; lang: Language }) {
  const label = item.evidenceLevel === 'established'
    ? (lang === 'fr' ? 'Repère bien établi' : 'معلومة موثوقة')
    : item.evidenceLevel === 'encouraging'
      ? (lang === 'fr' ? 'Données encourageantes' : 'معطيات مشجعة')
      : (lang === 'fr' ? 'Association possible' : 'ارتباط محتمل')
  return <span className={`evidence-badge evidence-badge--${item.evidenceLevel}`}>{label}</span>
}

function AdviceResult({ lang, profile, concern, lifestyle, complexion }: {
  lang: Language; profile: SkinProfileId; concern: string; lifestyle: LifestyleId | ''; complexion: ComplexionId
}) {
  const items = useMemo(() => recommendAdvice({ profile, concern, context: lifestyle, complexion }), [profile, concern, lifestyle, complexion])
  const viewed = useRef('')
  useEffect(() => {
    const key = `${profile}|${concern}|${lifestyle}|${complexion}`
    if (viewed.current === key) return
    viewed.current = key
    track('personalized_advice_view', { skin_type_id: profile, concern_id: concern, context_id: lifestyle || 'none', advice_count: items.length })
  }, [profile, concern, lifestyle, complexion, items.length])
  const selection = [
    optionLabel(skinProfiles, profile, lang),
    optionLabel(concernOptions, concern, lang),
    lifestyle ? optionLabel(lifestyleTopics, lifestyle, lang) : '',
  ].filter(Boolean).join(' + ')
  return <motion.section className="advice-result" id="conseils" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .48 }}>
    <div className="journey-wrap">
      <div className="advice-result__hero">
        <span className="advice-result__star"><Sparkles /></span>
        <div><p>{lang === 'fr' ? 'Votre résultat personnalisé' : 'نتيجتك المخصصة'}</p><h2>{lang === 'fr' ? 'Voici les conseils les plus adaptés à vos choix' : 'هذه النصائح هي الأقرب إلى اختياراتك'}</h2><span>{lang === 'fr' ? 'Vous avez sélectionné :' : 'لقد اخترتِ:'} <b>{selection}</b></span></div>
      </div>
      <div className="advice-result__split">
        <section className="advice-do"><h3><Check /> {lang === 'fr' ? 'CE QUE VOUS POUVEZ ESSAYER' : 'ما يمكنك تجربته'}</h3>{items.map(item => <article key={`do-${item.id}`}><b>{local(item.title, lang)}</b><p>{local(item.doItem, lang)}</p></article>)}</section>
        <section className="advice-avoid"><h3><X /> {lang === 'fr' ? 'CE QU’IL VAUT MIEUX ÉVITER' : 'ما يُفضّل تجنبه'}</h3>{items.map(item => <article key={`avoid-${item.id}`}><b>{local(item.title, lang)}</b><p>{local(item.avoidItem, lang)}</p></article>)}</section>
      </div>
      <div className="advice-explanations">
        <div className="advice-explanations__head"><p>{lang === 'fr' ? 'Comprendre le pourquoi' : 'افهمي السبب'}</p><h3>{lang === 'fr' ? 'Chaque conseil garde sa nuance et sa source.' : 'لكل نصيحة تفسيرها ومصدرها.'}</h3></div>
        {items.map(item => <details key={item.id} onToggle={event => event.currentTarget.open && track('advice_expand', { advice_id: item.id })}>
          <summary><span><EvidenceBadge item={item} lang={lang} /><b>{local(item.title, lang)}</b></span><ChevronDown /></summary>
          <div><p>{local(item.explanation, lang)}</p>{item.safety && <p className="advice-safety"><ShieldCheck /> {local(item.safety, lang)}</p>}<a href={item.source.url} target="_blank" rel="noreferrer" onClick={() => track('source_open', { advice_id: item.id, source_id: item.source.id })}><BookOpen /><span><b>{item.source.organisation}</b><small>{item.source.title} — {local(item.source.evidenceNote, lang)}</small></span><ArrowUpRight /></a></div>
        </details>)}
      </div>
      <div className="advice-disclaimer"><ShieldCheck /><p><b>{lang === 'fr' ? 'Information générale, pas un diagnostic.' : 'معلومات عامة وليست تشخيصاً.'}</b><span>{lang === 'fr' ? 'Une douleur importante, des lésions profondes, une réaction étendue ou une situation persistante doivent être présentées à un professionnel de santé.' : 'الألم الشديد أو الحبوب العميقة أو التفاعل الواسع أو الحالة المستمرة تستدعي استشارة مختص صحي.'}</span></p></div>
      <a className="advice-to-form" href="#formulaire" onClick={() => track('form_start', { source: 'personalized_result', concern_id: concern, skin_type_id: profile })}><MessageCircle /><span><b>{lang === 'fr' ? 'Vous voulez des conseils plus personnalisés ?' : 'هل تريدين نصائح أكثر تخصيصاً؟'}</b><small>{lang === 'fr' ? 'Expliquez votre situation à Hanane dans le formulaire très court juste en dessous.' : 'اشرحي حالتك لحنان في النموذج القصير أدناه.'}</small></span><ArrowDown /></a>
    </div>
  </motion.section>
}

export interface DiscoveryExperienceProps {
  lang: Language
  profile: SkinProfileId
  concern: string
  lifestyle: LifestyleId | ''
  complexion: ComplexionId
  setProfile: (id: SkinProfileId) => void
  setConcern: (id: string) => void
  setLifestyle: (id: LifestyleId) => void
  setComplexion: (id: ComplexionId) => void
  onComplete: () => void
}

export default function DiscoveryExperience(props: DiscoveryExperienceProps) {
  const [finished, setFinished] = useState(false)
  const reduced = useReducedMotion()
  const start = () => document.getElementById('personnalisation')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  const finish = () => {
    setFinished(true)
    props.onComplete()
    window.setTimeout(() => document.getElementById('conseils')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), reduced ? 0 : 80)
  }
  return <>
    <DiscoveryHero lang={props.lang} start={start} />
    <Questionnaire lang={props.lang} profile={props.profile} concern={props.concern} lifestyle={props.lifestyle} complexion={props.complexion} setProfile={props.setProfile} setConcern={props.setConcern} setLifestyle={props.setLifestyle} setComplexion={props.setComplexion} onFinished={finish} />
    {finished && <AdviceResult lang={props.lang} profile={props.profile} concern={props.concern} lifestyle={props.lifestyle} complexion={props.complexion} />}
  </>
}

function StoryModal({ item, lang, close, goToForm }: { item: Testimonial; lang: Language; close: () => void; goToForm: () => void }) {
  const content = customerStories.find(story => story.id === item.id)!
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const tracked = useRef(false)
  const toggle = () => audio.current?.paused ? void audio.current.play() : audio.current?.pause()
  return <motion.div className="narrative-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.currentTarget === event.target && close()}>
    <motion.article initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
      <button className="narrative-close" type="button" onClick={close} aria-label={lang === 'fr' ? 'Fermer' : 'إغلاق'}><X /></button>
      <div className="narrative-photo"><img src={item.image} alt={item.name} width="720" height="900" /><span>{item.name}</span></div>
      <div className="narrative-copy">
        <p className="narrative-kicker">{lang === 'fr' ? 'Une histoire ECOLYN • 1 min de lecture' : 'قصة من ECOLYN • دقيقة واحدة للقراءة'}</p>
        <h2 dir="rtl">{content.title}</h2>
        <p className="narrative-hook">{local(content.hook, lang)}</p>
        <div className="narrative-player"><button type="button" onClick={toggle}>{playing ? <Pause /> : <Play />}</button><span><b>{lang === 'fr' ? 'Écouter son audio original' : 'استمعي إلى تسجيلها الأصلي'}</b><small>ECOLYN • {item.name}</small></span><AudioLines /><audio ref={audio} src={item.audio} preload="metadata" onPlay={() => { setPlaying(true); if (!tracked.current) { tracked.current = true; track('story_audio_play', { story_id: String(item.id) }) } }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} /></div>
        <div className="narrative-story" dir="rtl">{content.narrative.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="narrative-summary">
          {[
            [lang === 'fr' ? 'Le problème' : 'المشكلة', content.problem],
            [lang === 'fr' ? 'Ce qu’elle a découvert' : 'ما الذي اكتشفته', content.discovery],
            [lang === 'fr' ? 'Ce qu’elle a changé' : 'ما الذي غيّرته', content.change],
            [lang === 'fr' ? 'Ce qu’elle a appris' : 'ما الذي تعلمته', content.learned],
          ].map(([label, value]) => <div key={String(label)}><b>{String(label)}</b><p>{local(value as Localized, lang)}</p></div>)}
        </div>
        <button className="journey-primary" type="button" onClick={goToForm}>{lang === 'fr' ? 'Votre situation ressemble à la sienne ? Expliquez-la à Hanane.' : 'هل تشبه حالتك هذه التجربة؟ اشرحي حالتك لحنان'} <MessageCircle /></button>
      </div>
    </motion.article>
  </motion.div>
}

function ComplementaryArticles({ lang, openArticle }: { lang: Language; openArticle: (article: Article) => void }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? articles : articles.slice(0, 4)
  return <section className="after-articles" id="articles">
    <div className="journey-wrap">
      <div className="after-heading"><p>{lang === 'fr' ? 'Pour approfondir' : 'للتعمق أكثر'}</p><h2>{lang === 'fr' ? 'Vous voulez aller plus loin ?' : 'هل تريدين معرفة المزيد؟'}</h2><span>{lang === 'fr' ? 'Ces articles expliquent certains points avec plus de détail.' : 'تشرح هذه المقالات بعض النقاط بتفصيل أكبر.'}</span></div>
      <div className="after-articles__grid">{shown.map((article, index) => <button type="button" key={article.slug} onClick={() => openArticle(article)}><span><b>{String(index + 1).padStart(2, '0')}</b><small>{article.time} min</small></span><em>{local(article.category, lang)}</em><strong>{local(article.title, lang)}</strong><p>{local(article.summary, lang)}</p><i>{lang === 'fr' ? 'Lire l’article' : 'قراءة المقال'} <ArrowUpRight /></i></button>)}</div>
      {articles.length > 4 && <button className="after-more" type="button" onClick={() => setExpanded(value => !value)}>{expanded ? (lang === 'fr' ? 'Afficher moins' : 'عرض أقل') : (lang === 'fr' ? 'Afficher plus' : 'عرض المزيد')} <ChevronDown /></button>}
    </div>
  </section>
}

function StorySection({ lang, goToForm }: { lang: Language; goToForm: () => void }) {
  const [openStory, setOpenStory] = useState<Testimonial | null>(null)
  const open = (item: Testimonial) => { setOpenStory(item); document.body.classList.add('modal-open'); track('story_open', { story_id: String(item.id) }) }
  const close = () => { setOpenStory(null); document.body.classList.remove('modal-open') }
  return <section className="after-stories" id="histoires">
    <div className="journey-wrap">
      <div className="after-heading"><p>{lang === 'fr' ? 'Six voix, six situations' : 'ست تجارب حقيقية'}</p><h2>{lang === 'fr' ? 'Leur histoire va plus loin qu’une photo.' : 'لكل واحدة قصة كاملة.'}</h2><span>{lang === 'fr' ? 'Les photos, identités et audios d’origine sont conservés.' : 'تم الاحتفاظ بالصور والأسماء والتسجيلات الصوتية الأصلية.'}</span></div>
      <div className="story-grid">{testimonials.map(item => <article key={item.id}><div><img src={item.image} alt={item.name} width="520" height="650" loading="lazy" /><button type="button" onClick={() => open(item)} aria-label={`${lang === 'fr' ? 'Lire l’histoire de' : 'قراءة قصة'} ${item.name}`}><Play /></button></div><span><b>{item.name}</b><small>{lang === 'fr' ? '1 min de lecture + audio' : 'دقيقة للقراءة + تسجيل صوتي'}</small></span><button className="story-read" type="button" onClick={() => open(item)}>{lang === 'fr' ? 'Lire son histoire' : 'اقرئي قصتها كاملة'} <ArrowUpRight /></button></article>)}</div>
    </div>
    <AnimatePresence>{openStory && <StoryModal item={openStory} lang={lang} close={close} goToForm={() => { close(); goToForm() }} />}</AnimatePresence>
  </section>
}

export function DiscoveryAfterForm({ lang, openArticle }: { lang: Language; openArticle: (article: Article) => void }) {
  const reduced = useReducedMotion()
  const goToForm = () => { track('form_start', { source: 'story_or_expert' }); document.getElementById('formulaire')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }) }
  return <>
    <ComplementaryArticles lang={lang} openArticle={openArticle} />
    <StorySection lang={lang} goToForm={goToForm} />
    <section className="after-hanane" id="hanane"><div className="journey-wrap after-hanane__shell"><div className="after-hanane__photo"><img src={siteConfig.assets.expertProfile} alt="Hanane — ECOLYN" width="900" height="1120" loading="lazy" /><span>ECOLYN</span></div><div className="after-hanane__copy"><p>{lang === 'fr' ? 'La personne derrière les conseils' : 'الشخص الذي يقف خلف النصائح'}</p><h2>{lang === 'fr' ? <>Hanane commence par <em>vous écouter.</em></> : <>حنان تبدأ <em>بالاستماع إليك.</em></>}</h2><span>{lang === 'fr' ? 'Elle vous aide à clarifier vos priorités et à éviter les changements inutiles, sans poser de diagnostic en ligne.' : 'تساعدك على توضيح أولوياتك وتجنب التغييرات غير الضرورية، من دون تشخيص عبر الإنترنت.'}</span><div><b><Check /> {lang === 'fr' ? 'Écouter la situation réelle' : 'فهم الوضع الحقيقي'}</b><b><Check /> {lang === 'fr' ? 'Simplifier les priorités' : 'تبسيط الأولويات'}</b><b><Check /> {lang === 'fr' ? 'Orienter avec prudence' : 'التوجيه بحذر'}</b></div><button className="journey-primary" type="button" onClick={goToForm}>{lang === 'fr' ? 'Expliquer ma situation à Hanane' : 'اشرحي حالتك لحنان'} <MessageCircle /></button></div></div></section>
    <section className="after-whatsapp"><div className="journey-wrap"><div><MessageCircle /><span><small>{lang === 'fr' ? 'Conseils courts et rappels utiles' : 'نصائح قصيرة وتذكيرات مفيدة'}</small><b>{lang === 'fr' ? 'Rejoignez le groupe ECOLYN sur WhatsApp' : 'انضمي إلى مجموعة ECOLYN على WhatsApp'}</b></span></div><a href={whatsappGroupHref} target="_blank" rel="noreferrer" onClick={() => track('join_whatsapp_group', { source: 'homepage_invitation' })}>{lang === 'fr' ? 'Rejoindre le groupe' : 'الانضمام إلى المجموعة'} <ArrowUpRight /></a></div></section>
  </>
}
