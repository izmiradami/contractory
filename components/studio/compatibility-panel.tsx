'use client'

import { ShieldCheck, ShieldAlert, ShieldX, Info, Loader2 } from 'lucide-react'
import type { CompatibilityIssue }                            from '@/packages/blockchain/core/interface'
import { cn } from '@/lib/utils'

interface CompatibilityPanelProps {
  issues:  CompatibilityIssue[]
  score:   number
  loading: boolean
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? '#34d399' : score >= 70 ? '#f59e0b' : '#ef4444'
  const r     = 28
  const circ  = 2 * Math.PI * r
  const dash  = (score / 100) * circ

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        {/* Track */}
        <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(224, 10%, 16%)" strokeWidth="6" />
        {/* Progress */}
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold tabular" style={{ color }}>{score}</p>
        <p className="text-2xs text-text-tertiary">/ 100</p>
      </div>
    </div>
  )
}

const SEVERITY_CONFIG = {
  error:   { icon: ShieldX,     color: 'text-status-error',   bg: 'bg-status-error/8   border-status-error/20',   label: 'Error'   },
  warning: { icon: ShieldAlert, color: 'text-status-warning', bg: 'bg-status-warning/8 border-status-warning/20', label: 'Warning' },
  info:    { icon: Info,        color: 'text-interactive',    bg: 'bg-interactive/8    border-interactive/20',    label: 'Info'    },
}

function IssueCard({ issue }: { issue: CompatibilityIssue }) {
  const cfg = SEVERITY_CONFIG[issue.severity]
  const Icon = cfg.icon
  return (
    <div className={cn('rounded-lg border p-3', cfg.bg)}>
      <div className="flex items-start gap-2 mb-1.5">
        <Icon size={13} className={cn('mt-0.5 shrink-0', cfg.color)} aria-hidden="true" />
        <p className={cn('text-xs font-semibold', cfg.color)}>{issue.pattern}</p>
        {issue.line && (
          <span className="ml-auto text-2xs text-text-tertiary font-mono">:{issue.line}</span>
        )}
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-2">{issue.description}</p>
      <div className="rounded bg-background-secondary/60 px-2 py-1.5">
        <p className="text-2xs text-text-tertiary font-medium mb-0.5">Fix</p>
        <p className="text-xs text-text-primary">{issue.recommendation}</p>
      </div>
    </div>
  )
}

export function CompatibilityPanel({ issues, score, loading }: CompatibilityPanelProps) {
  const errors   = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const infos    = issues.filter((i) => i.severity === 'info')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <Loader2 size={16} className="animate-spin text-text-tertiary" aria-hidden="true" />
        <p className="text-xs text-text-tertiary">Analyzing...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {score === 100 ? 'Fully compatible' : score >= 80 ? 'Minor issues' : 'Needs attention'}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">Arc compatibility score</p>
          <div className="flex items-center gap-3 mt-2">
            {errors.length   > 0 && <span className="text-xs text-status-error">{errors.length} error{errors.length > 1 ? 's' : ''}</span>}
            {warnings.length > 0 && <span className="text-xs text-status-warning">{warnings.length} warning{warnings.length > 1 ? 's' : ''}</span>}
            {issues.length   === 0 && <span className="text-xs text-usdc">All checks passed</span>}
          </div>
        </div>
      </div>

      {/* Checks summary */}
      {issues.length === 0 && (
        <div className="space-y-1.5">
          {[
            'No PREVRANDAO usage',
            'USDC decimals safe',
            'No forbidden SELFDESTRUCT',
            'No blob transactions',
            'Value transfers safe',
          ].map((check) => (
            <div key={check} className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-usdc shrink-0" aria-hidden="true" />
              <p className="text-xs text-text-secondary">{check}</p>
            </div>
          ))}
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          {[...errors, ...warnings, ...infos].map((issue, i) => (
            <IssueCard key={i} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
