'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, ArrowUpRight, ArrowDownRight, Filter, Search } from 'lucide-react'
import { formatCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, getMonthName } from '@/lib/utils'

interface Transaction {
  id: string; type: string; amount: number; currency: string
  category: string; description?: string; date: string; paymentMethod?: string
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', currency: 'DZD', category: '', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/transactions?month=${month}&year=${year}${filterType ? `&type=${filterType}` : ''}`)
    const d = await r.json()
    setTransactions(d.transactions || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [month, filterType])

  function openAdd() { setEditTx(null); setForm({ type: 'EXPENSE', amount: '', currency: 'DZD', category: '', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: '' }); setShowModal(true) }
  function openEdit(t: Transaction) { setEditTx(t); setForm({ type: t.type, amount: String(t.amount), currency: t.currency, category: t.category, description: t.description || '', date: t.date.split('T')[0], paymentMethod: t.paymentMethod || '' }); setShowModal(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editTx ? `/api/transactions/${editTx.id}` : '/api/transactions'
      const method = editTx ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { setShowModal(false); load(); showToast(editTx ? 'Transaction modifiée' : 'Transaction ajoutée') }
      else { const d = await r.json(); showToast(d.error || 'Erreur', 'error') }
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette transaction ?')) return
    const r = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (r.ok) { load(); showToast('Transaction supprimée') }
    else showToast('Erreur', 'error')
  }

  const filtered = transactions.filter(t =>
    (!search || t.category.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase()))
  )
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? <ArrowUpRight size={16} /> : <X size={16} />}{toast.msg}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Transactions</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{getMonthName(month)} {year}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={18} /> Ajouter</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Revenus</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{formatCurrency(income)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Dépenses</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(expense)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Solde</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: income - expense >= 0 ? '#22c55e' : '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(income - expense)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field" placeholder="Rechercher..." style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field" style={{ width: 'auto' }}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="">Tous</option>
          <option value="INCOME">Revenus</option>
          <option value="EXPENSE">Dépenses</option>
        </select>
      </div>

      {/* List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
            <ArrowUpRight size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>Aucune transaction</p>
            <button className="btn-primary" onClick={openAdd} style={{ marginTop: '1rem' }}><Plus size={16} /> Ajouter</button>
          </div>
        ) : (
          <div>
            {filtered.map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', padding: '1rem 1.25rem',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.type === 'INCOME' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '0.875rem' }}>
                  {t.type === 'INCOME' ? <ArrowUpRight size={18} style={{ color: '#22c55e' }} /> : <ArrowDownRight size={18} style={{ color: '#ef4444' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{t.category}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                    <span>{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                    {t.description && <span>• {t.description}</span>}
                    {t.paymentMethod && <span>• {t.paymentMethod}</span>}
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: t.type === 'INCOME' ? '#22c55e' : '#ef4444', marginRight: '1rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => openEdit(t)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>
                {editTx ? 'Modifier la transaction' : 'Nouvelle transaction'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'EXPENSE', category: '' }))} style={{ padding: '0.625rem', borderRadius: '0.625rem', border: `1px solid ${form.type === 'EXPENSE' ? '#ef4444' : 'rgba(99,102,241,0.15)'}`, background: form.type === 'EXPENSE' ? 'rgba(239,68,68,0.12)' : 'transparent', color: form.type === 'EXPENSE' ? '#f87171' : '#64748b', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <ArrowDownRight size={16} /> Dépense
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'INCOME', category: '' }))} style={{ padding: '0.625rem', borderRadius: '0.625rem', border: `1px solid ${form.type === 'INCOME' ? '#22c55e' : 'rgba(99,102,241,0.15)'}`, background: form.type === 'INCOME' ? 'rgba(34,197,94,0.12)' : 'transparent', color: form.type === 'INCOME' ? '#4ade80' : '#64748b', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <ArrowUpRight size={16} /> Revenu
                </button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Montant (DA)</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="0" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Catégorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" required>
                  <option value="">Choisir...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Mode de paiement</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                  <option value="">Sélectionner...</option>
                  {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem' }}>Description (optionnel)</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Notes..." />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? 'Enregistrement...' : editTx ? 'Modifier' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
