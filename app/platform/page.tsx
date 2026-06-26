'use client'

import { useAccount }        from 'wagmi'
import { useRouter }         from 'next/navigation'
import { useEffect, useState } from 'react'
import { useArcNetwork }     from '@/hooks/blockchain/use-arc-network'
import { useArcBalance }     from '@/hooks/blockchain/use-arc-balance'
import { useCommandPalette } from '@/components/layout/command-palette/provider'
import { truncateAddress }   from '@/lib/utils'
import { cn }                from '@/lib/utils'
import {
  Code2, ArrowLeftRight, Bot, Wallet, Search, Layers,
  Rocket, Coins, ImageIcon, Zap, Activity,
  Copy, ExternalLink, ChevronRight, Sparkles, Send
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  return (
    <span className={cn(
      'inline-block h-2 w-2 rounded-full',
      status === 'healthy'  && 'bg-usdc',
      status === 'degraded' && 'bg-status-warning',
      status === 'down'     && 'bg-status-error',
    )} aria-label={status} />
  )
}

// ─── LEFT: Workspace Nav ──────────────────────────────────────

const WORKSPACE_ITEMS = [
  { label: 'Contract Studio', icon: Code2,         href: '/platform/studio',    desc: 'Deploy & verify' },
  { label: 'AI Agents',       icon: Bot,            href: '/platform/agents',    desc: 'ERC-8004' },
  { label: 'Bridge USDC',     icon: ArrowLeftRight, href: '/platform/bridge',    desc: 'Cross-chain' },
  { label: 'Unified Balance', icon: Wallet,         href: '/platform/balance',   desc: 'All chains' },
  { label: 'Explorer',        icon: Search,         href: '/platform/explorer',  desc: 'Blocks & txs' },
  { label: 'Templates',       icon: Layers,         href: '/platform/templates', desc: 'Start fast' },
]

