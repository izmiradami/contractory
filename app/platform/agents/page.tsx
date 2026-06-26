'use client'

import { useState }          from 'react'
import { ReputationCard }    from '@/components/agents/reputation-card'
import { AgentBuilder }      from '@/components/agents/agent-builder'
import { DEMO_AGENTS, CAPABILITY_LABELS, PERMISSION_LABELS } from '@/components/agents/types'
import type { StoredAgent, AgentStatus } from '@/components/agents/types'
import { formatTimeAgo, truncateAddress } from '@/lib/utils'
import { cn }                from '@/lib/utils'
import { toast }             from 'sonner'
import {
  Bot, Plus, Search, CheckCircle2, Star,
  Activity, Zap, Terminal, ChevronRight, Sparkles, X,
  Play, Square, Info, Lock, History, Database,
  ExternalLink,
} from 'lucide-react'

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = {
    online:  { color: 'text-usdc',           bg: 'bg-usdc/10 border-usdc/20',               dot: 'bg-usdc animate-pulse' },
    busy:    { color: 'text-status-warning',  bg: 'bg-status-warning/10 border-status-warning/20', dot: 'bg-status-warning' },
    idle:    { color: 'text-text-secondary',  bg: 'bg-background-tertiary border-border-subtle',  dot: 'bg-text-tertiary'  },
    offline: { color: 'text-text-disabled',   bg: 'bg-background-tertiary border-border-subtle',  dot: 'bg-text-disabled'  },
  }[status]

  return (
    <span className={cn('flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-semibold capitalize', cfg.bg, cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} aria-hidden="true" />
      {status}
    </span>
  )
}

// ─── Agent card ───────────────────────────────────────────────

