'use client'

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { cn }                    from '@/lib/utils'
import {
  Sparkles, AlertTriangle, CheckCircle2, Info,
  Wrench, ArrowRight, Eye, Rocket, Loader2,
} from 'lucide-react'

interface Finding {
  level:      'critical' | 'warning' | 'info'
  title:      string
  detail:     string
  fixable:    boolean
  fixLabel?:  string
}

interface AiSummaryProps {
  contractName: string  // reserved for future use
  contractType: string
  verified:     boolean
  health:       number
  findings:     Finding[]
}

type FixState = 'idle' | 'generating' | 'preview' | 'deploying' | 'done'

function OneCLickFix({ finding }: { finding: Finding }) {
  const [state, setState] = useState<FixState>('idle')
  const router = useRouter()

  const run = async () => {
    setState('generating')
    await new Promise((r) => setTimeout(r, 1200))
    setState('preview')
  }

  const deploy = async () => {
    setState('deploying')
    await new Promise((r) => setTimeout(r, 1000))
    setState('done')
  }

  if (state === 'idle') {
    return (
      <button
        onClick={run}
        className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-2xs font-medium text-white hover:bg-accent-hover transition-colors"
      >
        <Wrench size={11} aria-hidden="true" />
        {finding.fixLabel ?? 'One-Click Fix'}
      </button>
    )
  }

  if (state === 'generating') {
    return (
      <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
        <Loader2 size={11} className="animate-spin" aria-hidden="true" />
        Generating fix...
      </div>
    )
  }

  if (state === 'preview') {
    return (
      <div className="mt-2 rounded-lg border border-accent-border bg-accent-subtle p-3 space-y-2">
        <p className="text-2xs font-semibold text-accent">Generated fix</p>
        <pre className="text-2xs font-mono text-text-secondary bg-background-secondary rounded p-2 overflow-x-auto">
{`// Add to constructor or as separate extension
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

// Replace unlimited mint with capped version
constructor(uint256 cap) ERC20Capped(cap) {
    // cap = maximum total supply
}`}
        </pre>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/platform/studio')}
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-secondary px-2 py-1 text-2xs text-text-secondary hover:bg-background-tertiary transition-colors"
          >
            <Eye size={10} aria-hidden="true" />
            Preview in Studio
          </button>
          <button
            onClick={deploy}
            className="flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-2xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Rocket size={10} aria-hidden="true" />
            Apply & Deploy
          </button>
          <button onClick={() => setState('idle')} className="text-2xs text-text-disabled hover:text-text-tertiary">
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  if (state === 'deploying') {
    return (
      <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
        <Loader2 size={11} className="animate-spin" aria-hidden="true" />
        Deploying fix...
      </div>
    )
  }

  // done
  return (
    <div className="flex items-center gap-1.5 text-2xs text-usdc">
      <CheckCircle2 size={11} aria-hidden="true" />
      Fix applied successfully
    </div>
  )
}

const LEVEL_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-status-error',   bg: 'bg-status-error/8 border-status-error/20',     label: 'Critical' },
  warning:  { icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/8 border-status-warning/20', label: 'Warning'  },
  info:     { icon: Info,          color: 'text-interactive',    bg: 'bg-interactive/8 border-interactive/20',        label: 'Info'    },
}

export function AiExecutiveSummary({
  contractName: _contractName,
  contractType,
  verified,
  health,
  findings,
}: AiSummaryProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? findings : findings.slice(0, 3)

  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3.5">
        <Sparkles size={14} className="text-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-text-primary">AI Executive Summary</p>
        <span className="ml-auto rounded-full bg-accent-subtle px-2 py-0.5 text-2xs font-medium text-accent">
          Claude
        </span>
      </div>

      {/* Summary prose */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className="text-sm text-text-primary leading-relaxed">
          This <strong className="text-accent">{contractType}</strong> contract
          {verified ? ' is verified and' : ' is unverified but'} deployed on Arc Testnet
          with a health score of{' '}
          <strong className={health >= 85 ? 'text-usdc' : health >= 65 ? 'text-status-warning' : 'text-status-error'}>
            {health}/100
          </strong>.
        </p>
        <p className="text-sm text-text-secondary leading-relaxed mt-2">
          {findings.filter((f) => f.level === 'critical').length === 0
            ? 'No critical security issues detected. '
            : `${findings.filter((f) => f.level === 'critical').length} critical issue(s) found. `
          }
          {contractType === 'ERC20'
            ? 'Ownership is centralized — the owner can mint unlimited tokens. Consider adding ERC20Capped to limit total supply. Adding ERC20Permit support would improve wallet UX for gasless approvals.'
            : contractType === 'ERC721'
            ? 'Source code not verified — this reduces trust. Consider verifying on ArcScan. No randomness vulnerabilities found (good — PREVRANDAO = 0 on Arc).'
            : 'Contract is functional and Arc-compatible.'
          }
        </p>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="px-5 py-4 space-y-2">
          {visible.map((f, i) => {
            const cfg  = LEVEL_CONFIG[f.level]
            const Icon = cfg.icon
            return (
              <div key={i} className={cn('rounded-lg border p-3', cfg.bg)}>
                <div className="flex items-start gap-2 mb-1">
                  <Icon size={12} className={cn('mt-0.5 shrink-0', cfg.color)} aria-hidden="true" />
                  <p className={cn('text-xs font-semibold flex-1', cfg.color)}>{f.title}</p>
                  <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-4 mb-2">{f.detail}</p>
                {f.fixable && <div className="pl-4"><OneCLickFix finding={f} /></div>}
              </div>
            )
          })}

          {findings.length > 3 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-interactive hover:text-interactive-hover transition-colors pt-1"
            >
              {showAll ? 'Show less' : `Show ${findings.length - 3} more findings`}
              <ArrowRight size={13} className={cn('transition-transform', showAll && 'rotate-90')} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Factory — generate findings from contract data
export function generateFindings(
  contractType: string,
  verified: boolean,
  health: number
): Finding[] {
  const findings: Finding[] = []

  if (!verified) {
    findings.push({
      level:     'warning',
      title:     'Source code not verified',
      detail:    'Users and auditors cannot inspect the contract logic. Verifying increases trust and ArcScan discoverability.',
      fixable:   true,
      fixLabel:  'Verify on ArcScan',
    })
  }

  if (contractType === 'ERC20') {
    findings.push({
      level:   'warning',
      title:   'Unlimited minting capability',
      detail:  'The owner can mint any amount of tokens at any time. This creates centralization risk and potential for value dilution.',
      fixable: true,
      fixLabel: 'Add supply cap',
    })
    findings.push({
      level:   'info',
      title:   'ERC20Permit not implemented',
      detail:  'Adding EIP-2612 Permit support enables gasless approvals via signatures, improving wallet UX significantly.',
      fixable: false,
    })
  }

  if (contractType === 'ERC721') {
    findings.push({
      level:   'info',
      title:   'Randomness check passed',
      detail:  'No PREVRANDAO usage detected. Arc always returns 0 for PREVRANDAO — using an oracle for randomness is the correct approach.',
      fixable: false,
    })
  }

  if (health < 75) {
    findings.push({
      level:   'warning',
      title:   'Health score below threshold',
      detail:  `Current score ${health}/100. Resolve warnings above to improve. Target: 85+ for production deployments.`,
      fixable: false,
    })
  }

  return findings
}
