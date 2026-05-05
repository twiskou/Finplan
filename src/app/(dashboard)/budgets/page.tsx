'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { formatCurrency, EXPENSE_CATEGORIES } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/i18n'
import { ConfirmModal } from '../layout'

interface Budget { id: string; category: string; limit: number; spent: number; month: number; year: number }

export default function BudgetsPage() {
  const { t } = useTranslation()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState({ category: '', limit: '' })
  const [saving, setSaving] = useState(false)
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/budgets?month=${month}&year=${year}`)
    const d = await r.json()
    setBudgets(d.budgets || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, month, year }) })
    if (r.ok) { setShowModal(false); setForm({ category: '', limit: '' }); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    load(); setConfirmId(null)
  }

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {confirmId && <ConfirmModal message={t('budget.deleteConfirm')} onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('budget.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t(`month.${month}` as TranslationKey)} {year}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> {t('budget.new')}</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('budget.total')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.25rem' }}>{formatCurrency(totalLimit)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('budget.spent')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{formatCurrency(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('budget.remaining')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{formatCurrency(Math.max(totalLimit - totalSpent, 0))}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
      ) : budgets.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600 }}>{t('budget.none')}</p>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}><Plus size={16} /> {t('budget.create')}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {budgets.map(b => {
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0
            const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e'
            const status = pct >= 100 ? t('budget.exceeded') : pct >= 80 ? t('budget.warning') : t('budget.ok')
            return (
              <div key={b.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-jakarta)' }}>{b.category}</h3>
                    <span style={{ display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, marginTop: '0.25rem', background: pct >= 100 ? 'rgba(239,68,68,0.15)' : pct >= 80 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)', color }}>{status}</span>
                  </div>
                  <button onClick={() => setConfirmId(b.id)} className="btn-danger" style={{ padding: '0.375rem 0.625rem' }}><Trash2 size={14} /></button>
                </div>
                <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('budget.spent')} : </span>
                    <span style={{ fontWeight: 700, color }}>{formatCurrency(b.spent)}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('budget.limit')} : </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{formatCurrency(b.limit)}</span>
                  </div>
                  <span style={{ fontWeight: 800, color, fontSize: '1.05rem' }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>{t('budget.new')}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('budget.category')}</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" required>
                  <option value="">{t('budget.choose')}</option>
                  {EXPENSE_CATEGORIES.filter(c => !budgets.some(b => b.category === c)).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('budget.limitDA')}</label>
                <input type="number" min="1" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} className="input-field" placeholder="Ex: 15000" required />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? t('common.saving') : t('budget.create')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
