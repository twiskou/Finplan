'use client'
import Link from 'next/link'
import { TrendingUp, Heart } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer style={{
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border-nav)',
      background: 'var(--bg-nav)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '0.75rem',
        textAlign: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <>
            <img 
              src="/logo.png" 
              alt="Finplan Logo" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('footer-logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          </>
          <div id="footer-logo-fallback" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-jakarta)' }}>
              Fin<span style={{ color: '#6366f1' }}>plan</span>
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Finplan', href: '/' },
            { label: t('nav.login'), href: '/login' },
            { label: t('nav.register'), href: '/register' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="footer-link"
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          © 2026 Finplan
          <Heart size={12} style={{ color: '#4f46e5' }} />
        </p>
      </div>
    </footer>
  )
}
