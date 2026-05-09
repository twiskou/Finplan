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

export function generateInsights(data: FinancialData, lang: 'fr' | 'en' | 'ar' = 'fr'): Insight[] {
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
      title: lang === 'ar' ? 'معدل ادخار منخفض' : lang === 'en' ? 'Low savings rate' : 'Taux d\'épargne faible',
      message: lang === 'ar' ? `أنت تدخر فقط ${savingsRate.toFixed(0)}% من دخلك. جرب قاعدة 50/30/20: 50% للاحتياجات، 30% للرغبات، 20% للادخار.` : lang === 'en' ? `You are saving only ${savingsRate.toFixed(0)}% of your income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.` : `Vous économisez seulement ${savingsRate.toFixed(0)}% de vos revenus. Essayez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne.`,
      priority: 1,
    })
  }

  // 2. Good savings rate
  if (totalIncome > 0 && savingsRate >= 20) {
    insights.push({
      type: 'success',
      icon: 'TrendingUp',
      title: lang === 'ar' ? 'معدل ادخار ممتاز!' : lang === 'en' ? 'Excellent savings rate!' : 'Excellent taux d\'épargne !',
      message: lang === 'ar' ? `أحسنت! أنت تدخر ${savingsRate.toFixed(0)}% من دخلك هذا الشهر. استمر هكذا!` : lang === 'en' ? `Well done! You are saving ${savingsRate.toFixed(0)}% of your income this month. Keep it up!` : `Bravo ! Vous épargnez ${savingsRate.toFixed(0)}% de vos revenus ce mois-ci. Continuez ainsi !`,
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
        title: lang === 'ar' ? `ميزانية ${budget.category} على وشك النفاد` : lang === 'en' ? `Budget ${budget.category} almost depleted` : `Budget ${budget.category} presque épuisé`,
        message: lang === 'ar' ? `لقد استهلكت ${pct.toFixed(0)}% من ميزانية ${budget.category}. احذر من النفقات المتبقية.` : lang === 'en' ? `You have used ${pct.toFixed(0)}% of your ${budget.category} budget. Be careful with remaining expenses.` : `Vous avez utilisé ${pct.toFixed(0)}% de votre budget ${budget.category}. Faites attention aux dépenses restantes.`,
        priority: 2,
      })
    } else if (pct >= 100) {
      insights.push({
        type: 'alert',
        icon: 'XCircle',
        title: lang === 'ar' ? `تجاوز ميزانية ${budget.category}` : lang === 'en' ? `Budget ${budget.category} exceeded` : `Budget ${budget.category} dépassé`,
        message: lang === 'ar' ? `لقد تجاوزت ميزانية ${budget.category} بمقدار ${(budget.spent - budget.limit).toLocaleString()} دج. راجع نفقاتك.` : lang === 'en' ? `You have exceeded your ${budget.category} budget by ${(budget.spent - budget.limit).toLocaleString()} DA. Review your expenses.` : `Vous avez dépassé votre budget ${budget.category} de ${(budget.spent - budget.limit).toLocaleString()} DA. Analysez vos dépenses.`,
        priority: 1,
      })
    }
  })

  // 4. Upcoming bills (due in ≤ 3 days)
  bills.filter(b => !b.isPaid).forEach(bill => {
    const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 3 && daysUntil >= 0) {
      const dueStr = daysUntil === 0 
        ? (lang === 'ar' ? 'اليوم' : lang === 'en' ? 'today' : "aujourd'hui") 
        : (lang === 'ar' ? `خلال ${daysUntil} أيام` : lang === 'en' ? `in ${daysUntil} day(s)` : `dans ${daysUntil} jour(s)`)
      
      insights.push({
        type: 'alert',
        icon: 'Bell',
        title: lang === 'ar' ? `فاتورة مستعجلة: ${bill.name}` : lang === 'en' ? `Urgent bill: ${bill.name}` : `Facture urgente : ${bill.name}`,
        message: lang === 'ar' ? `فاتورتك "${bill.name}" بقيمة ${bill.amount.toLocaleString()} دج مستحقة ${dueStr}.` : lang === 'en' ? `Your bill "${bill.name}" of ${bill.amount.toLocaleString()} DA is due ${dueStr}.` : `Votre facture "${bill.name}" de ${bill.amount.toLocaleString()} DA est due ${dueStr}.`,
        priority: 1,
      })
    } else if (daysUntil < 0) {
      insights.push({
        type: 'alert',
        icon: 'AlertOctagon',
        title: lang === 'ar' ? `فاتورة متأخرة: ${bill.name}` : lang === 'en' ? `Overdue bill: ${bill.name}` : `Facture en retard : ${bill.name}`,
        message: lang === 'ar' ? `فاتورتك "${bill.name}" متأخرة بـ ${Math.abs(daysUntil)} أيام. يرجى دفعها فوراً.` : lang === 'en' ? `Your bill "${bill.name}" is overdue by ${Math.abs(daysUntil)} day(s). Please pay it immediately.` : `Votre facture "${bill.name}" est en retard de ${Math.abs(daysUntil)} jour(s). Réglez-la immédiatement.`,
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
        title: lang === 'ar' ? `تم تحقيق الهدف: ${goal.name}!` : lang === 'en' ? `Goal reached: ${goal.name}!` : `Objectif atteint : ${goal.name} !`,
        message: lang === 'ar' ? `مبروك! لقد وصلت إلى هدف الادخار "${goal.name}". إنجاز رائع!` : lang === 'en' ? `Congratulations! You have reached your saving goal "${goal.name}". Great achievement!` : `Félicitations ! Vous avez atteint votre objectif d'épargne "${goal.name}". C'est une excellente réalisation !`,
        priority: 3,
      })
    } else if (pct >= 75) {
      insights.push({
        type: 'success',
        icon: 'Star',
        title: lang === 'ar' ? `على وشك التحقيق: ${goal.name}` : lang === 'en' ? `Almost there: ${goal.name}` : `Presque là : ${goal.name}`,
        message: lang === 'ar' ? `أنت عند ${pct.toFixed(0)}% من هدفك "${goal.name}". بقي القليل!` : lang === 'en' ? `You are at ${pct.toFixed(0)}% of your goal "${goal.name}". Just a little more!` : `Vous êtes à ${pct.toFixed(0)}% de votre objectif "${goal.name}". Encore un petit effort !`,
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
        title: lang === 'ar' ? `${topCategory[0]}: نفقاتك الرئيسية` : lang === 'en' ? `${topCategory[0]}: your top expense` : `${topCategory[0]} : votre principale dépense`,
        message: lang === 'ar' ? `${pct.toFixed(0)}% من نفقاتك هذا الشهر تذهب إلى "${topCategory[0]}". تحقق مما إذا كان بإمكانك تقليلها.` : lang === 'en' ? `${pct.toFixed(0)}% of your expenses this month go to "${topCategory[0]}". See if you can reduce it.` : `${pct.toFixed(0)}% de vos dépenses ce mois vont en "${topCategory[0]}". Examinez si vous pouvez réduire ce poste.`,
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
      title: lang === 'ar' ? `${unpaidDebts.length} دين (ديون) غير مسددة` : lang === 'en' ? `${unpaidDebts.length} unpaid debt(s)` : `${unpaidDebts.length} dette(s) non réglée(s)`,
      message: lang === 'ar' ? `لديك ${totalDebt.toLocaleString()} دج ديون غير مسددة. ضع خطة لسدادها.` : lang === 'en' ? `You have ${totalDebt.toLocaleString()} DA in unpaid debts. Set up a repayment plan.` : `Vous avez ${totalDebt.toLocaleString()} DA de dettes non réglées. Établissez un plan de remboursement.`,
      priority: 3,
    })
  }

  // 8. No income recorded
  if (totalIncome === 0 && monthlyTx.length > 0) {
    insights.push({
      type: 'tip',
      icon: 'Lightbulb',
      title: lang === 'ar' ? 'سجل دخلك' : lang === 'en' ? 'Record your income' : 'Enregistrez vos revenus',
      message: lang === 'ar' ? 'لديك نفقات هذا الشهر ولكن لم تسجل أي دخل. أضف مصادر دخلك للحصول على تتبع كامل.' : lang === 'en' ? 'You have expenses this month but no income recorded. Add your income sources for complete tracking.' : 'Vous avez des dépenses ce mois mais aucun revenu enregistré. Ajoutez vos sources de revenus pour un suivi complet.',
      priority: 2,
    })
  }

  // 9. General tip (always show one)
  const tips = [
    {
      icon: 'BookOpen',
      title: lang === 'ar' ? 'قاعدة الـ 3 أشهر' : lang === 'en' ? 'The 3-month rule' : 'La règle des 3 mois',
      message: lang === 'ar' ? 'أنشئ صندوق طوارئ يغطي 3 أشهر من النفقات. هذا يحميك من الحوادث غير المتوقعة.' : lang === 'en' ? 'Build an emergency fund covering 3 months of expenses. This protects you from the unexpected.' : 'Constituez un fonds d\'urgence couvrant 3 mois de dépenses. Cela vous protège des imprévus.',
    },
    {
      icon: 'Repeat',
      title: lang === 'ar' ? 'أتمتة مدخراتك' : lang === 'en' ? 'Automate your savings' : 'Automatisez votre épargne',
      message: lang === 'ar' ? 'ضع جانباً مبلغاً ثابتاً بمجرد استلام راتبك. ما لا تراه لا تنفقه.' : lang === 'en' ? 'Set aside a fixed amount as soon as you receive your salary. What you don\'t see, you don\'t spend.' : 'Mettez de côté un montant fixe dès réception de votre salaire. Ce qui ne se voit pas ne se dépense pas.',
    },
    {
      icon: 'ShoppingBag',
      title: lang === 'ar' ? 'انتظر 24 ساعة قبل الشراء' : lang === 'en' ? 'Wait 24h before buying' : 'Attendez 24h avant d\'acheter',
      message: lang === 'ar' ? 'لأي عملية شراء غير أساسية، انتظر 24 ساعة. هذه القاعدة تمنع 80% من المشتريات الاندفاعية.' : lang === 'en' ? 'For any non-essential purchase, wait 24 hours. This rule avoids 80% of impulse buying.' : 'Pour tout achat non essentiel, attendez 24 heures. Cette règle évite 80% des achats impulsifs.',
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
