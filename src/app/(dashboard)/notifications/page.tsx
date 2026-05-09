'use client'
import { useEffect, useState } from 'react'
import { Bell, CheckCheck, AlertTriangle, Info, Lightbulb, Megaphone } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface Notification {
  id: string; title: string; message: string; isRead: boolean; type: string; createdAt: string
}

const typeIcons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  reminder: Bell,
  alert: AlertTriangle,
  tip: Lightbulb,
  system: Megaphone,
  info: Info,
}

const typeColors: Record<string, string> = {
  reminder: '#f59e0b',
  alert: '#ef4444',
  tip: '#6366f1',
  system: '#3b82f6',
  info: '#22c55e',
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const r = await fetch('/api/notifications')
    const d = await r.json()
    setNotifications(d.notifications || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    load()
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} style={{ color: '#818cf8' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('notif.title')}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {unread > 0 ? `${unread} ${t('notif.unreadCount')}` : t('notif.upToDate')}
          </p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAllRead} style={{ padding: '0.5rem 1rem' }}>
            <CheckCheck size={16} /> {t('notif.markAllRead')}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('notif.empty')}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t('notif.emptyDesc')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {notifications.map(n => {
            const IconComp = typeIcons[n.type] || Info
            const color = typeColors[n.type] || '#6366f1'
            return (
              <div key={n.id} style={{
                padding: '1rem 1.25rem', borderRadius: '1rem',
                background: n.isRead ? 'var(--bg-stat-card)' : 'var(--bg-card-alpha)',
                border: `1px solid ${n.isRead ? 'var(--border-card)' : `${color}33`}`,
                opacity: n.isRead ? 0.7 : 1,
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                  <IconComp size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: n.isRead ? 'var(--text-muted)' : 'var(--text-heading)', fontSize: '0.9rem' }}>{n.title}</span>
                    {!n.isRead && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{n.message}</p>
                  <span style={{ color: 'var(--text-muted)', opacity: 0.7, fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>
                    {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
