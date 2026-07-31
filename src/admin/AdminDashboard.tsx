import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Download, FileText, LayoutDashboard,
  LogOut, RefreshCw, Search, Settings2, SlidersHorizontal, UserRound, X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { getAdminSession, signOutAdmin } from '../lib/admin'
import { navigate, routeUrl } from '../lib/navigation'
import { getSupabase } from '../lib/supabase'
import { initializeTracking } from '../lib/tracking'

type Tab = 'prospects' | 'live' | 'trackings'
type ProspectStatus = 'nouveau' | 'a_contacter' | 'contacte' | 'qualifie' | 'converti' | 'archive'

interface Prospect {
  id: string
  reference: string
  created_at: string
  updated_at: string
  status: ProspectStatus
  first_name: string
  whatsapp: string
  email: string | null
  city: string
  primary_concern: string
  skin_type: string | null
  goal: string | null
  description: string | null
  answers: Record<string, unknown>
  photo_name: string | null
  photo_consent: boolean
  contact_consent: boolean
  marketing_consent: boolean
  language: 'fr' | 'ar'
  source: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  admin_notes: string
}

interface TrackingForm {
  meta_pixel_id: string
  meta_enabled: boolean
  tiktok_pixel_id: string
  tiktok_enabled: boolean
  ga4_measurement_id: string
  ga4_enabled: boolean
}

interface LiveForm {
  is_published: boolean
  title_fr: string
  title_ar: string
  description_fr: string
  description_ar: string
  starts_at: string
  ends_at: string
  timezone: string
  location: string
  meeting_url: string
}

const statusLabels: Record<ProspectStatus, string> = {
  nouveau: 'Nouveau',
  a_contacter: 'À contacter',
  contacte: 'Contacté',
  qualifie: 'Qualifié',
  converti: 'Converti',
  archive: 'Archivé',
}

const answerLabels: Record<string, string> = {
  skinType: 'Type de peau',
  ageRange: 'Âge',
  city: 'Ville',
  duration: 'Durée',
  primaryConcern: 'Problème principal',
  secondaryConcerns: 'Problèmes secondaires',
  area: 'Zone',
  discomfort: 'Niveau de gêne',
  goal: 'Objectif',
  products: 'Produits',
  cleansing: 'Nettoyage',
  spf: 'SPF',
  newProducts: 'Nouveaux produits',
  reactions: 'Réactions',
  description: 'Description',
  firstName: 'Prénom',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  photoConsent: 'Consentement photo',
  contactConsent: 'Consentement contact',
  marketingConsent: 'Consentement marketing',
}