function WorkspaceNav() {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">Workspace</p>
        <p className="text-2xs text-text-tertiary mt-0.5">Developer Operating System for Arc</p>
      </div>
      <nav aria-label="Workspace navigation">
        {WORKSPACE_ITEMS.map(({ label, icon: Icon, href, desc }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border-subtle last:border-0 hover:bg-background-tertiary transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-elevated border border-border-subtle group-hover:border-accent-border group-hover:bg-accent-subtle transition-colors">
              <Icon size={15} className="text-text-tertiary group-hover:text-accent transition-colors" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-tertiary">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-text-disabled group-hover:text-text-tertiary transition-colors" aria-hidden="true" />
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── CENTER: Wallet Card ──────────────────────────────────────

function WalletCard() {
  const { address, isConnected, chain } = useAccount()
  const { formatted, isLoading }        = useArcBalance()
  const { open: openPalette }           = useCommandPalette()

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-border-subtle bg-background-secondary p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle border border-accent-border mx-auto mb-3">
          <Wallet size={22} className="text-accent" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">Connect your wallet</p>
        <p className="text-xs text-text-tertiary mb-4">Connect to start building on Arc</p>
        <button
          onClick={openPalette}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Connect wallet
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-text-tertiary mb-1.5">Connected wallet</p>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle border border-accent-border">
              <span className="text-xs font-bold text-accent">{address?.slice(2,4).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary font-mono">
                {address ? truncateAddress(address, 5) : '—'}
              </p>
              <p className="text-xs text-text-tertiary">{chain?.name ?? 'Arc Testnet'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Copy address" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors">
            <Copy size={13} aria-hidden="true" />
          </button>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" aria-label="View on explorer" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors">
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="rounded-lg bg-usdc-subtle border border-usdc-border p-3.5">
        <p className="text-xs font-medium text-text-tertiary mb-1">USDC Balance</p>
        <p className={cn('text-2xl font-semibold tabular text-usdc', isLoading && 'opacity-50')}>
          {isLoading ? '...' : formatted}
        </p>
        <p className="text-xs text-text-tertiary mt-1">Arc Testnet · ERC-20</p>
      </div>
    </div>
  )
}

// ─── Quick Actions ────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Deploy Contract', icon: Rocket,         href: '/platform/studio',           color: 'text-accent'         },
  { label: 'Bridge USDC',     icon: ArrowLeftRight, href: '/platform/bridge',           color: 'text-usdc'           },
  { label: 'Create ERC20',    icon: Coins,          href: '/platform/studio?t=erc20',   color: 'text-interactive'    },
  { label: 'Create NFT',      icon: ImageIcon,      href: '/platform/studio?t=erc721',  color: 'text-status-warning' },
  { label: 'AI Agent',        icon: Bot,            href: '/platform/agents',           color: 'text-accent'         },
  { label: 'Explorer',        icon: Search,         href: '/platform/explorer',         color: 'text-text-tertiary'  },
]

function QuickActions() {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-5 py-3.5">
        <p className="text-sm font-medium text-text-primary">Quick Actions</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-border-subtle" role="list">
        {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
          <button
            key={href}
            role="listitem"
            onClick={() => router.push(href)}
            className="flex flex-col items-center gap-2 bg-background-secondary px-3 py-4 text-center hover:bg-background-tertiary transition-colors group"
          >
            <Icon size={20} className={cn(color, 'transition-transform group-hover:scale-110')} aria-hidden="true" />
            <span className="text-xs font-medium text-text-secondary leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MiniStats() {
  const stats = [
    { label: 'Contracts',    value: '0'     },
    { label: 'Transactions', value: '0'     },
    { label: 'Gas spent',    value: '$0.00', accent: true },
    { label: 'AI Agents',    value: '0'     },
  ]
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(({ label, value, accent }) => (
        <div key={label} className="rounded-xl border border-border-subtle bg-background-secondary px-4 py-3 text-center">
          <p className={cn('text-lg font-semibold tabular', accent ? 'text-usdc' : 'text-text-primary')}>{value}</p>
          <p className="text-2xs text-text-tertiary mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

function RecentSection({ title, link, linkLabel, empty }: {
  title: string; link: string; linkLabel: string; empty: boolean
}) {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <button onClick={() => router.push(link)} className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          {linkLabel} →
        </button>
      </div>
      {empty && (
        <div className="px-5 py-5 flex items-center justify-between">
          <p className="text-sm text-text-tertiary">Nothing here yet</p>
          <button onClick={() => router.push(link)} className="text-xs text-interactive hover:text-interactive-hover transition-colors">
            Get started →
          </button>
        </div>
      )}
    </div>
  )
}

function AiAssistantCard() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const suggestions = [
    'Why did my deployment fail?',
    'Generate an ERC20 token.',
    'Estimate gas for deploy.',
    'Check Arc compatibility.',
  ]
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-5 py-3.5 flex items-center gap-2">
        <Sparkles size={14} className="text-accent" aria-hidden="true" />
        <p className="text-sm font-medium text-text-primary">Ask Contractory</p>
        <span className="ml-auto rounded-full bg-accent-subtle px-2 py-0.5 text-2xs font-medium text-accent">AI</span>
      </div>
      <div className="p-4 space-y-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setQuery(s)}
            className="w-full text-left rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="border-t border-border-subtle px-3 py-3 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about Arc..."
          aria-label="Ask the AI assistant"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        <button
          onClick={() => router.push(`/platform/assistant${query ? `?q=${encodeURIComponent(query)}` : ''}`)}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
          aria-label="Open AI assistant"
        >
          <Send size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ─── RIGHT: Network ───────────────────────────────────────────

function NetworkCard() {
  const { latestBlock, gasPrice, finality, rpcStatus, networkStatus, isLoading } = useArcNetwork()
  const rows = [
    { label: 'Status',       value: networkStatus === 'healthy' ? 'Healthy' : networkStatus, status: networkStatus },
    { label: 'Gas (~21k)',   value: isLoading ? '...' : gasPrice, usdc: true },
    { label: 'Finality',     value: finality },
    { label: 'Latest block', value: latestBlock ? `#${latestBlock.toLocaleString()}` : '...' },
    { label: 'RPC',          value: rpcStatus === 'healthy' ? 'Healthy' : rpcStatus, status: rpcStatus },
  ]
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Arc Testnet</p>
          <p className="text-2xs text-text-tertiary mt-0.5">Chain ID 72</p>
        </div>
        <StatusDot status={networkStatus} />
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map(({ label, value, status, usdc }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <p className="text-xs text-text-tertiary">{label}</p>
            <div className="flex items-center gap-1.5">
              {status && <StatusDot status={status as 'healthy' | 'degraded' | 'down'} />}
              <p className={cn('text-xs font-medium tabular', usdc ? 'text-usdc' : 'text-text-primary')}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle px-4 py-3">
        <a href="https://testnet.arcscan.app/gas-tracker" target="_blank" rel="noopener noreferrer" className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          Gas tracker →
        </a>
      </div>
    </div>
  )
}

function ArcFeaturesCard() {
  const features = [
    { icon: Zap,      label: 'Sub-second finality', desc: 'BFT consensus'  },
    { icon: Coins,    label: 'USDC-native gas',     desc: '~$0.01 / tx'    },
    { icon: Bot,      label: 'Agentic economy',     desc: 'ERC-8004/8183'  },
    { icon: Activity, label: 'Real-time events',    desc: 'EIP-7708'       },
  ]
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-medium text-text-primary">Arc Platform</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5">
            <Icon size={14} className="text-text-tertiary shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-text-primary">{label}</p>
              <p className="text-2xs text-text-tertiary">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function WorkspacePage() {
  const { isConnected, address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) router.replace('/auth/connect')
  }, [isConnected, router])

  if (!isConnected) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {greeting}{address ? `, ${truncateAddress(address, 4)}` : ''}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Developer Workspace · Arc Testnet</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-usdc" aria-label="Connected" />
          <span className="text-xs text-text-tertiary">Arc Testnet · Connected</span>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-[220px_1fr_240px] gap-5 items-start">

        {/* LEFT */}
        <WorkspaceNav />

        {/* CENTER */}
        <div className="space-y-4 min-w-0">
          <WalletCard />
          <MiniStats />
          <QuickActions />
          <RecentSection title="Recent Contracts"    link="/platform/contracts" linkLabel="View all" empty />
          <RecentSection title="Recent Transactions" link="/platform/explorer"  linkLabel="View all" empty />
          <RecentSection title="Recent Events"       link="/platform/events"    linkLabel="View all" empty />
          <AiAssistantCard />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <NetworkCard />
          <ArcFeaturesCard />
        </div>

      </div>
    </div>
  )
}
