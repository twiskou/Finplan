'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { formatCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/i18n'
import { ConfirmModal } from '../layout'

interface Transaction {
  id: string; type: string; amount: number; currency: string
  category: string; description?: string; date: string; paymentMethod?: string
}

export default function TransactionsPage() {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', currency: 'DZD', category: '', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: t(`month.${i + 1}` as TranslationKey) }))

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/transactions?month=${month}&year=${year}${filterType ? `&type=${filterType}` : ''}`)
    const d = await r.json()
    setTransactions(d.transactions || [])
    setLoading(false)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const r = await fetch(`/api/transactions?month=${month}&year=${year}${filterType ? `&type=${filterType}` : ''}`)
      const d = await r.json()
      setTransactions(d.transactions || [])
      setLoading(false)
    }
    loadData()
  }, [month, year, filterType])

  function openAdd() { setEditTx(null); setForm({ type: 'EXPENSE', amount: '', currency: 'DZD', category: '', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: '' }); setShowModal(true) }
  function openEdit(tx: Transaction) { setEditTx(tx); setForm({ type: tx.type, amount: String(tx.amount), currency: tx.currency, category: tx.category, description: tx.description || '', date: tx.date.split('T')[0], paymentMethod: tx.paymentMethod || '' }); setShowModal(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const url = editTx ? `/api/transactions/${editTx.id}` : '/api/transactions'
      const method = editTx ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { setShowModal(false); load(); showToast(editTx ? t('common.saved') : t('common.saved')) }
      else { const d = await r.json(); showToast(d.error || 'Erreur', 'error') }
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    const r = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (r.ok) { load(); showToast(t('common.saved')) }
    else showToast('Erreur', 'error')
    setConfirmId(null)
  }

  const filtered = transactions.filter(tx =>
    (!search || tx.category.toLowerCase().includes(search.toLowerCase()) || (tx.description || '').toLowerCase().includes(search.toLowerCase()))
  )
  const income = transactions.filter(tx => tx.type === 'INCOME').reduce((s, tx) => s + tx.amount, 0)
  const expense = transactions.filter(tx => tx.type === 'EXPENSE').reduce((s, tx) => s + tx.amount, 0)
  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? <ArrowUpRight size={16} /> : <X size={16} />}{toast.msg}</div>}
      {confirmId && <ConfirmModal message={t('tx.deleteConfirm')} onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('tx.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t(`month.${month}` as TranslationKey)} {year}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={18} /> {t('common.add')}</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.income')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{formatCurrency(income)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.expenses')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(expense)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.balance')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: income - expense >= 0 ? '#22c55e' : '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(income - expense)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field" placeholder={t('common.search')} style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field" style={{ width: 'auto' }}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="">{t('common.all')}</option>
          <option value="INCOME">{t('tx.income')}</option>
          <option value="EXPENSE">{t('tx.expense')}</option>
        </select>
      </div>

      {/* List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ArrowUpRight size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>{t('tx.noTransactions')}</p>
            <button className="btn-primary" onClick={openAdd} style={{ marginTop: '1rem' }}><Plus size={16} /> {t('common.add')}</button>
          </div>
        ) : (
          <div>
            {filtered.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: tx.type === 'INCOME' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '0.875rem' }}>
                  {tx.type === 'INCOME' ? <ArrowUpRight size={18} style={{ color: '#22c55e' }} /> : <ArrowDownRight size={18} style={{ color: '#ef4444' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{tx.category}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                    <span>{new Date(tx.date).toLocaleDateString('fr-FR')}</span>
                    {tx.description && <span>• {tx.description}</span>}
                    {tx.paymentMethod && <span>• {tx.paymentMethod}</span>}
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: tx.type === 'INCOME' ? '#22c55e' : '#ef4444', marginRight: '1rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => openEdit(tx)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button>
                  <button onClick={() => setConfirmId(tx.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
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
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>
                {editTx ? t('tx.edit') : t('tx.new')}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'EXPENSE', category: '' }))} style={{ padding: '0.625rem', borderRadius: '0.625rem', border: `1px solid ${form.type === 'EXPENSE' ? '#ef4444' : 'rgba(99,102,241,0.15)'}`, background: form.type === 'EXPENSE' ? 'rgba(239,68,68,0.12)' : 'transparent', color: form.type === 'EXPENSE' ? '#f87171' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <ArrowDownRight size={16} /> {t('tx.expense')}
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'INCOME', category: '' }))} style={{ padding: '0.625rem', borderRadius: '0.625rem', border: `1px solid ${form.type === 'INCOME' ? '#22c55e' : 'rgba(99,102,241,0.15)'}`, background: form.type === 'INCOME' ? 'rgba(34,197,94,0.12)' : 'transparent', color: form.type === 'INCOME' ? '#4ade80' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <ArrowUpRight size={16} /> {t('tx.income')}
                </button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.amount')}</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="0" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.category')}</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" required>
                  <option value="">{t('tx.choose')}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.date')}</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.paymentMethod')}</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                  <option value="">{t('tx.select')}</option>
                  {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.description')}</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder={t('tx.notes')} />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? t('common.saving') : editTx ? t('common.edit') : t('common.add')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
