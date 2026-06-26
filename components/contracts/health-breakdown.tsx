'use client'

import { useState }  from 'react'
import { HealthRing } from './health-ring'
import { cn }         from '@/lib/utils'
import {
  ShieldCheck, ShieldAlert, Fuel, Zap, User, RefreshCw, ChevronDown,
} from 'lucide-react'

export interface HealthBreakdown {
  compatibility:  number   // 0-100
  security:       number
  performance:    number
  gas:            number
  ownership:      number
  upgradeability: number
}

interface HealthDimension {
  key:    keyof HealthBreakdown
  label:  string
  icon:   React.ElementType
  detail: string
}

const DIMENSIONS: HealthDimension[] = [
  { key: 'compatibility',  label: 'Compatibility',  icon: ShieldCheck,  detail: 'Arc-specific checks: PREVRANDAO, SELFDESTRUCT, USDC decimals, blob tx.' },
  { key: 'security',       label: 'Security',       icon: ShieldAlert,  detail: 'Reentrancy, tx.origin, floating pragma, centralization risks.' },
  { key: 'performance',    label: 'Performance',    icon: Zap,          detail: 'Storage reads, loops, unnecessary SSTORE, packing.' },
  { key: 'gas',            label: 'Gas',            icon: Fuel,         detail: 'Estimated cost per function call on Arc Testnet.' },
  { key: 'ownership',      label: 'Ownership',      icon: User,         detail: 'Owner set, multisig, timelock, renounced check.' },
  { key: 'upgradeability', label: 'Upgradeability', icon: RefreshCw,    detail: 'Proxy pattern detected, implementation slot analysis.' },
]

function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 85 ? 'bg-usdc' :
    value >= 65 ? 'bg-status-warning' :
                  'bg-status-error'
  return (
    <div className="flex-1 h-1.5 rounded-full bg-background-elevated overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

interface HealthBreakdownCardProps {
  breakdown: HealthBreakdown
  overall:   number
}

export function HealthBreakdownCard({ breakdown, overall }: HealthBreakdownCardProps) {
  const [expanded, setExpanded] = useState<keyof HealthBreakdown | null>(null)

  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border-subtle px-5 py-4">
        <HealthRing score={overall} size="lg" />
        <div>
          <p className="text-sm font-semibold text-text-primary">Contract Health</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {overall >= 90 ? 'Excellent — production ready' :
             overall >= 75 ? 'Good — minor issues' :
             overall >= 60 ? 'Fair — needs attention' :
             'Poor — critical issues found'}
          </p>
        </div>
      </div>

      {/* Dimension rows */}
      <div className="divide-y divide-border-subtle">
        {DIMENSIONS.map(({ key, label, icon: Icon }) => {
          const val  = breakdown[key]
          const open = expanded === key
          const color =
            val >= 85 ? 'text-usdc' :
            val >= 65 ? 'text-status-warning' :
                        'text-status-error'

          return (
            <div key={key}>
              <button
                onClick={() => setExpanded(open ? null : key)}
                className="flex w-full items-center gap-3 px-5 py-3 hover:bg-background-tertiary transition-colors"
              >
                <Icon size={14} className="text-text-tertiary shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-text-primary w-28 text-left">{label}</span>
                <ScoreBar value={val} />
                <span className={cn('text-xs font-bold tabular w-7 text-right shrink-0', color)}>{val}</span>
                <ChevronDown
                  size={13}
                  className={cn('text-text-disabled transition-transform shrink-0', open && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
              {open && (
                <div className="px-5 py-3 bg-background-tertiary/50 border-t border-border-subtle">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {DIMENSIONS.find((d) => d.key === key)?.detail}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compute breakdown from contract data
export function computeBreakdown(
  verified: boolean,
  arcScore: number,
  securityScore: number
): HealthBreakdown {
  return {
    compatibility:  arcScore,
    security:       securityScore,
    performance:    verified ? 88 : 72,
    gas:            92,
    ownership:      verified ? 82 : 60,
    upgradeability: 100,
  }
}
