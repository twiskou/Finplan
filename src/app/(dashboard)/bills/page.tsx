'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatCurrency, getDaysUntil } from '@/lib/utils'

interface Bill {
  id: string; name: string; amount: number; currency: string
  dueDate: string; frequency: string; isPaid: boolean; category?: string
}

const FREQUENCIES = [
  { value: 'MONTHLY', label: 'Mensuel' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'YEARLY', label: 'Annuel' },
  { value: 'DAILY', label: 'Quotidien' },
]

const CATEGORIES = ['Internet', 'Téléphone', 'Électricité', 'Eau', 'Gaz', 'Loyer', 'Assurance', 'Abonnement', 'Autre']

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', currency: 'DZD', dueDate: '', frequency: 'MONTHLY', category: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const r = await fetch('/api/bills')
    const d = await r.json()
    setBills(d.bills || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setShowModal(false); setForm({ name: '', amount: '', currency: 'DZD', dueDate: '', frequency: 'MONTHLY', category: '' }); load(); showToast('Facture ajoutée') }
    else showToast('Erreur', 'error')
    setSaving(false)
  }

  async function togglePaid(bill: Bill) {
    await fetch(`/api/bills/${bill.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bill, isPaid: !bill.isPaid }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette facture ?')) return
    await fetch(`/api/bills/${id}`, { method: 'DELETE' })
    load(); showToast('Facture supprimée')
  }

  const unpaid = bills.filter(b => !b.isPaid)
  const paid = bills.filter(b => b.isPaid)
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0)
  const urgent = unpaid.filter(b => getDaysUntil(b.dueDate) <= 3)

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Factures</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{unpaid.length} facture(s) à payer</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Nouvelle facture</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>À payer</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{formatCurrency(totalUnpaid)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Urgentes</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{urgent.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Payées</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{paid.length}</div>
        </div>
      </div>

      {/* Unpaid bills */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
      ) : bills.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
          <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Aucune facture enregistrée</p>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}><Plus size={16} /> Ajouter</button>
        </div>
      ) : (
        <div>
          {unpaid.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> À payer ({unpaid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {unpaid.map(b => {
                  const days = getDaysUntil(b.dueDate)
                  const isUrgent = days <= 3
                  const isLate = days < 0
                  return (
                    <div key={b.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderColor: isLate ? 'rgba(239,68,68,0.3)' : isUrgent ? 'rgba(245,158,11,0.3)' : undefined }}>
                      <button onClick={() => togglePaid(b)} style={{
                        width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)',
                        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{b.name}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {b.category && <span>{b.category}</span>}
                          <span>• {FREQUENCIES.find(f => f.value === b.frequency)?.label}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: isLate ? '#ef4444' : isUrgent ? '#f59e0b' : '#64748b' }}>
                            <Clock size={11} />
                            {isLate ? `${Math.abs(days)}j en retard` : days === 0 ? "Aujourd'hui" : `${days}j restants`}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: '#f59e0b', whiteSpace: 'nowrap' }}>{formatCurrency(b.amount)}</span>
                      <button onClick={() => handleDelete(b.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                <CheckCircle2 size={16} /> Payées ({paid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {paid.map(b => (
                  <div key={b.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: 0.6 }}>
                    <button onClick={() => togglePaid(b)} style={{
                      width: 24, height: 24, borderRadius: '50%', border: '2px solid #22c55e',
                      background: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <CheckCircle2 size={14} color="white" />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'line-through' }}>{b.name}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>{formatCurrency(b.amount)}</span>
                    <button onClick={() => handleDelete(b.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Nouvelle facture</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Nom</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Ex: Internet, Loyer..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Montant (DA)</label>
                <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="3500" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Date d&apos;échéance</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Fréquence</label>
                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Catégorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  <option value="">Sélectionner...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? 'Enregistrement...' : 'Ajouter la facture'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
