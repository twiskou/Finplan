'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { TrendingUp, Menu, X, Sun, Moon, Globe } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useTheme } from 'next-themes'

interface NavbarProps {
  activePage?: 'login' | 'register'
}

export default function Navbar({ activePage }: NavbarProps) {
  const { t, lang, setLang } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const fallbackRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (activePage) return;

    const handleScroll = () => {
      const sections = ['features', 'pricing']
      let current = ''
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) {
            current = section
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activePage])

  const toggleLanguage = () => {
    const langs: ('fr' | 'en' | 'ar')[] = ['fr', 'en', 'ar']
    const nextIndex = (langs.indexOf(lang as any) + 1) % langs.length
    setLang(langs[nextIndex])
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-nav)',
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
        position: 'relative'
      }}>
        {/* Logo - Left */}
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', zIndex: 10 }}>
          <img
            src="/logo.png"
            alt="Finplan Logo"
            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              if (fallbackRef.current) fallbackRef.current.style.display = 'flex'
            }}
          />
          <div ref={fallbackRef} style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)', color: 'var(--text-heading)' }}>
              Fin<span style={{ color: '#6366f1' }}>plan</span>
            </span>
          </div>
        </Link>

        {/* Center Links - Desktop Only */}
        {!activePage && (
          <div className="nav-center-links" style={{ display: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <style>{`
              @media (min-width: 768px) {
                .nav-center-links { display: flex !important; gap: 2.5rem; align-items: center; }
              }
              .hover-icon-btn {
                background: transparent; border: none; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                color: var(--text-heading); padding: 0.4rem 0.6rem;
                border-radius: 8px; transition: background 0.2s;
              }
              .hover-icon-btn:hover {
                background: rgba(128, 128, 128, 0.1);
              }
            `}</style>
            <Link 
              href="/#features" 
              style={{ 
                textDecoration: 'none', 
                color: activeSection === 'features' ? '#6366f1' : 'var(--text-main)',
                fontWeight: activeSection === 'features' ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
            >
              {t('nav.features')}
            </Link>
            <Link 
              href="/#pricing" 
              style={{ 
                textDecoration: 'none', 
                color: activeSection === 'pricing' ? '#6366f1' : 'var(--text-main)',
                fontWeight: activeSection === 'pricing' ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
            >
              {t('nav.pricing')}
            </Link>
          </div>
        )}

        {/* Right Side - Toggles, Buttons & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
          
          {/* Toggles (Always visible) */}
          {mounted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  title="Changer la langue"
                  className="hover-icon-btn"
                  style={{ gap: '0.35rem' }}
                >
                  <Globe size={18} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{lang.toUpperCase()}</span>
                </button>

                {isLangMenuOpen && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                      onClick={() => setIsLangMenuOpen(false)} 
                    />
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                      background: 'var(--bg-nav)', border: '1px solid var(--border-nav)',
                      borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column',
                      gap: '0.25rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', zIndex: 50,
                      minWidth: '130px', backdropFilter: 'blur(12px)'
                    }}>
                      {[
                        { code: 'fr', label: 'Français' },
                        { code: 'en', label: 'English' },
                        { code: 'ar', label: 'العربية' }
                      ].map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code as any); setIsLangMenuOpen(false) }}
                          style={{
                            background: lang === l.code ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: lang === l.code ? '#6366f1' : 'var(--text-heading)',
                            border: 'none', padding: '0.5rem 0.75rem', borderRadius: '6px',
                            textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem',
                            fontWeight: lang === l.code ? 600 : 400,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                          className="hover-bg-light"
                        >
                          {l.label}
                          {lang === l.code && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Changer le thème"
                className="hover-icon-btn"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          )}

          <div className={`auth-buttons ${activePage ? 'always-show' : ''}`} style={{ display: 'none' }}>
            <style>{`
              @media (min-width: 768px) {
                .auth-buttons { display: flex !important; align-items: center; gap: 0.75rem; }
                .mobile-toggle { display: none !important; }
              }
              .always-show { display: flex !important; align-items: center; gap: 0.75rem; }
            `}</style>
            
            <Link
              href="/login"
              className="btn-secondary"
              style={{
                padding: '0.5rem 1rem',
                opacity: activePage === 'login' ? 0.5 : 1,
                pointerEvents: activePage === 'login' ? 'none' : 'auto',
              }}
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/register"
              className="btn-primary"
              style={{
                padding: '0.5rem 1rem',
                opacity: activePage === 'register' ? 0.5 : 1,
                pointerEvents: activePage === 'register' ? 'none' : 'auto',
              }}
            >
              {t('nav.register')}
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          {!activePage && (
            <button 
              className="mobile-toggle hover-icon-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {!activePage && isMobileMenuOpen && (
        <div className="mobile-toggle" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-nav)',
          padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: activeSection === 'features' ? '#6366f1' : 'var(--text-heading)', fontWeight: activeSection === 'features' ? 700 : 600, fontSize: '1.1rem' }}>
              {t('nav.features')}
            </Link>
            <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: activeSection === 'pricing' ? '#6366f1' : 'var(--text-heading)', fontWeight: activeSection === 'pricing' ? 700 : 600, fontSize: '1.1rem' }}>
              {t('nav.pricing')}
            </Link>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)', margin: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary" style={{ padding: '0.75rem', textAlign: 'center', width: '100%', justifyContent: 'center' }}>
              {t('nav.login')}
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary" style={{ padding: '0.75rem', textAlign: 'center', width: '100%', justifyContent: 'center' }}>
              {t('nav.register')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

