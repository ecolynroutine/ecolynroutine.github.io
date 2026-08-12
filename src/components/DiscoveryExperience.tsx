import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, BookOpen,
  Check, ChevronRight, CircleHelp, Clock3, HeartHandshake, MessageCircle,
  MoonStar, Pause, Play, ShieldCheck, Sparkles, Sun, Utensils, X,
} from 'lucide-react'
import type { Language, Localized, Testimonial } from '../types'
import { testimonials } from '../data/testimonials'
import { siteConfig } from '../data/site'
import {
  concernOptions,
  discoveryCards,
  lifestyleTopics,
  skinProfiles,
  type DiscoveryCard,
  type LifestyleId,
  type SkinProfileId,
} from '../data/discovery'
import { track } from '../lib/tracking'

const whatsappGroupHref = 'https://chat.whatsapp.com/IbrwixzaySqLYawg3D7WiP?s=cl&p=a&ilr=1'

function local(value: Localized, lang: Language) {
  return value[lang]
}

const formatLabels: Record<DiscoveryCard['format'], Localized> = {
  fact: { fr: 'À savoir', ar: 'معلومة مهمة' },
  myth: { fr: 'Mythe ou nuance', ar: 'فكرة أو توضيح' },
  gesture: { fr: 'À essayer', ar: 'جربي هادي' },
  quiz: { fr: 'Mini test', ar: 'تجربة صغيرة' },
  warning: { fr: 'Repère prudent', ar: 'معلومة بحذر' },
}

function DoorIcon({ type }: { type: 'profile' | 'lifestyle' }) {
  return type === 'profile' ? <Sparkles /> : <MoonStar />
}

function useRailNavigation(count: number) {
  const rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const node = rail.current
    if (!node) return
    const update = () => {
      const railBox = node.getBoundingClientRect()
      const center = railBox.left + railBox.width / 2
      const children = Array.from(node.children) as HTMLElement[]
      if (!children.length) return
      const closest = children.reduce((best, child, childIndex) => {
        const box = child.getBoundingClientRect()
        const distance = Math.abs((box.left + box.width / 2) - center)
        return distance < best.distance ? { index: childIndex, distance } : best
      }, { index: 0, distance: Number.POSITIVE_INFINITY })
      setIndex(closest.index)
    }
    update()
    node.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      node.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [count])

  const goTo = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(nextIndex, count - 1))
    const child = rail.current?.children.item(safeIndex) as HTMLElement | null
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  return { rail, index, goTo }
}

function MobileCarouselNavigation({ lang, index, count, goTo, label }: {
  lang: Language
  index: number
  count: number
  goTo: (index: number) => void
  label: string
}) {
  return (
    <div className="mobile-carousel-nav" aria-label={label}>
      <button className="mobile-carousel-arrow mobile-carousel-arrow--prev" type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label={lang === 'fr' ? 'Élément précédent' : 'العنصر السابق'}>
        {lang === 'fr' ? <ArrowLeft /> : <ArrowRight />}
      </button>
      <button className="mobile-carousel-arrow mobile-carousel-arrow--next" type="button" onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label={lang === 'fr' ? 'Élément suivant' : 'العنصر التالي'}>
        {lang === 'fr' ? <ArrowRight /> : <ArrowLeft />}
      </button>
      <div className="mobile-carousel-dots">
        {Array.from({ length: count }, (_, dotIndex) => (
          <button key={dotIndex} type="button" className={dotIndex === index ? 'is-active' : ''} onClick={() => goTo(dotIndex)} aria-label={`${lang === 'fr' ? 'Afficher l’élément' : 'عرض العنصر'} ${dotIndex + 1}`} aria-current={dotIndex === index ? 'true' : undefined} />
        ))}
      </div>
    </div>
  )
}

