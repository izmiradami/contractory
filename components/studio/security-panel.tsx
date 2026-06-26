'use client'

import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title:    string
  detail:   string
  line?:    number
}

function scanSource(source: string): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const lines = source.split('\n')

  const check = (
    pattern: RegExp,
    finding: Omit<SecurityFinding, 'line'>
  ) => {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        findings.push({ ...finding, line: i + 1 })
      }
    })
  }

  // Reentrancy risk
  if (/\.call\{value/.test(source) && /mapping.*uint/.test(source)) {
    findings.push({
      severity: 'high',
      title:    'Potential reentrancy',
      detail:   'External call with value before state update. Consider checks-effects-interactions pattern.',
    })
  }

  // tx.origin usage
  check(/\btx\.origin\b/, {
    severity: 'high',
    title:    'tx.origin authentication',
    detail:   'Using tx.origin for authentication is vulnerable to phishing attacks. Use msg.sender instead.',
  })

  // Unchecked arithmetic (pre-0.8)
  if (/pragma solidity\s+\^?0\.[0-7]/.test(source)) {
    findings.push({
      severity: 'high',
      title:    'Outdated Solidity version',
      detail:   'Versions before 0.8.0 lack built-in overflow protection. Use SafeMath or upgrade.',
    })
  }

  // Floating pragma
  check(/pragma solidity\s+\^/, {
    severity: 'medium',
    title:    'Floating pragma',
    detail:   'Floating pragma (^) may deploy with a different compiler version than tested. Pin the version.',
  })

  // DELEGATECALL
  check(/\bdelegatecall\b/, {
    severity: 'medium',
    title:    'DELEGATECALL usage',
    detail:   'DELEGATECALL executes code in the calling contract\'s context. Storage layout must match exactly.',
  })

  // Centralization risk
  check(/onlyOwner/, {
    severity: 'low',
    title:    'Centralization risk',
    detail:   'Owner has privileged access. Consider timelock or multisig for sensitive operations.',
  })

  // Block timestamp dependence
  check(/\bblock\.timestamp\b/, {
    severity: 'low',
    title:    'Timestamp dependence',
    detail:   'block.timestamp can be slightly manipulated by validators. Avoid for critical timing logic.',
  })

  // Magic numbers
  if (/[^0-9]1e18\b|\b10\s*\*\*\s*18/.test(source)) {
    findings.push({
      severity: 'info',
      title:    'Arc: 18-decimal precision',
      detail:   'This looks like native USDC (18 dec). Remember: ERC-20 USDC interface uses 6 dec. Don\'t mix them.',
    })
  }

  return findings
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle,   color: 'text-status-error',   bg: 'bg-status-error/8 border-status-error/20',     label: 'Critical' },
  high:     { icon: AlertCircle,   color: 'text-status-error',   bg: 'bg-status-error/5 border-status-error/15',     label: 'High'     },
  medium:   { icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/8 border-status-warning/20', label: 'Medium'   },
  low:      { icon: AlertTriangle, color: 'text-text-secondary', bg: 'bg-background-tertiary border-border-subtle',  label: 'Low'      },
  info:     { icon: Info,          color: 'text-interactive',    bg: 'bg-interactive/5 border-interactive/15',       label: 'Info'     },
}

interface SecurityPanelProps {
  source: string
}

export function SecurityPanel({ source }: SecurityPanelProps) {
  const findings = scanSource(source)

  const counts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high:     findings.filter((f) => f.severity === 'high').length,
    medium:   findings.filter((f) => f.severity === 'medium').length,
    low:      findings.filter((f) => f.severity === 'low').length,
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
          <div
            key={sev}
            className={cn(
              'rounded-lg border p-2 text-center',
              counts[sev] > 0 && sev !== 'low'
                ? SEVERITY_CONFIG[sev].bg
                : 'border-border-subtle bg-background-tertiary'
            )}
          >
            <p className={cn(
              'text-base font-bold tabular',
              counts[sev] > 0 ? SEVERITY_CONFIG[sev].color : 'text-text-disabled'
            )}>
              {counts[sev]}
            </p>
            <p className="text-2xs text-text-tertiary capitalize">{sev}</p>
          </div>
        ))}
      </div>

      {/* Findings */}
      {findings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Shield size={24} className="text-usdc" aria-hidden="true" />
          <p className="text-sm font-medium text-text-primary">No issues found</p>
          <p className="text-xs text-text-tertiary">Static analysis passed</p>
        </div>
      ) : (
        <div className="space-y-2">
          {findings.map((f, i) => {
            const cfg  = SEVERITY_CONFIG[f.severity]
            const Icon = cfg.icon
            return (
              <div key={i} className={cn('rounded-lg border p-3', cfg.bg)}>
                <div className="flex items-start gap-2 mb-1">
                  <Icon size={12} className={cn('mt-0.5 shrink-0', cfg.color)} aria-hidden="true" />
                  <p className={cn('text-xs font-semibold', cfg.color)}>{f.title}</p>
                  {f.line && (
                    <span className="ml-auto text-2xs text-text-tertiary font-mono">:{f.line}</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-4">{f.detail}</p>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-2xs text-text-disabled text-center pt-1">
        Static analysis only — not a substitute for audit
      </p>
    </div>
  )
}
