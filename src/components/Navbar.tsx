'use client'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface NavbarProps {
  activePage?: 'login' | 'register'
}

export default function Navbar({ activePage }: NavbarProps) {
  const { t } = useTranslation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-nav)',
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'var(--text-heading)' }}>
            Fin<span style={{ color: '#6366f1' }}>plan</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link
            href="/login"
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              opacity: activePage === 'login' ? 0.5 : 1,
              pointerEvents: activePage === 'login' ? 'none' : 'auto',
            }}
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/register"
            className="btn-primary"
            style={{
              padding: '0.5rem 1rem',
              opacity: activePage === 'register' ? 0.5 : 1,
              pointerEvents: activePage === 'register' ? 'none' : 'auto',
            }}
          >
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