function DiscoveryHero({ lang, openDoor }: { lang: Language; openDoor: (door: 'profile' | 'lifestyle') => void }) {
  return (
    <section className="discovery-hero" id="accueil">
      <div className="discovery-hero__grain" />
      <div className="discovery-hero__orb discovery-hero__orb--one" />
      <div className="discovery-hero__orb discovery-hero__orb--two" />
      <div className="discovery-hero__content">
        <p className="discovery-kicker"><span>ECOLYN</span>{lang === 'fr' ? 'Comprendre avant de conseiller' : 'نفهمو قبل ما ننصحو'}</p>
        <h1>{lang === 'fr' ? <>Votre peau n’est pas celle <em>de tout le monde.</em></> : <>بشرتك ماشي بحال <em>أي بشرة.</em></>}</h1>
        <p className="discovery-hero__lead">{lang === 'fr' ? 'Commencez par ce qui vous ressemble.' : 'خلي المحتوى اللي كتشوفيه يكون عليك أنتِ.'}</p>
        <p className="discovery-hero__prompt">{lang === 'fr' ? 'Choisissez votre première porte d’entrée' : 'بداي باختيار شنو كيشبه ليك أكثر'}</p>
        <div className="discovery-doors">
          <button type="button" onClick={() => openDoor('profile')}>
            <span><DoorIcon type="profile" /></span>
            <b>{lang === 'fr' ? 'Ma peau aujourd’hui' : 'بشرتي اليوم'}</b>
            <small>{lang === 'fr' ? 'Grasse, sèche, sensible…' : 'دهنية، جافة، حساسة…'}</small>
            <ArrowUpRight />
          </button>
          <button type="button" onClick={() => openDoor('lifestyle')}>
            <span><DoorIcon type="lifestyle" /></span>
            <b>{lang === 'fr' ? 'Ce que je vis' : 'شنو كنعيش دابا'}</b>
            <small>{lang === 'fr' ? 'Sommeil, stress, grossesse…' : 'النوم، الضغط، الحمل…'}</small>
            <ArrowUpRight />
          </button>
        </div>
        <div className="discovery-hero__trust">
          <span><BookOpen /> {lang === 'fr' ? 'Contenus sourcés' : 'محتوى بالمصادر'}</span>
          <span><ShieldCheck /> {lang === 'fr' ? 'Sans diagnostic' : 'بلا تشخيص'}</span>
          <span><HeartHandshake /> {lang === 'fr' ? 'Conseils gratuits' : 'نصائح مجانية'}</span>
        </div>
      </div>
      <div className="discovery-hero__preview" aria-hidden="true">
        <article className="insight-panel">
          <div className="insight-panel__top">
            <span>{lang === 'fr' ? 'Lecture personnalisée' : 'قراءة مخصصة'}</span>
            <b>01</b>
          </div>
          <div className="insight-panel__statement">
            <i><Sparkles /></i>
            <p>{lang === 'fr' ? 'Une lecture plus claire de ce que vous observez.' : 'قراءة أوضح للي كتلاحظيه فبشرتك.'}</p>
          </div>
          <div className="insight-panel__steps">
            <span><b>01</b><small>{lang === 'fr' ? 'Observer' : 'لاحظي'}</small></span>
            <span><b>02</b><small>{lang === 'fr' ? 'Comprendre' : 'فهمي'}</small></span>
            <span><b>03</b><small>{lang === 'fr' ? 'Ajuster' : 'عدّلي'}</small></span>
          </div>
          <div className="insight-panel__foot">
            <span><CircleHelp /><b>{lang === 'fr' ? 'Le pourquoi et la source restent accessibles.' : 'السبب والمصدر ديما واضحين.'}</b></span>
            <span><Check /><b>{lang === 'fr' ? 'Un geste concret à la fois.' : 'خطوة عملية وحدة كل مرة.'}</b></span>
          </div>
        </article>
      </div>
      <a className="discovery-scroll" href="#personnalisation"><ArrowDown /> {lang === 'fr' ? 'Personnaliser' : 'خصصي المحتوى'}</a>
    </section>
  )
}

function ChoiceCard<T extends string>({ id, label, hint, active, onClick }: {
  id: T
  label: string
  hint: string
  active: boolean
  onClick: (id: T) => void
}) {
  return (
    <button type="button" className={`choice-card${active ? ' is-active' : ''}`} onClick={() => onClick(id)} aria-pressed={active}>
      <i>{active ? <Check /> : <span />}</i>
      <b>{label}</b>
      <small>{hint}</small>
    </button>
  )
}