function csvCell(value: unknown) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(rows: Prospect[]) {
  const columns: Array<[string, (row: Prospect) => unknown]> = [
    ['Référence', row => row.reference],
    ['Date', row => row.created_at],
    ['Statut', row => statusLabels[row.status]],
    ['Prénom', row => row.first_name],
    ['WhatsApp', row => row.whatsapp],
    ['E-mail', row => row.email],
    ['Ville', row => row.city],
    ['Problème principal', row => row.primary_concern],
    ['Type de peau', row => row.skin_type],
    ['Objectif', row => row.goal],
    ['Description', row => row.description],
    ['Langue', row => row.language],
    ['Source', row => row.source],
    ['UTM source', row => row.utm_source],
    ['UTM medium', row => row.utm_medium],
    ['UTM campaign', row => row.utm_campaign],
    ['UTM term', row => row.utm_term],
    ['UTM content', row => row.utm_content],
    ['Consentement contact', row => row.contact_consent],
    ['Consentement marketing', row => row.marketing_consent],
    ['Consentement photo', row => row.photo_consent],
    ['Toutes les réponses', row => row.answers],
    ['Notes administrateur', row => row.admin_notes],
  ]
  const csv = [
    columns.map(([label]) => csvCell(label)).join(','),
    ...rows.map(row => columns.map(([, getter]) => csvCell(getter(row))).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `ecolyn-prospects-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

async function fetchAllProspects() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED')
  const rows: Prospect[] = []
  const pageSize = 500

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('prospects')
      .select('id,reference,created_at,updated_at,status,first_name,whatsapp,email,city,primary_concern,skin_type,goal,description,answers,photo_name,photo_consent,contact_consent,marketing_consent,language,source,utm_source,utm_medium,utm_campaign,utm_term,utm_content,admin_notes')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...(data as Prospect[]))
    if (!data || data.length < pageSize) break
  }
  return rows
}

function ProspectsPanel() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'tous' | ProspectStatus>('tous')
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [savingId, setSavingId] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setProspects(await fetchAllProspects())
    } catch {
      setError('Impossible de charger les prospects. Vérifiez la connexion et les règles RLS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('fr')
    return prospects.filter(prospect => {
      if (status !== 'tous' && prospect.status !== status) return false
      if (!needle) return true
      return [
        prospect.reference, prospect.first_name, prospect.whatsapp, prospect.email,
        prospect.city, prospect.primary_concern, prospect.source,
      ].some(value => value?.toLocaleLowerCase('fr').includes(needle))
    })
  }, [prospects, search, status])

  const updateStatus = async (prospect: Prospect, nextStatus: ProspectStatus) => {
    const supabase = getSupabase()
    if (!supabase) return
    setSavingId(prospect.id)
    const { error: updateError } = await supabase
      .from('prospects')
      .update({ status: nextStatus })
      .eq('id', prospect.id)
    if (updateError) {
      setError('Le statut n’a pas été enregistré.')
    } else {
      setProspects(rows => rows.map(row => row.id === prospect.id ? { ...row, status: nextStatus } : row))
      setSelected(current => current?.id === prospect.id ? { ...current, status: nextStatus } : current)
    }
    setSavingId('')
  }

  const saveNotes = async (prospect: Prospect, adminNotes: string) => {
    const supabase = getSupabase()
    if (!supabase) return
    setSavingId(prospect.id)
    const { error: updateError } = await supabase
      .from('prospects')
      .update({ admin_notes: adminNotes })
      .eq('id', prospect.id)
    if (updateError) {
      setError('Les notes n’ont pas été enregistrées.')
    } else {
      setProspects(rows => rows.map(row => row.id === prospect.id ? { ...row, admin_notes: adminNotes } : row))
      setSelected(current => current?.id === prospect.id ? { ...current, admin_notes: adminNotes } : current)
    }
    setSavingId('')
  }

  const loadPhoto = async (prospect: Prospect) => {
    const supabase = getSupabase()
    if (!supabase) return
    setPhotoLoading(true)
    const { data, error: photoError } = await supabase
      .from('prospects')
      .select('photo_data_url')
      .eq('id', prospect.id)
      .single()
    if (photoError || !data?.photo_data_url) setError('La photo est indisponible.')
    else setPhoto(data.photo_data_url)
    setPhotoLoading(false)
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div><p className="admin-kicker">Base de contacts</p><h1>Prospects</h1><span>{prospects.length} demande{prospects.length === 1 ? '' : 's'} enregistrée{prospects.length === 1 ? '' : 's'}</span></div>
        <div className="admin-heading-actions">
          <button className="admin-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw /> Actualiser</button>
          <button className="admin-primary-button" onClick={() => downloadCsv(filtered)} disabled={!filtered.length}><Download /> Exporter CSV</button>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search"><Search /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un nom, téléphone, ville…" /></label>
        <label className="admin-filter"><SlidersHorizontal /><select value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="tous">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <span className="admin-result-count">{filtered.length} résultat{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {loading ? <div className="admin-loading"><RefreshCw /> Chargement sécurisé…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Prospect</th><th>Besoin</th><th>Source</th><th>Date</th><th>Statut</th><th><span className="sr-only">Détails</span></th></tr></thead>
            <tbody>
              {filtered.map(prospect => (
                <tr key={prospect.id}>
                  <td><strong>{prospect.first_name}</strong><span>{prospect.whatsapp}</span><small>{prospect.email || prospect.reference}</small></td>
                  <td><strong>{prospect.primary_concern}</strong><span>{prospect.city} · {prospect.skin_type || 'Type non précisé'}</span></td>
                  <td><span className="admin-source">{prospect.source}</span><small>{prospect.language.toUpperCase()}</small></td>
                  <td><span>{new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium' }).format(new Date(prospect.created_at))}</span><small>{new Intl.DateTimeFormat('fr-MA', { timeStyle: 'short' }).format(new Date(prospect.created_at))}</small></td>
                  <td>
                    <select className={`admin-status admin-status--${prospect.status}`} value={prospect.status} disabled={savingId === prospect.id} onChange={event => void updateStatus(prospect, event.target.value as ProspectStatus)}>
                      {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                  </td>
                  <td><button className="admin-icon-button" onClick={() => { setSelected(prospect); setPhoto('') }} aria-label={`Voir ${prospect.first_name}`}><ChevronRight /></button></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6}><div className="admin-empty"><FileText /><strong>Aucun prospect trouvé</strong><span>Modifiez les filtres ou revenez plus tard.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-drawer-overlay" onMouseDown={event => event.currentTarget === event.target && setSelected(null)}>
          <aside className="admin-drawer" aria-label={`Dossier ${selected.reference}`}>
            <button className="admin-drawer-close" onClick={() => setSelected(null)} aria-label="Fermer"><X /></button>
            <p className="admin-kicker">{selected.reference}</p>
            <h2>{selected.first_name}</h2>
            <div className="admin-contact-row"><a href={`https://wa.me/${selected.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{selected.whatsapp}</a>{selected.email && <a href={`mailto:${selected.email}`}>{selected.email}</a>}</div>
            <label className="admin-detail-status">Statut<select value={selected.status} disabled={savingId === selected.id} onChange={event => void updateStatus(selected, event.target.value as ProspectStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <div className="admin-detail-grid">
              {Object.entries(selected.answers || {}).map(([key, value]) => (
                <div key={key}><span>{answerLabels[key] || key}</span><strong>{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value || '—')}</strong></div>
              ))}
            </div>
            {(selected.utm_source || selected.utm_campaign) && <div className="admin-utm-box"><strong>Acquisition</strong><span>Source : {selected.utm_source || '—'}</span><span>Support : {selected.utm_medium || '—'}</span><span>Campagne : {selected.utm_campaign || '—'}</span></div>}
            {selected.photo_name && <div className="admin-photo-box"><strong>Photo privée : {selected.photo_name}</strong>{photo ? <img src={photo} alt="Photo privée transmise avec la demande" /> : <button className="admin-secondary-button" onClick={() => void loadPhoto(selected)} disabled={photoLoading}>{photoLoading ? 'Chargement…' : 'Afficher la photo'}</button>}</div>}
            <label className="admin-notes"><span>Notes internes</span><textarea key={selected.id} defaultValue={selected.admin_notes} rows={5} id={`notes-${selected.id}`} /></label>
            <button className="admin-primary-button" disabled={savingId === selected.id} onClick={() => {
              const textarea = document.getElementById(`notes-${selected.id}`) as HTMLTextAreaElement | null
              void saveNotes(selected, textarea?.value || '')
            }}><Check /> Enregistrer les notes</button>
          </aside>
        </div>
      )}
    </section>
  )
}

