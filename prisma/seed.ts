import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await prisma.notification.deleteMany()
  await prisma.debt.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.savingGoal.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.user.deleteMany()

  const hashedDemo = await bcrypt.hash('demo123', 12)
  const hashedAdmin = await bcrypt.hash('admin123', 12)

  // Demo user
  const demo = await prisma.user.create({
    data: {
      name: 'Ahmed Bouzid',
      email: 'demo@finplan.dz',
      password: hashedDemo,
      role: 'USER',
      plan: 'FREE',
      language: 'fr',
      currency: 'DZD',
      theme: 'dark',
    },
  })

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Finplan',
      email: 'admin@finplan.dz',
      password: hashedAdmin,
      role: 'ADMIN',
      plan: 'PREMIUM',
      language: 'fr',
      currency: 'DZD',
      theme: 'dark',
    },
  })

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  // Transactions
  const txData = [
    { type: 'INCOME' as const, amount: 85000, category: 'Salaire', description: 'Salaire du mois', date: new Date(year, month, 1), paymentMethod: 'Virement' },
    { type: 'INCOME' as const, amount: 15000, category: 'Freelance', description: 'Projet web', date: new Date(year, month, 5), paymentMethod: 'BaridiMob' },
    { type: 'EXPENSE' as const, amount: 25000, category: 'Logement', description: 'Loyer appartement', date: new Date(year, month, 2), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 12000, category: 'Alimentation', description: 'Courses du mois', date: new Date(year, month, 3), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 8000, category: 'Alimentation', description: 'Restaurants', date: new Date(year, month, 10), paymentMethod: 'Edahabia' },
    { type: 'EXPENSE' as const, amount: 5000, category: 'Transport', description: 'Carburant', date: new Date(year, month, 4), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 3500, category: 'Transport', description: 'Entretien voiture', date: new Date(year, month, 12), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 4500, category: 'Factures', description: 'Internet + Téléphone', date: new Date(year, month, 6), paymentMethod: 'BaridiMob' },
    { type: 'EXPENSE' as const, amount: 2000, category: 'Factures', description: 'Électricité', date: new Date(year, month, 7), paymentMethod: 'Edahabia' },
    { type: 'EXPENSE' as const, amount: 3000, category: 'Shopping', description: 'Vêtements', date: new Date(year, month, 8), paymentMethod: 'CIB' },
    { type: 'EXPENSE' as const, amount: 2500, category: 'Loisirs', description: 'Cinéma + sortie', date: new Date(year, month, 9), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 1500, category: 'Santé', description: 'Pharmacie', date: new Date(year, month, 11), paymentMethod: 'Espèces' },
    { type: 'EXPENSE' as const, amount: 6000, category: 'Education', description: 'Cours en ligne', date: new Date(year, month, 13), paymentMethod: 'CIB' },
  ]

  for (const tx of txData) {
    await prisma.transaction.create({ data: { ...tx, userId: demo.id } })
  }

  // Budgets
  const budgetData = [
    { category: 'Alimentation', limit: 25000, spent: 20000 },
    { category: 'Transport', limit: 10000, spent: 8500 },
    { category: 'Logement', limit: 25000, spent: 25000 },
    { category: 'Factures', limit: 8000, spent: 6500 },
    { category: 'Loisirs', limit: 5000, spent: 2500 },
    { category: 'Shopping', limit: 5000, spent: 3000 },
  ]

  for (const b of budgetData) {
    await prisma.budget.create({
      data: { ...b, userId: demo.id, month: month + 1, year, currency: 'DZD' },
    })
  }

  // Savings Goals
  await prisma.savingGoal.create({
    data: { userId: demo.id, name: 'Vacances d\'été', targetAmount: 100000, savedAmount: 45000, icon: 'Plane', color: '#3b82f6', deadline: new Date(year, 6, 1) },
  })
  await prisma.savingGoal.create({
    data: { userId: demo.id, name: 'Laptop neuf', targetAmount: 180000, savedAmount: 120000, icon: 'Smartphone', color: '#8b5cf6', deadline: new Date(year, 8, 1) },
  })
  await prisma.savingGoal.create({
    data: { userId: demo.id, name: 'Fonds d\'urgence', targetAmount: 300000, savedAmount: 80000, icon: 'Shield', color: '#22c55e' },
  })

  // Bills
  await prisma.bill.create({
    data: { userId: demo.id, name: 'Internet Algérie Télécom', amount: 3500, dueDate: new Date(year, month, 25), frequency: 'MONTHLY', category: 'Internet' },
  })
  await prisma.bill.create({
    data: { userId: demo.id, name: 'Loyer', amount: 25000, dueDate: new Date(year, month + 1, 1), frequency: 'MONTHLY', category: 'Loyer' },
  })
  await prisma.bill.create({
    data: { userId: demo.id, name: 'Abonnement Mobilis', amount: 1000, dueDate: new Date(year, month, 20), frequency: 'MONTHLY', category: 'Téléphone', isPaid: true },
  })

  // Debts
  await prisma.debt.create({
    data: { userId: demo.id, creditor: 'Karim (ami)', amount: 15000, notes: 'Prêt pour achat meubles', dueDate: new Date(year, month + 1, 15) },
  })
  await prisma.debt.create({
    data: { userId: demo.id, creditor: 'Banque BDL', amount: 200000, notes: 'Crédit voiture', dueDate: new Date(year + 1, 0, 1) },
  })

  // Notifications
  await prisma.notification.create({
    data: { userId: demo.id, title: 'Bienvenue sur Finplan !', message: 'Commencez par ajouter vos revenus et dépenses pour obtenir des insights personnalisés.', type: 'system' },
  })
  await prisma.notification.create({
    data: { userId: demo.id, title: 'Budget Logement atteint', message: 'Vous avez utilisé 100% de votre budget Logement ce mois-ci.', type: 'alert' },
  })
  await prisma.notification.create({
    data: { userId: demo.id, title: 'Facture Internet bientôt due', message: 'Votre facture Internet Algérie Télécom de 3 500 DA est due le 25 du mois.', type: 'reminder' },
  })
  await prisma.notification.create({
    data: { userId: demo.id, title: 'Conseil : la règle 50/30/20', message: 'Divisez votre revenu : 50% besoins, 30% envies, 20% épargne. Essayez ce mois-ci !', type: 'tip' },
  })

  console.log('✅ Seed completed!')
  console.log('📧 Demo: demo@finplan.dz / demo123')
  console.log('🛡️ Admin: admin@finplan.dz / admin123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
