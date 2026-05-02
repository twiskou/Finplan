'use client'
import { useEffect, useState } from 'react'
import { Settings, User, Globe, Palette, Save, Check } from 'lucide-react'

interface UserProfile {
  id: string; name: string; email: string; role: string; plan: string
  theme: string; language: string; currency: string
}

import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme: activeTheme, setTheme: setActiveTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('fr')
  const [theme, setTheme] = useState('dark')
  const [currency, setCurrency] = useState('DZD')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user)
        setName(d.user.name)
        setLanguage(d.user.language)
        setTheme(d.user.theme)
        setCurrency(d.user.currency)
        setActiveTheme(d.user.theme)
      }
    })
  }, [setActiveTheme])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/auth/me', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, language, theme, currency }),
    })
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  if (!user) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
  }

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '700px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} style={{ color: '#818cf8' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Paramètres</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Gérez votre profil et vos préférences</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-jakarta)', fontSize: '1.1rem' }}>{user.name}</h2>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
              <span className={`badge ${user.plan === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`}>{user.plan}</span>
              <span className="badge badge-free">{user.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>
              <User size={14} /> Nom complet
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
          </div>

          {/* Language */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>
              <Globe size={14} /> Langue
            </label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              <Palette size={14} /> Thème
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['dark', 'light'].map(t => (
                <button key={t} type="button" onClick={() => { setTheme(t); setActiveTheme(t); }} style={{
                  flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                  border: theme === t ? '2px solid #6366f1' : '1px solid rgba(99,102,241,0.15)',
                  background: theme === t ? 'var(--bg-btn-sec)' : 'transparent',
                  color: theme === t ? 'var(--text-btn-sec)' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                }}>
                  {t === 'dark' ? '🌙' : '☀️'} {t === 'dark' ? 'Sombre' : 'Clair'}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Devise</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
              <option value="DZD">Dinar Algérien (DZD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar US (USD)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
            {saved ? <><Check size={18} /> Enregistré !</> : saving ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-jakarta)', marginBottom: '1rem' }}>Informations du compte</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Abonnement</span>
            <span className={`badge ${user.plan === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`}>{user.plan}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Rôle</span>
            <span style={{ color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600 }}>{user.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>ID Utilisateur</span>
            <span style={{ color: '#475569', fontSize: '0.78rem', fontFamily: 'monospace' }}>{user.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
