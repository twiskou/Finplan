'use client'
import { useEffect, useState } from 'react'
import {
  Brain, AlertTriangle, XCircle, Trophy, Star, PiggyBank, TrendingUp,
  Bell, PieChart, CreditCard, Lightbulb, BookOpen, Repeat, ShoppingBag, RefreshCw
} from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/i18n'

interface Insight {
  type: 'warning' | 'success' | 'tip' | 'alert' | 'info'
  icon: string
  title: string
  message: string
  priority: number
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  PiggyBank, TrendingUp, AlertTriangle, XCircle, Bell, Trophy, Star, PieChart,
  CreditCard, Lightbulb, BookOpen, Repeat, ShoppingBag,
}

export default function InsightsPage() {
  const { t, lang } = useTranslation()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/ai/insights?lang=${lang}`)
    const d = await r.json()
    setInsights(d.insights || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [lang])

  const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
    alert: { bg: 'rgba(239,68,68,0.06)', border: '#ef4444', icon: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.06)', border: '#f59e0b', icon: '#f59e0b' },
    success: { bg: 'rgba(34,197,94,0.06)', border: '#22c55e', icon: '#22c55e' },
    tip: { bg: 'rgba(99,102,241,0.06)', border: '#6366f1', icon: '#818cf8' },
    info: { bg: 'rgba(59,130,246,0.06)', border: '#3b82f6', icon: '#3b82f6' },
  }

  const typeLabels: Record<string, TranslationKey> = {
    alert: 'ai.typeAlert',
    warning: 'ai.typeWarning',
    success: 'ai.typeSuccess',
    tip: 'ai.typeTip',
    info: 'ai.typeInfo',
  }

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={22} style={{ color: '#818cf8' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{t('ai.title')}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('ai.subtitle')}</p>
        </div>
        <button className="btn-secondary" onClick={load} style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw size={16} /> {t('ai.refresh')}
        </button>
      </div>

      {/* AI Banner */}
      <div style={{
        padding: '1.25rem', borderRadius: '1rem', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div className="animate-pulse-glow" style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Brain size={24} style={{ color: '#a5b4fc' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', fontFamily: 'var(--font-jakarta)' }}>{t('ai.bannerTitle')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            {t('ai.bannerSubtitle')}
          </div>
        </div>
      </div>

      {/* Insights */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Brain size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>{t('ai.noneTitle')}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t('ai.noneSubtitle')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {insights.map((insight, i) => {
            const colors = typeColors[insight.type] || typeColors.info
            const IconComponent = ICON_MAP[insight.icon] || Brain
            return (
              <div key={i} style={{
                padding: '1.25rem', borderRadius: '1rem',
                background: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
                border: `1px solid ${colors.border}22`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${colors.border}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComponent size={20} style={{ color: colors.icon }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', fontFamily: 'var(--font-jakarta)' }}>{insight.title}</span>
                      <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: `${colors.border}22`, color: colors.icon }}>
                        {t(typeLabels[insight.type])}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{insight.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
