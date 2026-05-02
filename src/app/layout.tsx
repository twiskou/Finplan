import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'Finplan — Gérez vos finances intelligemment',
  description: 'Finplan est une plateforme intelligente de gestion des finances personnelles. Suivez vos revenus, dépenses, budgets et objectifs d\'épargne avec des insights IA.',
  keywords: 'finance personnelle, budget, épargne, gestion argent, Algérie, DZD',
  authors: [{ name: 'Finplan' }],
  openGraph: {
    title: 'Finplan — Gérez vos finances intelligemment',
    description: 'La plateforme de gestion financière adaptée au marché algérien.',
    type: 'website',
  },
}

import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
