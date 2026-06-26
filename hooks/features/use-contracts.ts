'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount }                        from 'wagmi'
import { contractStore }                     from '@/lib/store/contract-store'
import { DEMO_CONTRACTS }                    from '@/components/contracts/types'
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
    // Not connected — show demo data so UI is never empty
    if (!address || !isConnected) {
      setContracts(DEMO_CONTRACTS)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await contractStore.getByOwner(address)
      // If user has no contracts yet, show demos as examples
      setContracts(data.length > 0 ? data : DEMO_CONTRACTS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
      setContracts(DEMO_CONTRACTS)  // graceful fallback
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
      // Revert optimistic update
      setContracts((prev) => prev.map((c) => c.id === id ? { ...c, isFavorite: !fav } : c))
    }
  }, [])

  return { contracts, isLoading, error, refetch: fetch, toggle }
}
