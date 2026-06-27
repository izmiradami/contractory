'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { useState }    from 'react'
import {
  LayoutDashboard, Code2, FileCode, CircleDollarSign, Wallet,
  ArrowLeftRight, Repeat2, Bot, Briefcase, Activity, Search,
  Wrench, Sparkles, Settings, ChevronLeft, ChevronRight, ShieldCheck,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---

interface NavItem {
  label:   string
  path:    string
  icon:    React.ElementType
  group:   string
  badge?:  string | number
  comingSoon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  // Core
  { label: 'Dashboard',       path: '/platform',           icon: LayoutDashboard, group: 'core' },
  { label: 'Contract Studio', path: '/platform/studio',    icon: Code2,           group: 'core' },
  { label: 'Contracts',       path: '/platform/contracts', icon: FileCode,        group: 'core' },
  { label: 'AI Agents',       path: '/platform/agents',    icon: Bot,             group: 'core' },

  // Tools
  { label: 'Explorer',        path: '/platform/explorer',  icon: Search,          group: 'tools', comingSoon: true },
  { label: 'Templates',       path: '/platform/templates', icon: Layers,          group: 'tools', comingSoon: true },
  { label: 'Security Center', path: '/platform/security',  icon: ShieldCheck,     group: 'tools', comingSoon: true },
  { label: 'AI Assistant',    path: '/platform/assistant', icon: Sparkles,        group: 'tools', comingSoon: true },

  // Finance
  { label: 'Payments',        path: '/platform/money',     icon: CircleDollarSign, group: 'finance', comingSoon: true },
]

const GROUP_LABELS: Record<string, string> = {
  core:    'Core',
  finance: 'Finance',
  tools:   'Developer Tools',
}

// ---

export function Sidebar() {
  const pathname   = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Group items
  const groups = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'relative z-20 flex flex-col border-r border-border-subtle bg-background-secondary',
        'transition-[width] duration-200 ease-expo-out',
        collapsed ? 'w-16' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-14 shrink-0 items-center border-b border-border-subtle px-4',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex items-center gap-2.5">
          {/* Contractory logo */}
          <img src="/logo.png" alt="Contractory" className="h-7 w-7 shrink-0 rounded-md object-cover" />
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              Contractory
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-hide">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-2xs font-medium uppercase tracking-wider text-text-disabled">
                {GROUP_LABELS[group]}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.path ||
                  (item.path !== '/platform' && pathname.startsWith(item.path))
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-100',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      isActive
                        ? 'bg-accent-subtle text-accent font-medium'
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon
                      size={16}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary'
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!collapsed && item.comingSoon && (
                      <span className="ml-auto rounded-full border border-border-subtle bg-background-tertiary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-tertiary">
                        Soon
                      </span>
                    )}
                    {!collapsed && item.badge !== undefined && (
                      <span className="ml-auto rounded-full bg-accent-subtle px-1.5 py-0.5 text-2xs font-medium text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Settings + Collapse toggle */}
      <div className="shrink-0 border-t border-border-subtle px-2 py-3">
        <Link
          href="/platform/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-text-secondary',
            'hover:bg-background-tertiary hover:text-text-primary transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <Settings size={16} className="shrink-0 text-text-tertiary" aria-hidden="true" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm',
            'text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed
            ? <ChevronRight size={16} aria-hidden="true" />
            : <><ChevronLeft size={16} aria-hidden="true" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}