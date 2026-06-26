'use client'

import { useState }                      from 'react'
import { cn }                            from '@/lib/utils'
import { CAPABILITY_LABELS, PERMISSION_LABELS } from './types'
import type { AgentCapability, AgentPermission } from './types'
import {
  CheckCircle2, Circle, Loader2, Rocket, ChevronRight, ChevronLeft,
} from 'lucide-react'

type Step = 'name' | 'capabilities' | 'permissions' | 'wallet' | 'review' | 'registering' | 'done'

const STEPS: Array<{ id: Step; label: string }> = [
  { id: 'name',         label: 'Identity'     },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'permissions',  label: 'Permissions'  },
  { id: 'wallet',       label: 'Wallet'       },
  { id: 'review',       label: 'Review'       },
]

const ALL_CAPABILITIES = Object.entries(CAPABILITY_LABELS) as [AgentCapability, string][]
const ALL_PERMISSIONS  = Object.entries(PERMISSION_LABELS)  as [AgentPermission, string][]

interface BuilderProps {
  onCancel: () => void
  onDone:   (name: string) => void
}

export function AgentBuilder({ onCancel, onDone }: BuilderProps) {
  const [step,         setStep]         = useState<Step>('name')
  const [name,         setName]         = useState('')
  const [description,  setDescription]  = useState('')
  const [version,      setVersion]      = useState('v1.0')
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([])
  const [permissions,  setPermissions]  = useState<AgentPermission[]>(['read_contracts', 'explorer'])
  const [visibility,   setVisibility]   = useState<'private' | 'public'>('private')

  const stepIdx     = STEPS.findIndex((s) => s.id === step)
  const isLastStep  = stepIdx === STEPS.length - 1

  const toggleCap = (c: AgentCapability) =>
    setCapabilities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])

  const togglePerm = (p: AgentPermission) =>
    setPermissions((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  const next = async () => {
    const order: Step[] = ['name', 'capabilities', 'permissions', 'wallet', 'review', 'registering', 'done']
    const cur = order.indexOf(step)

    if (step === 'review') {
      setStep('registering')
      await new Promise((r) => setTimeout(r, 2000))
      setStep('done')
      return
    }

    setStep(order[cur + 1])
  }

  const prev = () => {
    const order: Step[] = ['name', 'capabilities', 'permissions', 'wallet', 'review']
    const cur = order.indexOf(step)
    if (cur > 0) setStep(order[cur - 1])
  }

  // Done state
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-usdc/10 border border-usdc-border">
          <CheckCircle2 size={32} className="text-usdc" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">Agent registered!</p>
          <p className="text-sm text-text-tertiary mt-1">
            <strong className="text-accent">{name}</strong> is now live on Arc Testnet
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">ERC-8004 identity created · Gas: ~$0.01 USDC</p>
        </div>
        <button
          onClick={() => onDone(name)}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          View Agent
        </button>
      </div>
    )
  }

  // Registering state
  if (step === 'registering') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 size={32} className="animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm font-medium text-text-primary">Registering on Arc Testnet...</p>
        <p className="text-xs text-text-tertiary">ERC-8004 · Gas ~$0.01 USDC · Sub-second finality</p>
      </div>
    )
  }

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map(({ id, label }, i) => {
          const done   = i < stepIdx
          const active = id === step
          return (
            <div key={id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {done ? (
                  <CheckCircle2 size={16} className="text-usdc" aria-hidden="true" />
                ) : active ? (
                  <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-2xs font-bold text-white">{i + 1}</span>
                  </div>
                ) : (
                  <Circle size={16} className="text-text-disabled" aria-hidden="true" />
                )}
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  done ? 'text-usdc' : active ? 'text-accent' : 'text-text-disabled'
                )}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={13} className="text-text-disabled" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="space-y-4 min-h-[280px]">

        {step === 'name' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Agent Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Research Agent"
                className="w-full rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this agent do?"
                className="w-full rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                  className="w-full rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 'capabilities' && (
          <div>
            <p className="text-xs text-text-tertiary mb-3">Select what this agent can do</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CAPABILITIES.map(([id, label]) => {
                const active = capabilities.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleCap(id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-accent-border bg-accent-subtle'
                        : 'border-border-subtle bg-background-tertiary hover:bg-background-elevated'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                      active ? 'border-accent bg-accent' : 'border-border-strong bg-transparent'
                    )}>
                      {active && <CheckCircle2 size={11} className="text-white" aria-hidden="true" />}
                    </div>
                    <span className={cn('text-xs font-medium', active ? 'text-accent' : 'text-text-secondary')}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 'permissions' && (
          <div>
            <p className="text-xs text-text-tertiary mb-3">Grant granular on-chain permissions</p>
            <div className="space-y-2">
              {ALL_PERMISSIONS.map(([id, label]) => {
                const active = permissions.includes(id)
                const isDangerous = ['deploy', 'write_contracts', 'payments', 'bridge', 'swap'].includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => togglePerm(id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-accent-border bg-accent-subtle'
                        : 'border-border-subtle bg-background-tertiary hover:bg-background-elevated'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center',
                      active ? 'border-accent bg-accent' : 'border-border-strong'
                    )}>
                      {active && <CheckCircle2 size={11} className="text-white" aria-hidden="true" />}
                    </div>
                    <span className={cn('flex-1 text-xs font-medium', active ? 'text-accent' : 'text-text-secondary')}>
                      {label}
                    </span>
                    {isDangerous && (
                      <span className="text-2xs text-status-warning rounded-full border border-status-warning/20 bg-status-warning/10 px-1.5 py-0.5">
                        Write
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 'wallet' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border-subtle bg-background-tertiary p-4">
              <p className="text-xs font-semibold text-text-secondary mb-2">Agent Wallet</p>
              <p className="text-xs text-text-tertiary leading-relaxed">
                A dedicated wallet will be generated for this agent, or you can assign an existing one.
                The agent uses this wallet for on-chain actions with USDC gas fees.
              </p>
            </div>
            <div className="space-y-2">
              {['Generate new wallet (recommended)', 'Use connected wallet'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2.5 cursor-pointer hover:bg-background-elevated transition-colors">
                  <input type="radio" name="wallet" className="accent-accent" defaultChecked={opt.includes('Generate')} />
                  <span className="text-xs text-text-secondary">{opt}</span>
                </label>
              ))}
            </div>
            <div className="rounded-lg border border-usdc-border bg-usdc-subtle px-3 py-2.5">
              <p className="text-xs text-usdc font-medium">Registration cost: ~$0.01 USDC</p>
              <p className="text-2xs text-text-tertiary mt-0.5">Arc sub-second finality — instant confirmation</p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border-subtle bg-background-tertiary p-4 space-y-2">
              {[
                ['Name',         name         || '—'],
                ['Version',      version               ],
                ['Visibility',   visibility            ],
                ['Capabilities', capabilities.length + ' selected'],
                ['Permissions',  permissions.length  + ' granted' ],
                ['Network',      'Arc Testnet (72)'    ],
                ['Gas cost',     '~$0.01 USDC'         ],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary">{label}</span>
                  <span className={cn(
                    'font-medium',
                    String(label) === 'Gas cost' ? 'text-usdc' : 'text-text-primary'
                  )}>{value}</span>
                </div>
              ))}
            </div>
            {capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {capabilities.map((c) => (
                  <span key={c} className="rounded-full bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent">
                    {CAPABILITY_LABELS[c]}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-subtle">
        <button
          onClick={stepIdx === 0 ? onCancel : prev}
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          {stepIdx === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
          onClick={next}
          disabled={step === 'name' && !name.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLastStep ? (
            <><Rocket size={15} aria-hidden="true" /> Register Agent</>
          ) : (
            <>Next <ChevronRight size={15} aria-hidden="true" /></>
          )}
        </button>
      </div>
    </div>
  )
}
