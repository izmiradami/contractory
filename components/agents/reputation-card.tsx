'use client'

import { HealthRing } from '@/components/contracts/health-ring'
import { cn } from '@/lib/utils'
import type { AgentReputation } from './types'

interface ReputationBar {
  label: string
  value: number
}

function RepBar({ label, value }: ReputationBar) {
  const color =
    value >= 90 ? 'bg-usdc' :
    value >= 70 ? 'bg-status-warning' :
                  'bg-status-error'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-tertiary">{label}</span>
        <span className={cn(
          'text-xs font-semibold tabular',
          value >= 90 ? 'text-usdc' : value >= 70 ? 'text-status-warning' : 'text-status-error'
        )}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-background-elevated overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

interface ReputationCardProps {
  reputation: AgentReputation
  compact?:   boolean
}

export function ReputationCard({ reputation, compact = false }: ReputationCardProps) {
  const dims: Array<{ label: string; key: keyof AgentReputation }> = [
    { label: 'Reliability',    key: 'reliability'   },
    { label: 'Security',       key: 'security'      },
    { label: 'Response Time',  key: 'responseTime'  },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <HealthRing score={reputation.overall} size="sm" />
        <div>
          <p className="text-xs font-semibold text-text-primary">
            Rep: {reputation.overall}/100
          </p>
          <p className="text-2xs text-text-tertiary">
            {reputation.jobsCompleted} jobs · {reputation.successRate}% success
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Overall */}
      <div className="flex items-center gap-4">
        <HealthRing score={reputation.overall} size="lg" />
        <div>
          <p className="text-sm font-semibold text-text-primary">Overall Reputation</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {reputation.jobsCompleted} jobs completed · {reputation.successRate}% success rate
          </p>
        </div>
      </div>
      {/* Breakdown */}
      <div className="space-y-2.5">
        {dims.map(({ label, key }) => (
          <RepBar key={key} label={label} value={reputation[key] as number} />
        ))}
      </div>
    </div>
  )
}
