'use client'
import { useEffect, useState } from 'react'
import { Shield, Users, CreditCard, BarChart3, ArrowUpRight, Check, X, Crown } from 'lucide-react'

interface UserInfo {
  id: string; name: string; email: string; role: string; plan: string; isActive: boolean; createdAt: string; language?: string
}

interface Stats { totalUsers: number; premiumUsers: number; totalTransactions: number; monthlyRevenue: number }

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
      ])
      setStats(statsRes.stats)
      setUsers(usersRes.users || statsRes.recentUsers || [])
    } catch { /* ignore */ }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function updateUser(userId: string, data: Partial<{ plan: string; isActive: boolean; role: string }>) {
    const r = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    })
    if (r.ok) { load(); showToast('Utilisateur mis à jour') }
    else showToast('Erreur', 'error')
  }

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '1100px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} style={{ color: '#fcd34d' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Administration</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Gérez les utilisateurs et surveillez la plateforme</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Premium', value: stats.premiumUsers, icon: Crown, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Transactions', value: stats.totalTransactions, icon: BarChart3, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
            { label: 'Revenu mensuel', value: `${(stats.monthlyRevenue * 990).toLocaleString()} DA`, icon: CreditCard, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
          ].map(card => (
            <div key={card.label} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-jakarta)' }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>Utilisateurs</h2>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{users.length} utilisateur(s)</span>
        </div>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {['Utilisateur', 'Rôle', 'Plan', 'Statut', 'Inscrit', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{u.name}</div>
                          <div style={{ color: '#475569', fontSize: '0.75rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-free">{u.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${u.plan === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`}>{u.plan}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                        background: u.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: u.isActive ? '#4ade80' : '#f87171',
                      }}>
                        {u.isActive ? <Check size={11} /> : <X size={11} />}
                        {u.isActive ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => updateUser(u.id, { plan: u.plan === 'FREE' ? 'PREMIUM' : 'FREE' })}
                          title={u.plan === 'FREE' ? 'Passer en Premium' : 'Passer en Free'}
                          style={{ width: 28, height: 28, borderRadius: '6px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer', color: '#fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Crown size={13} />
                        </button>
                        <button
                          onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                          title={u.isActive ? 'Bloquer' : 'Débloquer'}
                          style={{ width: 28, height: 28, borderRadius: '6px', background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, cursor: 'pointer', color: u.isActive ? '#f87171' : '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {u.isActive ? <X size={13} /> : <Check size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
