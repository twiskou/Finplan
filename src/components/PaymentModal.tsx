'use client'
import { useState, useEffect, useRef } from 'react'
import { X, CreditCard, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/i18n'

interface PaymentModalProps {
  billName: string
  amount: number
  onClose: () => void
  onSuccess: () => void
}

function detectCardType(number: string): 'edahabia' | 'cib' | null {
  const clean = number.replace(/\s/g, '')
  if (clean.length < 4) return null          // Bug fix: wait for ≥4 digits before showing badge
  if (clean.startsWith('622')) return 'edahabia'
  return 'cib'
}

function formatCardNumber(value: string) {
  const clean = value.replace(/\D/g, '').slice(0, 16)
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
  const clean = value.replace(/\D/g, '').slice(0, 4)
  if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2)
  return clean
}

// Extracted outside PaymentModal to avoid recreation on each render
function CardBadge({ cardType }: { cardType: 'edahabia' | 'cib' | null }) {
  if (!cardType) return null
  const isEdahabia = cardType === 'edahabia'
  return (
    <div style={{
      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
      background: isEdahabia
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem',
      fontWeight: 800, color: 'white', letterSpacing: '0.03em', zIndex: 10,
    }} dir="ltr">
      {isEdahabia ? 'EDAHABIA' : 'CIB'}
    </div>
  )
}

type PaymentStep = 'form' | 'confirm' | 'processing' | 'success' | 'error'

export default function PaymentModal({ billName, amount, onClose, onSuccess }: PaymentModalProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<PaymentStep>('form')
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount to avoid calling onSuccess on unmounted component
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const cardType = detectCardType(form.cardNumber)

  function validate() {
    const e: Record<string, string> = {}
    const clean = form.cardNumber.replace(/\s/g, '')
    if (clean.length < 16) e.cardNumber = t('pay.invalidCard')
    if (form.expiry.length < 5) e.expiry = t('pay.invalidExpiry')
    if (form.cvv.length < 3) e.cvv = t('pay.invalidCvv')
    if (!form.name.trim()) e.name = t('pay.nameRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStep('confirm')
  }

  async function processPayment() {
    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))
    setStep('success')
    timerRef.current = setTimeout(() => { onSuccess() }, 1500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.875rem', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    color: 'white', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '0.05em',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem',
  }
  const errorStyle: React.CSSProperties = {
    fontSize: '0.7rem', color: '#f87171', marginTop: '0.3rem',
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && step === 'form' && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'rgba(10, 10, 20, 0.99)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '1.5rem', padding: '1.75rem',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      }}>

        {/* === CONFIRM === */}
        {step === 'confirm' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <AlertCircle size={52} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 800, color: 'white', fontSize: '1.15rem' }}>{t('pay.confirmTitle')}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0.75rem 0 1.5rem', lineHeight: 1.5 }}>
              {t('pay.confirmDesc1')} <strong style={{ color: '#f59e0b' }}>{amount.toLocaleString('fr-DZ')} DZD</strong> {t('pay.confirmDesc2')} <strong style={{ color: 'white' }}>{billName}</strong> {t('pay.confirmDesc3')}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep('form')} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                {t('common.cancel')}
              </button>
              <button onClick={processPayment} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '10px', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', transition: 'transform 0.2s' }}>
                {t('common.confirm')}
              </button>
            </div>
          </div>
        )}

        {/* === PROCESSING === */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <Loader2 size={52} color="#6366f1" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
            <p style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>{t('pay.processing')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {t('pay.wait')}
            </p>
          </div>
        )}

        {/* === SUCCESS === */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={56} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 800, color: 'white', fontSize: '1.15rem' }}>{t('pay.success')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
              {t('pay.successDesc')}
            </p>
          </div>
        )}

        {/* === ERROR === */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <AlertCircle size={52} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>{t('pay.failed')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '0.5rem 0 1.5rem' }}>
              {t('pay.failedDesc')}
            </p>
            <button onClick={() => setStep('form')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('pay.retry')}
            </button>
          </div>
        )}

        {/* === FORM === */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: cardType === 'edahabia'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s',
                }}>
                  <CreditCard size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{t('pay.secure')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{billName}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Amount Card */}
            <div style={{
              background: cardType === 'edahabia'
                ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
              border: `1px solid ${cardType === 'edahabia' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`,
              borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('pay.amountToPay')}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginTop: '0.2rem' }}>
                {amount.toLocaleString('fr-DZ')} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>DZD</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Card Number */}
              <div>
                <label style={labelStyle}>{t('pay.cardNumber')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    dir="ltr"
                    style={{ ...inputStyle, paddingRight: '3.5rem', textAlign: 'left' }}
                    placeholder="0000 0000 0000 0000"
                    value={form.cardNumber}
                    onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                    inputMode="numeric"
                  />
                  <CardBadge cardType={cardType} />
                </div>
                {errors.cardNumber && <div style={errorStyle}>{errors.cardNumber}</div>}
              </div>

              {/* Expiry + CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>{t('pay.expiry')}</label>
                  <input
                    dir="ltr"
                    style={{ ...inputStyle, textAlign: 'left' }}
                    placeholder="MM/AA"
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                    maxLength={5}
                    inputMode="numeric"
                  />
                  {errors.expiry && <div style={errorStyle}>{errors.expiry}</div>}
                </div>
                <div>
                  <label style={labelStyle}>{t('pay.cvv')}</label>
                  <input
                    dir="ltr"
                    style={{ ...inputStyle, textAlign: 'left', letterSpacing: '0.2em' }}
                    placeholder="***"
                    value={form.cvv}
                    onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    maxLength={3}
                    type="password"
                    inputMode="numeric"
                  />
                  {errors.cvv && <div style={errorStyle}>{errors.cvv}</div>}
                </div>
              </div>

              {/* Card Name */}
              <div>
                <label style={labelStyle}>{t('pay.cardHolder')}</label>
                <input
                  style={{ ...inputStyle, fontFamily: 'inherit', letterSpacing: 'normal' }}
                  placeholder="NOM PRÉNOM"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                />
                {errors.name && <div style={errorStyle}>{errors.name}</div>}
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                style={{
                  marginTop: '0.25rem', width: '100%', padding: '0.875rem',
                  background: cardType === 'edahabia'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  color: 'white', fontWeight: 800, fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
              >
                <Lock size={15} />
                {t('pay.btn')} {amount.toLocaleString('fr-DZ')} DZD
              </button>

              {/* Security note */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '-0.25rem' }}>
                <Lock size={11} color="rgba(255,255,255,0.25)" />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                  {t('pay.securityNote')}
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
