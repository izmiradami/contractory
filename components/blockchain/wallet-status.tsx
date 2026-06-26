'use client'

import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { Copy, ExternalLink, LogOut, Wifi }        from 'lucide-react'
import { toast }                                    from 'sonner'
import { arcAdapter }                               from '@/packages/blockchain/providers/arc'
import { truncateAddress, explorerAddressUrl, copyToClipboard } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function WalletStatus({ compact = false }: { compact?: boolean }) {
  const { address, chain, isConnected } = useAccount()
  const { disconnect }                   = useDisconnect()
  const { data: balance }               = useBalance({
    address,
    token: arcAdapter.contracts.usdc as `0x${string}`,
  })

  if (!isConnected || !address) return null

  const handleCopy = async () => {
    const ok = await copyToClipboard(address)
    if (ok) toast.success('Address copied')
  }

  const explorerUrl = explorerAddressUrl(address)
  const displayBal  = balance
    ? `$${(Number(balance.formatted)).toFixed(2)} USDC`
    : '— USDC'

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-usdc" aria-label="Connected" />
        <span className="font-mono text-xs text-text-secondary">{truncateAddress(address)}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary p-5 space-y-4">
      {/* Address */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-tertiary mb-1">Wallet</p>
          <p className="font-mono text-sm text-text-primary">{truncateAddress(address, 6)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            aria-label="Copy address"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary',
              'hover:bg-background-tertiary hover:text-text-secondary transition-colors'
            )}
          >
            <Copy size={13} aria-hidden="true" />
          </button>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on explorer"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary',
              'hover:bg-background-tertiary hover:text-text-secondary transition-colors'
            )}
          >
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs font-medium text-text-tertiary mb-1">USDC Balance</p>
        <p className="text-xl font-semibold tabular text-usdc">{displayBal}</p>
      </div>

      {/* Chain */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi size={13} className="text-text-tertiary" aria-hidden="true" />
          <span className="text-xs text-text-secondary">{chain?.name ?? 'Arc Testnet'}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-usdc" aria-label="Connected" />
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-status-error transition-colors"
        >
          <LogOut size={12} aria-hidden="true" />
          Disconnect
        </button>
      </div>
    </div>
  )
}
