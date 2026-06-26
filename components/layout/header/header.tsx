'use client'

import { Search, Bell, Moon, Sun, Monitor, Command } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTheme }      from '@/components/design-system/theme-provider'
import { useCommandPalette } from '@/components/layout/command-palette/provider'
import { cn } from '@/lib/utils'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { open: openPalette } = useCommandPalette()

  const cycleTheme = () => {
    const next: Record<string, 'dark' | 'light' | 'system'> = {
      dark: 'light', light: 'system', system: 'dark',
    }
    setTheme(next[theme])
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle bg-background-secondary/90 px-4 backdrop-blur-sm">
      {/* Search trigger — opens command palette */}
      <button
        onClick={openPalette}
        className={cn(
          'flex flex-1 items-center gap-2 rounded-md border border-border-subtle',
          'bg-background-tertiary px-3 py-2 text-left text-sm text-text-tertiary',
          'hover:border-border-default hover:text-text-secondary transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'max-w-xs'
        )}
        aria-label="Open command palette"
      >
        <Search size={14} aria-hidden="true" />
        <span className="flex-1 truncate">Search or jump to...</span>
        <kbd className="flex items-center gap-0.5 rounded border border-border-subtle bg-background-elevated px-1.5 py-0.5 text-2xs text-text-disabled">
          <Command size={10} aria-hidden="true" />K
        </kbd>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          aria-label={`Switch theme (current: ${theme})`}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary',
            'hover:bg-background-tertiary hover:text-text-secondary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <ThemeIcon size={16} aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary',
            'hover:bg-background-tertiary hover:text-text-secondary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <Bell size={16} aria-hidden="true" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border-subtle" aria-hidden="true" />

        {/* Wallet connect */}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            if (!mounted) return null

            if (!account) {
              return (
                <button
                  onClick={openConnectModal}
                  className={cn(
                    'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white',
                    'hover:bg-accent-hover transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary'
                  )}
                >
                  Connect wallet
                </button>
              )
            }

            return (
              <div className="flex items-center gap-1.5">
                {/* Chain selector */}
                {chain && (
                  <button
                    onClick={openChainModal}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border border-border-subtle',
                      'bg-background-tertiary px-2.5 py-1.5 text-sm text-text-secondary',
                      'hover:border-border-default hover:text-text-primary transition-colors'
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-usdc" aria-hidden="true" />
                    <span className="text-xs font-medium">{chain.name}</span>
                  </button>
                )}

                {/* Account button */}
                <button
                  onClick={openAccountModal}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border-subtle',
                    'bg-background-tertiary px-2.5 py-1.5 text-sm text-text-secondary',
                    'hover:border-border-default hover:text-text-primary transition-colors'
                  )}
                >
                  <span className="font-mono text-xs">{account.displayName}</span>
                  {account.displayBalance && (
                    <span className="hidden text-xs text-usdc sm:inline">
                      {account.displayBalance}
                    </span>
                  )}
                </button>
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  )
}
