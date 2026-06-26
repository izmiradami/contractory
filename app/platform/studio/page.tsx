'use client'

import dynamic                           from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useDeploy } from '@/hooks/features/use-deploy'
import type { DeployPhase } from '@/hooks/features/use-deploy'
import { useCompatibilityAnalyzer }      from '@/hooks/features/use-compatibility-analyzer'
import { useGasEstimator }               from '@/hooks/features/use-gas-estimator'
import { CompatibilityPanel }            from '@/components/studio/compatibility-panel'
import { GasPanel }                      from '@/components/studio/gas-panel'
import { SecurityPanel }                 from '@/components/studio/security-panel'
import { TEMPLATES, DEFAULT_SOURCE }     from '@/components/studio/templates'
import { cn }                            from '@/lib/utils'
import {
  Code2, ShieldCheck, Fuel, Shield, Rocket, FileCode,
  ChevronDown, Sparkles, LayoutTemplate, CheckCircle2,
  Circle, Loader2, Bot
} from 'lucide-react'

// Monaco must load client-side only
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.Editor),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

function EditorSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-[#1e1e2e]">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────

type RightTab  = 'compatibility' | 'gas' | 'security' | 'ai'
type BottomTab = 'problems' | 'deploy' | 'abi' | 'output'





// ─── Deploy Wizard (real) ─────────────────────────────────────

function DeployWizard({ source, contractName, score }: { source: string; contractName: string; score: number }) {
  const { phase, result, error, gasEst, warnings, deploy, reset } = useDeploy()
  const { isConnected } = useAccount()

  const STEP_ORDER: DeployPhase[] = ['compiling','analyzing','estimating','deploying','confirming','verifying','saving','done']
  const stepIdx = STEP_ORDER.indexOf(phase)

  const STEP_LABELS: Partial<Record<DeployPhase, string>> = {
    compiling: 'Compile', analyzing: 'Arc Analysis', estimating: 'Gas Estimate',
    deploying: 'Deploy', confirming: 'Confirm', verifying: 'Verify', saving: 'Save', done: 'Done',
  }

  const handleDeploy = () => deploy({ contractName: contractName || 'MyContract', contractType: 'CUSTOM', source })

  if (phase === 'done' && result) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-usdc">
          <CheckCircle2 size={16} aria-hidden="true" />
          <p className="text-sm font-medium">Deployed successfully!</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-background-secondary p-3 space-y-1.5 font-mono text-xs">
          <p><span className="text-text-tertiary">Address: </span><span className="text-interactive">{result.address}</span></p>
          <p><span className="text-text-tertiary">Gas: </span><span className="text-usdc">{result.gasUsed}</span></p>
          <p><span className="text-text-tertiary">Verified: </span><span className={result.verified ? 'text-usdc' : 'text-text-tertiary'}>{result.verified ? '✓ Yes' : 'Pending'}</span></p>
        </div>
        <div className="flex gap-2">
          <a href={`https://testnet.arcscan.app/address/${result.address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-interactive hover:text-interactive-hover transition-colors">
            View on ArcScan →
          </a>
          <button onClick={reset} className="ml-auto text-xs text-text-tertiary hover:text-text-secondary transition-colors">Deploy another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-6 p-4">
      <div className="space-y-2 min-w-[130px]">
        {STEP_ORDER.slice(0, -1).map((s, i) => {
          const done = stepIdx > i; const active = phase === s
          return (
            <div key={s} className="flex items-center gap-2">
              {done ? <CheckCircle2 size={14} className="text-usdc shrink-0" aria-hidden="true" />
                : active ? <Loader2 size={14} className="animate-spin text-accent shrink-0" aria-hidden="true" />
                : <Circle size={14} className="text-text-disabled shrink-0" aria-hidden="true" />}
              <span className={cn('text-xs', done ? 'text-usdc' : active ? 'text-accent font-medium' : 'text-text-disabled')}>
                {STEP_LABELS[s] ?? s}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex-1 space-y-3">
        {gasEst && phase !== 'idle' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-tertiary">Estimated:</span>
            <span className="text-usdc font-medium">{gasEst}</span>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="rounded-lg border border-status-warning/20 bg-status-warning/8 px-3 py-2 space-y-1">
            {warnings.slice(0, 2).map((w: string, i: number) => <p key={i} className="text-2xs text-status-warning">{w}</p>)}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-status-error/20 bg-status-error/8 px-3 py-2">
            <p className="text-xs text-status-error font-medium">{error.message}</p>
            {error.detail && <p className="text-2xs text-status-error/80 mt-1">{error.detail}</p>}
            <button onClick={reset} className="text-2xs text-interactive mt-2 hover:text-interactive-hover transition-colors">Try again →</button>
          </div>
        )}
        {phase === 'idle' && (
          <>
            {score < 60 && <div className="rounded-lg border border-status-warning/20 bg-status-warning/8 px-3 py-2"><p className="text-xs text-status-warning">Score {score}/100. Fix errors first.</p></div>}
            {!isConnected && <p className="text-xs text-text-tertiary">Connect wallet to deploy</p>}
            <button onClick={handleDeploy} disabled={!isConnected || score < 60}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Rocket size={15} aria-hidden="true" />Deploy to Arc Testnet
            </button>
          </>
        )}
        {phase !== 'idle' && phase !== 'done' && phase !== 'error' && (
          <p className="text-xs text-text-tertiary animate-pulse">
            {phase === 'deploying' ? 'Waiting for wallet signature...'
              : phase === 'confirming' ? 'Waiting for Arc confirmation (<1s)...'
              : 'Processing...'}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function ContractStudioPage() {
  const [source,      setSource]      = useState(DEFAULT_SOURCE)
  const [rightTab,    setRightTab]    = useState<RightTab>('compatibility')
  const [bottomTab,   setBottomTab]   = useState<BottomTab>('problems')
  const [showTemplates, setShowTemplates] = useState(false)

  const compat  = useCompatibilityAnalyzer(source)
  const gas     = useGasEstimator()

  const handleEditorChange = useCallback((val: string | undefined) => {
    if (val !== undefined) setSource(val)
  }, [])

  const RIGHT_TABS: Array<{ id: RightTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'compatibility', label: 'Arc',      icon: ShieldCheck,
      badge: compat.issues.filter((i) => i.severity === 'error').length || undefined },
    { id: 'gas',           label: 'Gas',      icon: Fuel       },
    { id: 'security',      label: 'Security', icon: Shield     },
    { id: 'ai',            label: 'AI',       icon: Bot        },
  ]

  const BOTTOM_TABS: Array<{ id: BottomTab; label: string }> = [
    { id: 'problems', label: `Problems (${compat.issues.length})` },
    { id: 'deploy',   label: 'Deploy Wizard'                      },
    { id: 'abi',      label: 'ABI'                                },
    { id: 'output',   label: 'Output'                             },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -mx-6 -my-8 overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-border-subtle bg-background-secondary px-4 py-2.5 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">Contract Studio</span>
        </div>

        <div className="h-4 w-px bg-border-subtle mx-1" aria-hidden="true" />

        {/* Templates picker */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-tertiary px-3 py-1.5 text-xs text-text-secondary hover:border-border-default transition-colors"
          >
            <LayoutTemplate size={13} aria-hidden="true" />
            Templates
            <ChevronDown size={12} aria-hidden="true" />
          </button>
          {showTemplates && (
            <div className="absolute top-full left-0 z-30 mt-1 w-56 rounded-xl border border-border-default bg-background-elevated shadow-card-hover">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSource(t.source); setShowTemplates(false) }}
                  className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-background-tertiary first:rounded-t-xl last:rounded-b-xl transition-colors"
                >
                  <p className="text-xs font-medium text-text-primary">{t.name}</p>
                  <p className="text-2xs text-text-tertiary">{t.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compatibility badge */}
        <div className={cn(
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold',
          compat.score >= 90
            ? 'bg-usdc-subtle text-usdc'
            : compat.score >= 70
            ? 'bg-status-warning/10 text-status-warning'
            : 'bg-status-error/10 text-status-error'
        )}>
          <ShieldCheck size={11} aria-hidden="true" />
          {compat.loading ? 'Analyzing...' : `${compat.score}/100`}
        </div>

        {/* Gas badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-usdc-subtle px-2.5 py-1 text-2xs font-semibold text-usdc">
          <Fuel size={11} aria-hidden="true" />
          {gas.isLoading ? '...' : gas.costUsdc}
        </div>

        <div className="flex-1" />

        {/* AI assist shortcut */}
        <button className="flex items-center gap-1.5 rounded-md border border-accent-border bg-accent-subtle px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-subtle/80 transition-colors">
          <Sparkles size={13} aria-hidden="true" />
          AI Assist
        </button>

        {/* Deploy button */}
        <button className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors">
          <Rocket size={13} aria-hidden="true" />
          Deploy
        </button>
      </div>

      {/* ── Main 3-panel area ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: File explorer ── */}
        <div className="w-44 shrink-0 border-r border-border-subtle bg-background-secondary flex flex-col">
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled">Explorer</p>
          </div>
          <div className="flex-1 p-2 space-y-0.5">
            <div className="flex items-center gap-2 rounded-md bg-accent-subtle px-2 py-1.5">
              <FileCode size={13} className="text-accent shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium text-accent truncate">Contract.sol</span>
            </div>
            <div className="px-3 py-3 text-center">
              <p className="text-2xs text-text-disabled">No other files</p>
            </div>
          </div>
          <div className="border-t border-border-subtle p-2">
            <p className="text-2xs text-text-disabled px-2">Multi-file support coming in Phase 7</p>
          </div>
        </div>

        {/* ── CENTER: Monaco Editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language="sol"
              theme="vs-dark"
              value={source}
              onChange={handleEditorChange}
              options={{
                fontSize:              13,
                fontFamily:            "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures:         true,
                minimap:               { enabled: true, scale: 0.6 },
                lineNumbers:           'on',
                scrollBeyondLastLine:  false,
                wordWrap:              'on',
                tabSize:               4,
                smoothScrolling:       true,
                cursorBlinking:        'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding:               { top: 16, bottom: 16 },
                scrollbar:             { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
                bracketPairColorization: { enabled: true },
                formatOnPaste:         true,
                autoIndent:            'full',
                quickSuggestions:      true,
              }}
              beforeMount={(monaco) => {
                // Register Solidity language basics
                monaco.languages.register({ id: 'sol' })
                monaco.languages.setMonarchTokensProvider('sol', {
                  keywords: [
                    'pragma', 'solidity', 'contract', 'interface', 'library', 'is', 'using', 'for',
                    'function', 'modifier', 'event', 'error', 'struct', 'enum', 'mapping',
                    'address', 'bool', 'string', 'bytes', 'uint', 'int',
                    'public', 'private', 'internal', 'external', 'pure', 'view', 'payable',
                    'virtual', 'override', 'abstract', 'immutable', 'constant',
                    'memory', 'storage', 'calldata', 'returns',
                    'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'revert',
                    'emit', 'new', 'delete', 'try', 'catch',
                    'constructor', 'fallback', 'receive',
                    'import', 'from', 'as',
                    'true', 'false', 'wei', 'gwei', 'ether', 'seconds', 'minutes', 'hours', 'days', 'weeks',
                    'msg', 'block', 'tx', 'abi', 'this', 'super',
                  ],
                  tokenizer: {
                    root: [
                      [/\/\/.*$/,                     'comment'],
                      [/\/\*[\s\S]*?\*\//,            'comment'],
                      [/"(?:[^"\\]|\\.)*"/,            'string'],
                      [/'(?:[^'\\]|\\.)*'/,            'string'],
                      [/\b(0x[0-9a-fA-F]+)\b/,        'number.hex'],
                      [/\b\d+\b/,                      'number'],
                      [/[a-zA-Z_]\w*/,                 {
                        cases: {
                          '@keywords':   'keyword',
                          '@default':    'identifier',
                        }
                      }],
                      [/[{}()[\]]/,  'delimiter.bracket'],
                      [/[<>]/,       'delimiter.angle'],
                      [/[.,;]/,      'delimiter'],
                      [/[=+\-*/%&|^~!]/,   'operator'],
                    ]
                  }
                })
                // Define a dark theme matching Contractory
                monaco.editor.defineTheme('contractory-dark', {
                  base:    'vs-dark',
                  inherit: true,
                  rules: [
                    { token: 'keyword',    foreground: '818cf8' },  // indigo
                    { token: 'comment',    foreground: '4a4c65', fontStyle: 'italic' },
                    { token: 'string',     foreground: '34d399' },  // usdc green
                    { token: 'number',     foreground: 'f59e0b' },
                    { token: 'number.hex', foreground: 'f59e0b' },
                    { token: 'operator',   foreground: 'e8eaf0' },
                  ],
                  colors: {
                    'editor.background':           '#0d0e14',
                    'editor.foreground':           '#c0c2da',
                    'editorLineNumber.foreground': '#3d3f55',
                    'editorLineNumber.activeForeground': '#6b6d85',
                    'editor.selectionBackground':  '#6366f130',
                    'editor.lineHighlightBackground': '#1a1b2650',
                    'editorCursor.foreground':     '#818cf8',
                    'editorIndentGuide.background1': '#1a1b26',
                  }
                })
                monaco.editor.setTheme('contractory-dark')
              }}
            />
          </div>

          {/* ── Bottom Tabs ── */}
          <div className="border-t border-border-subtle shrink-0">
            {/* Tab bar */}
            <div className="flex items-center border-b border-border-subtle bg-background-secondary">
              {BOTTOM_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setBottomTab(id)}
                  className={cn(
                    'px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                    bottomTab === id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Tab content */}
            <div className="max-h-48 overflow-y-auto bg-background-primary">
              {bottomTab === 'problems' && (
                <div className="p-3 space-y-1.5">
                  {compat.issues.length === 0 ? (
                    <div className="flex items-center gap-2 py-2">
                      <ShieldCheck size={13} className="text-usdc" aria-hidden="true" />
                      <p className="text-xs text-text-secondary">No problems detected</p>
                    </div>
                  ) : compat.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <span className={cn(
                        'text-2xs font-medium px-1.5 py-0.5 rounded',
                        issue.severity === 'error'   && 'bg-status-error/10 text-status-error',
                        issue.severity === 'warning' && 'bg-status-warning/10 text-status-warning',
                        issue.severity === 'info'    && 'bg-interactive/10 text-interactive',
                      )}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <p className="text-xs text-text-secondary">{issue.description}</p>
                      {issue.line && <span className="ml-auto text-2xs font-mono text-text-disabled">:{issue.line}</span>}
                    </div>
                  ))}
                </div>
              )}
              {bottomTab === 'deploy' && (
                <DeployWizard source={source} contractName="MyContract" score={compat.score} />
              )}
              {bottomTab === 'abi' && (
                <div className="p-3">
                  <p className="text-xs text-text-tertiary">Compile the contract to view ABI</p>
                </div>
              )}
              {bottomTab === 'output' && (
                <div className="p-3 font-mono text-xs text-text-tertiary space-y-1">
                  <p className="text-text-disabled">[Contractory Studio] Ready.</p>
                  <p className="text-text-disabled">[Contractory Studio] Arc Testnet connected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Intelligence Panel ── */}
        <div className="w-72 shrink-0 border-l border-border-subtle bg-background-secondary flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-border-subtle">
            {RIGHT_TABS.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 py-2.5 text-2xs font-medium transition-colors relative',
                  rightTab === id
                    ? 'text-accent border-b-2 border-accent -mb-px'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                <Icon size={12} aria-hidden="true" />
                {label}
                {badge !== undefined && Number(badge) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-error text-2xs font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {rightTab === 'compatibility' && (
              <CompatibilityPanel
                issues={compat.issues}
                score={compat.score}
                loading={compat.loading}
              />
            )}
            {rightTab === 'gas' && (
              <GasPanel
                costUsdc={gas.costUsdc}
                gasLimit={gas.gasLimit}
                gasPriceWei={gas.gasPriceWei}
                isLoading={gas.isLoading}
                error={gas.error}
              />
            )}
            {rightTab === 'security' && (
              <SecurityPanel source={source} />
            )}
            {rightTab === 'ai' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-text-primary">AI Code Assistant</p>
                <div className="space-y-1.5">
                  {[
                    'Explain this contract',
                    'Find potential bugs',
                    'Optimize for gas',
                    'Generate tests',
                    'Generate docs',
                    'Check Arc compatibility',
                    'Generate README',
                  ].map((action) => (
                    <button
                      key={action}
                      className="w-full text-left rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
                <a
                  href="/platform/assistant"
                  className="block text-center text-xs text-interactive hover:text-interactive-hover transition-colors pt-1"
                >
                  Open full AI assistant →
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
