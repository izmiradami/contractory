'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter }  from 'next/navigation'
import { Command }    from 'cmdk'
import {
  Search, LayoutDashboard, Code2, FileCode, CircleDollarSign, Wallet,
  ArrowLeftRight, Repeat2, Bot, Briefcase, Activity, Wrench,
  Sparkles, Settings, Send, Rocket, PlusCircle, Binary,
  Hash, ShieldAlert, SearchCode
} from 'lucide-react'
import { useCommandPalette } from './provider'
import { commandRegistry }  from '@/packages/plugins/core/commands'
import { cn } from '@/lib/utils'

// Icon map for command IDs
const ICON_MAP: Record<string, React.ElementType> = {
  'nav.dashboard':    LayoutDashboard,
  'nav.studio':       Code2,
  'nav.contracts':    FileCode,
  'nav.money':        CircleDollarSign,
  'nav.balance':      Wallet,
  'nav.bridge':       ArrowLeftRight,
  'nav.swap':         Repeat2,
  'nav.agents':       Bot,
  'nav.jobs':         Briefcase,
  'nav.events':       Activity,
  'nav.tools':        Wrench,
  'nav.assistant':    Sparkles,
  'nav.settings':     Settings,
  'action.deploy':    Rocket,
  'action.bridge':    ArrowLeftRight,
  'action.send':      Send,
  'action.agent':     Bot,
  'action.job':       PlusCircle,
  'tool.abi':         Binary,
  'tool.hash':        Hash,
  'tool.blocklist':   ShieldAlert,
  'tool.compat':      SearchCode,
  'ai.explain':       Sparkles,
  'ai.generate':      Sparkles,
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation:  'Navigation',
  contracts:   'Contracts',
  blockchain:  'Blockchain',
  tools:       'Developer Tools',
  ai:          'AI',
  settings:    'Settings',
  recent:      'Recent',
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const [query, setQuery]   = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        // handled by provider
      }
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, close])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  const handleSelect = useCallback((commandId: string) => {
    const cmd = commandRegistry.get(commandId)
    if (!cmd) return
    commandRegistry.markUsed(commandId)
    close()
    if (cmd.href) {
      router.push(cmd.href)
    } else {
      cmd.action?.()
    }
  }, [close, router])

  if (!isOpen) return null

  const commands = commandRegistry.search(query)

  // Group by category
  const grouped = commands.reduce<Record<string, typeof commands>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2',
          'animate-scale-in'
        )}
      >
        <Command
          className={cn(
            'overflow-hidden rounded-xl border border-border-default',
            'bg-background-elevated shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]'
          )}
          shouldFilter={false}
        >
          {/* Search input */}
          <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-3">
            <Search size={16} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search commands, pages, actions..."
              className={cn(
                'flex-1 bg-transparent text-sm text-text-primary outline-none',
                'placeholder:text-text-tertiary'
              )}
            />
            <kbd className="rounded border border-border-subtle bg-background-secondary px-1.5 py-0.5 text-2xs text-text-disabled">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-[360px] overflow-y-auto py-2 scrollbar-hide">
            {commands.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Search size={24} className="text-text-disabled" aria-hidden="true" />
                <p className="text-sm text-text-tertiary">No results for "{query}"</p>
              </div>
            )}

            {Object.entries(grouped).map(([category, items]) => (
              <Command.Group key={category}>
                <div className="px-3 pb-1 pt-2">
                  <p className="text-2xs font-medium uppercase tracking-wider text-text-disabled">
                    {CATEGORY_LABELS[category] ?? category}
                  </p>
                </div>
                {items.map((cmd) => {
                  const Icon = ICON_MAP[cmd.id] ?? Search
                  return (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.id}
                      onSelect={() => handleSelect(cmd.id)}
                      className={cn(
                        'mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
                        'text-sm text-text-secondary transition-colors',
                        'aria-selected:bg-accent-subtle aria-selected:text-text-primary',
                        'hover:bg-background-tertiary hover:text-text-primary'
                      )}
                    >
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                        'border border-border-subtle bg-background-secondary'
                      )}>
                        <Icon size={14} className="text-text-tertiary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{cmd.label}</p>
                        {cmd.description && (
                          <p className="truncate text-xs text-text-tertiary">{cmd.description}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="shrink-0 rounded border border-border-subtle bg-background-secondary px-1.5 py-0.5 text-2xs text-text-disabled">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border-subtle px-3.5 py-2">
            <span className="flex items-center gap-1 text-2xs text-text-disabled">
              <kbd className="rounded border border-border-subtle bg-background-secondary px-1 text-2xs">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1 text-2xs text-text-disabled">
              <kbd className="rounded border border-border-subtle bg-background-secondary px-1 text-2xs">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1 text-2xs text-text-disabled">
              <kbd className="rounded border border-border-subtle bg-background-secondary px-1 text-2xs">esc</kbd>
              close
            </span>
          </div>
        </Command>
      </div>
    </>
  )
}
