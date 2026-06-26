'use client'

import { useAccount }        from 'wagmi'
import { useRouter }         from 'next/navigation'
import { useEffect }         from 'react'
import { useArcNetwork }     from '@/hooks/blockchain/use-arc-network'
import { useArcBalance }     from '@/hooks/blockchain/use-arc-balance'
import { truncateAddress }   from '@/lib/utils'
import { cn }                from '@/lib/utils'
import {
  Code2, Bot, Wallet, Layers, Settings as SettingsIcon,
  Rocket, Coins, ImageIcon, Zap, Activity,
  Copy, ExternalLink, ChevronRight, ShieldCheck,
} from 'lucide-react'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ LEFT: Workspace Nav (only real, working pages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const WORKSPACE_ITEMS = [
  { label: 'Contract Studio',  icon: Code2,        href: '/platform/studio',    desc: 'Write, compile & deploy' },
  { label: 'My Contracts',     icon: Layers,       href: '/platform/contracts', desc: 'Manage deployments' },
  { label: 'AI Agents',        icon: Bot,          href: '/platform/agents',    desc: 'ERC-8004 identity' },
  { label: 'Settings',         icon: SettingsIcon, href: '/platform/settings',  desc: 'Preferences' },
]

function WorkspaceNav() {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">Workspace</p>
        <p className="text-2xs text-text-tertiary mt-0.5">Smart contract development for Arc</p>
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

// â”€â”€â”€ CENTER: Wallet Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WalletCard() {
  const { address, isConnected, chain } = useAccount()
  const { formatted, isLoading }        = useArcBalance()

  if (!isConnected) return null

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
                {address ? truncateAddress(address, 5) : 'â€”'}
              </p>
              <p className="text-xs text-text-tertiary">{chain?.name ?? 'Arc Testnet'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Copy address"
            onClick={() => address && navigator.clipboard.writeText(address)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors"
          >
            <Copy size={13} aria-hidden="true" />
          </button>
          <a href={address ? `https://testnet.arcscan.app/address/${address}` : 'https://testnet.arcscan.app'} target="_blank" rel="noopener noreferrer" aria-label="View on explorer" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors">
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="rounded-lg bg-usdc-subtle border border-usdc-border p-3.5">
        <p className="text-xs font-medium text-text-tertiary mb-1">USDC Balance</p>
        <p className={cn('text-2xl font-semibold tabular text-usdc', isLoading && 'opacity-50')}>
          {isLoading ? '...' : formatted}
        </p>
        <p className="text-xs text-text-tertiary mt-1">Arc Testnet Â· ERC-20</p>
      </div>
    </div>
  )
}

// â”€â”€â”€ Quick Actions (only real, working destinations) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const QUICK_ACTIONS = [
  { label: 'Deploy Contract', icon: Rocket,    href: '/platform/studio',          color: 'text-accent'         },
  { label: 'Create ERC20',    icon: Coins,     href: '/platform/studio?t=erc20',  color: 'text-interactive'    },
  { label: 'Create NFT',      icon: ImageIcon, href: '/platform/studio?t=erc721', color: 'text-status-warning' },
  { label: 'My Contracts',    icon: Layers,    href: '/platform/contracts',       color: 'text-usdc'           },
  { label: 'AI Agents',       icon: Bot,       href: '/platform/agents',          color: 'text-accent'         },
  { label: 'Settings',        icon: SettingsIcon, href: '/platform/settings',     color: 'text-text-tertiary'  },
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

function RecentSection({ title, link, linkLabel }: {
  title: string; link: string; linkLabel: string
}) {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <button onClick={() => router.push(link)} className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          {linkLabel} â†’
        </button>
      </div>
      <div className="px-5 py-5 flex items-center justify-between">
        <p className="text-sm text-text-tertiary">Nothing here yet</p>
        <button onClick={() => router.push(link)} className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          Get started â†’
        </button>
      </div>
    </div>
  )
}

// â”€â”€â”€ RIGHT: Network â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <p className="text-sm font-medium text-text-primary">Arc Testnet</p>
          <p className="text-2xs text-text-tertiary mt-0.5">Chain ID 5042002</p>
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
        <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          Open ArcScan â†’
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

// â”€â”€â”€ PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <p className="mt-1 text-sm text-text-secondary">Developer Workspace Â· Arc Testnet</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-usdc" aria-label="Connected" />
          <span className="text-xs text-text-tertiary">Arc Testnet Â· Connected</span>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-[220px_1fr_240px] gap-5 items-start">

        {/* LEFT */}
        <WorkspaceNav />

        {/* CENTER */}
        <div className="space-y-4 min-w-0">
          <WalletCard />
          <QuickActions />
          <RecentSection title="Recent Contracts" link="/platform/contracts" linkLabel="View all" />
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