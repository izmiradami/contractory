'use client'

import { Fuel, Info } from 'lucide-react'
import { cn }         from '@/lib/utils'

interface GasPanelProps {
  costUsdc:    string
  gasLimit:    bigint | null
  gasPriceWei: bigint | null
  isLoading:   boolean
  error:       string | null
}

function GasRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={cn('text-xs font-medium tabular', accent ? 'text-usdc' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}

export function GasPanel({ costUsdc, gasLimit, gasPriceWei, isLoading, error }: GasPanelProps) {
  const gasPriceGwei = gasPriceWei ? `${Number(gasPriceWei / 10n ** 9n)} Gwei` : '...'
  const gasLimitStr  = gasLimit    ? gasLimit.toLocaleString()                   : '...'

  return (
    <div className="space-y-3">
      {/* Main estimate */}
      <div className="rounded-xl bg-usdc-subtle border border-usdc-border p-4 text-center">
        <Fuel size={16} className="text-usdc mx-auto mb-2" aria-hidden="true" />
        <p className="text-2xs text-text-tertiary mb-1">Estimated deploy cost</p>
        <p className={cn('text-2xl font-bold tabular text-usdc', isLoading && 'opacity-50')}>
          {isLoading ? '...' : costUsdc}
        </p>
        <p className="text-2xs text-text-tertiary mt-1">Arc Testnet · USDC gas</p>
      </div>

      {error && (
        <div className="rounded-lg border border-status-warning/20 bg-status-warning/8 px-3 py-2">
          <p className="text-xs text-status-warning">{error}</p>
        </div>
      )}

      {/* Details */}
      <div>
        <GasRow label="Gas limit (est.)" value={gasLimitStr} />
        <GasRow label="Gas price"        value={gasPriceGwei} />
        <GasRow label="Cost in USDC"     value={costUsdc} accent />
        <GasRow label="Max base fee"     value="1e-3 USDC/unit" />
      </div>

      {/* Arc info */}
      <div className="rounded-lg border border-border-subtle bg-background-tertiary px-3 py-2.5 flex items-start gap-2">
        <Info size={12} className="text-text-tertiary mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-text-tertiary leading-relaxed">
          Arc uses USDC as the native gas token. Target cost is ~$0.01 per transaction.
          Fees are EWMA-smoothed — no sudden spikes.
        </p>
      </div>
    </div>
  )
}