function PersonalizationHub({ lang, activeDoor, profile, concern, lifestyle, chooseProfile, chooseConcern, chooseLifestyle }: {
  lang: Language
  activeDoor: 'profile' | 'lifestyle'
  profile: SkinProfileId
  concern: string
  lifestyle: LifestyleId | ''
  chooseProfile: (id: SkinProfileId) => void
  chooseConcern: (id: string) => void
  chooseLifestyle: (id: LifestyleId) => void
}) {
  const profileRail = useRef<HTMLDivElement>(null)
  const lifestyleRail = useRef<HTMLDivElement>(null)
  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: number) => ref.current?.scrollBy({ left: direction * Math.min(340, window.innerWidth * .78), behavior: 'smooth' })

  return (
    <section className="personalization" id="personnalisation">
      <div className="discovery-wrap">
        <div className="discovery-heading">
          <p>{lang === 'fr' ? 'Votre point de départ' : 'نقطة البداية ديالك'}</p>
          <h2>{lang === 'fr' ? 'Le bon contenu commence par une bonne question.' : 'المحتوى المناسب كيبدا بسؤال مناسب.'}</h2>
          <span>{lang === 'fr' ? 'Vous pouvez changer vos choix à tout moment. Ils restent uniquement sur votre appareil.' : 'تقدري تبدلي الاختيارات فأي وقت. كيبقاو غير فالجهاز ديالك.'}</span>
        </div>

        <div className={`choice-block${activeDoor === 'profile' ? ' is-highlighted' : ''}`}>
          <div className="choice-block__head">
            <div><span>01</span><div><p>{lang === 'fr' ? 'Profil de peau' : 'نوع البشرة'}</p><h3>{lang === 'fr' ? 'Qu’est-ce qui vous ressemble le plus ?' : 'شنو كيشبه لبشرتك أكثر؟'}</h3></div></div>
            <div className="rail-buttons"><button onClick={() => scrollRail(profileRail, -1)} aria-label="Précédent"><ArrowLeft /></button><button onClick={() => scrollRail(profileRail, 1)} aria-label="Suivant"><ArrowRight /></button></div>
          </div>
          <div className="choice-rail" ref={profileRail}>
            {skinProfiles.map(item => <ChoiceCard key={item.id} {...item} label={local(item.label, lang)} hint={local(item.hint, lang)} active={profile === item.id} onClick={chooseProfile} />)}
          </div>
        </div>

        <div className="choice-block choice-block--compact">
          <div className="choice-block__head">
            <div><span>02</span><div><p>{lang === 'fr' ? 'Préoccupation' : 'المشكل'}</p><h3>{lang === 'fr' ? 'Qu’aimeriez-vous comprendre d’abord ?' : 'شنو بغيتي تفهمي أولاً؟'}</h3></div></div>
          </div>
          <div className="concern-chips">
            {concernOptions.map(item => <button key={item.id} type="button" className={concern === item.id ? 'is-active' : ''} onClick={() => chooseConcern(item.id)} aria-pressed={concern === item.id}>{local(item.label, lang)}</button>)}
          </div>
        </div>

        <div className={`choice-block choice-block--life${activeDoor === 'lifestyle' ? ' is-highlighted' : ''}`} id="mode-de-vie">
          <div className="choice-block__head">
            <div><span>03</span><div><p>{lang === 'fr' ? 'Votre contexte' : 'الظروف ديالك'}</p><h3>{lang === 'fr' ? 'Un sujet de vie influence votre routine ?' : 'كاين شي موضوع فحياتك كيأثر على الروتين؟'}</h3></div></div>
            <div className="rail-buttons"><button onClick={() => scrollRail(lifestyleRail, -1)} aria-label="Précédent"><ArrowLeft /></button><button onClick={() => scrollRail(lifestyleRail, 1)} aria-label="Suivant"><ArrowRight /></button></div>
          </div>
          <div className="choice-rail choice-rail--life" ref={lifestyleRail}>
            {lifestyleTopics.map(item => <ChoiceCard key={item.id} {...item} label={local(item.label, lang)} hint={local(item.hint, lang)} active={lifestyle === item.id} onClick={chooseLifestyle} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function ContentDrawer({ card, lang, close, complete, next }: { card: DiscoveryCard; lang: Language; close: () => void; complete: () => void; next: () => void }) {
  return (
    <motion.div className="content-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.currentTarget === event.target && close()}>
      <motion.article className={`content-drawer content-drawer--${card.format}`} initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} transition={{ duration: .48, ease: [.22, 1, .36, 1] }}>
        <div className="content-drawer__top">
          <span>{local(formatLabels[card.format], lang)}</span>
          <button onClick={close} aria-label={lang === 'fr' ? 'Fermer' : 'سد'}><X /></button>
        </div>
        <div className="content-drawer__hero">
          <p>{local(card.eyebrow, lang)}</p>
          <h2>{local(card.title, lang)}</h2>
          <span>{local(card.teaser, lang)}</span>
        </div>
        <div className="content-drawer__body">
          <section><b>01</b><div><h3>{lang === 'fr' ? 'Ce que cela veut dire' : 'شنو كيعني هادشي'}</h3><p>{local(card.explanation, lang)}</p></div></section>
          <details open>
            <summary><CircleHelp /> {lang === 'fr' ? 'Pourquoi ?' : 'علاش؟'} <ChevronRight /></summary>
            <p>{local(card.why, lang)}</p>
            <a href={card.sourceUrl} target="_blank" rel="noreferrer"><BookOpen /> <span><b>{local(card.sourceType, lang)}</b><small>{card.sourceTitle}</small></span><ArrowUpRight /></a>
          </details>
          <section className="drawer-gesture"><b>02</b><div><h3>{lang === 'fr' ? 'Le geste concret' : 'الخطوة العملية'}</h3><p>{local(card.gesture, lang)}</p></div></section>
          <section className="drawer-mistake"><b>03</b><div><h3>{lang === 'fr' ? 'L’erreur à éviter' : 'الغلطة اللي خاص نتفاداو'}</h3><p>{local(card.mistake, lang)}</p></div></section>
          <section><b>04</b><div><h3>{lang === 'fr' ? 'Quand demander un avis' : 'إمتى نطلبو رأي مختص'}</h3><p>{local(card.professional, lang)}</p></div></section>
          {card.caution && <p className="drawer-caution"><ShieldCheck /> {local(card.caution, lang)}</p>}
        </div>
        <div className="content-drawer__actions">
          <button className="button button--primary" onClick={complete}><Check /> {lang === 'fr' ? 'J’ai compris' : 'فهمت'}</button>
          <button className="button button--ghost" onClick={next}>{lang === 'fr' ? 'Contenu suivant' : 'المحتوى الموالي'} <ArrowRight /></button>
        </div>
      </motion.article>
    </motion.div>
  )
}

function PersonalizedFeed({ lang, profile, concern, lifestyle }: { lang: Language; profile: SkinProfileId; concern: string; lifestyle: LifestyleId | '' }) {
  const [openCard, setOpenCard] = useState<DiscoveryCard | null>(null)
  const [visibleCount, setVisibleCount] = useState(7)
  const feedNavigation = useRailNavigation(visibleCount)
  const completed = useRef(new Set<string>())
  const ordered = useMemo(() => discoveryCards.map((card, index) => ({
    card,
    index,
    score: (card.profiles.includes(profile) ? 5 : 0) + (card.concerns.includes(concern) ? 4 : 0) + (lifestyle && card.lifestyles.includes(lifestyle) ? 7 : 0),
  })).sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.card), [profile, concern, lifestyle])

  const open = (card: DiscoveryCard, source: string) => {
    setOpenCard(card)
    document.body.classList.add('modal-open')
    track('content_open', { content_id: card.id, content_format: card.format, selection_source: source })
  }
  const close = () => {
    setOpenCard(null)
    document.body.classList.remove('modal-open')
  }
  const complete = () => {
    if (openCard && !completed.current.has(openCard.id)) {
      completed.current.add(openCard.id)
      track('content_complete', { content_id: openCard.id, content_format: openCard.format })
    }
    close()
  }
  const next = () => {
    if (!openCard) return
    const index = ordered.findIndex(card => card.id === openCard.id)
    const nextCard = ordered[(index + 1) % ordered.length]
    setOpenCard(nextCard)
    track('content_open', { content_id: nextCard.id, content_format: nextCard.format, selection_source: 'drawer_next' })
  }

  const profileName = local(skinProfiles.find(item => item.id === profile)?.label || skinProfiles[5].label, lang)
  const concernName = local(concernOptions.find(item => item.id === concern)?.label || concernOptions[7].label, lang)
  const lifestyleName = lifestyle ? local(lifestyleTopics.find(item => item.id === lifestyle)?.label || lifestyleTopics[0].label, lang) : ''

  return (
    <section className="personal-feed" id="conseils">
      <div className="discovery-wrap">
        <div className="feed-intro">
          <div>
            <p>{lang === 'fr' ? 'Votre mini-feed' : 'المحتوى ديالك'}</p>
            <h2>{lang === 'fr' ? 'À explorer maintenant' : 'اكتشفي دابا'}</h2>
          </div>
          <div className="feed-profile"><Sparkles /><span>{profileName}</span><i>+</i><span>{concernName}</span>{lifestyleName && <><i>+</i><span>{lifestyleName}</span></>}</div>
        </div>
        <div className="mobile-carousel-shell">
          <div className="content-grid" ref={feedNavigation.rail}>
            {ordered.slice(0, visibleCount).map((card, index) => (
              <motion.button
                type="button"
                className={`content-card content-card--${card.format} content-card--${(index % 4) + 1}`}
                key={card.id}
                onClick={() => open(card, 'personalized_feed')}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8%' }}
                transition={{ duration: .5, delay: Math.min(index * .04, .2) }}
              >
                <span className="content-card__top"><b>{String(index + 1).padStart(2, '0')}</b><i>{local(formatLabels[card.format], lang)}</i></span>
                <span className="content-card__eyebrow">{local(card.eyebrow, lang)}</span>
                <strong>{local(card.title, lang)}</strong>
                <span className="content-card__teaser">{local(card.teaser, lang)}</span>
                <span className="content-card__why"><CircleHelp /> {lang === 'fr' ? 'Pourquoi ?' : 'علاش؟'}</span>
                <span className="content-card__open">{lang === 'fr' ? 'Ouvrir' : 'فتحي'} <ArrowUpRight /></span>
              </motion.button>
            ))}
          </div>
          <MobileCarouselNavigation lang={lang} index={feedNavigation.index} count={visibleCount} goTo={feedNavigation.goTo} label={lang === 'fr' ? 'Navigation des contenus' : 'تصفح المحتويات'} />
        </div>
        {visibleCount < ordered.length && <button className="feed-more" type="button" onClick={() => setVisibleCount(ordered.length)}>{lang === 'fr' ? 'Voir tous les contenus' : 'شوفي المحتوى كامل'} <ArrowDown /></button>}
      </div>
      <AnimatePresence>{openCard && <ContentDrawer card={openCard} lang={lang} close={close} complete={complete} next={next} />}</AnimatePresence>
    </section>
  )
}

function StoryDrawer({ story, lang, close }: { story: Testimonial; lang: Language; close: () => void }) {
  const [playing, setPlaying] = useState(false)
  const played = useRef(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }
  const onPlay = () => {
    setPlaying(true)
    if (!played.current) {
      played.current = true
      track('story_audio_play', { story_id: String(story.id) })
      track('audio_play', { testimonial_id: String(story.id) })
    }
  }
  return (
    <motion.div className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.target === event.currentTarget && close()}>
      <motion.article initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}>
        <button className="story-close" onClick={close} aria-label={lang === 'fr' ? 'Fermer' : 'سد'}><X /></button>
        <div className="story-image"><img src={story.image} alt={story.name} width="720" height="900" /></div>
        <div className="story-copy">
          <p>{lang === 'fr' ? 'Une vraie voix, une vraie expérience' : 'صوت حقيقي وتجربة حقيقية'}</p>
          <h2>{story.name}</h2>
          <span>{lang === 'fr' ? 'Son témoignage original est conservé en audio. Aucun détail biographique ou résultat n’a été ajouté sans validation.' : 'الشهادة الأصلية محفوظة فالصوت. ما زدنا حتى تفاصيل أو نتائج بلا تأكيد.'}</span>
          <div className="story-player">
            <button type="button" onClick={toggle} aria-label={playing ? (lang === 'fr' ? 'Mettre en pause' : 'وقفي الصوت') : (lang === 'fr' ? `Écouter le témoignage de ${story.name}` : `سمعي شهادة ${story.name}`)}>{playing ? <Pause /> : <Play />}</button>
            <div><b>{lang === 'fr' ? 'Écouter son histoire' : 'سمعي قصتها'}</b><small>{lang === 'fr' ? 'Audio original ECOLYN' : 'الصوت الأصلي ديال ECOLYN'}</small></div>
            <AudioLines />
            <audio ref={audioRef} src={story.audio} preload="metadata" onPlay={onPlay} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
          </div>
          <div className="story-fields-note"><BookOpen /><p>{lang === 'fr' ? 'Les champs “problème”, “déclic”, “évolution” et “conseil” sont prêts pour une future transcription validée ; ils restent volontairement absents aujourd’hui.' : 'خانات “المشكل” و“اللحظة المهمة” و“التطور” و“النصيحة” واجدين للنسخة المكتوبة من بعد الموافقة؛ دابا خليناهم خاويين بقصد.'}</p></div>
        </div>
      </motion.article>
    </motion.div>
  )
}

