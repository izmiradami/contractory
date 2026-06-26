'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http }          from 'viem'
import { arcTestnet }                        from '@/lib/wagmi/config'

interface NetworkStatus {
  latestBlock:   bigint | null
  gasPrice:      string          // "$0.01 USDC"
  gasPriceGwei:  string          // "20 Gwei"
  finality:      string          // "< 1s"
  rpcStatus:     'healthy' | 'degraded' | 'down'
  networkStatus: 'healthy' | 'degraded' | 'down'
  lastUpdated:   Date | null
  isLoading:     boolean
}

const client = createPublicClient({
  chain:     arcTestnet,
  transport: http(),
})

// Format gas price to USDC display
function formatGasUsdc(gasPriceWei: bigint): string {
  // Estimate: 21000 gas * price = tx cost in 18-dec USDC
  const txCostNative = 21_000n * gasPriceWei
  const txCostErc20  = txCostNative / 10n ** 12n   // → 6 dec
  const dollars      = Number(txCostErc20) / 1_000_000
  return `$${dollars < 0.01 ? '<0.01' : dollars.toFixed(4)} USDC`
}

export function useArcNetwork() {
  const [status, setStatus] = useState<NetworkStatus>({
    latestBlock:   null,
    gasPrice:      '~$0.01 USDC',
    gasPriceGwei:  '20 Gwei',
    finality:      '< 1s',
    rpcStatus:     'healthy',
    networkStatus: 'healthy',
    lastUpdated:   null,
    isLoading:     true,
  })

  const fetch = useCallback(async () => {
    try {
      const [block, gasPrice] = await Promise.all([
        client.getBlockNumber(),
        client.getGasPrice(),
      ])

      setStatus({
        latestBlock:   block,
        gasPrice:      formatGasUsdc(gasPrice),
        gasPriceGwei:  `${Number(gasPrice / 10n ** 9n)} Gwei`,
        finality:      '< 1s',
        rpcStatus:     'healthy',
        networkStatus: 'healthy',
        lastUpdated:   new Date(),
        isLoading:     false,
      })
    } catch {
      setStatus((prev) => ({
        ...prev,
        rpcStatus:     'down',
        networkStatus: 'degraded',
        isLoading:     false,
        lastUpdated:   new Date(),
      }))
    }
  }, [])

  useEffect(() => {
    fetch()
    // Poll every 10 seconds
    const id = setInterval(fetch, 10_000)
    return () => clearInterval(id)
  }, [fetch])

  return status
}
