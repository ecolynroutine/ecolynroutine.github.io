import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { getAdminSession, signInAdmin } from '../lib/admin'
import { navigate, routeUrl } from '../lib/navigation'
import { isSupabaseConfigured } from '../lib/supabase'
import { initializeTracking } from '../lib/tracking'
import './admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const configured = isSupabaseConfigured()

  useEffect(() => {
    void initializeTracking('admin_login')
    if (!configured) return
    void getAdminSession().then(admin => {
      if (admin) navigate('admin', {}, true)
    })
  }, [configured])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await signInAdmin(email.trim(), password)
      navigate('admin', {}, true)
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : ''
      setError(
        code === 'NOT_ADMIN'
          ? 'Ce compte existe, mais il ne possède pas le rôle administrateur.'
          : code === 'SUPABASE_NOT_CONFIGURED'
            ? 'La connexion Supabase doit être configurée avant de se connecter.'
            : 'Adresse e-mail ou mot de passe incorrect.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="admin-auth-page">
      <a className="admin-back-link" href={routeUrl('home')}><ArrowLeft /> Retour au site</a>
      <section className="admin-auth-card">
        <div className="admin-auth-brand">
          <span>ECOLYN</span>
          <small>ESPACE SÉCURISÉ</small>
        </div>
        <div className="admin-auth-icon"><LockKeyhole /></div>
        <p className="admin-kicker">Administration</p>
        <h1>Bienvenue dans votre espace privé.</h1>
        <p className="admin-auth-copy">Connectez-vous pour gérer les prospects et les pixels de mesure.</p>

        {!configured ? (
          <div className="admin-setup-warning" role="status">
            <ShieldCheck />
            <div>
              <strong>Supabase est prêt côté code.</strong>
              <p>Ajoutez l’URL du projet et la clé publique dans les variables d’environnement pour activer la connexion.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="admin-login-form">
            <label>
              <span>Adresse e-mail</span>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              <span>Mot de passe</span>
              <div className="admin-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            {error && <p className="admin-form-error" role="alert">{error}</p>}
            <button className="admin-primary-button" type="submit" disabled={sending}>
              {sending ? 'Vérification…' : 'Se connecter'}
            </button>
          </form>
        )}
        <p className="admin-security-note"><ShieldCheck /> La protection des données est appliquée par les règles RLS de Supabase.</p>
      </section>
    </main>
  )
}
