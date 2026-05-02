'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, CreditCard, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { formatCurrency, getDaysUntil } from '@/lib/utils'

interface Debt {
  id: string; creditor: string; amount: number; currency: string
  dueDate?: string; isPaid: boolean; notes?: string
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ creditor: '', amount: '', currency: 'DZD', dueDate: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const r = await fetch('/api/debts')
    const d = await r.json()
    setDebts(d.debts || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/debts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setShowModal(false); setForm({ creditor: '', amount: '', currency: 'DZD', dueDate: '', notes: '' }); load(); showToast('Dette ajoutée') }
    else showToast('Erreur', 'error')
    setSaving(false)
  }

  async function togglePaid(debt: Debt) {
    await fetch(`/api/debts/${debt.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...debt, isPaid: !debt.isPaid }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette dette ?')) return
    await fetch(`/api/debts/${id}`, { method: 'DELETE' })
    load(); showToast('Dette supprimée')
  }

  const unpaid = debts.filter(d => !d.isPaid)
  const paid = debts.filter(d => d.isPaid)
  const totalDebt = unpaid.reduce((s, d) => s + d.amount, 0)
  const totalPaid = paid.reduce((s, d) => s + d.amount, 0)

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Dettes</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{unpaid.length} dette(s) active(s)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Nouvelle dette</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total dû</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(totalDebt)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Remboursé</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{formatCurrency(totalPaid)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Nb. actives</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{unpaid.length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
      ) : debts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
          <CreditCard size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Aucune dette enregistrée</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Bonne nouvelle si vous n&apos;avez pas de dettes !</p>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}><Plus size={16} /> Ajouter</button>
        </div>
      ) : (
        <div>
          {unpaid.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> Non remboursées ({unpaid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {unpaid.map(d => {
                  const days = d.dueDate ? getDaysUntil(d.dueDate) : null
                  return (
                    <div key={d.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <button onClick={() => togglePaid(d)} style={{
                        width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)',
                        background: 'transparent', cursor: 'pointer', flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{d.creditor}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {d.notes && <span>{d.notes}</span>}
                          {days !== null && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: days < 0 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#64748b' }}>
                              <Clock size={11} />
                              {days < 0 ? `${Math.abs(days)}j en retard` : `${days}j restants`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: '#ef4444', whiteSpace: 'nowrap' }}>{formatCurrency(d.amount)}</span>
                      <button onClick={() => handleDelete(d.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {paid.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> Remboursées ({paid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {paid.map(d => (
                  <div key={d.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: 0.5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={14} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through' }}>{d.creditor}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>{formatCurrency(d.amount)}</span>
                    <button onClick={() => handleDelete(d.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Nouvelle dette</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Créancier</label>
                <input type="text" value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} className="input-field" placeholder="Ex: Ami, Banque..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Montant (DA)</label>
                <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="10000" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Échéance (optionnel)</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Notes (optionnel)</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="Détails..." />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? 'Enregistrement...' : 'Ajouter la dette'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