function TrackingPanel() {
  const [form, setForm] = useState<TrackingForm>({
    meta_pixel_id: '', meta_enabled: false,
    tiktok_pixel_id: '', tiktok_enabled: false,
    ga4_measurement_id: '', ga4_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase()
      if (!supabase) return
      const { data, error: loadError } = await supabase.from('tracking_settings').select('*').eq('id', 1).single()
      if (loadError) setError('Impossible de charger la configuration.')
      else if (data) setForm({
        meta_pixel_id: data.meta_pixel_id || '',
        meta_enabled: Boolean(data.meta_enabled),
        tiktok_pixel_id: data.tiktok_pixel_id || '',
        tiktok_enabled: Boolean(data.tiktok_enabled),
        ga4_measurement_id: data.ga4_measurement_id || '',
        ga4_enabled: Boolean(data.ga4_enabled),
      })
      setLoading(false)
    }
    void load()
  }, [])

  const update = <K extends keyof TrackingForm>(key: K, value: TrackingForm[K]) => setForm(current => ({ ...current, [key]: value }))

  const save = async () => {
    setError('')
    setMessage('')
    if ((form.meta_enabled && !form.meta_pixel_id.trim()) || (form.tiktok_enabled && !form.tiktok_pixel_id.trim()) || (form.ga4_enabled && !form.ga4_measurement_id.trim())) {
      setError('Ajoutez l’identifiant avant d’activer un tracking.')
      return
    }
    if (form.ga4_measurement_id && !/^G-[A-Z0-9]+$/i.test(form.ga4_measurement_id.trim())) {
      setError('L’identifiant GA4 doit commencer par G-.')
      return
    }

    const supabase = getSupabase()
    if (!supabase) return
    setSaving(true)
    const { error: saveError } = await supabase
      .from('tracking_settings')
      .update({
        ...form,
        meta_pixel_id: form.meta_pixel_id.trim() || null,
        tiktok_pixel_id: form.tiktok_pixel_id.trim() || null,
        ga4_measurement_id: form.ga4_measurement_id.trim().toUpperCase() || null,
      })
      .eq('id', 1)
    if (saveError) setError('La configuration n’a pas été enregistrée.')
    else setMessage('Configuration enregistrée. Les changements seront chargés lors de la prochaine page vue.')
    setSaving(false)
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading"><div><p className="admin-kicker">Mesure & publicité</p><h1>Trackings</h1><span>Activez uniquement les outils réellement utilisés.</span></div></div>
      {loading ? <div className="admin-loading"><RefreshCw /> Chargement sécurisé…</div> : (
        <div className="tracking-grid">
          <TrackingCard name="Meta Pixel" hint="Identifiant numérique du pixel Meta" value={form.meta_pixel_id} enabled={form.meta_enabled} onValue={value => update('meta_pixel_id', value)} onEnabled={value => update('meta_enabled', value)} placeholder="123456789012345" />
          <TrackingCard name="TikTok Pixel" hint="Identifiant du pixel TikTok Ads" value={form.tiktok_pixel_id} enabled={form.tiktok_enabled} onValue={value => update('tiktok_pixel_id', value)} onEnabled={value => update('tiktok_enabled', value)} placeholder="CXXXXXXXXXXXXXXXXX" />
          <TrackingCard name="Google Analytics 4" hint="Measurement ID commençant par G-" value={form.ga4_measurement_id} enabled={form.ga4_enabled} onValue={value => update('ga4_measurement_id', value)} onEnabled={value => update('ga4_enabled', value)} placeholder="G-XXXXXXXXXX" />
        </div>
      )}
      <div className="tracking-events">
        <p className="admin-kicker">Événements couverts</p>
        <div>{['PageView', 'ViewContent', 'Lead', 'Contact', 'InitiateCheckout', 'form_start', 'form_submit', 'whatsapp_click', 'pack_view', 'pack_cta_click', 'live_calendar_click'].map(event => <span key={event}>{event}</span>)}</div>
      </div>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      {message && <p className="admin-success" role="status"><Check /> {message}</p>}
      <button className="admin-primary-button tracking-save" onClick={() => void save()} disabled={saving || loading}><Settings2 /> {saving ? 'Enregistrement…' : 'Enregistrer les trackings'}</button>
    </section>
  )
}

function dateTimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function LivePanel() {
  const [form, setForm] = useState<LiveForm>({
    is_published: false,
    title_fr: 'Live ECOLYN',
    title_ar: 'لايف إيكولين',
    description_fr: '',
    description_ar: '',
    starts_at: '',
    ends_at: '',
    timezone: 'Africa/Casablanca',
    location: 'En ligne',
    meeting_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase()
      if (!supabase) return
      const { data, error: loadError } = await supabase.from('live_settings').select('*').eq('id', 1).single()
      if (loadError) {
        setError('Impossible de charger le live. Exécutez d’abord la dernière version du SQL Supabase.')
      } else if (data) {
        setForm({
          is_published: Boolean(data.is_published),
          title_fr: data.title_fr || '',
          title_ar: data.title_ar || '',
          description_fr: data.description_fr || '',
          description_ar: data.description_ar || '',
          starts_at: dateTimeLocal(data.starts_at),
          ends_at: dateTimeLocal(data.ends_at),
          timezone: data.timezone || 'Africa/Casablanca',
          location: data.location || '',
          meeting_url: data.meeting_url || '',
        })
      }
      setLoading(false)
    }
    void load()
  }, [])

  const update = <K extends keyof LiveForm>(key: K, value: LiveForm[K]) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const save = async () => {
    setError('')
    setMessage('')
    if (!form.title_fr.trim() || !form.title_ar.trim()) {
      setError('Ajoutez le titre du live en français et en arabe.')
      return
    }
    if (form.is_published && !form.starts_at) {
      setError('Choisissez la date et l’heure avant de publier le live.')
      return
    }
    if (form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError('L’heure de fin doit être postérieure à l’heure de début.')
      return
    }
    if (form.meeting_url && !/^https:\/\//i.test(form.meeting_url.trim())) {
      setError('Le lien du live doit commencer par https://.')
      return
    }

    const supabase = getSupabase()
    if (!supabase) return
    setSaving(true)
    const { error: saveError } = await supabase
      .from('live_settings')
      .update({
        is_published: form.is_published,
        title_fr: form.title_fr.trim(),
        title_ar: form.title_ar.trim(),
        description_fr: form.description_fr.trim() || null,
        description_ar: form.description_ar.trim() || null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        timezone: form.timezone,
        location: form.location.trim() || null,
        meeting_url: form.meeting_url.trim() || null,
      })
      .eq('id', 1)

    if (saveError) setError('Le live n’a pas été enregistré.')
    else setMessage(form.is_published ? 'Live publié. Le bouton calendrier est actif sur le site.' : 'Brouillon enregistré. Le live reste masqué sur le site.')
    setSaving(false)
  }

  if (loading) return <section className="admin-panel"><div className="admin-loading"><RefreshCw /> Chargement sécurisé…</div></section>

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div><p className="admin-kicker">Agenda public</p><h1>Prochain live</h1><span>Programmez la date affichée et le rappel calendrier des visiteurs.</span></div>
      </div>

      <div className="live-admin-layout">
        <div className="live-admin-card">
          <div className="live-admin-publish">
            <div><strong>Afficher ce live sur le site</strong><span>Vous pouvez enregistrer un brouillon avant de le publier.</span></div>
            <label className="admin-switch"><input type="checkbox" checked={form.is_published} onChange={event => update('is_published', event.target.checked)} /><i /><span>{form.is_published ? 'Publié' : 'Brouillon'}</span></label>
          </div>

          <div className="live-admin-grid">
            <label><span>Titre français</span><input value={form.title_fr} maxLength={180} onChange={event => update('title_fr', event.target.value)} /></label>
            <label dir="rtl"><span>العنوان بالعربية</span><input value={form.title_ar} maxLength={180} onChange={event => update('title_ar', event.target.value)} /></label>
            <label><span>Description française</span><textarea value={form.description_fr} maxLength={1200} rows={4} onChange={event => update('description_fr', event.target.value)} /></label>
            <label dir="rtl"><span>الوصف بالعربية</span><textarea value={form.description_ar} maxLength={1200} rows={4} onChange={event => update('description_ar', event.target.value)} /></label>
            <label><span>Date et heure de début</span><input type="datetime-local" value={form.starts_at} onChange={event => update('starts_at', event.target.value)} /></label>
            <label><span>Date et heure de fin</span><input type="datetime-local" value={form.ends_at} onChange={event => update('ends_at', event.target.value)} /></label>
            <label><span>Fuseau horaire affiché</span><select value={form.timezone} onChange={event => update('timezone', event.target.value)}><option value="Africa/Casablanca">Maroc — Africa/Casablanca</option><option value="UTC">UTC</option><option value="Europe/Paris">Europe/Paris</option></select></label>
            <label><span>Lieu ou plateforme</span><input value={form.location} maxLength={180} placeholder="Instagram Live, Google Meet…" onChange={event => update('location', event.target.value)} /></label>
            <label className="live-admin-wide"><span>Lien du live (facultatif)</span><input type="url" value={form.meeting_url} maxLength={2000} placeholder="https://…" onChange={event => update('meeting_url', event.target.value)} /></label>
          </div>
        </div>

        <aside className="live-admin-preview">
          <span><CalendarDays /> Aperçu</span>
          <strong>{form.title_fr || 'Titre du live'}</strong>
          <p>{form.starts_at ? new Intl.DateTimeFormat('fr-MA', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(form.starts_at)) : 'Date à définir'}</p>
          <small>Le fichier calendrier ajoutera automatiquement un rappel 30 minutes avant.</small>
        </aside>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {message && <p className="admin-success" role="status"><Check /> {message}</p>}
      <button className="admin-primary-button live-admin-save" onClick={() => void save()} disabled={saving}><CalendarDays /> {saving ? 'Enregistrement…' : 'Enregistrer le live'}</button>
    </section>
  )
}

