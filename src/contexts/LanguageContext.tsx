'use client'
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { dict, Lang, TranslationKey } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  isRTL: false,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    // Read from localStorage first
    const saved = localStorage.getItem('finplan_lang') as Lang | null
    if (saved && ['fr', 'en', 'ar'].includes(saved)) {
      setLangState(saved)
    } else {
      // Fallback: fetch from API
      fetch('/api/auth/me')
        .then(r => r.json())
        .then(d => {
          if (d.user?.language && ['fr', 'en', 'ar'].includes(d.user.language)) {
            setLangState(d.user.language as Lang)
          }
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    // Apply RTL direction for Arabic
    const isRTL = lang === 'ar'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('finplan_lang', l)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return dict[lang]?.[key] ?? dict['fr'][key] ?? key
  }, [lang])

  const contextValue = useMemo(() => ({
    lang,
    setLang,
    t,
    isRTL: lang === 'ar'
  }), [lang, setLang, t])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
