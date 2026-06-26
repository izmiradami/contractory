'use client'

import { useState }  from 'react'
import { toast }     from 'sonner'
import { cn }        from '@/lib/utils'
import {
  ChevronDown, Play, Eye, Sparkles, Copy,
  Fuel, FileText,
} from 'lucide-react'
import type { AbiItem } from './types'

interface FunctionStudioProps {
  abi:        AbiItem[]
  address:    string
  onExplain:  (name: string) => void
}

type CodeTarget = 'viem' | 'ethers' | 'curl'

function generateCode(fn: AbiItem, address: string, target: CodeTarget): string {
  const name   = fn.name ?? 'unknown'
  const isRead = fn.stateMutability === 'view' || fn.stateMutability === 'pure'
  const inputs = fn.inputs ?? []
  const args   = inputs.map((p) => `/* ${p.name}: ${p.type} */`).join(', ')

  switch (target) {
    case 'viem':
      return isRead
        ? `const result = await publicClient.readContract({
  address: '${address}',
  abi,
  functionName: '${name}',
  args: [${args}],
})`
        : `const hash = await walletClient.writeContract({
  address: '${address}',
  abi,
  functionName: '${name}',
  args: [${args}],
})`

    case 'ethers':
      return isRead
        ? `const contract = new ethers.Contract('${address}', abi, provider)
const result = await contract.${name}(${args})`
        : `const contract = new ethers.Contract('${address}', abi, signer)
const tx = await contract.${name}(${args})
await tx.wait()`

    case 'curl':
      return isRead
        ? `curl -X POST https://rpc.testnet.arc.network \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"${address}","data":"0x..."},"latest"],"id":1}'`
        : `# Write functions require a signed transaction — use viem or ethers.js`
  }
}