function Stories({ lang }: { lang: Language }) {
  const [story, setStory] = useState<Testimonial | null>(null)
  const storyNavigation = useRailNavigation(testimonials.length)
  const open = (item: Testimonial) => {
    setStory(item)
    document.body.classList.add('modal-open')
    track('story_open', { story_id: String(item.id) })
  }
  const close = () => {
    setStory(null)
    document.body.classList.remove('modal-open')
  }
  return (
    <section className="story-section" id="histoires">
      <div className="discovery-wrap">
        <div className="story-heading">
          <p>{lang === 'fr' ? 'Elles ne sont pas des statistiques' : 'ماشي غير أرقام'}</p>
          <h2>{lang === 'fr' ? 'Elles ont une histoire à raconter.' : 'عندهم قصة يحكيوها.'}</h2>
          <span>{lang === 'fr' ? 'Six témoignages, six voix originales. Touchez un portrait pour écouter.' : 'ست شهادات وست أصوات أصلية. كليكي على الصورة باش تسمعي.'}</span>
        </div>
        <div className="mobile-carousel-shell">
          <div className="story-rail" ref={storyNavigation.rail}>
            {testimonials.map((item, index) => (
              <button type="button" key={item.id} onClick={() => open(item)}>
                <img src={item.image} alt={item.name} width="520" height="650" loading="lazy" />
                <span><small>0{index + 1}</small><b>{item.name}</b><i><Play /></i></span>
              </button>
            ))}
          </div>
          <MobileCarouselNavigation lang={lang} index={storyNavigation.index} count={testimonials.length} goTo={storyNavigation.goTo} label={lang === 'fr' ? 'Navigation des témoignages' : 'تصفح الشهادات'} />
        </div>
      </div>
      <AnimatePresence>{story && <StoryDrawer story={story} lang={lang} close={close} />}</AnimatePresence>
    </section>
  )
}

