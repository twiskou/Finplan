'use client'
import { useState } from 'react'
import { X, QrCode, AlertCircle, CreditCard } from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'

interface QRScannerModalProps {
  onClose: () => void
  onScan: (data: string) => void
  onSkipToPayment: () => void // New: skip scan and go directly to payment
}

export default function QRScannerModal({ onClose, onScan, onSkipToPayment }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanned, setScanned] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  function handleScan(result: { rawValue: string }[]) {
    if (scanned || !result || result.length === 0) return
    setScanned(true)
    onScan(result[0].rawValue)
  }

  function handleError(err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('Permission') || err.message.includes('NotAllowed')) {
        setError("Accès à la caméra refusé. Veuillez autoriser l'accès.")
      } else {
        setError("Erreur lors de l'accès à la caméra.")
      }
    } else {
      setError("Erreur lors de l'accès à la caméra.")
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'rgba(15, 15, 26, 0.98)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QrCode size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Scanner QR Code</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Pointez la caméra arrière vers le QR</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera View */}
        {error ? (
          <div style={{
            borderRadius: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            padding: '2rem', textAlign: 'center', color: '#f87171',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
          }}>
            <AlertCircle size={32} />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</p>
          </div>
        ) : (
          <div style={{ borderRadius: '1rem', overflow: 'hidden', position: 'relative' }}>
            {/* Scan frame overlay */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'relative', width: 180, height: 180 }}>
                {[
                  { top: 0, left: 0, borderTop: '3px solid #6366f1', borderLeft: '3px solid #6366f1', borderRadius: '4px 0 0 0' },
                  { top: 0, right: 0, borderTop: '3px solid #6366f1', borderRight: '3px solid #6366f1', borderRadius: '0 4px 0 0' },
                  { bottom: 0, left: 0, borderBottom: '3px solid #6366f1', borderLeft: '3px solid #6366f1', borderRadius: '0 0 0 4px' },
                  { bottom: 0, right: 0, borderBottom: '3px solid #6366f1', borderRight: '3px solid #6366f1', borderRadius: '0 0 4px 0' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
                ))}
                <style>{`
                  @keyframes scanLine {
                    0% { top: 10px; opacity: 1; }
                    50% { top: 160px; opacity: 0.7; }
                    100% { top: 10px; opacity: 1; }
                  }
                `}</style>
                <div style={{
                  position: 'absolute', left: 8, right: 8, height: 2,
                  background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                  animation: 'scanLine 2s ease-in-out infinite',
                }} />
              </div>
            </div>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode }}
              styles={{ container: { borderRadius: '1rem' } }}
            />
            
            {/* Camera Switch Button */}
            <button
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              style={{
                position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 20,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              title="Changer de caméra"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path>
                <path d="M20 15v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"></path>
                <path d="m16 5-4-4-4 4"></path>
                <path d="m16 19-4 4-4-4"></path>
              </svg>
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '1rem', marginBottom: '0.875rem' }}>
          Le scan est automatique dès détection du QR Code
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>OU</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Skip to payment button */}
        <button
          onClick={() => { onClose(); onSkipToPayment() }}
          style={{
            width: '100%', padding: '0.7rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '10px', cursor: 'pointer',
            color: '#818cf8', fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <CreditCard size={15} />
          Payer directement sans scanner
        </button>
      </div>
    </div>
  )
}
