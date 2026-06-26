'use client'

import { useArcBalance } from '@/hooks/blockchain/use-arc-balance'
import { useRouter }     from 'next/navigation'
import { cn }            from '@/lib/utils'
import {
  Bot, Sparkles, Clock, CheckCircle2, Code2, Network, ShieldCheck,
} from 'lucide-react'

const PREVIEW_FEATURES = [
  {
    icon: Network,
    title: 'Agent Registry',
    desc: 'Discover and browse AI agents registered on-chain via the ERC-8004 identity standard.',
    status: 'Awaiting Arc ERC-8004 registry',
  },
  {
    icon: ShieldCheck,
    title: 'On-chain Reputation',
    desc: 'Verifiable reputation and job history for every agent, settled on Arc.',
    status: 'Awaiting Arc ERC-8004 registry',
  },
  {
    icon: Bot,
    title: 'Agent Builder',
    desc: 'Configure an agent identity, capabilities and permissions, then register it on Arc.',
    status: 'Planned for v1.1',
  },
]

export default function AgentsPage() {
  const { formatted, isLoading } = useArcBalance()
  const router = useRouter()

  return (
    <div className="animate-fade-in-up">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">AI Agents</h1>
          <p className="mt-1 text-sm text-text-secondary">
            On-chain AI agent identity and reputation on Arc - ERC-8004
          </p>
        </div>
        <div className="rounded-lg border border-usdc-border bg-usdc-subtle px-3 py-2 text-right">
          <p className="text-2xs text-text-tertiary">Arc balance</p>
          <p className={cn('text-sm font-bold text-usdc tabular', isLoading && 'opacity-50')}>
            {isLoading ? '...' : formatted}
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-secondary mb-6">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle">
            <Bot size={26} className="text-accent" aria-hidden="true" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 mb-4">
            <Clock size={12} className="text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold text-accent">Coming Soon</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            The agentic economy is almost here
          </h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary leading-relaxed">
            Contractory v1.0 focuses on building and deploying smart contracts on Arc.
            A full AI agent registry - with on-chain identity, reputation and discovery -
            will go live once Arc exposes the ERC-8004 registry infrastructure. No mock
            agents are shown here.
          </p>
        </div>
      </div>

      {/* Feature preview grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {PREVIEW_FEATURES.map(({ icon: Icon, title, desc, status }) => (
          <div key={title} className="rounded-xl border border-border-subtle bg-background-secondary p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-background-tertiary">
              <Icon size={18} className="text-text-tertiary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="mt-1 text-xs text-text-tertiary leading-relaxed">{desc}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-background-tertiary px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden="true" />
              <span className="text-2xs font-medium text-text-secondary">{status}</span>
            </div>
            <button disabled className="mt-4 w-full rounded-lg border border-border-subtle bg-background-tertiary py-2 text-xs font-medium text-text-disabled cursor-not-allowed">
              Not available yet
            </button>
          </div>
        ))}
      </div>

      {/* What's ready today */}
      <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
        <div className="border-b border-border-subtle px-5 py-3.5 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-text-primary">What you can do today</p>
        </div>
        <div className="divide-y divide-border-subtle">
          <div className="flex items-center gap-3 px-5 py-3">
            <CheckCircle2 size={15} className="text-usdc shrink-0" aria-hidden="true" />
            <p className="text-sm text-text-secondary">
              Deploy the ERC-8004 agent identity contract from Contract Studio
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <CheckCircle2 size={15} className="text-usdc shrink-0" aria-hidden="true" />
            <p className="text-sm text-text-secondary">
              Deploy the ERC-8183 job contract with USDC escrow
            </p>
          </div>
        </div>
        <div className="border-t border-border-subtle px-5 py-3.5">
          <button
            onClick={() => router.push('/platform/studio?t=arc-agent')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Code2 size={14} aria-hidden="true" />
            Open Contract Studio
          </button>
        </div>
      </div>

    </div>
  )
}