function Hanane({ lang, goToForm }: { lang: Language; goToForm: () => void }) {
  return (
    <section className="hanane-section" id="hanane">
      <div className="hanane-shell">
        <div className="hanane-photo">
          <img src={siteConfig.assets.expertProfile} alt="Hanane — ECOLYN" width="900" height="1120" loading="lazy" />
          <span><i>ECOLYN</i>{lang === 'fr' ? 'Une approche humaine et structurée' : 'طريقة إنسانية ومنظمة'}</span>
        </div>
        <div className="hanane-copy">
          <p>{lang === 'fr' ? 'La personne derrière les conseils' : 'الشخص اللي ورا النصائح'}</p>
          <h2>{lang === 'fr' ? <>Hanane commence par <em>vous écouter.</em></> : <>حنان كتبدا <em>بالاستماع ليك.</em></>}</h2>
          <span className="hanane-role">{local(siteConfig.expert.role, lang)}</span>
          <blockquote>{lang === 'fr' ? 'Comprendre ce que vous observez, ce que vous utilisez et ce que vous vivez avant de proposer une routine plus claire.' : 'نفهمو شنو كتلاحظي، شنو كتستعملي وشنو كتعيشي قبل ما نقترحو روتين أوضح.'}</blockquote>
          <div className="hanane-method">
            <span><b>01</b>{lang === 'fr' ? 'Écouter la situation réelle' : 'نسمعو للوضع الحقيقي'}</span>
            <span><b>02</b>{lang === 'fr' ? 'Simplifier les priorités' : 'نبسطو الأولويات'}</span>
            <span><b>03</b>{lang === 'fr' ? 'Orienter avec prudence' : 'نوجهو بحذر'}</span>
          </div>
          <button className="button button--primary" type="button" onClick={goToForm}>{lang === 'fr' ? 'Poser ma question à Hanane' : 'نسول حنان'} <MessageCircle /></button>
        </div>
      </div>
    </section>
  )
}

