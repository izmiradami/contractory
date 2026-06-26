'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { parseUnits, isAddress }  from 'viem'
import { useArcBalance }           from '@/hooks/blockchain/use-arc-balance'
import { ARC_CONTRACTS }           from '@/packages/blockchain/providers/arc'
import { withRetry, retryPresets } from '@/lib/utils/retry'
import { toast }                   from 'sonner'
import { cn }             from '@/lib/utils'
import {
  Send, ArrowLeftRight, Repeat2, Wallet, Zap,
  Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, Users, Calendar, Lock, RefreshCw,
  ChevronRight, Plus, FileText, Star,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

type HubTab = 'send' | 'bridge' | 'swap' | 'balance' | 'automations'

// ─── Send Center ──────────────────────────────────────────────

const RECENT_RECIPIENTS = [
  { address: '0x7bbf...8f', label: 'My wallet',   amount: '$50.00' },
  { address: '0x1234...ab', label: 'Alice.eth',   amount: '$120.00' },
  { address: '0xdead...ef', label: 'Treasury',    amount: '$500.00' },
]

function SendCenter() {
  const [mode,     setMode]     = useState<'single' | 'batch' | 'csv'>('single')
  const [amount,   setAmount]   = useState('')
  const [toAddress, setToAddress] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { address: myAddress } = useAccount()
  const { data: walletClient } = useWalletClient()

  const gasFee = '~$0.01 USDC'
  const net    = amount ? `${(parseFloat(amount || '0') - 0.01).toFixed(2)} USDC` : '—'

  const handleSend = useCallback(async () => {
    if (!walletClient || !myAddress || !toAddress || !amount) return
    if (!isAddress(toAddress)) { toast.error('Invalid recipient address'); return }

    setIsSending(true)
    try {
      // Arc: send USDC via ERC-20 transfer
      const amountUsdc = parseUnits(amount, 6)  // 6 decimal ERC-20

      const hash = await withRetry(
        () => walletClient.writeContract({
          address:      ARC_CONTRACTS.USDC as `0x${string}`,
          abi:          [{ name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }] }],
          functionName: 'transfer',
          args:         [toAddress as `0x${string}`, amountUsdc],
          account:      myAddress,
        }),
        retryPresets.rpc
      )

      toast.success(`Sent! TX: ${hash.slice(0, 10)}...`)
      setAmount('')
      setToAddress('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Send failed'
      if (msg.includes('rejected') || msg.includes('denied')) {
        toast.error('Transaction rejected by wallet')
      } else {
        toast.error(`Send failed: ${msg.slice(0, 60)}`)
      }
    } finally {
      setIsSending(false)
    }
  }, [walletClient, myAddress, toAddress, amount])

  return (
    <div className="grid grid-cols-[1fr_300px] gap-6">
      {/* Left: Form */}
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-1 bg-background-tertiary rounded-lg p-1 w-fit">
          {([
            { id: 'single' as const, label: 'Single Transfer' },
            { id: 'batch'  as const, label: 'Batch'           },
            { id: 'csv'    as const, label: 'CSV Import'      },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                mode === id
                  ? 'bg-background-secondary text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'single' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Recipient
              </label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x address or ENS"
                className="w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Amount (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-lg font-semibold text-usdc placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-tertiary">
                  USDC
                </span>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="rounded-lg border border-border-subtle bg-background-tertiary p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary">Amount</span>
                <span className="text-text-primary tabular">{amount || '0.00'} USDC</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary">Arc gas fee</span>
                <span className="text-usdc tabular">{gasFee}</span>
              </div>
              <div className="h-px bg-border-subtle" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-secondary">Net received</span>
                <span className="text-usdc tabular">{net}</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!amount || !toAddress || isSending || !walletClient}
              className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send USDC'}
            </button>
          </div>
        )}

        {mode === 'batch' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border-subtle bg-background-secondary">
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
                <p className="text-xs font-medium text-text-primary">Recipients</p>
                <button className="flex items-center gap-1 text-xs text-interactive hover:text-interactive-hover transition-colors">
                  <Plus size={12} aria-hidden="true" />
                  Add row
                </button>
              </div>
              <div className="p-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-[1fr_120px] gap-2">
                    <input type="text" placeholder="0x address" className="rounded-md border border-border-subtle bg-background-tertiary px-2.5 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-accent" />
                    <input type="number" placeholder="Amount" className="rounded-md border border-border-subtle bg-background-tertiary px-2.5 py-1.5 text-xs text-usdc placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-accent" />
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
              Send Batch
            </button>
          </div>
        )}

        {mode === 'csv' && (
          <div className="rounded-xl border-2 border-dashed border-border-subtle bg-background-secondary flex flex-col items-center justify-center gap-3 py-12">
            <FileText size={28} className="text-text-disabled" aria-hidden="true" />
            <p className="text-sm font-medium text-text-primary">Drop CSV file here</p>
            <p className="text-xs text-text-tertiary">address, amount per row</p>
            <button className="rounded-lg border border-border-subtle bg-background-tertiary px-4 py-2 text-sm text-text-secondary hover:bg-background-elevated transition-colors">
              Browse file
            </button>
          </div>
        )}
      </div>

      {/* Right: Recent + Address book */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-xs font-semibold text-text-primary">Recent Recipients</p>
          </div>
          <div className="divide-y divide-border-subtle">
            {RECENT_RECIPIENTS.map(({ address, label, amount }) => (
              <button
                key={address}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-background-tertiary transition-colors"
                onClick={() => setToAddress(address)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-bold text-accent">
                  {label[0]}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-text-primary">{label}</p>
                  <p className="text-2xs text-text-tertiary font-mono">{address}</p>
                </div>
                <span className="text-2xs text-usdc tabular">{amount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bridge Center ────────────────────────────────────────────

const BRIDGE_ROUTES = [
  { name: 'Circle CCTP',    fee: '~$0.01 USDC', time: '25s',  rating: 5, recommended: true  },
  { name: 'LayerZero',      fee: '~$0.008 USDC', time: '45s', rating: 4, recommended: false },
  { name: 'Wormhole',       fee: '~$0.015 USDC', time: '20s', rating: 4, recommended: false },
]

const CHAINS = ['Arc Testnet', 'Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon']

function BridgeCenter() {
  const [from,   setFrom]   = useState('Ethereum')
  const [to,     setTo]     = useState('Arc Testnet')
  const [amount, setAmount] = useState('')
  const [route,  setRoute]  = useState(0)

  return (
    <div className="grid grid-cols-[1fr_280px] gap-6">
      {/* Form */}
      <div className="space-y-4">
        {/* Chain selector */}
        <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-2">
          <div>
            <label className="text-2xs text-text-tertiary mb-1 block">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {CHAINS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1.5 justify-center">
            <button
              onClick={() => { const t = from; setFrom(to); setTo(t) }}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-background-secondary text-text-tertiary hover:bg-background-tertiary transition-colors"
              aria-label="Swap chains"
            >
              <ArrowLeftRight size={14} aria-hidden="true" />
            </button>
          </div>
          <div>
            <label className="text-2xs text-text-tertiary mb-1 block">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {CHAINS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Amount (USDC)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-lg font-semibold text-usdc placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">USDC</span>
          </div>
        </div>

        {/* Route comparison */}
        <div>
          <p className="text-xs font-semibold text-text-secondary mb-2">Routes</p>
          <div className="space-y-2">
            {BRIDGE_ROUTES.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setRoute(i)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  route === i
                    ? 'border-accent-border bg-accent-subtle'
                    : 'border-border-subtle bg-background-secondary hover:bg-background-tertiary'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text-primary">{r.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className={j < r.rating ? 'text-status-warning text-xs' : 'text-text-disabled text-xs'}>★</span>
                    ))}
                    {r.recommended && (
                      <span className="ml-2 rounded-full bg-usdc/10 px-1.5 py-0.5 text-2xs font-semibold text-usdc">Best</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-2xs text-text-tertiary">
                  <span>Fee: <span className="text-usdc font-medium">{r.fee}</span></span>
                  <span>Time: <span className="text-text-secondary">{r.time}</span></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-border-subtle bg-background-tertiary p-3 space-y-1.5">
          {[
            ['Amount',       `${amount || '0.00'} USDC`],
            ['Bridge fee',   BRIDGE_ROUTES[route].fee, true],
            ['Est. time',    BRIDGE_ROUTES[route].time],
            ['Net received', amount ? `${(parseFloat(amount) - 0.01).toFixed(2)} USDC` : '—', true],
          ].map(([label, value, usdc]) => (
            <div key={String(label)} className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">{label}</span>
              <span className={cn('tabular', usdc ? 'text-usdc font-medium' : 'text-text-primary')}>{value}</span>
            </div>
          ))}
        </div>

        <button
          disabled={!amount}
          className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40"
        >
          Bridge USDC via {BRIDGE_ROUTES[route].name}
        </button>
      </div>

      {/* Right: Recent bridges */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-xs font-semibold text-text-primary">Recent Bridges</p>
          </div>
          <div className="divide-y divide-border-subtle">
            {[
              { from: 'ETH', to: 'Arc', amount: '$250', status: 'completed', time: '2h ago' },
              { from: 'Arc', to: 'Base', amount: '$100', status: 'completed', time: '1d ago' },
              { from: 'ETH', to: 'Arc', amount: '$500', status: 'failed',    time: '3d ago' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  b.status === 'completed' ? 'bg-usdc/10' : 'bg-status-error/10'
                )}>
                  {b.status === 'completed'
                    ? <CheckCircle2 size={12} className="text-usdc" aria-hidden="true" />
                    : <AlertCircle size={12} className="text-status-error" aria-hidden="true" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary">{b.from} → {b.to}</p>
                  <p className="text-2xs text-text-tertiary">{b.time}</p>
                </div>
                <span className="text-xs font-medium text-usdc tabular">{b.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Unified Balance ──────────────────────────────────────────

const CHAIN_BALANCES = [
  { chain: 'Arc Testnet', balance: '$0.00',     spendable: '$0.00',    color: 'bg-accent'        },
  { chain: 'Ethereum',    balance: '$8,234.12',  spendable: '$8,234.12', color: 'bg-interactive'  },
  { chain: 'Base',        balance: '$2,100.00',  spendable: '$2,000.00', color: 'bg-accent'       },
  { chain: 'Arbitrum',    balance: '$1,500.50',  spendable: '$1,500.50', color: 'bg-status-warning' },
  { chain: 'Optimism',    balance: '$524.30',    spendable: '$500.00',   color: 'bg-usdc'         },
  { chain: 'Polygon',     balance: '$100.00',    spendable: '$100.00',   color: 'bg-accent'       },
]

function UnifiedBalance() {
  const total = '$12,458.92'
  return (
    <div className="space-y-5">
      {/* Total */}
      <div className="rounded-xl border border-usdc-border bg-usdc-subtle p-6 text-center">
        <p className="text-xs font-medium text-text-tertiary mb-2">Total USDC Balance</p>
        <p className="text-4xl font-bold tabular text-usdc">{total}</p>
        <p className="text-xs text-text-tertiary mt-2">Across {CHAIN_BALANCES.length} chains</p>
      </div>

      {/* Chain breakdown */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {CHAIN_BALANCES.map(({ chain, balance, spendable, color }) => (
          <div key={chain} className="rounded-xl border border-border-subtle bg-background-secondary p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', color)} aria-hidden="true" />
              <p className="text-xs font-semibold text-text-primary">{chain}</p>
            </div>
            <p className="text-lg font-bold tabular text-usdc">{balance}</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-text-tertiary">Spendable</span>
                <span className="text-text-secondary tabular">{spendable}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-md bg-accent-subtle border border-accent-border text-2xs font-medium text-accent py-1.5 hover:bg-accent-subtle/80 transition-colors">
                Send
              </button>
              <button className="flex-1 rounded-md border border-border-subtle bg-background-tertiary text-2xs text-text-secondary py-1.5 hover:bg-background-elevated transition-colors">
                Bridge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Swap Center ──────────────────────────────────────────────

function SwapCenter() {
  const [fromAmt, setFromAmt] = useState('')
  const [slippage] = useState('0.5')

  const toAmt = fromAmt ? (parseFloat(fromAmt) * 0.9985).toFixed(2) : ''

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="rounded-xl border border-border-subtle bg-background-secondary p-5 space-y-3">
        {/* From */}
        <div className="rounded-lg bg-background-tertiary p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-tertiary">From</span>
            <span className="text-2xs text-text-tertiary">Balance: $0.00</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={fromAmt}
              onChange={(e) => setFromAmt(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-xl font-semibold text-usdc outline-none placeholder:text-text-disabled"
            />
            <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-background-secondary px-2.5 py-1.5">
              <span className="h-4 w-4 rounded-full bg-usdc" aria-hidden="true" />
              <span className="text-sm font-medium text-text-primary">USDC</span>
            </div>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-background-secondary text-text-tertiary">
            <Repeat2 size={16} aria-hidden="true" />
          </div>
        </div>

        {/* To */}
        <div className="rounded-lg bg-background-tertiary p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-tertiary">To (est.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xl font-semibold text-text-primary tabular">
              {toAmt || '0.00'}
            </span>
            <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-background-secondary px-2.5 py-1.5">
              <span className="h-4 w-4 rounded-full bg-status-warning" aria-hidden="true" />
              <span className="text-sm font-medium text-text-primary">ETH</span>
            </div>
          </div>
        </div>

        {/* Quote details */}
        {fromAmt && (
          <div className="space-y-1.5">
            {[
              ['Price impact',      '0.02%'],
              ['Min. received',     `${toAmt} ETH`],
              ['Route',             'USDC → WETH → ETH'],
              ['Fee',               '~$0.01 USDC',  true],
              ['Slippage',          `${slippage}%`],
            ].map(([label, value, usdc]) => (
              <div key={String(label)} className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary">{label}</span>
                <span className={usdc ? 'text-usdc tabular' : 'text-text-primary tabular'}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <button
          disabled={!fromAmt}
          className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-40"
        >
          Swap
        </button>
      </div>
    </div>
  )
}

// ─── Automations ──────────────────────────────────────────────

const AUTOMATION_RECIPES = [
  { icon: Users,    label: 'Team Payroll',          desc: 'Recurring salary payments'    },
  { icon: Star,     label: 'Contributor Rewards',   desc: 'Milestone-based payouts'      },
  { icon: Lock,     label: 'Investor Vesting',       desc: 'Linear or cliff vesting'      },
  { icon: Zap,      label: 'Airdrop Distribution',  desc: 'Batch token distribution'     },
  { icon: RefreshCw,label: 'Treasury Rebalancing',  desc: 'Auto-rebalance across chains' },
  { icon: Calendar, label: 'Monthly Subscription',  desc: 'Recurring charges'            },
]

const AUTOMATION_TYPES = [
  { icon: Calendar,  label: 'Recurring Payment', desc: 'Send on a schedule'              },
  { icon: Users,     label: 'Payroll',           desc: 'Pay multiple recipients'         },
  { icon: RefreshCw, label: 'Streaming',         desc: 'Continuous token stream'         },
  { icon: Lock,      label: 'Vesting',           desc: 'Unlock over time'                },
  { icon: TrendingUp,label: 'Subscription',      desc: 'Charge recurring fees'           },
  { icon: FileText,  label: 'Escrow',            desc: 'Hold until condition met'        },
]

function Automations() {
  return (
    <div className="space-y-6">
      {/* Create new */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">Create Automation</p>
        <div className="grid grid-cols-3 gap-3">
          {AUTOMATION_TYPES.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="group rounded-xl border border-border-subtle bg-background-secondary p-4 text-left hover:border-border-default hover:bg-background-tertiary transition-colors"
            >
              <Icon size={20} className="text-text-tertiary group-hover:text-accent mb-3 transition-colors" aria-hidden="true" />
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">Payment Recipes</p>
        <div className="grid grid-cols-3 gap-3">
          {AUTOMATION_RECIPES.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-background-secondary p-4 text-left hover:border-accent-border hover:bg-accent-subtle/30 transition-colors"
            >
              <Icon size={18} className="text-accent shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{label}</p>
                <p className="text-2xs text-text-tertiary">{desc}</p>
              </div>
              <ChevronRight size={13} className="text-text-disabled ml-auto shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {/* Active automations */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">Active Automations</p>
        <div className="rounded-xl border border-border-subtle bg-background-secondary">
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Zap size={24} className="text-text-disabled" aria-hidden="true" />
            <p className="text-sm text-text-tertiary">No automations yet</p>
            <p className="text-xs text-text-disabled">Create one from templates above</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Analytics ────────────────────────────────────────

function PaymentAnalytics() {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-xs font-semibold text-text-primary">Payment Analytics</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-border-subtle">
        {[
          { label: 'Total Sent',    value: '$0.00',   usdc: true  },
          { label: 'Total Bridged', value: '$0.00',   usdc: true  },
          { label: 'Avg Fee',       value: '$0.01',   usdc: true  },
          { label: 'Success Rate',  value: '100%',    usdc: false },
        ].map(({ label, value, usdc }) => (
          <div key={label} className="p-4 text-center">
            <p className={cn('text-lg font-bold tabular', usdc ? 'text-usdc' : 'text-text-primary')}>{value}</p>
            <p className="text-2xs text-text-tertiary mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

const TABS: Array<{ id: HubTab; label: string; icon: React.ElementType }> = [
  { id: 'send',        label: 'Send',            icon: Send          },
  { id: 'bridge',      label: 'Bridge',          icon: ArrowLeftRight },
  { id: 'swap',        label: 'Swap',            icon: Repeat2       },
  { id: 'balance',     label: 'Unified Balance', icon: Wallet        },
  { id: 'automations', label: 'Automations',     icon: Zap           },
]

export default function PaymentsHubPage() {
  const [tab, setTab]         = useState<HubTab>('send')
  const { formatted, isLoading } = useArcBalance()

  return (
    <div className="animate-fade-in-up">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Payments Hub</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Programmable money on Arc — send, bridge, swap and automate USDC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-usdc-border bg-usdc-subtle px-3 py-2 text-right">
            <p className="text-2xs text-text-tertiary">Arc balance</p>
            <p className={cn('text-sm font-bold text-usdc tabular', isLoading && 'opacity-50')}>
              {isLoading ? '...' : formatted}
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            )}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-[1fr_260px] gap-6 items-start">
        <div>
          {tab === 'send'        && <SendCenter    />}
          {tab === 'bridge'      && <BridgeCenter  />}
          {tab === 'swap'        && <SwapCenter    />}
          {tab === 'balance'     && <UnifiedBalance />}
          {tab === 'automations' && <Automations   />}
        </div>

        {/* Right: AI + Analytics */}
        <div className="space-y-4">
          {/* AI Payment Assistant */}
          <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
              <Sparkles size={13} className="text-accent" aria-hidden="true" />
              <p className="text-xs font-semibold text-text-primary">AI Payment Assistant</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                'Generate payroll',
                'Optimize bridge fees',
                'Explain this transaction',
                'Compare routes',
                'Estimate costs',
                'Schedule payments',
              ].map((action) => (
                <button
                  key={action}
                  className="w-full text-left rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2 text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <PaymentAnalytics />

          {/* Payment Health */}
          <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
            <div className="border-b border-border-subtle px-4 py-3">
              <p className="text-xs font-semibold text-text-primary">Payment Health</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Success Rate', value: '100%',   good: true  },
                { label: 'Avg Fee',      value: '$0.01',  good: true  },
                { label: 'Avg Time',     value: '< 1s',   good: true  },
                { label: 'Failures',     value: '0',      good: true  },
              ].map(({ label, value, good }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">{label}</span>
                  <span className={cn('text-xs font-semibold tabular', good ? 'text-usdc' : 'text-status-error')}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
