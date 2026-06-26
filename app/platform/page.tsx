'use client'

import { useAccount }        from 'wagmi'
import { useRouter }         from 'next/navigation'
import { useEffect, useState } from 'react'
import { useArcNetwork }     from '@/hooks/blockchain/use-arc-network'
import { useArcBalance }     from '@/hooks/blockchain/use-arc-balance'
import { truncateAddress }   from '@/lib/utils'
import { cn }                from '@/lib/utils'
import {
  Code2, Bot, Layers, Rocket, Coins, ImageIcon, Zap, Activity,
  Copy, ExternalLink, Sparkles, FileCode, ShieldCheck, Lightbulb,
} from 'lucide-react'

// --- Helpers ---

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

// --- Hero ---

function Hero() {
  const router = useRouter()
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-secondary mb-6">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="relative px-8 py-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 mb-4">
          <Sparkles size={12} className="text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-accent">Developer OS for Arc</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary max-w-2xl">
          Build your next smart contract on Arc
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xl">
          Write, compile, analyze and deploy Arc-compatible contracts with USDC-native gas
          and sub-second finality — all from one workspace.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push('/platform/studio')}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Rocket size={15} aria-hidden="true" />
            New Contract
          </button>
          <button
            onClick={() => router.push('/platform/studio')}
            className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-background-tertiary px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
          >
            <Code2 size={15} aria-hidden="true" />
            Open Contract Studio
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Premium Quick Actions ---

const QUICK_ACTIONS = [
  { icon: Rocket,    title: 'New Contract',        desc: 'Start from an Arc-ready template',      href: '/platform/studio',    color: 'text-accent' },
  { icon: Code2,     title: 'Open Contract Studio', desc: 'Write, compile and deploy',            href: '/platform/studio',    color: 'text-interactive' },
  { icon: Layers,    title: 'My Contracts',        desc: 'Manage your deployments',               href: '/platform/contracts', color: 'text-usdc' },
  { icon: ShieldCheck, title: 'AI Review',         desc: 'Check compatibility and security',      href: '/platform/studio',    color: 'text-status-warning' },
]

function QuickActions() {
  const router = useRouter()
  return (
    <div>
      <p className="text-sm font-semibold text-text-primary mb-3">Quick Actions</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ icon: Icon, title, desc, href, color }) => (
          <button
            key={title}
            onClick={() => router.push(href)}
            className="group flex items-start gap-3 rounded-xl border border-border-subtle bg-background-secondary p-4 text-left transition-all hover:border-border-default hover:bg-background-tertiary active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-background-tertiary transition-transform group-hover:scale-110">
              <Icon size={18} className={color} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">{title}</p>
              <p className="mt-0.5 text-xs text-text-tertiary leading-relaxed">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Wallet Card ---

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
                {address ? truncateAddress(address, 5) : '-'}
              </p>
              <p className="text-xs text-text-tertiary">{chain?.name ?? 'Arc Testnet'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Copy address" onClick={() => address && navigator.clipboard.writeText(address)} className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors">
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
        <p className="text-xs text-text-tertiary mt-1">Arc Testnet - ERC-20</p>
      </div>
    </div>
  )
}

// --- Recent Contracts (honest empty state) ---

function RecentContracts() {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <p className="text-sm font-medium text-text-primary">Recent Contracts</p>
        <button onClick={() => router.push('/platform/contracts')} className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          View all
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-subtle bg-background-tertiary">
          <FileCode size={22} className="text-text-disabled" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">No contracts deployed yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Deploy your first smart contract on Arc.</p>
        </div>
        <button
          onClick={() => router.push('/platform/studio')}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <Rocket size={14} aria-hidden="true" />
          Create Contract
        </button>
      </div>
    </div>
  )
}

// --- Network Card ---

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
        {rows.map(({ label, value, usdc, status }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <p className="text-xs text-text-tertiary">{label}</p>
            <div className="flex items-center gap-1.5">
              {status && <StatusDot status={status} />}
              <p className={cn('text-xs font-medium', usdc ? 'text-usdc' : 'text-text-primary')}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle px-4 py-3">
        <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-xs text-interactive hover:text-interactive-hover transition-colors">
          Open ArcScan
        </a>
      </div>
    </div>
  )
}

// --- Developer Tips (auto-rotating, static) ---

const DEV_TIPS = [
  { title: 'Use the ERC20 template', desc: 'Start from an audited, Arc-ready ERC20 in Contract Studio.' },
  { title: 'Verify every deployment', desc: 'Verified contracts build trust and unlock ArcScan source view.' },
  { title: 'Review compatibility first', desc: 'Aim for 100/100 on the Arc Analyzer before you deploy.' },
  { title: 'Gas is paid in USDC', desc: 'No volatile gas token — costs stay predictable at ~$0.01 / tx.' },
]

function DeveloperTips() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % DEV_TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])
  const tip = DEV_TIPS[idx]
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3 flex items-center gap-2">
        <Lightbulb size={14} className="text-accent" aria-hidden="true" />
        <p className="text-sm font-medium text-text-primary">Developer Tips</p>
      </div>
      <div className="px-4 py-4 min-h-[84px]">
        <p className="text-sm font-medium text-text-primary">{tip.title}</p>
        <p className="mt-1 text-xs text-text-tertiary leading-relaxed">{tip.desc}</p>
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-3">
        {DEV_TIPS.map((_, i) => (
          <span key={i} className={cn('h-1 rounded-full transition-all', i === idx ? 'w-5 bg-accent' : 'w-1.5 bg-border-default')} aria-hidden="true" />
        ))}
      </div>
    </div>
  )
}

// --- Arc Platform features ---

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

// --- PAGE ---

export default function WorkspacePage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) router.replace('/auth/connect')
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <div className="animate-fade-in-up">
      <Hero />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        {/* MAIN */}
        <div className="space-y-5 min-w-0">
          <QuickActions />
          <RecentContracts />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <WalletCard />
          <NetworkCard />
          <DeveloperTips />
          <ArcFeaturesCard />
        </div>
      </div>
    </div>
  )
}