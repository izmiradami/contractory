'use client'

import { useEffect }           from 'react'
import { useNotifications }    from '@/hooks/ui/use-notifications'
import { useCommandPalette }   from '@/components/layout/command-palette/provider'

export function PlatformShell({ children }: { children: React.ReactNode }) {
  useNotifications()
  const { open } = useCommandPalette()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K → command palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        open()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return <>{children}</>
}
