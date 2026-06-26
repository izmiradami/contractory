'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http, parseAbiItem, type Log } from 'viem'
import { arcTestnet }                                       from '@/lib/wagmi/config'

interface ContractEvent {
  id:        string
  name:      string
  txHash:    string
  blockNum:  bigint
  timestamp: Date | null
  args:      Record<string, string>
  logIndex:  number
}

const client = createPublicClient({ chain: arcTestnet, transport: http() })

export function useContractEvents(address: `0x${string}` | undefined) {
  const [events,    setEvents]    = useState<ContractEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!address) return
    setIsLoading(true)
    setError(null)

    try {
      // Fetch Transfer and Approval events (standard ERC-20)
      const [transfers, approvals] = await Promise.all([
        client.getLogs({
          address,
          event:    parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
          fromBlock: 'earliest',
          toBlock:   'latest',
        }).catch(() => [] as Log[]),
        client.getLogs({
          address,
          event:    parseAbiItem('event Approval(address indexed owner, address indexed spender, uint256 value)'),
          fromBlock: 'earliest',
          toBlock:   'latest',
        }).catch(() => [] as Log[]),
      ])

      const allLogs = [...transfers, ...approvals]
        .sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)))
        .slice(0, 20)

      // Fetch block timestamps for recent events
      const blockNums = [...new Set(allLogs.map((l) => l.blockNumber ?? 0n))]
      const timestamps: Record<string, Date> = {}

      await Promise.all(
        blockNums.slice(0, 10).map(async (bn) => {
          try {
            const block = await client.getBlock({ blockNumber: bn })
            timestamps[bn.toString()] = new Date(Number(block.timestamp) * 1000)
          } catch { /* ignore */ }
        })
      )

      const parsed: ContractEvent[] = allLogs.map((log, i) => {
        const isTransfer = 'from' in ((log as any).args ?? {})
        return {
          id:       `${log.transactionHash}-${log.logIndex}`,
          name:     isTransfer ? 'Transfer' : 'Approval',
          txHash:   log.transactionHash ?? '0x0',
          blockNum: log.blockNumber ?? 0n,
          timestamp: timestamps[log.blockNumber?.toString() ?? ''] ?? null,
          args:     Object.fromEntries(
            Object.entries((log as any).args ?? {}).map(([k, v]: [string, unknown]) => [k, String(v)])
          ),
          logIndex: log.logIndex ?? i,
        }
      })

      setEvents(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 15_000)
    return () => clearInterval(id)
  }, [fetch])

  return { events, isLoading, error, refetch: fetch }
}
