'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, Target, PiggyBank,
  FileText, CreditCard, Brain, Settings, Bell, LogOut,
  TrendingUp, Menu, X, ChevronRight, Shield
} from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface User { id: string; name: string; email: string; role: string; plan: string }

// ConfirmModal — replaces native confirm()
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onCancel} className="btn-secondary">{t('common.cancel')}</button>
          <button onClick={onConfirm} className="btn-danger">{t('common.confirm')}</button>
        </div>
      </div>
    </div>
  )
}

export { ConfirmModal }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, isRTL } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/transactions', icon: ArrowLeftRight, label: t('nav.transactions') },
    { href: '/budgets', icon: PiggyBank, label: t('nav.budgets') },
    { href: '/goals', icon: Target, label: t('nav.goals') },
    { href: '/bills', icon: FileText, label: t('nav.bills') },
    { href: '/debts', icon: CreditCard, label: t('nav.debts') },
    { href: '/insights', icon: Brain, label: t('nav.insights') },
  ]

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user)
      } else {
        // Token is stale or user was deleted — clear cookie then redirect
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => router.push('/login'))
      }
    }).catch(() => {
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => router.push('/login'))
    })

    fetch('/api/notifications').then(r => r.json()).then(d => {
      if (d.notifications) setNotifCount(d.notifications.filter((n: { isRead: boolean }) => !n.isRead).length)
    })
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b' }}>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem', padding: '0 0.25rem' }}>
        <>
          <img 
            src="/logo.png" 
            alt="Finplan Logo" 
            style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        </>
        <div className="sidebar-logo-fallback" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-jakarta)', color: 'white' }}>
            Fin<span style={{ color: '#6366f1' }}>plan</span>
          </span>
        </div>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div style={{ height: '1px', background: 'rgba(99,102,241,0.1)', margin: '0.5rem 0' }} />
            <Link href="/admin" className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Shield size={18} />
              {t('nav.admin')}
            </Link>
          </>
        )}
      </nav>

      <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link href="/notifications" className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`} style={{ position: 'relative' }} onClick={() => setSidebarOpen(false)}>
          <Bell size={18} />
          {t('nav.notifications')}
          {notifCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', minWidth: '18px', textAlign: 'center' }}>
              {notifCount}
            </span>
          )}
        </Link>
        <Link href="/settings" className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Settings size={18} />
          {t('nav.settings')}
        </Link>
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
          <LogOut size={18} />
          {t('nav.logout')}
        </button>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <span className={`badge ${user?.plan === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>
              {user?.plan}
            </span>
          </div>
          <Link href="/settings" style={{ marginLeft: 'auto', color: '#475569' }}>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Desktop Sidebar — intentionally always dark */}
      <aside style={{
        width: '260px', flexShrink: 0,
        background: 'rgba(15, 15, 26, 0.98)',
        borderRight: isRTL ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
        borderLeft: isRTL ? '1px solid rgba(99, 102, 241, 0.1)' : 'none',
        position: 'fixed', left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', top: 0, bottom: 0, zIndex: 30,
        display: 'none',
      }} className="desktop-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside style={{
        width: '260px', flexShrink: 0,
        background: 'rgba(15, 15, 26, 0.98)',
        borderRight: isRTL ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
        borderLeft: isRTL ? '1px solid rgba(99, 102, 241, 0.1)' : 'none',
        position: 'fixed', 
        left: isRTL ? 'auto' : (sidebarOpen ? 0 : '-280px'), 
        right: isRTL ? (sidebarOpen ? 0 : '-280px') : 'auto',
        top: 0, bottom: 0, zIndex: 50,
        transition: 'all 0.3s ease',
      }} className="mobile-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: 60, padding: '0 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-nav)',
          background: 'var(--bg-nav)',
          backdropFilter: 'blur(8px)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginInlineStart: 'auto' }}>
            <Link href="/notifications" style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex' }}>
              <Bell size={20} />
              {notifCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {notifCount}
                </span>
              )}
            </Link>
            <Link href="/settings" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', textDecoration: 'none' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Link>
          </div>
        </header>

        <div style={{ flex: 1, padding: '1.5rem 1.25rem', overflowX: 'hidden' }}>
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          background: 'rgba(15, 15, 26, 0.98)',
          borderTop: '1px solid rgba(99, 102, 241, 0.12)',
          display: 'flex', padding: '0.5rem 0',
        }}>
          {[
            { href: '/dashboard', icon: LayoutDashboard },
            { href: '/transactions', icon: ArrowLeftRight },
            { href: '/budgets', icon: PiggyBank },
            { href: '/goals', icon: Target },
            { href: '/insights', icon: Brain },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '0.375rem', textDecoration: 'none',
                color: isActive(item.href) ? '#6366f1' : '#475569',
                transition: 'color 0.2s',
              }}
            >
              <item.icon size={22} />
            </Link>
          ))}
        </nav>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; flex-direction: column; }
          .mobile-sidebar { display: none !important; }
          main { margin-left: ${isRTL ? '0' : '260px'} !important; margin-right: ${isRTL ? '260px' : '0'} !important; }
          nav[style*="position: fixed; bottom: 0"] { display: none !important; }
          header button:first-child { display: none !important; }
        }
      `}</style>
    </div>
  )
}
