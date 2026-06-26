// Supabase contract persistence
// Replaces DEMO_CONTRACTS with real data after Phase 10

import { createClient } from '@/lib/supabase/client'
import type { StoredContract, ContractType, ContractStatus } from '@/components/contracts/types'

// ─── Database row type ────────────────────────────────────────

interface ContractRow {
  id:            string
  address:       string
  chain_id:      number
  name:          string
  type:          string
  abi:           string | null   // JSON stringified
  source_code:   string | null
  verified:      boolean
  is_favorite:   boolean
  tags:          string[]
  deployed_at:   string          // ISO
  deployer:      string
  tx_hash:       string
  status:        string
  metadata:      Record<string, string>
  health:        number
  owner_address: string
}

function rowToContract(row: ContractRow): StoredContract {
  return {
    id:          row.id,
    address:     row.address as `0x${string}`,
    chainId:     row.chain_id,
    name:        row.name,
    type:        row.type as ContractType,
    abi:         row.abi ? JSON.parse(row.abi) : undefined,
    sourceCode:  row.source_code ?? undefined,
    verified:    row.verified,
    isFavorite:  row.is_favorite,
    tags:        row.tags ?? [],
    deployedAt:  new Date(row.deployed_at),
    deployer:    row.deployer as `0x${string}`,
    txHash:      row.tx_hash as `0x${string}`,
    status:      row.status as ContractStatus,
    metadata:    row.metadata ?? {},
    health:      row.health,
  }
}

// ─── Store API ────────────────────────────────────────────────

export const contractStore = {

  /** Fetch all contracts for an owner address */
  async getByOwner(ownerAddress: string): Promise<StoredContract[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('owner_address', ownerAddress.toLowerCase())
      .eq('chain_id', 5042002)
      .order('deployed_at', { ascending: false })

    if (error || !data) return []
    return data.map(rowToContract)
  },

  /** Fetch a single contract by address */
  async getByAddress(address: string): Promise<StoredContract | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('address', address.toLowerCase())
      .single()

    if (error || !data) return null
    return rowToContract(data)
  },

  /** Save a newly deployed contract */
  async save(contract: Omit<StoredContract, 'id'>): Promise<string | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        address:       contract.address.toLowerCase(),
        chain_id:      contract.chainId,
        name:          contract.name,
        type:          contract.type,
        abi:           contract.abi ? JSON.stringify(contract.abi) : null,
        source_code:   contract.sourceCode ?? null,
        verified:      contract.verified,
        is_favorite:   contract.isFavorite,
        tags:          contract.tags,
        deployed_at:   contract.deployedAt.toISOString(),
        deployer:      contract.deployer.toLowerCase(),
        tx_hash:       contract.txHash.toLowerCase(),
        status:        contract.status,
        metadata:      contract.metadata,
        health:        contract.health,
        owner_address: contract.deployer.toLowerCase(),
      })
      .select('id')
      .single()

    if (error || !data) return null
    return data.id
  },

  /** Toggle favorite */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const supabase = createClient()
    await supabase
      .from('contracts')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
  },

  /** Update verified status */
  async markVerified(address: string): Promise<void> {
    const supabase = createClient()
    await supabase
      .from('contracts')
      .update({ verified: true, health: 96 })
      .eq('address', address.toLowerCase())
  },
}
