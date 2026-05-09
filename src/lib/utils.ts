// Format currency
export function formatCurrency(amount: number, currency = 'DZD'): string {
  if (currency === 'DZD') {
    return `${amount.toLocaleString('fr-DZ')} DA`
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return months[month - 1] || ''
}

// Calculate percentage
export function calcPercent(value: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.round((value / total) * 100), 100)
}

// Get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Alimentation': '#F59E0B',
    'Transport': '#3B82F6',
    'Logement': '#8B5CF6',
    'Santé': '#EF4444',
    'Education': '#10B981',
    'Loisirs': '#EC4899',
    'Shopping': '#F97316',
    'Factures': '#6366F1',
    'Salaire': '#22C55E',
    'Freelance': '#14B8A6',
    'Investissement': '#A78BFA',
    'Autre': '#94A3B8',
  }
  return colors[category] || '#94A3B8'
}

// Get category icon name (lucide-react icon names)
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Alimentation': 'UtensilsCrossed',
    'Transport': 'Car',
    'Logement': 'Home',
    'Santé': 'Heart',
    'Education': 'BookOpen',
    'Loisirs': 'Gamepad2',
    'Shopping': 'ShoppingBag',
    'Factures': 'FileText',
    'Salaire': 'Briefcase',
    'Freelance': 'Laptop',
    'Investissement': 'TrendingUp',
    'Autre': 'MoreHorizontal',
  }
  return icons[category] || 'Circle'
}

export const EXPENSE_CATEGORIES = [
  'Alimentation', 'Transport', 'Logement', 'Santé',
  'Education', 'Loisirs', 'Shopping', 'Factures', 'Autre'
]

export const INCOME_CATEGORIES = [
  'Salaire', 'Freelance', 'Investissement', 'Autre'
]

export const PAYMENT_METHODS = [
  'Espèces', 'BaridiMob', 'Edahabia', 'CIB', 'Virement', 'Autre'
]

export function getDaysUntil(date: Date | string | number): number {
  const target = new Date(date)
  if (isNaN(target.getTime())) return 0
  // Normalize both to midnight local time to avoid partial-day timezone issues
  const now = new Date()
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = targetMidnight.getTime() - nowMidnight.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
