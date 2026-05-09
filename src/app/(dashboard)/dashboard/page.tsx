'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight, PiggyBank, Brain } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

interface Transaction { type: string; amount: number; category: string; date: string }
interface Budget { category: string; limit: number; spent: number }
interface SavingGoal { id: string; name: string; targetAmount: number; savedAmount: number; icon: string; color: string }

export default function DashboardPage() {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  useEffect(() => {
    Promise.all([
      fetch(`/api/transactions`).then(r => r.json()), // Fetch ALL to populate charts properly
      fetch(`/api/budgets?month=${month}&year=${year}`).then(r => r.json()),
      fetch('/api/goals').then(r => r.json()),
    ]).then(([tx, bgt, gls]) => {
      setTransactions(tx.transactions || [])
      setBudgets(bgt.budgets || [])
      setGoals(gls.goals || [])
      setLoading(false)
    })
  }, [month, year])

  // Filter for current month's KPIs
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  const income = currentMonthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const expByCat: Record<string, number> = {}
  currentMonthTx.filter(t => t.type === 'EXPENSE').forEach(t => {
    expByCat[t.category] = (expByCat[t.category] || 0) + t.amount
  })
  const catLabels = Object.keys(expByCat)
  const catValues = Object.values(expByCat)

  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i), 1)
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: t(`month.${d.getMonth() + 1}` as Parameters<typeof t>[0]).slice(0, 3) }
  })

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '5rem', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          {t('dashboard.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          {t(`month.${month}` as Parameters<typeof t>[0])} {year}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: t('dashboard.balance'), value: balance, icon: Wallet, color: balance >= 0 ? '#22c55e' : '#ef4444', bg: balance >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' },
          { label: t('dashboard.income'), value: income, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
          { label: t('dashboard.expenses'), value: expense, icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: t('dashboard.savingsRate'), value: null, display: `${savingsRate}%`, icon: PiggyBank, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
        ].map(card => (
          <div key={card.label} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-jakarta)' }}>
              {card.display || formatCurrency(card.value!)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem', fontSize: '0.95rem' }}>{t('dashboard.expensesByCategory')}</h3>
          {catLabels.length > 0 ? (
            <div className="chart-container" style={{ height: 200 }}>
              <Doughnut
                data={{ labels: catLabels, datasets: [{ data: catValues, backgroundColor: catLabels.map(c => getCategoryColor(c)), borderWidth: 0, hoverOffset: 4 }] }}
                options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } } } }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Target size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>{t('dashboard.noExpenses')}</p>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem', fontSize: '0.95rem' }}>{t('dashboard.incomeVsExpenses')}</h3>
          <div style={{ height: 200 }}>
            <Bar
              data={{
                labels: months6.map(m => m.label),
                datasets: [
                  { label: t('dashboard.income'), data: months6.map(m => transactions.filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() + 1 === m.month && new Date(t.date).getFullYear() === m.year).reduce((s, t) => s + t.amount, 0)), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 6 },
                  { label: t('dashboard.expenses'), data: months6.map(m => transactions.filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() + 1 === m.month && new Date(t.date).getFullYear() === m.year).reduce((s, t) => s + t.amount, 0)), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6 },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } } }, scales: { x: { ticks: { color: '#475569' }, grid: { color: 'rgba(99,102,241,0.05)' } }, y: { ticks: { color: '#475569', callback: (v) => `${Number(v).toLocaleString()}` }, grid: { color: 'rgba(99,102,241,0.05)' } } } }}
            />
          </div>
        </div>
      </div>

      {/* Budgets + Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{t('dashboard.budgetsMonth')}</h3>
            <Link href="/budgets" style={{ color: '#6366f1', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{t('common.seeAll')} <ArrowUpRight size={14} /></Link>
          </div>
          {budgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <PiggyBank size={28} style={{ margin: '0 auto 0.5rem' }} />
              <p>{t('dashboard.noBudgets')}</p>
              <Link href="/budgets" className="btn-primary" style={{ marginTop: '0.75rem', display: 'inline-flex', padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>{t('dashboard.createBudget')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {budgets.slice(0, 4).map(b => {
                const pct = Math.min((b.spent / b.limit) * 100, 100)
                const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={b.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{b.category}</span>
                      <span style={{ fontSize: '0.78rem', color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: color }} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{formatCurrency(b.spent)}</span><span>{formatCurrency(b.limit)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{t('dashboard.savingsGoals')}</h3>
            <Link href="/goals" style={{ color: '#6366f1', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{t('common.seeAll')} <ArrowUpRight size={14} /></Link>
          </div>
          {goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Target size={28} style={{ margin: '0 auto 0.5rem' }} />
              <p>{t('dashboard.noGoals')}</p>
              <Link href="/goals" className="btn-primary" style={{ marginTop: '0.75rem', display: 'inline-flex', padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>{t('dashboard.createGoal')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {goals.slice(0, 3).map(g => {
                const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100)
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{g.icon} {g.name}</span>
                      <span style={{ fontSize: '0.78rem', color: '#818cf8' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: g.color || '#6366f1' }} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{formatCurrency(g.savedAmount)}</span><span>{formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{t('dashboard.recentTransactions')}</h3>
          <Link href="/transactions" style={{ color: '#6366f1', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{t('common.seeAll')} <ArrowUpRight size={14} /></Link>
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.875rem' }}>{t('dashboard.noTransactions')}</p>
            <Link href="/transactions" className="btn-primary" style={{ marginTop: '0.75rem', display: 'inline-flex', padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>{t('dashboard.addTransaction')}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {transactions.slice(0, 6).map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: tx.type === 'INCOME' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tx.type === 'INCOME' ? <ArrowUpRight size={16} style={{ color: '#22c55e' }} /> : <ArrowDownRight size={16} style={{ color: '#ef4444' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{tx.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: tx.type === 'INCOME' ? '#22c55e' : '#ef4444', fontSize: '0.9rem' }}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI CTA */}
      <Link href="/insights" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={22} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', fontFamily: 'var(--font-jakarta)' }}>{t('dashboard.aiInsights')}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('dashboard.aiSubtitle')}</div>
            </div>
          </div>
          <ArrowUpRight size={20} style={{ color: '#6366f1' }} />
        </div>
      </Link>
    </div>
  )
}
