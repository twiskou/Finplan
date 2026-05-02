// Rule-based AI financial insights engine
// Analyzes user financial data and returns personalized tips

interface Transaction {
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string | Date
}

interface Budget {
  category: string
  limit: number
  spent: number
}

interface SavingGoal {
  name: string
  targetAmount: number
  savedAmount: number
  deadline?: string | Date | null
}

interface Bill {
  name: string
  amount: number
  dueDate: string | Date
  isPaid: boolean
}

interface Debt {
  creditor: string
  amount: number
  dueDate?: string | Date | null
  isPaid: boolean
}

export interface Insight {
  type: 'warning' | 'success' | 'tip' | 'alert' | 'info'
  icon: string
  title: string
  message: string
  priority: number
}

interface FinancialData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingGoal[]
  bills: Bill[]
  debts: Debt[]
}

export function generateInsights(data: FinancialData): Insight[] {
  const insights: Insight[] = []
  const { transactions, budgets, goals, bills, debts } = data

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Filter current month transactions
  const monthlyTx = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })

  const totalIncome = monthlyTx
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = monthlyTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  // 1. Low savings rate
  if (totalIncome > 0 && savingsRate < 10) {
    insights.push({
      type: 'warning',
      icon: 'PiggyBank',
      title: 'Taux d\'épargne faible',
      message: `Vous économisez seulement ${savingsRate.toFixed(0)}% de vos revenus. Essayez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne.`,
      priority: 1,
    })
  }

  // 2. Good savings rate
  if (totalIncome > 0 && savingsRate >= 20) {
    insights.push({
      type: 'success',
      icon: 'TrendingUp',
      title: 'Excellent taux d\'épargne !',
      message: `Bravo ! Vous épargnez ${savingsRate.toFixed(0)}% de vos revenus ce mois-ci. Continuez ainsi !`,
      priority: 5,
    })
  }

  // 3. Budget overruns
  budgets.forEach(budget => {
    const pct = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
    if (pct >= 90 && pct < 100) {
      insights.push({
        type: 'warning',
        icon: 'AlertTriangle',
        title: `Budget ${budget.category} presque épuisé`,
        message: `Vous avez utilisé ${pct.toFixed(0)}% de votre budget ${budget.category}. Faites attention aux dépenses restantes.`,
        priority: 2,
      })
    } else if (pct >= 100) {
      insights.push({
        type: 'alert',
        icon: 'XCircle',
        title: `Budget ${budget.category} dépassé`,
        message: `Vous avez dépassé votre budget ${budget.category} de ${(budget.spent - budget.limit).toLocaleString()} DA. Analysez vos dépenses.`,
        priority: 1,
      })
    }
  })

  // 4. Upcoming bills (due in ≤ 3 days)
  bills.filter(b => !b.isPaid).forEach(bill => {
    const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 3 && daysUntil >= 0) {
      insights.push({
        type: 'alert',
        icon: 'Bell',
        title: `Facture urgente : ${bill.name}`,
        message: `Votre facture "${bill.name}" de ${bill.amount.toLocaleString()} DA est due dans ${daysUntil === 0 ? "aujourd'hui" : `${daysUntil} jour(s)`}.`,
        priority: 1,
      })
    } else if (daysUntil < 0) {
      insights.push({
        type: 'alert',
        icon: 'AlertOctagon',
        title: `Facture en retard : ${bill.name}`,
        message: `Votre facture "${bill.name}" est en retard de ${Math.abs(daysUntil)} jour(s). Réglez-la immédiatement.`,
        priority: 1,
      })
    }
  })

  // 5. Goal milestones
  goals.forEach(goal => {
    const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0
    if (pct >= 100) {
      insights.push({
        type: 'success',
        icon: 'Trophy',
        title: `Objectif atteint : ${goal.name} !`,
        message: `Félicitations ! Vous avez atteint votre objectif d'épargne "${goal.name}". C'est une excellente réalisation !`,
        priority: 3,
      })
    } else if (pct >= 75) {
      insights.push({
        type: 'success',
        icon: 'Star',
        title: `Presque là : ${goal.name}`,
        message: `Vous êtes à ${pct.toFixed(0)}% de votre objectif "${goal.name}". Encore un petit effort !`,
        priority: 4,
      })
    }
  })

  // 6. Top spending category
  const expenseByCategory: Record<string, number> = {}
  monthlyTx.filter(t => t.type === 'EXPENSE').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]
  if (topCategory && totalExpense > 0) {
    const pct = (topCategory[1] / totalExpense) * 100
    if (pct > 40) {
      insights.push({
        type: 'info',
        icon: 'PieChart',
        title: `${topCategory[0]} : votre principale dépense`,
        message: `${pct.toFixed(0)}% de vos dépenses ce mois vont en "${topCategory[0]}". Examinez si vous pouvez réduire ce poste.`,
        priority: 3,
      })
    }
  }

  // 7. Unpaid debts reminder
  const unpaidDebts = debts.filter(d => !d.isPaid)
  if (unpaidDebts.length > 0) {
    const totalDebt = unpaidDebts.reduce((sum, d) => sum + d.amount, 0)
    insights.push({
      type: 'info',
      icon: 'CreditCard',
      title: `${unpaidDebts.length} dette(s) non réglée(s)`,
      message: `Vous avez ${totalDebt.toLocaleString()} DA de dettes non réglées. Établissez un plan de remboursement.`,
      priority: 3,
    })
  }

  // 8. No income recorded
  if (totalIncome === 0 && monthlyTx.length > 0) {
    insights.push({
      type: 'tip',
      icon: 'Lightbulb',
      title: 'Enregistrez vos revenus',
      message: 'Vous avez des dépenses ce mois mais aucun revenu enregistré. Ajoutez vos sources de revenus pour un suivi complet.',
      priority: 2,
    })
  }

  // 9. General tip (always show one)
  const tips = [
    {
      icon: 'BookOpen',
      title: 'La règle des 3 mois',
      message: 'Constituez un fonds d\'urgence couvrant 3 mois de dépenses. Cela vous protège des imprévus.',
    },
    {
      icon: 'Repeat',
      title: 'Automatisez votre épargne',
      message: 'Mettez de côté un montant fixe dès réception de votre salaire. Ce qui ne se voit pas ne se dépense pas.',
    },
    {
      icon: 'ShoppingBag',
      title: 'Attendez 24h avant d\'acheter',
      message: 'Pour tout achat non essentiel, attendez 24 heures. Cette règle évite 80% des achats impulsifs.',
    },
  ]
  const tip = tips[Math.floor(Date.now() / 86400000) % tips.length]
  insights.push({
    type: 'tip',
    icon: tip.icon,
    title: tip.title,
    message: tip.message,
    priority: 6,
  })

  return insights.sort((a, b) => a.priority - b.priority)
}
