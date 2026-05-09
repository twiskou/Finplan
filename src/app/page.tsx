'use client'
import Link from 'next/link'
import {
  TrendingUp, Shield, Brain, BarChart3, Target, Bell,
  ChevronRight, Check, Star, Zap, Globe, ArrowRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTranslation } from '@/contexts/LanguageContext'

export default function LandingPage() {
  const { t, isRTL } = useTranslation()

  const features = [
    { icon: TrendingUp, title: t('home.feat1.title'), desc: t('home.feat1.desc') },
    { icon: BarChart3, title: t('home.feat2.title'), desc: t('home.feat2.desc') },
    { icon: Target, title: t('home.feat3.title'), desc: t('home.feat3.desc') },
    { icon: Bell, title: t('home.feat4.title'), desc: t('home.feat4.desc') },
    { icon: Brain, title: t('home.feat5.title'), desc: t('home.feat5.desc') },
    { icon: Shield, title: t('home.feat6.title'), desc: t('home.feat6.desc') },
  ]

  const plans = [
    {
      name: t('home.plan.free'),
      price: '0',
      period: t('home.plan.daMonth'),
      features: [t('home.plan.freeFeat1'), t('home.plan.freeFeat2'), t('home.plan.freeFeat3'), t('home.plan.freeFeat4'), t('home.plan.freeFeat5')],
      cta: t('home.plan.ctaFree'),
      highlight: false,
    },
    {
      name: t('home.plan.premium'),
      price: '990',
      period: t('home.plan.daMonth'),
      features: [t('home.plan.premFeat1'), t('home.plan.premFeat2'), t('home.plan.premFeat3'), t('home.plan.premFeat4'), t('home.plan.premFeat5'), t('home.plan.premFeat6'), t('home.plan.premFeat7')],
      cta: t('home.plan.ctaPremium'),
      highlight: true,
    },
  ]

  const stats = [
    { value: '50K+', label: t('home.stats.users') },
    { value: '98%', label: t('home.stats.satisfaction') },
    { value: '2M+', label: t('home.stats.transactions') },
    { value: '15M DA', label: t('home.stats.saved') },
  ]

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-main)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ padding: '6rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '20%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem', borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-btn-sec)',
            fontWeight: 600,
          }}>
            <Zap size={14} />
            {t('home.heroBadge')}
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
            fontFamily: 'var(--font-jakarta)', color: 'var(--text-heading)', marginBottom: '1.25rem',
          }}>
            {t('home.heroTitle1')}{' '}
            <span className="gradient-text">{t('home.heroTitle2')}</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            {t('home.heroDesc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('home.startFree')} <ArrowRight size={18} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              {t('home.login')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '2rem 1.5rem', borderTop: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              {t('home.features.title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{t('home.features.subtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(99,102,241,0.05))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <f.icon size={22} style={{ color: '#6366f1' }} />
                </div>
                <h3 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-jakarta)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', background: 'rgba(99,102,241,0.03)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              {t('home.pricing.title')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('home.pricing.subtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {plans.map(plan => (
              <div key={plan.name} style={{
                padding: '2rem', borderRadius: '1.25rem',
                background: plan.highlight ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(99,102,241,0.05))' : 'var(--bg-card-alpha)',
                border: plan.highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border-card)',
                backdropFilter: 'blur(12px)',
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: '1rem', [isRTL ? 'left' : 'right']: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(245,158,11,0.2)', color: '#d97706',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    <Star size={12} /> {t('home.plan.popular')}
                  </div>
                )}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '1.15rem', fontFamily: 'var(--font-jakarta)' }}>{plan.name}</h3>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: plan.highlight ? '#6366f1' : 'var(--text-heading)' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {plan.cta} <ChevronRight size={16} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Local Support ── */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6366f1' }}>
            <Globe size={20} />
            <span style={{ fontWeight: 700 }}>{t('home.local.badge')}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-jakarta)', marginBottom: '1rem' }}>
            {t('home.local.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {t('home.local.desc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['DZD', 'BaridiMob', 'Edahabia'].map(tag => (
              <span key={tag} className="badge badge-premium">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        borderTop: '1px solid var(--border-card)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-jakarta)', marginBottom: '1rem' }}>
            {t('home.cta.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            {t('home.cta.desc')}
          </p>
          <Link href="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {t('home.cta.btn')} <ArrowRight size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
