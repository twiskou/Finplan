'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, FileText, AlertTriangle, CheckCircle2, Clock, ScanLine } from 'lucide-react'
import { formatCurrency, getDaysUntil } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/i18n'
import { ConfirmModal } from '../layout'
import dynamic from 'next/dynamic'
import PaymentModal from '@/components/PaymentModal'

const QRScannerModal = dynamic(() => import('@/components/QRScannerModal'), { ssr: false })

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
  const { t } = useTranslation()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', amount: '', currency: 'DZD', dueDate: '', frequency: 'MONTHLY', category: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [pendingBill, setPendingBill] = useState<{ billName: string; amount: number; billId: string } | null>(null)
  const [paymentData, setPaymentData] = useState<{ billName: string; amount: number; billId?: string } | null>(null)
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null) // confirm before manual pay

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
    if (r.ok) { setShowModal(false); setForm({ name: '', amount: '', currency: 'DZD', dueDate: '', frequency: 'MONTHLY', category: '' }); load(); showToast(t('bill.added')) }
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

  async function markAsPaid(billId: string) {
    const bill = bills.find(b => b.id === billId)
    if (!bill || bill.isPaid) return
    const res = await fetch(`/api/bills/${billId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bill, isPaid: true }),
    })
    if (!res.ok) {
      showToast('Erreur lors du marquage de la facture', 'error')
      return
    }
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/bills/${id}`, { method: 'DELETE' })
    load(); showToast(t('bill.deleted')); setConfirmId(null)
  }

  const unpaid = bills.filter(b => !b.isPaid)
  const paid = bills.filter(b => b.isPaid)
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0)
  const urgent = unpaid.filter(b => getDaysUntil(b.dueDate) <= 3)

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '900px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      {confirmId && <ConfirmModal message={t('bill.deleteConfirm')} onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}
      {confirmPayId && (
        <ConfirmModal
          message={t('bill.payConfirm')}
          onConfirm={async () => {
            const id = confirmPayId
            setConfirmPayId(null)
            await markAsPaid(id)
            showToast(t('bill.paySuccess'))
          }}
          onCancel={() => setConfirmPayId(null)}
        />
      )}
      {showScanner && (
        <QRScannerModal
          onClose={() => {
            setShowScanner(false)
            setPendingBill(null) // discard the pending bill on cancel
          }}
          onScan={() => {
            setShowScanner(false)
            // Move pending bill into paymentData — NOW the payment modal opens
            if (pendingBill) {
              setPaymentData(pendingBill)
              setPendingBill(null)
            }
          }}
          onSkipToPayment={() => {
            // Skip scan — go directly to payment with the bill's real amount
            if (pendingBill) {
              setPaymentData(pendingBill)
              setPendingBill(null)
            }
          }}
        />
      )}
      {paymentData && (
        <PaymentModal
          billName={paymentData.billName}
          amount={paymentData.amount}
          onClose={() => setPaymentData(null)}
          onSuccess={async () => {
            const billId = paymentData.billId // capture before state changes
            setPaymentData(null)
            if (billId) {
              await markAsPaid(billId)
            }
            showToast('Paiement effectué avec succès !')
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('bill.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{unpaid.length} {t('bill.unpaidCount')}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> {t('bill.new')}</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('bill.toPay')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{formatCurrency(totalUnpaid)}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('bill.urgent')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{urgent.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('bill.paid')}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{paid.length}</div>
        </div>
      </div>

      {/* Unpaid bills */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
      ) : bills.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>{t('bill.none')}</p>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}><Plus size={16} /> {t('common.add')}</button>
        </div>
      ) : (
        <div>
          {unpaid.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> {t('bill.toPay')} ({unpaid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {unpaid.map(b => {
                  const days = getDaysUntil(b.dueDate)
                  const isUrgent = days <= 3
                  const isLate = days < 0
                  return (
                    <div key={b.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderColor: (isLate || days === 0) ? 'rgba(239,68,68,0.3)' : isUrgent ? 'rgba(245,158,11,0.3)' : undefined }}>
                      <button
                        onClick={() => setConfirmPayId(b.id)}
                        title="Marquer comme payée"
                        style={{
                          width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)',
                          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.9rem' }}>{b.name}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {b.category && <span>{t(`cat.${b.category}` as TranslationKey) || b.category}</span>}
                          <span>• {t(`freq.${b.frequency}` as TranslationKey) || b.frequency}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: (isLate || days === 0) ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--text-muted)' }}>
                            <Clock size={11} />
                            {isLate ? `${Math.abs(days)}${t('bill.daysLate')}` : days === 0 ? t('bill.today') : `${days}${t('bill.daysLeft')}`}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: '#f59e0b', whiteSpace: 'nowrap' }}>{formatCurrency(b.amount)}</span>
                      {/* Scan QR button per bill */}
                      <button
                        onClick={() => {
                          // Store the bill info — scanner opens first, payment form comes AFTER scan
                          setPendingBill({ billName: b.name, amount: b.amount, billId: b.id })
                          setShowScanner(true)
                        }}
                        title="Scanner le QR Code de cette facture"
                        style={{
                          width: 30, height: 30, borderRadius: '8px',
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                          cursor: 'pointer', color: '#818cf8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        <ScanLine size={14} />
                      </button>
                      <button onClick={() => setConfirmId(b.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                <CheckCircle2 size={16} /> {t('bill.paid')} ({paid.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {paid.map(b => (
                  <div key={b.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <CheckCircle2 size={22} color="#22c55e" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'line-through' }}>{b.name}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatCurrency(b.amount)}</span>
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
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>{t('bill.new')}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('bill.name')}</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder={t('bill.namePlaceholder')} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('bill.amount')}</label>
                <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="3500" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('bill.dueDate')}</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('bill.frequency')}</label>
                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{t(`freq.${f.value}` as TranslationKey) || f.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t('tx.category')}</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  <option value="">{t('tx.select')}</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(`cat.${c}` as TranslationKey) || c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? t('common.saving') : t('bill.addBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
