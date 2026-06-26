'use client'

import { useArcBalance } from '@/hooks/blockchain/use-arc-balance'
import { cn } from '@/lib/utils'
import {
  ArrowLeftRight, Repeat2, Wallet, Zap, Send,
  CheckCircle2, Clock, Sparkles,
} from 'lucide-react'

// ─── Preview feature cards ────────────────────────────────────

const PREVIEW_FEATURES = [
  {
    icon: Send,
    title: 'Send USDC',
    desc: 'Single, batch and CSV-based USDC transfers with live Arc gas estimation.',
    status: 'Planned for v1.1',
  },
  {
    icon: ArrowLeftRight,
    title: 'Bridge',
    desc: 'Move USDC across chains via Circle CCTP and other canonical routes.',
    status: 'Awaiting Arc bridge infrastructure',
  },
  {
    icon: Repeat2,
    title: 'Swap',
    desc: 'Swap USDC for other assets through Arc-native liquidity venues.',
    status: 'Awaiting Arc DEX liquidity',
  },
  {
    icon: Wallet,
    title: 'Unified Balance',
    desc: 'See and manage your USDC across every supported chain in one view.',
    status: 'Planned for v1.1',
  },
  {
    icon: Zap,
    title: 'Automations',
    desc: 'Recurring payroll, vesting, streaming and scheduled USDC payments.',
    status: 'Planned for v1.2',
  },
]

// ─── Page ─────────────────────────────────────────────────────

export default function PaymentsHubPage() {
  const { formatted, isLoading } = useArcBalance()

  return (
    <div className="animate-fade-in-up">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Payments Hub</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Programmable money on Arc — send, bridge, swap and automate USDC
          </p>
        </div>
        <div className="rounded-lg border border-usdc-border bg-usdc-subtle px-3 py-2 text-right">
          <p className="text-2xs text-text-tertiary">Arc balance</p>
          <p className={cn('text-sm font-bold text-usdc tabular', isLoading && 'opacity-50')}>
            {isLoading ? '...' : formatted}
          </p>
        </div>
      </div>

      {/* Hero preview banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-secondary mb-6">
        {/* glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-usdc/5 blur-3xl" aria-hidden="true" />

        <div className="relative px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle">
            <Sparkles size={26} className="text-accent" aria-hidden="true" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 mb-4">
            <Clock size={12} className="text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold text-accent">Coming Soon</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Programmable payments are on the way
          </h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary leading-relaxed">
            Contractory v1.0 is focused on being the best place to build, deploy and manage
            smart contracts on Arc. Full USDC payments — sending, bridging, swapping and
            automations — will arrive in upcoming releases as the Arc ecosystem matures.
          </p>
        </div>
      </div>

      {/* Feature preview grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {PREVIEW_FEATURES.map(({ icon: Icon, title, desc, status }) => (
          <div
            key={title}
            className="relative rounded-xl border border-border-subtle bg-background-secondary p-5 opacity-90"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-background-tertiary">
              <Icon size={18} className="text-text-tertiary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="mt-1 text-xs text-text-tertiary leading-relaxed">{desc}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-background-tertiary px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden="true" />
              <span className="text-2xs font-medium text-text-secondary">{status}</span>
            </div>
            {/* disabled action */}
            <button
              disabled
              className="mt-4 w-full rounded-lg border border-border-subtle bg-background-tertiary py-2 text-xs font-medium text-text-disabled cursor-not-allowed"
            >
              Not available yet
            </button>
          </div>
        ))}
      </div>

      {/* What's ready today */}
      <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
        <div className="border-b border-border-subtle px-5 py-3.5">
          <p className="text-sm font-medium text-text-primary">What&apos;s ready today in Contractory v1.0</p>
        </div>
        <div className="divide-y divide-border-subtle">
          {[
            'Contract Studio — write, compile and deploy Solidity to Arc Testnet',
            'Arc Compatibility Analyzer, Security Scanner and Gas Estimator',
            'ArcScan verification built into the deploy flow',
            'Contract Control Center — manage your deployed contracts with real data',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 px-5 py-3">
              <CheckCircle2 size={15} className="text-usdc shrink-0" aria-hidden="true" />
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}