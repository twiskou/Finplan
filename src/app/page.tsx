'use client'
import Link from 'next/link'
import {
  TrendingUp, Shield, Brain, BarChart3, Target, Bell,
  ChevronRight, Check, Star, Zap, Globe, ArrowRight
} from 'lucide-react'

const features = [
  { icon: TrendingUp, title: 'Suivi intelligent', desc: 'Suivez revenus et dépenses en temps réel avec des graphiques interactifs.' },
  { icon: BarChart3, title: 'Budgets dynamiques', desc: 'Créez des budgets par catégorie et visualisez votre progression instantanément.' },
  { icon: Target, title: 'Objectifs d\'épargne', desc: 'Définissez vos objectifs et suivez votre avancement avec des indicateurs visuels.' },
  { icon: Bell, title: 'Rappels intelligents', desc: 'Ne manquez aucune facture grâce aux rappels automatiques avant échéance.' },
  { icon: Brain, title: 'Insights IA', desc: 'Recevez des conseils financiers personnalisés basés sur votre comportement.' },
  { icon: Shield, title: 'Sécurité maximale', desc: 'Vos données sont chiffrées et protégées avec les meilleurs standards.' },
]

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'DA/mois',
    features: ['50 transactions/mois', '2 objectifs d\'épargne', '3 catégories de budget', 'Graphiques de base', '5 insights IA/mois'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '990',
    period: 'DA/mois',
    features: ['Transactions illimitées', 'Objectifs illimités', 'Budgets illimités', 'Analyses avancées', 'Insights IA illimités', 'Export PDF/CSV', 'Support prioritaire'],
    cta: 'Essayer Premium',
    highlight: true,
  },
]

const stats = [
  { value: '50K+', label: 'Utilisateurs actifs' },
  { value: '98%', label: 'Satisfaction client' },
  { value: '2M+', label: 'Transactions suivies' },
  { value: '15M DA', label: 'Économisés' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(15, 15, 26, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
        padding: '0 1.5rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'white' }}>
              Fin<span style={{ color: '#6366f1' }}>plan</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Connexion</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Commencer</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '6rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow blobs */}
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
            marginBottom: '1.5rem', fontSize: '0.85rem', color: '#a5b4fc',
            fontWeight: 600,
          }}>
            <Zap size={14} />
            Intelligence financière pour l&apos;Algérie
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
            fontFamily: 'var(--font-jakarta)', color: 'white', marginBottom: '1.25rem',
          }}>
            Maîtrisez vos finances{' '}
            <span className="gradient-text">intelligemment</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Finplan vous aide à suivre vos revenus, gérer vos budgets et atteindre vos objectifs d&apos;épargne avec des insights IA personnalisés. Support DZD natif.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Se connecter
            </Link>
          </div>
          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem', padding: '0.875rem 1.5rem', display: 'inline-flex',
            gap: '2rem', borderRadius: '0.75rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <span>Compte démo :</span>
            <span style={{ color: '#a5b4fc' }}>demo@finplan.dz</span>
            <span style={{ color: '#a5b4fc' }}>demo123</span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '2rem 1.5rem', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'white' }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'white', marginBottom: '0.75rem' }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Une plateforme complète pour prendre le contrôle de vos finances</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(99,102,241,0.1))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <f.icon size={22} style={{ color: '#818cf8' }} />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-jakarta)' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(99,102,241,0.03)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'white', marginBottom: '0.75rem' }}>
              Tarifs transparents
            </h2>
            <p style={{ color: '#64748b' }}>Commencez gratuitement, évoluez quand vous êtes prêt</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {plans.map(plan => (
              <div key={plan.name} style={{
                padding: '2rem', borderRadius: '1.25rem',
                background: plan.highlight ? 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(99,102,241,0.1))' : 'rgba(30,30,46,0.8)',
                border: plan.highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.12)',
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(245,158,11,0.2)', color: '#fcd34d',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    <Star size={12} /> Populaire
                  </div>
                )}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.15rem', fontFamily: 'var(--font-jakarta)' }}>{plan.name}</h3>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: plan.highlight ? '#818cf8' : 'white' }}>{plan.price}</span>
                    <span style={{ color: '#64748b', marginLeft: '0.25rem', fontSize: '0.9rem' }}>{plan.period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>
                  {plan.cta} <ChevronRight size={16} />
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
            <span style={{ fontWeight: 700 }}>Conçu pour l&apos;Algérie</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-jakarta)', marginBottom: '1rem' }}>
            Support natif du marché algérien
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
            Finplan supporte nativement le Dinar Algérien (DZD) et les méthodes de paiement locales : BaridiMob, Edahabia, et paiement en espèces.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['DZD', 'BaridiMob', 'Edahabia', 'Français', 'عربي'].map(tag => (
              <span key={tag} className="badge badge-premium">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', fontFamily: 'var(--font-jakarta)', marginBottom: '1rem' }}>
            Prêt à maîtriser vos finances ?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Rejoignez des milliers d&apos;utilisateurs qui gèrent leur argent intelligemment.
          </p>
          <Link href="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
            Créer mon compte gratuit <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '2rem 1.5rem', borderTop: '1px solid rgba(99,102,241,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-jakarta)' }}>Fin<span style={{ color: '#6366f1' }}>plan</span></span>
        </div>
        <p style={{ color: '#334155', fontSize: '0.875rem' }}>
          © 2025 Finplan. Gérez votre argent intelligemment.
        </p>
      </footer>
    </div>
  )
}
