'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, Target, Trophy, Clock } from 'lucide-react'
import { formatCurrency, getDaysUntil } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { ConfirmModal } from '../layout'

interface SavingGoal {
  id: string; name: string; targetAmount: number; savedAmount: number
  currency: string; deadline?: string; icon?: string; color?: string; isCompleted: boolean
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6']

export default function GoalsPage() {
  const { t } = useTranslation()
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingGoal | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'Target', color: '#6366f1' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const r = await fetch('/api/goals')
    const d = await r.json()
    setGoals(d.goals || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditGoal(null); setForm({ name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'Target', color: '#6366f1' }); setShowModal(true) }
  function openEdit(g: SavingGoal) {
    setEditGoal(g)
    setForm({ name: g.name, targetAmount: String(g.targetAmount), savedAmount: String(g.savedAmount), deadline: g.deadline ? g.deadline.split('T')[0] : '', icon: g.icon || 'Target', color: g.color || '#6366f1' })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const url = editGoal ? `/api/goals/${editGoal.id}` : '/api/goals'
      const method = editGoal ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { setShowModal(false); load(); showToast(t('common.saved')) }
      else showToast('Erreur', 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    load(); showToast(t('common.saved')); setConfirmId(null)
  }

  async function addSaving(goal: SavingGoal) {
    const amount = prompt(t('goal.addAmount'))
    if (!amount || isNaN(Number(amount))) return
    const newSaved = goal.savedAmount + Number(amount)
    await fetch(`/api/goals/${goal.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...goal, savedAmount: newSaved, targetAmount: goal.targetAmount, isCompleted: newSaved >= goal.targetAmount }),
    })
    load(); showToast(`+${Number(amount).toLocaleString()} DA`)
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      {confirmId && <ConfirmModal message={t('goal.deleteConfirm')} onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('goal.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{goals.length} {t('goal.active')}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={18} /> {t('goal.new')}</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('goal.total')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.25rem' }}>{formatCurrency(totalTarget)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('goal.saved')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{formatCurrency(totalSaved)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('goal.progress')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem' }}>{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}</div>
      ) : goals.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Target size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{t('goal.none')}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t('goal.noneSubtitle')}</p>
          <button className="btn-primary" onClick={openAdd} style={{ marginTop: '1.25rem' }}><Plus size={16} /> {t('goal.create')}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {goals.map(g => {
            const pct = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0
            const daysLeft = g.deadline ? getDaysUntil(g.deadline) : null
            return (
              <div key={g.id} className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                {g.isCompleted && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 700 }}>
                    <Trophy size={12} /> {t('goal.completed')}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${g.color || '#6366f1'}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${g.color || '#6366f1'}22`, border: `1px solid ${g.color || '#6366f1'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={20} style={{ color: g.color || '#6366f1' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-jakarta)', fontSize: '0.95rem' }}>{g.name}</h3>
                    {daysLeft !== null && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: daysLeft <= 7 ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                        <Clock size={11} /> {daysLeft > 0 ? `${daysLeft} ${t('goal.daysLeft')}` : t('goal.deadlinePassed')}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                    <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="32" cy="32" r="28" fill="none" stroke={`${g.color || '#6366f1'}22`} strokeWidth="5" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke={g.color || '#6366f1'} strokeWidth="5" strokeDasharray={`${pct * 1.76} ${176 - pct * 1.76}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: g.color || '#6366f1' }}>{pct.toFixed(0)}%</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('goal.saved')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)' }}>{formatCurrency(g.savedAmount)}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t('goal.on')} {formatCurrency(g.targetAmount)}</div>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginBottom: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: g.color || '#6366f1' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => addSaving(g)} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', justifyContent: 'center' }}><Plus size={14} /> {t('goal.save')}</button>
                  <button onClick={() => openEdit(g)} style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button>
                  <button onClick={() => setConfirmId(g.id)} style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
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
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>
                {editGoal ? t('goal.edit') : t('goal.new')}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('goal.name')}</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder={t('goal.namePlaceholder')} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('goal.targetAmount')}</label>
                <input type="number" min="1" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} className="input-field" placeholder="100000" required />
              </div>
              {editGoal && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('goal.savedAmount')}</label>
                  <input type="number" min="0" value={form.savedAmount} onChange={e => setForm(f => ({ ...f, savedAmount: e.target.value }))} className="input-field" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('goal.deadline')}</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('goal.color')}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.15s' }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? t('common.saving') : editGoal ? t('common.edit') : t('goal.create')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
