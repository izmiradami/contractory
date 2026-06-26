'use client'

import { useState, useEffect, useRef } from 'react'
import { createPublicClient, http }     from 'viem'
import { arcTestnet }                   from '@/lib/wagmi/config'
import { arcUsdc }                      from '@/packages/blockchain/providers/arc'

interface GasEstimate {
  gasLimit:      bigint | null
  gasPriceWei:   bigint | null
  costUsdc:      string         // "$0.012 USDC"
  costUsdcRaw:   bigint | null  // 6-decimal ERC20 units
  isLoading:     boolean
  error:         string | null
}

const client = createPublicClient({ chain: arcTestnet, transport: http() })

// Typical contract deploy: ~800k gas (varies with bytecode size)
const DEPLOY_GAS_ESTIMATE = 800_000n

export function useGasEstimator(bytecode?: string) {
  const [estimate, setEstimate] = useState<GasEstimate>({
    gasLimit:    null,
    gasPriceWei: null,
    costUsdc:    '...',
    costUsdcRaw: null,
    isLoading:   true,
    error:       null,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const gasPrice = await client.getGasPrice()

        // Use bytecode-derived estimate if available, else default
        const gasLimit = bytecode
          ? BigInt(Math.ceil(bytecode.length / 2 * 200) + 21000)
          : DEPLOY_GAS_ESTIMATE

        const costNative = gasLimit * gasPrice
        const costErc20  = arcUsdc.toErc20(costNative)
        const costUsdc   = arcUsdc.format(costErc20)

        setEstimate({
          gasLimit,
          gasPriceWei: gasPrice,
          costUsdc,
          costUsdcRaw: costErc20,
          isLoading:   false,
          error:       null,
        })
      } catch (err) {
        setEstimate((prev) => ({
          ...prev,
          isLoading: false,
          error:     'Could not fetch gas price',
          costUsdc:  '~$0.01 USDC',
        }))
      }
    }

    run()

    // Refresh every 15s
    timerRef.current = setInterval(run, 15_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [bytecode])

  return estimate
}