function TrackingCard({ name, hint, value, enabled, onValue, onEnabled, placeholder }: {
  name: string
  hint: string
  value: string
  enabled: boolean
  onValue: (value: string) => void
  onEnabled: (value: boolean) => void
  placeholder: string
}) {
  return (
    <article className={`tracking-card${enabled ? ' is-enabled' : ''}`}>
      <div className="tracking-card-head"><div><strong>{name}</strong><span>{hint}</span></div><label className="admin-switch"><input type="checkbox" checked={enabled} onChange={event => onEnabled(event.target.checked)} /><i /><span>{enabled ? 'Activé' : 'Désactivé'}</span></label></div>
      <label><span>Identifiant</span><input value={value} onChange={event => onValue(event.target.value)} placeholder={placeholder} autoComplete="off" /></label>
    </article>
  )
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('prospects')

  useEffect(() => {
    void initializeTracking('admin')
    void getAdminSession().then(admin => {
      if (!admin) navigate('admin-login', {}, true)
      else setUser(admin.user)
      setChecking(false)
    })
  }, [])

  if (checking || !user) return <main className="admin-gate"><RefreshCw /><strong>Vérification des autorisations…</strong></main>

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href={routeUrl('home')}><span>ECOLYN</span><small>ADMIN</small></a>
        <nav>
          <button className={tab === 'prospects' ? 'is-active' : ''} onClick={() => setTab('prospects')}><LayoutDashboard /> Prospects</button>
          <button className={tab === 'live' ? 'is-active' : ''} onClick={() => setTab('live')}><CalendarDays /> Live</button>
          <button className={tab === 'trackings' ? 'is-active' : ''} onClick={() => setTab('trackings')}><Settings2 /> Trackings</button>
        </nav>
        <div className="admin-sidebar-account"><UserRound /><div><strong>{user.email}</strong><span>Administrateur</span></div></div>
        <button className="admin-logout" onClick={() => void signOutAdmin().then(() => navigate('admin-login', {}, true))}><LogOut /> Se déconnecter</button>
        <a className="admin-site-link" href={routeUrl('home')}><ArrowLeft /> Voir le site</a>
      </aside>
      <div className="admin-content">{tab === 'prospects' ? <ProspectsPanel /> : tab === 'live' ? <LivePanel /> : <TrackingPanel />}</div>
    </main>
  )
}
