'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme  = 'dark' | 'light' | 'system'
type Accent = 'indigo' | 'violet' | 'blue' | 'slate'

interface ThemeContextValue {
  theme:         Theme
  accent:        Accent
  resolvedTheme: 'dark' | 'light'
  setTheme:      (t: Theme)  => void
  setAccent:     (a: Accent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  defaultTheme  = 'dark',
  defaultAccent = 'indigo',
}: {
  children:       ReactNode
  defaultTheme?:  Theme
  defaultAccent?: Accent
}) {
  const [theme,  setThemeState]  = useState<Theme>(defaultTheme)
  const [accent, setAccentState] = useState<Accent>(defaultAccent)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  // Load persisted preferences
  useEffect(() => {
    const t = localStorage.getItem('contractory-theme')  as Theme  | null
    const a = localStorage.getItem('contractory-accent') as Accent | null
    if (t) setThemeState(t)
    if (a) setAccentState(a)
  }, [])

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement
    const mq   = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = (t: Theme) => {
      const resolved = t === 'system' ? (mq.matches ? 'dark' : 'light') : t
      root.setAttribute('data-theme', resolved)
      setResolvedTheme(resolved)
    }

    apply(theme)

    if (theme === 'system') {
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  // Apply accent to <html>
  useEffect(() => {
    const root = document.documentElement
    // 'indigo' is the default — no attribute needed
    if (accent === 'indigo') {
      root.removeAttribute('data-accent')
    } else {
      root.setAttribute('data-accent', accent)
    }
  }, [accent])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('contractory-theme', t)
  }

  const setAccent = (a: Accent) => {
    setAccentState(a)
    localStorage.setItem('contractory-accent', a)
  }

  return (
    <ThemeContext.Provider value={{ theme, accent, resolvedTheme, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