function FunctionCard({
  fn, address, onExplain,
}: {
  fn:        AbiItem
  address:   string
  onExplain: (name: string) => void
}) {
  const [open,       setOpen]       = useState(false)
  const [codeTarget, setCodeTarget] = useState<CodeTarget>('viem')

  const isRead  = fn.stateMutability === 'view' || fn.stateMutability === 'pure'
  const isEvent = fn.type === 'event'
  const inputs  = fn.inputs ?? []
  const outputs = fn.outputs ?? []

  const handleCopyCode = () => {
    const code = generateCode(fn, address, codeTarget)
    navigator.clipboard.writeText(code)
    toast.success(`${codeTarget} code copied`)
  }

  const badge = isEvent ? 'event' : isRead ? 'read' : 'write'
  const badgeCls = isEvent
    ? 'bg-accent/10 text-accent'
    : isRead
    ? 'bg-interactive/10 text-interactive'
    : 'bg-status-warning/10 text-status-warning'

  return (
    <div className="rounded-lg border border-border-subtle bg-background-secondary overflow-hidden mb-1.5">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-background-tertiary transition-colors text-left"
      >
        <span className={cn('rounded-full px-2 py-0.5 text-2xs font-semibold w-10 text-center shrink-0', badgeCls)}>
          {badge}
        </span>
        <code className="flex-1 text-xs font-mono text-text-primary">
          {fn.name}({inputs.map((p) => p.type).join(', ')})
          {outputs.length > 0 && <span className="text-text-tertiary"> → {outputs.map((p) => p.type).join(', ')}</span>}
        </code>
        {!isEvent && (
          <span className="text-2xs text-usdc shrink-0">~$0.01</span>
        )}
        <ChevronDown
          size={13}
          className={cn('text-text-disabled transition-transform shrink-0', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* Expanded studio */}
      {open && (
        <div className="border-t border-border-subtle">
          {/* Inputs */}
          {inputs.length > 0 && (
            <div className="px-3 py-3 space-y-2 border-b border-border-subtle">
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled">Parameters</p>
              {inputs.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="text-xs text-interactive w-24 shrink-0">{p.type}</code>
                  <span className="text-xs text-text-secondary">{p.name}</span>
                  {!isEvent && !isRead && (
                    <input
                      type="text"
                      placeholder={p.type}
                      aria-label={`${fn.name} ${p.name}`}
                      className="ml-auto w-32 rounded border border-border-subtle bg-background-tertiary px-2 py-1 text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle flex-wrap">
            {/* Call/Execute */}
            {!isEvent && (
              <button className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                isRead
                  ? 'bg-interactive/10 text-interactive hover:bg-interactive/20'
                  : 'bg-status-warning/10 text-status-warning hover:bg-status-warning/20'
              )}>
                {isRead
                  ? <><Eye size={12} aria-hidden="true" /> Call</>
                  : <><Play size={12} aria-hidden="true" /> Execute</>
                }
              </button>
            )}

            {/* Gas estimate */}
            {!isRead && !isEvent && (
              <button className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-tertiary px-2.5 py-1.5 text-xs text-text-secondary hover:bg-background-elevated transition-colors">
                <Fuel size={12} aria-hidden="true" />
                Estimate gas
              </button>
            )}

            {/* AI Explain */}
            <button
              onClick={() => onExplain(fn.name!)}
              className="flex items-center gap-1.5 rounded-md bg-accent-subtle px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent-subtle/80 transition-colors"
            >
              <Sparkles size={12} aria-hidden="true" />
              AI Explain
            </button>

            {/* Generate script */}
            <button className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-background-tertiary px-2.5 py-1.5 text-xs text-text-secondary hover:bg-background-elevated transition-colors">
              <FileText size={12} aria-hidden="true" />
              Script
            </button>
          </div>

          {/* Code generation */}
          {!isEvent && (
            <div className="px-3 py-3">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled mr-2">Copy as</p>
                {(['viem', 'ethers', 'curl'] as CodeTarget[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCodeTarget(t)}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-2xs font-medium transition-colors',
                      codeTarget === t
                        ? 'bg-accent text-white'
                        : 'bg-background-tertiary text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={handleCopyCode}
                  className="ml-auto flex items-center gap-1 text-2xs text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <Copy size={11} aria-hidden="true" />
                  Copy
                </button>
              </div>
              <pre className="rounded-lg bg-background-primary border border-border-subtle p-2.5 text-2xs font-mono text-text-secondary overflow-x-auto scrollbar-hide whitespace-pre-wrap">
                {generateCode(fn, address, codeTarget)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FunctionStudio({ abi, address, onExplain }: FunctionStudioProps) {
  const [tab, setTab] = useState<'read' | 'write' | 'events'>('read')

  const readFns  = abi.filter((f) => f.type === 'function' && (f.stateMutability === 'view' || f.stateMutability === 'pure'))
  const writeFns = abi.filter((f) => f.type === 'function' && f.stateMutability !== 'view' && f.stateMutability !== 'pure')
  const eventFns = abi.filter((f) => f.type === 'event')

  const displayed = tab === 'read' ? readFns : tab === 'write' ? writeFns : eventFns

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-1 mb-4 bg-background-tertiary rounded-lg p-1 w-fit">
        {([
          { id: 'read'   as const, label: `Read (${readFns.length})`,   color: 'text-interactive' },
          { id: 'write'  as const, label: `Write (${writeFns.length})`,  color: 'text-status-warning' },
          { id: 'events' as const, label: `Events (${eventFns.length})`, color: 'text-accent' },
        ]).map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              tab === id ? 'bg-background-secondary text-text-primary shadow-sm' : cn('text-text-tertiary hover:text-text-secondary', color)
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Functions */}
      <div>
        {displayed.length === 0 ? (
          <p className="text-xs text-text-tertiary py-4 text-center">No {tab} functions</p>
        ) : (
          displayed.map((fn, i) => (
            <FunctionCard key={i} fn={fn} address={address} onExplain={onExplain} />
          ))
        )}
      </div>
    </div>
  )
}
