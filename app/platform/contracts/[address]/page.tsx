'use client'

import { use, useState }                  from 'react'
import { useRouter }                      from 'next/navigation'
import { HealthRing }                     from '@/components/contracts/health-ring'
import { HealthBreakdownCard, computeBreakdown } from '@/components/contracts/health-breakdown'
import { FunctionStudio }                 from '@/components/contracts/function-studio'
import { AiExecutiveSummary, generateFindings }  from '@/components/contracts/ai-summary'
import { useContracts }                   from '@/hooks/features/use-contracts'
import { useContractEvents }              from '@/hooks/features/use-contract-events'
import { SecurityPanel }                  from '@/components/studio/security-panel'
import { truncateAddress, formatTimeAgo, copyToClipboard, explorerAddressUrl } from '@/lib/utils'
import { cn }                             from '@/lib/utils'
import { toast }                          from 'sonner'
import {
  ArrowLeft, CheckCircle2, AlertCircle, Copy, ExternalLink,
  Star, Activity, Fuel, ShieldCheck, Sparkles,
  Clock, User, Zap, FileCode, BarChart2,
  Code2,
} from 'lucide-react'
import type { AbiItem } from '@/components/contracts/types'

// ─── Demo ABI ─────────────────────────────────────────────────

const DEMO_ABI: AbiItem[] = [
  { name: 'balanceOf',         type: 'function', stateMutability: 'view',        inputs: [{ name: 'account', type: 'address' }],                                                                           outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalSupply',       type: 'function', stateMutability: 'view',        inputs: [],                                                                                                               outputs: [{ name: '', type: 'uint256' }] },
  { name: 'owner',             type: 'function', stateMutability: 'view',        inputs: [],                                                                                                               outputs: [{ name: '', type: 'address' }] },
  { name: 'symbol',            type: 'function', stateMutability: 'view',        inputs: [],                                                                                                               outputs: [{ name: '', type: 'string'  }] },
  { name: 'decimals',          type: 'function', stateMutability: 'view',        inputs: [],                                                                                                               outputs: [{ name: '', type: 'uint8'   }] },
  { name: 'allowance',         type: 'function', stateMutability: 'view',        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],                                      outputs: [{ name: '', type: 'uint256' }] },
  { name: 'transfer',          type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],                                          outputs: [{ name: '', type: 'bool'    }] },
  { name: 'approve',           type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],                                     outputs: [{ name: '', type: 'bool'    }] },
  { name: 'mint',              type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],                                          outputs: []                             },
  { name: 'transferOwnership', type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'newOwner', type: 'address' }],                                                                         outputs: []                             },
  { name: 'Transfer',          type: 'event',    inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }] },
  { name: 'Approval',          type: 'event',    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }] },
]

const DEMO_EVENTS = [
  { id: '1', name: 'Transfer', timestamp: new Date(Date.now() - 2 * 60 * 1000),        args: { from: '0x0000...', to: '0x7bbf...', value: '1e18' } },
  { id: '2', name: 'Approval', timestamp: new Date(Date.now() - 15 * 60 * 1000),       args: { owner: '0x7bbf...', spender: '0x1234...', value: '5e8' } },
  { id: '3', name: 'Transfer', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),   args: { from: '0x0000...', to: '0x7bbf...', value: '5e17' } },
  { id: '4', name: 'Transfer', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),  args: { from: '0x7bbf...', to: '0xabcd...', value: '1e17' } },
]

const TIMELINE_EVENTS = [
  { label: 'Deployed',          time: '2 days ago',    icon: Zap,          color: 'text-accent'         },
  { label: 'Source verified',   time: '2 days ago',    icon: CheckCircle2, color: 'text-usdc'           },
  { label: 'First Transfer',    time: '1 day ago',     icon: Activity,     color: 'text-interactive'    },
  { label: 'Ownership checked', time: '20 hours ago',  icon: User,         color: 'text-text-secondary' },
  { label: 'Approval emitted',  time: '15 min ago',    icon: Activity,     color: 'text-interactive'    },
  { label: 'Transfer emitted',  time: '2 min ago',     icon: Activity,     color: 'text-interactive'    },
]

// ─── Types ────────────────────────────────────────────────────

type DetailTab = 'overview' | 'functions' | 'events' | 'abi' | 'analytics' | 'timeline'
type RightTab  = 'ai' | 'health' | 'security' | 'gas'