function PreFormBridge({ lang, goToForm }: { lang: Language; goToForm: () => void }) {
  return (
    <section className="preform-bridge">
      <div className="preform-bridge__copy">
        <p>{lang === 'fr' ? 'Votre peau mérite mieux qu’une réponse copiée-collée.' : 'بشرتك كتستاهل أكثر من جواب منسوخ.'}</p>
        <h2>{lang === 'fr' ? 'Transformez ce que vous avez observé en une question claire.' : 'حولي الملاحظات ديالك لسؤال واضح.'}</h2>
        <button className="button button--light" type="button" onClick={goToForm}>{lang === 'fr' ? 'Recevoir un premier conseil gratuit' : 'خذي أول نصيحة مجانية'} <ArrowUpRight /></button>
      </div>
      <div className="preform-bridge__trust">
        <span><Clock3 /><b>{lang === 'fr' ? 'Moins de 2 minutes' : 'أقل من جوج دقايق'}</b></span>
        <span><ShieldCheck /><b>{lang === 'fr' ? 'Demande confidentielle' : 'طلب سري'}</b></span>
        <span><MessageCircle /><b>{lang === 'fr' ? 'Réponse sur WhatsApp' : 'الجواب فالواتساب'}</b></span>
      </div>
    </section>
  )
}

