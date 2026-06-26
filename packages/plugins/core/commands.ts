// Contractory Command Palette Infrastructure
// Raycast-inspired command registry. UI component built in Phase 4 (Layout).
// Here we define: command types, registry, keyboard shortcuts.

// ─── Types ────────────────────────────────────────────────────────────────

export type CommandCategory =
  | 'navigation'
  | 'contracts'
  | 'blockchain'
  | 'tools'
  | 'ai'
  | 'settings'
  | 'recent'

export interface Command {
  id:          string
  label:       string
  description?: string
  icon?:       string       // Lucide icon name
  category:    CommandCategory
  shortcut?:   string       // e.g. '⌘D'
  keywords?:   string[]     // additional search terms
  requiresWallet?: boolean
  requiresChain?:  number   // specific chainId required

  // Action — navigation or function
  href?:    string
  action?:  () => void | Promise<void>

  // Dynamic commands can provide sub-commands
  subCommands?: () => Command[] | Promise<Command[]>
}

// ─── Command Registry ─────────────────────────────────────────────────────

class CommandRegistry {
  private commands = new Map<string, Command>()
  private recentIds: string[] = []
  private readonly maxRecent = 5

  register(command: Command): void {
    this.commands.set(command.id, command)
  }

  registerMany(commands: Command[]): void {
    commands.forEach((c) => this.register(c))
  }

  unregister(id: string): void {
    this.commands.delete(id)
  }

  get(id: string): Command | undefined {
    return this.commands.get(id)
  }

  search(query: string): Command[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAll()

    return this.getAll().filter((cmd) => {
      const searchable = [
        cmd.label,
        cmd.description ?? '',
        ...(cmd.keywords ?? []),
        cmd.category,
      ].join(' ').toLowerCase()
      return searchable.includes(q)
    })
  }

  getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  getByCategory(category: CommandCategory): Command[] {
    return this.getAll().filter((c) => c.category === category)
  }

  getRecent(): Command[] {
    return this.recentIds
      .map((id) => this.commands.get(id))
      .filter((c): c is Command => c !== undefined)
  }

  markUsed(id: string): void {
    this.recentIds = [id, ...this.recentIds.filter((i) => i !== id)].slice(0, this.maxRecent)
    try {
      localStorage.setItem('contractory-recent-commands', JSON.stringify(this.recentIds))
    } catch { /* ignore */ }
  }

  loadRecent(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('contractory-recent-commands') ?? '[]')
      if (Array.isArray(stored)) this.recentIds = stored
    } catch { /* ignore */ }
  }
}

export const commandRegistry = new CommandRegistry()

// ─── Built-in Commands ────────────────────────────────────────────────────

export const BUILT_IN_COMMANDS: Command[] = [
  // Navigation
  { id: 'nav.dashboard',   label: 'Go to Dashboard',       icon: 'layout-dashboard', category: 'navigation', href: '/' },
  { id: 'nav.studio',      label: 'Go to Contract Studio',  icon: 'code-2',           category: 'navigation', href: '/studio', requiresWallet: true },
  { id: 'nav.contracts',   label: 'Go to Contracts',        icon: 'file-code',        category: 'navigation', href: '/contracts' },
  { id: 'nav.money',       label: 'Go to Payments',         icon: 'circle-dollar-sign', category: 'navigation', href: '/money', requiresWallet: true },
  { id: 'nav.balance',     label: 'Go to Unified Balance',  icon: 'wallet',           category: 'navigation', href: '/balance', requiresWallet: true },
  { id: 'nav.bridge',      label: 'Go to Bridge',           icon: 'arrow-left-right', category: 'navigation', href: '/bridge', requiresWallet: true },
  { id: 'nav.agents',      label: 'Go to AI Agents',        icon: 'bot',              category: 'navigation', href: '/agents' },
  { id: 'nav.jobs',        label: 'Go to Job Center',       icon: 'briefcase',        category: 'navigation', href: '/jobs' },
  { id: 'nav.explorer',    label: 'Go to Explorer',         icon: 'search',           category: 'navigation', href: '/explorer' },
  { id: 'nav.tools',       label: 'Go to Dev Toolkit',      icon: 'wrench',           category: 'navigation', href: '/tools' },
  { id: 'nav.assistant',   label: 'Open AI Assistant',      icon: 'sparkles',         category: 'navigation', href: '/assistant' },
  { id: 'nav.settings',    label: 'Open Settings',          icon: 'settings',         category: 'navigation', href: '/settings', shortcut: '⌘,' },

  // Blockchain actions
  { id: 'action.deploy',   label: 'Deploy New Contract',    icon: 'rocket',           category: 'contracts',  href: '/studio', requiresWallet: true, shortcut: '⌘⇧D' },
  { id: 'action.bridge',   label: 'Bridge USDC',            icon: 'arrow-left-right', category: 'blockchain', href: '/bridge', requiresWallet: true, shortcut: '⌘⇧B' },
  { id: 'action.swap',     label: 'Swap Tokens',            icon: 'repeat-2',         category: 'blockchain', href: '/swap',   requiresWallet: true },
  { id: 'action.send',     label: 'Send USDC',              icon: 'send',             category: 'blockchain', href: '/money',  requiresWallet: true },
  { id: 'action.agent',    label: 'Register AI Agent',      icon: 'bot',              category: 'ai',         href: '/agents/register', requiresWallet: true },
  { id: 'action.job',      label: 'Create AI Job',          icon: 'plus-circle',      category: 'ai',         href: '/jobs/create',     requiresWallet: true },

  // Tools
  { id: 'tool.abi',        label: 'ABI Encoder / Decoder',  icon: 'binary',           category: 'tools',      href: '/tools#abi' },
  { id: 'tool.usdc',       label: 'USDC Decimal Converter', icon: 'circle-dollar-sign', category: 'tools',    href: '/tools#usdc' },
  { id: 'tool.hash',       label: 'Keccak-256 Hash',        icon: 'hash',             category: 'tools',      href: '/tools#keccak' },
  { id: 'tool.blocklist',  label: 'Blocklist Checker',      icon: 'shield-alert',     category: 'tools',      href: '/tools#blocklist' },
  { id: 'tool.calldata',   label: 'Calldata Decoder',       icon: 'code',             category: 'tools',      href: '/tools#calldata' },
  { id: 'tool.compat',     label: 'Arc Compatibility Check',icon: 'shield-check',     category: 'tools',      href: '/tools#compat' },

  // AI
  { id: 'ai.explain',      label: 'Explain Error',          icon: 'sparkles',         category: 'ai',         href: '/assistant?task=explain' },
  { id: 'ai.generate',     label: 'Generate Contract',      icon: 'wand-2',           category: 'ai',         href: '/assistant?task=generate' },
  { id: 'ai.review',       label: 'Review Contract',        icon: 'search-code',      category: 'ai',         href: '/assistant?task=review' },
]

// ─── Keyboard Shortcut Registry ───────────────────────────────────────────

export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  'meta+k':         'Open Command Palette',
  'meta+,':         'Open Settings',
  'meta+shift+d':   'Deploy Contract',
  'meta+shift+b':   'Bridge USDC',
  'meta+/':         'Quick Search',
  'escape':         'Close / Cancel',
  'meta+shift+a':   'Open AI Assistant',
}