// ─── Page ─────────────────────────────────────────────────────

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = use(params)
  const router      = useRouter()

  const { contracts, isLoading: _contractsLoading } = useContracts()
  const contract = contracts.find(
    (c) => c.address.toLowerCase() === address.toLowerCase()
  ) ?? contracts[0]

  const { events: liveEvents, isLoading: _eventsLoading } = useContractEvents(
    contract?.address
  )

  const [detailTab,  setDetailTab]  = useState<DetailTab>('overview')
  const [rightTab,   setRightTab]   = useState<RightTab>('ai')
  const [aiExplain,  setAiExplain]  = useState<string | null>(null)

  const findings  = generateFindings(contract.type, contract.verified, contract.health)

  const handleCopy = async () => {
    await copyToClipboard(contract.address)
    toast.success('Address copied')
  }

  const handleExplain = (name: string) => {
    setAiExplain(name)
    setRightTab('ai')
  }

  const DETAIL_TABS: Array<{ id: DetailTab; label: string; icon: React.ElementType }> = [
    { id: 'overview',  label: 'Overview',   icon: FileCode  },
    { id: 'functions', label: 'Functions',  icon: Code2     },
    { id: 'events',    label: 'Events',     icon: Activity  },
    { id: 'abi',       label: 'ABI',        icon: FileCode  },
    { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
    { id: 'timeline',  label: 'Timeline',   icon: Clock     },
  ]

  const RIGHT_TABS: Array<{ id: RightTab; label: string; icon: React.ElementType }> = [
    { id: 'ai',       label: 'AI',      icon: Sparkles   },
    { id: 'health',   label: 'Health',  icon: ShieldCheck },
    { id: 'security', label: 'Security',icon: ShieldCheck },
    { id: 'gas',      label: 'Gas',     icon: Fuel       },
  ]

  return (
    <div className="animate-fade-in-up space-y-5">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/platform/contracts')}
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Contracts
        </button>
        <span className="text-text-disabled">/</span>
        <span className="text-sm font-medium text-text-primary">{contract.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <button aria-label="Toggle favorite" className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-background-secondary hover:text-status-warning transition-colors">
            <Star size={15} fill={contract.isFavorite ? 'currentColor' : 'none'} className={contract.isFavorite ? 'text-status-warning' : ''} aria-hidden="true" />
          </button>
          <a
            href={explorerAddressUrl(contract.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-secondary px-3 py-1.5 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
          >
            <ExternalLink size={13} aria-hidden="true" />
            ArcScan
          </a>
        </div>
      </div>

      {/* ── Identity bar ── */}
      <div className="rounded-xl border border-border-subtle bg-background-secondary px-5 py-4">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-subtle border border-accent-border">
            <FileCode size={22} className="text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h1 className="text-lg font-bold text-text-primary">{contract.name}</h1>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-2xs font-semibold text-accent">
                {contract.type.replace('_', '-')}
              </span>
              {contract.verified
                ? <span className="flex items-center gap-1 text-2xs text-usdc"><CheckCircle2 size={11} aria-hidden="true" />Verified</span>
                : <span className="flex items-center gap-1 text-2xs text-status-error"><AlertCircle size={11} aria-hidden="true" />Unverified</span>
              }
              <span className={cn('text-2xs capitalize', contract.status === 'active' ? 'text-usdc' : 'text-text-tertiary')}>
                ● {contract.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-text-secondary">{contract.address}</code>
              <button onClick={handleCopy} aria-label="Copy address" className="text-text-tertiary hover:text-text-secondary transition-colors">
                <Copy size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="text-center shrink-0">
            <HealthRing score={contract.health} size="lg" />
            <p className="text-2xs text-text-tertiary mt-1">Health</p>
          </div>
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── LEFT: Content ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* AI Executive Summary — always visible */}
          <AiExecutiveSummary
            contractName={contract.name}
            contractType={contract.type}
            verified={contract.verified}
            health={contract.health}
            findings={findings}
          />

          {/* Detail tabs */}
          <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
            <div className="flex border-b border-border-subtle bg-background-secondary/80">
              {DETAIL_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setDetailTab(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 -mb-px',
                    detailTab === id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* Overview */}
              {detailTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Contract Info</p>
                    {[
                      ['Address',  <code key="a" className="text-xs font-mono text-text-secondary">{truncateAddress(contract.address, 6)}</code>],
                      ['Network',  <span key="n" className="text-xs text-text-primary">Arc Testnet (72)</span>],
                      ['Status',   <span key="s" className={cn('text-xs capitalize', contract.status === 'active' ? 'text-usdc' : 'text-text-tertiary')}>{contract.status}</span>],
                      ['Deployed', <span key="d" className="text-xs text-text-primary">{formatTimeAgo(contract.deployedAt)}</span>],
                      ['Deployer', <code key="dep" className="text-xs font-mono text-text-secondary">{truncateAddress(contract.deployer, 4)}</code>],
                      ['Tx Hash',  <code key="tx" className="text-xs font-mono text-interactive">{truncateAddress(contract.txHash, 6)}</code>],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                        <p className="text-xs text-text-tertiary">{label}</p>
                        {value}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Ownership</p>
                    <div className="rounded-lg border border-border-subtle bg-background-tertiary p-4 space-y-3 mb-4">
                      <div>
                        <p className="text-2xs text-text-tertiary mb-1">Owner</p>
                        <code className="text-xs font-mono text-text-primary">{truncateAddress(contract.deployer, 8)}</code>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Transfer', 'Renounce', 'Pause', 'Upgrade'].map((action) => (
                          <button key={action} className={cn(
                            'rounded-md border px-2 py-1.5 text-xs transition-colors',
                            action === 'Upgrade'
                              ? 'border-accent-border bg-accent-subtle text-accent hover:bg-accent-subtle/80'
                              : 'border-border-subtle bg-background-secondary text-text-secondary hover:bg-background-elevated'
                          )}>
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Export</p>
                    <div className="flex flex-wrap gap-2">
                      {['ABI', 'Source', 'JSON', 'README', 'OpenAPI'].map((fmt) => (
                        <button key={fmt} className="rounded-md border border-border-subtle bg-background-tertiary px-3 py-1.5 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors">
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Function Studio */}
              {detailTab === 'functions' && (
                <FunctionStudio
                  abi={DEMO_ABI}
                  address={contract.address}
                  onExplain={handleExplain}
                />
              )}

              {/* Events */}
              {detailTab === 'events' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-text-primary">Live Events</p>
                    <span className="flex items-center gap-1.5 text-2xs text-usdc">
                      <span className="h-1.5 w-1.5 rounded-full bg-usdc animate-pulse" aria-hidden="true" />
                      Monitoring
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(liveEvents.length > 0 ? liveEvents : DEMO_EVENTS).map((ev) => (
                      <div key={ev.id} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-background-tertiary px-4 py-3">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-2xs font-semibold text-accent shrink-0">
                          {ev.name}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap text-2xs text-text-tertiary">
                            {Object.entries(ev.args).map(([k, v]) => (
                              <span key={k}>
                                <span className="text-text-disabled">{k}:</span>{' '}
                                <span className="font-mono text-text-secondary">{v}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="shrink-0 text-2xs text-text-disabled">{ev.timestamp ? formatTimeAgo(ev.timestamp) : "recent"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABI */}
              {detailTab === 'abi' && (
                <div>
                  <div className="flex gap-4 mb-4 text-xs font-medium">
                    <span className="text-interactive">{DEMO_ABI.filter((f) => f.type === 'function').length} functions</span>
                    <span className="text-accent">{DEMO_ABI.filter((f) => f.type === 'event').length} events</span>
                  </div>
                  <pre className="rounded-lg bg-background-primary border border-border-subtle p-4 text-xs font-mono text-text-secondary overflow-auto max-h-80 scrollbar-hide">
                    {JSON.stringify(DEMO_ABI, null, 2)}
                  </pre>
                </div>
              )}

              {/* Analytics */}
              {detailTab === 'analytics' && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Calls',    value: '143',        usdc: false },
                    { label: 'Unique Users',   value: '12',         usdc: false },
                    { label: 'Gas Spent',      value: '$1.43 USDC', usdc: true  },
                    { label: 'Events Emitted', value: '89',         usdc: false },
                    { label: 'Avg Gas/tx',     value: '$0.01 USDC', usdc: true  },
                    { label: 'Last Activity',  value: '2 min ago',  usdc: false },
                  ].map(({ label, value, usdc }) => (
                    <div key={label} className="rounded-xl border border-border-subtle bg-background-tertiary p-4 text-center">
                      <p className={cn('text-xl font-bold tabular', usdc ? 'text-usdc' : 'text-text-primary')}>{value}</p>
                      <p className="text-xs font-medium text-text-primary mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              {detailTab === 'timeline' && (
                <div className="relative">
                  <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border-subtle" aria-hidden="true" />
                  <div className="space-y-4">
                    {TIMELINE_EVENTS.map(({ label, time, icon: Icon, color }, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-elevated border border-border-subtle z-10', color)}>
                          <Icon size={16} aria-hidden="true" />
                        </div>
                        <div className="flex-1 pt-2.5">
                          <p className="text-sm text-text-primary">{label}</p>
                          <p className="text-xs text-text-tertiary">{time}</p>
                        </div>
                      </div>
                    ))}
                    {/* Now */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-usdc/10 border border-usdc-border z-10">
                        <span className="h-3 w-3 rounded-full bg-usdc animate-pulse" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold text-usdc">Now — monitoring</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── RIGHT: Intelligence Panel ── */}
        <div className="w-72 shrink-0 space-y-4">
          <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border-subtle">
              {RIGHT_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setRightTab(id)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-2xs font-medium transition-colors border-b-2 -mb-px',
                    rightTab === id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto max-h-[600px] scrollbar-hide">

              {/* AI Workspace */}
              {rightTab === 'ai' && (
                <div className="space-y-3">
                  {aiExplain ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-text-primary">
                          Explain: <code className="text-accent">{aiExplain}()</code>
                        </p>
                        <button onClick={() => setAiExplain(null)} className="text-2xs text-text-tertiary hover:text-text-secondary">✕</button>
                      </div>
                      <div className="rounded-lg border border-accent-border bg-accent-subtle p-3">
                        <p className="text-xs text-text-primary leading-relaxed">
                          {aiExplain === 'mint'
                            ? 'The mint() function creates new tokens (onlyOwner). On Arc: both native 18-dec USDC and ERC-20 6-dec balanceOf increase simultaneously. Never confuse 1e18 native with 1e6 ERC-20 when minting amounts.'
                            : aiExplain === 'transfer'
                            ? 'Standard ERC-20 transfer. On Arc: transfers to address(0) REVERT. Transfers to or from blocklisted addresses also REVERT at runtime. Safe for use with normal addresses.'
                            : `The ${aiExplain}() function performs its standard operation. On Arc, gas is paid in USDC (~$0.01 per call). All state changes are final in under 1 second.`
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-text-primary">AI Workspace</p>
                      <div className="space-y-1.5">
                        {[
                          'Explain this contract',
                          'Find vulnerabilities',
                          'Optimize gas usage',
                          'Explain constructor',
                          'Generate unit tests',
                          'Generate documentation',
                          'Generate README',
                          'Suggest improvements',
                          'Compare with ERC20 standard',
                          'Generate deployment guide',
                        ].map((action) => (
                          <button
                            key={action}
                            className="w-full text-left rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Health breakdown */}
              {rightTab === 'health' && (
                <HealthBreakdownCard
                  breakdown={computeBreakdown(contract.verified, contract.verified ? 96 : 74, contract.health)}
                  overall={contract.health}
                />
              )}

              {rightTab === 'security' && (
                <SecurityPanel source={''} />
              )}

              {rightTab === 'gas' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-usdc-subtle border border-usdc-border p-4 text-center">
                    <Fuel size={16} className="text-usdc mx-auto mb-2" aria-hidden="true" />
                    <p className="text-2xs text-text-tertiary mb-1">Avg call cost</p>
                    <p className="text-xl font-bold text-usdc">~$0.01 USDC</p>
                  </div>
                  <div>
                    {[
                      { fn: 'transfer()',    gas: '~$0.008 USDC' },
                      { fn: 'approve()',     gas: '~$0.006 USDC' },
                      { fn: 'mint()',        gas: '~$0.012 USDC' },
                      { fn: 'balanceOf()',   gas: 'Free (read)'  },
                      { fn: 'totalSupply()', gas: 'Free (read)'  },
                    ].map(({ fn, gas }) => (
                      <div key={fn} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                        <code className="text-xs font-mono text-text-secondary">{fn}</code>
                        <span className={cn('text-xs tabular font-medium', gas.startsWith('Free') ? 'text-usdc' : 'text-text-primary')}>
                          {gas}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
