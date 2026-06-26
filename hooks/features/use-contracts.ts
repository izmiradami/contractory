'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount }                        from 'wagmi'
import { contractStore }                     from '@/lib/store/contract-store'
import type { StoredContract }               from '@/components/contracts/types'

interface UseContractsResult {
  contracts:    StoredContract[]
  isLoading:    boolean
  error:        string | null
  refetch:      () => void
  toggle:       (id: string, fav: boolean) => Promise<void>
}

export function useContracts(): UseContractsResult {
  const { address, isConnected }  = useAccount()
  const [contracts, setContracts] = useState<StoredContract[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!address || !isConnected) {
      setContracts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await contractStore.getByOwner(address)
      setContracts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
      setContracts([])
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => { fetch() }, [fetch])

  const toggle = useCallback(async (id: string, fav: boolean) => {
    setContracts((prev) => prev.map((c) => c.id === id ? { ...c, isFavorite: fav } : c))
    try {
      await contractStore.toggleFavorite(id, fav)
    } catch {
      setContracts((prev) => prev.map((c) => c.id === id ? { ...c, isFavorite: !fav } : c))
    }
  }, [])

  return { contracts, isLoading, error, refetch: fetch, toggle }
}