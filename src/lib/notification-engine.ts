import { prisma } from './prisma'

export async function checkAndGenerateNotifications(userId: string, lang: string = 'fr') {
  const now = new Date()

  // Helper to check if an unread notification with same title already exists
  const hasUnreadNotification = async (title: string) => {
    const existing = await prisma.notification.findFirst({
      where: { userId, title, isRead: false }
    })
    return !!existing
  }

  // 1. Check Bills
  const bills = await prisma.bill.findMany({ where: { userId, isPaid: false } })
  for (const bill of bills) {
    const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil <= 3) {
      let title = ''
      let message = ''
      let type = 'alert'

      if (daysUntil < 0) {
        title = lang === 'ar' ? `فاتورة متأخرة: ${bill.name}` : lang === 'en' ? `Overdue bill: ${bill.name}` : `Facture en retard : ${bill.name}`
        message = lang === 'ar' ? `فاتورتك "${bill.name}" متأخرة بـ ${Math.abs(daysUntil)} أيام. يرجى دفعها فوراً.` : lang === 'en' ? `Your bill "${bill.name}" is overdue by ${Math.abs(daysUntil)} day(s).` : `Votre facture "${bill.name}" est en retard de ${Math.abs(daysUntil)} jour(s).`
      } else {
        const dueStr = daysUntil === 0 
          ? (lang === 'ar' ? 'اليوم' : lang === 'en' ? 'today' : "aujourd'hui") 
          : (lang === 'ar' ? `خلال ${daysUntil} أيام` : lang === 'en' ? `in ${daysUntil} day(s)` : `dans ${daysUntil} jour(s)`)
        
        title = lang === 'ar' ? `فاتورة مستعجلة: ${bill.name}` : lang === 'en' ? `Urgent bill: ${bill.name}` : `Facture urgente : ${bill.name}`
        message = lang === 'ar' ? `فاتورتك "${bill.name}" بقيمة ${bill.amount.toLocaleString()} دج مستحقة ${dueStr}.` : lang === 'en' ? `Your bill "${bill.name}" is due ${dueStr}.` : `Votre facture "${bill.name}" de ${bill.amount.toLocaleString()} DA est due ${dueStr}.`
        type = 'reminder'
      }

      if (!(await hasUnreadNotification(title))) {
        await prisma.notification.create({
          data: { userId, title, message, type }
        })
      }
    }
  }

  // 2. Check Budgets
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const budgets = await prisma.budget.findMany({ 
    where: { userId, month: currentMonth, year: currentYear } 
  })

  for (const budget of budgets) {
    if (budget.limit > 0) {
      const pct = (budget.spent / budget.limit) * 100
      let title = ''
      let message = ''
      let type = 'info'

      if (pct >= 100) {
        title = lang === 'ar' ? `تجاوز ميزانية ${budget.category}` : lang === 'en' ? `Budget ${budget.category} exceeded` : `Budget ${budget.category} dépassé`
        message = lang === 'ar' ? `لقد تجاوزت ميزانية ${budget.category} المحددة لهذا الشهر.` : lang === 'en' ? `You have exceeded your ${budget.category} budget.` : `Vous avez dépassé votre budget ${budget.category}.`
        type = 'alert'
      } else if (pct >= 90) {
        title = lang === 'ar' ? `ميزانية ${budget.category} على وشك النفاد` : lang === 'en' ? `Budget ${budget.category} almost depleted` : `Budget ${budget.category} presque épuisé`
        message = lang === 'ar' ? `لقد استهلكت ${pct.toFixed(0)}% من ميزانية ${budget.category}.` : lang === 'en' ? `You have used ${pct.toFixed(0)}% of your ${budget.category} budget.` : `Vous avez utilisé ${pct.toFixed(0)}% de votre budget ${budget.category}.`
        type = 'warning'
      }

      if (title && !(await hasUnreadNotification(title))) {
        await prisma.notification.create({
          data: { userId, title, message, type }
        })
      }
    }
  }

  // 3. Check Debts
  const debts = await prisma.debt.findMany({ where: { userId, isPaid: false } })
  if (debts.length > 0) {
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)
    const title = lang === 'ar' ? `تذكير بالديون غير المسددة` : lang === 'en' ? `Unpaid debts reminder` : `Rappel de dettes non réglées`
    const message = lang === 'ar' ? `لديك ${debts.length} ديون غير مسددة بقيمة إجمالية ${totalDebt.toLocaleString()} دج.` : lang === 'en' ? `You have ${debts.length} unpaid debts totaling ${totalDebt.toLocaleString()} DA.` : `Vous avez ${debts.length} dettes non réglées pour un total de ${totalDebt.toLocaleString()} DA.`
    
    // For general debt reminder, maybe only alert if not alerted recently. Using title check is fine.
    if (!(await hasUnreadNotification(title))) {
      await prisma.notification.create({
        data: { userId, title, message, type: 'reminder' }
      })
    }
  }
}
