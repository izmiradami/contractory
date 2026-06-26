'use client'

import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi }                                 from 'viem'
import { arcAdapter }                               from '@/packages/blockchain/providers/arc'

export function useArcBalance() {
  const { address, isConnected } = useAccount()

  // ERC-20 interface (6 decimals) — for display
  const { data: erc20Balance, isLoading } = useReadContract({
    address:      arcAdapter.contracts.usdc as `0x${string}`,
    abi:          erc20Abi,
    functionName: 'balanceOf',
    args:         address ? [address] : undefined,
    query:        { enabled: !!address && isConnected, refetchInterval: 10_000 },
  })

  const raw = erc20Balance ?? 0n

  // Format: "$1,234.56 USDC"
  const formatted = (() => {
    const dollars = Number(raw) / 1_000_000
    return new Intl.NumberFormat('en-US', {
      style:                'currency',
      currency:             'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars) + ' USDC'
  })()

  // Short format: "$1.2K USDC"
  const compact = (() => {
    const dollars = Number(raw) / 1_000_000
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K USDC`
    return `$${dollars.toFixed(2)} USDC`
  })()

  return {
    raw,
    formatted,
    compact,
    isLoading,
    isConnected,
    address,
  }
}
