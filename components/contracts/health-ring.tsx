'use client'

import { cn } from '@/lib/utils'

interface HealthRingProps {
  score:    number   // 0-100
  size?:   'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function HealthRing({ score, size = 'md', showLabel = true }: HealthRingProps) {
  const dims = { sm: 40, md: 56, lg: 80 }[size]
  const r    = dims / 2 - 4
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  const color =
    score >= 85 ? 'hsl(152, 68%, 48%)' :   // usdc green
    score >= 65 ? 'hsl(38,  90%, 56%)' :   // warning
                  'hsl(0,   80%, 58%)'      // error

  const textSize = { sm: 'text-2xs', md: 'text-xs', lg: 'text-sm' }[size]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dims, height: dims }}>
      <svg width={dims} height={dims} viewBox={`0 0 ${dims} ${dims}`} aria-hidden="true">
        <circle
          cx={dims/2} cy={dims/2} r={r}
          fill="none"
          stroke="hsl(224, 10%, 14%)"
          strokeWidth={size === 'sm' ? 3 : 4}
        />
        <circle
          cx={dims/2} cy={dims/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size === 'sm' ? 3 : 4}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute text-center">
          <p className={cn('font-bold tabular leading-none', textSize)} style={{ color }}>
            {score}
          </p>
        </div>
      )}
    </div>
  )
}