function WhatsAppInvitation({ lang }: { lang: Language }) {
  return (
    <section className="whatsapp-invite">
      <div><MessageCircle /><span><small>{lang === 'fr' ? 'Conseils courts, rappels utiles' : 'نصائح قصيرة وتذكيرات مفيدة'}</small><b>{lang === 'fr' ? 'Rejoignez le groupe ECOLYN sur WhatsApp' : 'انضمي لمجموعة ECOLYN فالواتساب'}</b></span></div>
      <a href={whatsappGroupHref} target="_blank" rel="noreferrer" onClick={() => track('join_whatsapp_group', { source: 'homepage_invitation' })}>{lang === 'fr' ? 'Rejoindre le groupe' : 'انضمي للمجموعة'} <ArrowUpRight /></a>
    </section>
  )
}

export interface DiscoveryExperienceProps {
  lang: Language
  profile: SkinProfileId
  concern: string
  lifestyle: LifestyleId | ''
  setProfile: (id: SkinProfileId) => void
  setConcern: (id: string) => void
  setLifestyle: (id: LifestyleId) => void
}

export default function DiscoveryExperience({ lang, profile, concern, lifestyle, setProfile, setConcern, setLifestyle }: DiscoveryExperienceProps) {
  const [activeDoor, setActiveDoor] = useState<'profile' | 'lifestyle'>('profile')
  const reduced = useReducedMotion()
  const openDoor = (door: 'profile' | 'lifestyle') => {
    setActiveDoor(door)
    track(door === 'profile' ? 'select_skin_profile' : 'select_lifestyle_topic', { selection_source: 'hero_door', option_id: door })
    window.setTimeout(() => document.getElementById(door === 'profile' ? 'personnalisation' : 'mode-de-vie')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 40)
  }
  const chooseProfile = (id: SkinProfileId) => {
    setProfile(id)
    track('select_skin_profile', { profile_id: id, selection_source: 'personalization_hub' })
  }
  const chooseConcern = (id: string) => {
    setConcern(id)
    track('select_skin_concern', { concern_id: id, selection_source: 'personalization_hub' })
  }
  const chooseLifestyle = (id: LifestyleId) => {
    setLifestyle(id)
    track('select_lifestyle_topic', { lifestyle_topic: id, selection_source: 'personalization_hub' })
  }
  const goToForm = () => {
    track('form_start', { source: 'discovery_cta', concern_id: concern, profile_id: profile })
    document.getElementById('formulaire')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <>
      <DiscoveryHero lang={lang} openDoor={openDoor} />
      <PersonalizationHub lang={lang} activeDoor={activeDoor} profile={profile} concern={concern} lifestyle={lifestyle} chooseProfile={chooseProfile} chooseConcern={chooseConcern} chooseLifestyle={chooseLifestyle} />
      <PersonalizedFeed lang={lang} profile={profile} concern={concern} lifestyle={lifestyle} />
      <Stories lang={lang} />
      <Hanane lang={lang} goToForm={goToForm} />
      <WhatsAppInvitation lang={lang} />
      <PreFormBridge lang={lang} goToForm={goToForm} />
    </>
  )
}