function AgentCard({ agent, onClick }: { agent: StoredAgent; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-border-subtle bg-background-secondary p-4 hover:border-border-default hover:bg-background-tertiary transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle border border-accent-border">
            <Bot size={20} className="text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{agent.name}</p>
            <p className="text-2xs font-mono text-text-tertiary">{truncateAddress(agent.address, 4)}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <p className="text-xs text-text-tertiary leading-relaxed mb-3 line-clamp-2">{agent.description}</p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.capabilities.slice(0, 3).map((c) => (
          <span key={c} className="rounded-full bg-accent/8 px-2 py-0.5 text-2xs text-accent">
            {CAPABILITY_LABELS[c]}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="rounded-full bg-background-elevated px-2 py-0.5 text-2xs text-text-disabled">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-2xs text-text-disabled">
          <span className="flex items-center gap-1">
            <Star size={10} className="text-status-warning fill-status-warning" aria-hidden="true" />
            {agent.reputation.overall}/100
          </span>
          <span>{agent.reputation.jobsCompleted} jobs</span>
          <span>{agent.version}</span>
        </div>
        <ChevronRight size={13} className="text-text-disabled group-hover:text-text-tertiary transition-colors" aria-hidden="true" />
      </div>
    </div>
  )
}

// ─── Agent Detail ─────────────────────────────────────────────

type DetailTab = 'overview' | 'playground' | 'permissions' | 'memory' | 'versions' | 'timeline'

const PLAYGROUND_LOGS = [
  { time: '12:34:01', type: 'info',    msg: 'Agent initialized · ERC-8004 identity verified'     },
  { time: '12:34:02', type: 'action',  msg: 'Reading contract: 0x3600...0001'                     },
  { time: '12:34:02', type: 'info',    msg: 'Arc compatibility score: 96/100'                     },
  { time: '12:34:03', type: 'action',  msg: 'Running security analysis...'                        },
  { time: '12:34:04', type: 'success', msg: 'No critical issues found · 2 warnings'               },
  { time: '12:34:04', type: 'info',    msg: 'Gas estimate: ~$0.01 USDC per call'                   },
  { time: '12:34:05', type: 'success', msg: 'Analysis complete · Report generated'                 },
]

const AGENT_TIMELINE = [
  { label: 'Registered on Arc',     time: '14 days ago', icon: Bot,         color: 'text-accent'         },
  { label: 'Capability update',     time: '7 days ago',  icon: Zap,         color: 'text-interactive'    },
  { label: 'First job accepted',    time: '5 days ago',  icon: CheckCircle2,color: 'text-usdc'            },
  { label: 'Job completed',         time: '5 days ago',  icon: CheckCircle2,color: 'text-usdc'            },
  { label: 'Reputation: 90→94',     time: '3 days ago',  icon: Star,        color: 'text-status-warning' },
  { label: 'Version updated: v1.1→v1.2', time: '2 days ago', icon: History, color: 'text-accent'         },
  { label: 'Job completed',         time: '1 day ago',   icon: CheckCircle2,color: 'text-usdc'            },
]

function AgentDetail({ agent, onClose }: { agent: StoredAgent; onClose: () => void }) {
  const [tab,    setTab]    = useState<DetailTab>('overview')
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [output,  setOutput]  = useState('')

  const runPlayground = async () => {
    if (!prompt.trim()) return
    setRunning(true)
    setOutput('')
    await new Promise((r) => setTimeout(r, 1500))
    setOutput(`Agent "${agent.name}" executed successfully.\n\nPrompt: ${prompt}\n\nResult: Analysis complete. The contract shows 96/100 Arc compatibility. No critical security issues found. Gas estimate: $0.01 USDC per call.\n\nExecution time: 1.4s\nGas used: ~$0.008 USDC\nLogs: ${PLAYGROUND_LOGS.length} entries`)
    setRunning(false)
  }

  const TABS: Array<{ id: DetailTab; label: string; icon: React.ElementType }> = [
    { id: 'overview',    label: 'Overview',    icon: Info       },
    { id: 'playground',  label: 'Playground',  icon: Terminal   },
    { id: 'permissions', label: 'Permissions', icon: Lock       },
    { id: 'memory',      label: 'Memory',      icon: Database   },
    { id: 'versions',    label: 'Versions',    icon: History    },
    { id: 'timeline',    label: 'Timeline',    icon: Activity   },
  ]

  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle border border-accent-border">
          <Bot size={20} className="text-accent" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary">{agent.name}</h2>
            <StatusBadge status={agent.status} />
            <span className="text-2xs text-text-disabled">{agent.version}</span>
          </div>
          <p className="text-xs font-mono text-text-tertiary">{agent.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://testnet.arcscan.app/address/${agent.address}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-tertiary px-2.5 py-1.5 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
          >
            <ExternalLink size={12} aria-hidden="true" />ArcScan
          </a>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary transition-colors"
            aria-label="Close agent detail"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
              tab === id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            )}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">

        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">{agent.description}</p>
              <ReputationCard reputation={agent.reputation} />
              {/* Info rows */}
              <div className="space-y-0">
                {[
                  ['Owner',      truncateAddress(agent.owner, 6)],
                  ['Registered', formatTimeAgo(agent.registeredAt)],
                  ['Chain',      'Arc Testnet (5042002)'],
                  ['Visibility', agent.visibility],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <span className="text-xs text-text-tertiary">{label}</span>
                    <span className="text-xs text-text-primary capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Capabilities</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.capabilities.map((c) => (
                  <span key={c} className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-1 text-xs font-medium text-accent">
                    {CAPABILITY_LABELS[c]}
                  </span>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Knowledge Sources</p>
              <div className="space-y-1.5">
                {['Arc Documentation (MCP)', 'Project Contracts', 'Uploaded ABIs', 'User Templates'].map((src) => (
                  <div key={src} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={12} className="text-usdc shrink-0" aria-hidden="true" />
                    {src}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'playground' && (
          <div className="space-y-4">
            <p className="text-xs text-text-tertiary">Test the agent before using it in production. Every action is explainable, auditable, and replayable.</p>
            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runPlayground()}
                placeholder={`Prompt ${agent.name}...`}
                className="flex-1 rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={running ? undefined : runPlayground}
                disabled={!prompt.trim()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-40',
                  running ? 'bg-status-error hover:bg-status-error/80' : 'bg-accent hover:bg-accent-hover'
                )}
              >
                {running ? <><Square size={14} aria-hidden="true" />Stop</> : <><Play size={14} aria-hidden="true" />Run</>}
              </button>
            </div>

            {/* Suggestions */}
            {!output && (
              <div className="flex flex-wrap gap-1.5">
                {['Analyze contract 0x3600...0001', 'Review security of ArcToken', 'Estimate deployment gas'].map((s) => (
                  <button key={s} onClick={() => setPrompt(s)} className="rounded-full border border-border-subtle bg-background-tertiary px-2.5 py-1 text-2xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Logs */}
            <div className="rounded-lg border border-border-subtle bg-background-primary p-3 font-mono text-xs space-y-1 min-h-[160px]">
              {output ? (
                <pre className="text-text-secondary whitespace-pre-wrap">{output}</pre>
              ) : (
                PLAYGROUND_LOGS.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-text-disabled shrink-0">{log.time}</span>
                    <span className={cn(
                      log.type === 'success' ? 'text-usdc' :
                      log.type === 'action'  ? 'text-accent' :
                      log.type === 'error'   ? 'text-status-error' :
                      'text-text-tertiary'
                    )}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-text-secondary">{log.msg}</span>
                  </div>
                ))
              )}
              {running && (
                <div className="flex gap-2 animate-pulse">
                  <span className="text-text-disabled">running</span>
                  <span className="text-accent">[ACTION]</span>
                  <span className="text-text-secondary">Executing...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'permissions' && (
          <div className="space-y-2">
            <p className="text-xs text-text-tertiary mb-3">Granular on-chain permissions granted to this agent</p>
            {Object.entries(PERMISSION_LABELS).map(([id, label]) => {
              const granted = agent.permissions.includes(id as any)
              const isDangerous = ['deploy', 'write_contracts', 'payments', 'bridge', 'swap'].includes(id)
              return (
                <div key={id} className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                  granted
                    ? isDangerous ? 'border-status-warning/20 bg-status-warning/5' : 'border-usdc/20 bg-usdc/5'
                    : 'border-border-subtle bg-background-tertiary opacity-50'
                )}>
                  {granted
                    ? <CheckCircle2 size={14} className={isDangerous ? 'text-status-warning' : 'text-usdc'} aria-hidden="true" />
                    : <Lock size={14} className="text-text-disabled" aria-hidden="true" />
                  }
                  <span className={cn('flex-1 text-xs font-medium', granted ? 'text-text-primary' : 'text-text-disabled')}>{label}</span>
                  {granted && isDangerous && (
                    <span className="text-2xs text-status-warning">Write access</span>
                  )}
                  {granted && !isDangerous && (
                    <span className="text-2xs text-usdc">Granted</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'memory' && (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Recent Jobs</p>
              <div className="space-y-2">
                {agent.memory.recentJobs.map((job, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary">
                    <CheckCircle2 size={11} className="text-usdc shrink-0" aria-hidden="true" />
                    {job}
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mt-4 mb-3">Context</p>
              <div className="rounded-lg border border-border-subtle bg-background-tertiary p-3">
                <p className="text-xs text-text-secondary leading-relaxed">{agent.memory.context}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3">Known Contracts</p>
              <div className="space-y-2">
                {agent.memory.recentContracts.map((addr, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs font-mono text-text-secondary">
                    {addr}
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-text-disabled mt-4 mb-3">Favorite Chains</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.memory.favoriteChains.map((c) => (
                  <span key={c} className="rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'versions' && (
          <div className="space-y-2">
            {agent.versions.map((v, i) => (
              <div key={i} className={cn(
                'flex items-start gap-3 rounded-lg border px-4 py-3',
                i === 0 ? 'border-accent-border bg-accent-subtle' : 'border-border-subtle bg-background-tertiary'
              )}>
                <span className={cn('text-xs font-bold font-mono', i === 0 ? 'text-accent' : 'text-text-tertiary')}>{v.version}</span>
                <div className="flex-1">
                  <p className="text-xs text-text-primary">{v.changes}</p>
                  <p className="text-2xs text-text-tertiary mt-0.5">{formatTimeAgo(v.timestamp)}</p>
                </div>
                {i === 0 && <span className="text-2xs font-medium text-accent">Current</span>}
                {i > 0 && (
                  <button className="text-2xs text-interactive hover:text-interactive-hover transition-colors">
                    Rollback
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'timeline' && (
          <div className="relative">
            <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border-subtle" aria-hidden="true" />
            <div className="space-y-3">
              {AGENT_TIMELINE.map(({ label, time, icon: Icon, color }, i) => (
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
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-usdc/10 border border-usdc-border z-10">
                  <span className="h-3 w-3 rounded-full bg-usdc animate-pulse" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-usdc">Now · Monitoring</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

type PageView = 'list' | 'build' | 'detail'

export default function AgentsPage() {
  const [view,     setView]     = useState<PageView>('list')
  const [selected, setSelected] = useState<StoredAgent | null>(null)
  const [query,    setQuery]    = useState('')

  const filtered = DEMO_AGENTS.filter((a) =>
    !query || a.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleAgentSelect = (agent: StoredAgent) => {
    setSelected(agent)
    setView('detail')
  }

  const handleBuildDone = (name: string) => {
    toast.success(`${name} registered on Arc Testnet`)
    setView('list')
  }

  return (
    <div className="animate-fade-in-up">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">AI Agent Operating Center</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ERC-8004 onchain identity — deploy, manage and monitor AI agents on Arc
          </p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('build')}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} aria-hidden="true" />
            Register Agent
          </button>
        )}
        {view !== 'list' && (
          <button
            onClick={() => { setView('list'); setSelected(null) }}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            ← Back to agents
          </button>
        )}
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="grid grid-cols-[1fr_260px] gap-6 items-start">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="w-full rounded-lg border border-border-subtle bg-background-secondary pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent hover:border-border-default transition-colors"
              />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle bg-background-secondary py-16">
                <Bot size={32} className="text-text-disabled" aria-hidden="true" />
                <p className="text-sm text-text-tertiary">No agents yet</p>
                <button onClick={() => setView('build')} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
                  Register your first agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onClick={() => handleAgentSelect(agent)} />
                ))}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
                <Sparkles size={13} className="text-accent" aria-hidden="true" />
                <p className="text-xs font-semibold text-text-primary">AI Agent Assistant</p>
              </div>
              <div className="p-3 space-y-1.5">
                {['What is ERC-8004?', 'How to create an agent?', 'Explain agent reputation', 'Best practices for agents', 'Compare agent capabilities'].map((q) => (
                  <button key={q} className="w-full text-left rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
              <div className="border-b border-border-subtle px-4 py-3">
                <p className="text-xs font-semibold text-text-primary">Platform Stats</p>
              </div>
              <div className="divide-y divide-border-subtle">
                {[
                  { label: 'Total Agents',     value: `${DEMO_AGENTS.length}` },
                  { label: 'Online Now',        value: `${DEMO_AGENTS.filter((a) => a.status === 'online').length}` },
                  { label: 'Jobs Completed',    value: `${DEMO_AGENTS.reduce((s, a) => s + a.reputation.jobsCompleted, 0)}` },
                  { label: 'Avg Reputation',    value: `${Math.round(DEMO_AGENTS.reduce((s, a) => s + a.reputation.overall, 0) / DEMO_AGENTS.length)}/100` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-text-tertiary">{label}</span>
                    <span className="text-xs font-semibold text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Builder */}
      {view === 'build' && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-border-subtle bg-background-secondary p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bot size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-base font-semibold text-text-primary">Agent Builder</h2>
              <span className="ml-auto text-xs text-text-tertiary">ERC-8004 · Arc Testnet</span>
            </div>
            <AgentBuilder
              onCancel={() => setView('list')}
              onDone={handleBuildDone}
            />
          </div>
        </div>
      )}

      {/* Detail */}
      {view === 'detail' && selected && (
        <AgentDetail agent={selected} onClose={() => { setView('list'); setSelected(null) }} />
      )}
    </div>
  )
}
