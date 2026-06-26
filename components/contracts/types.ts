// Contractory — Contract Control Center types

export type ContractType =
  | 'ERC20' | 'ERC721' | 'ERC1155'
  | 'ARC_AGENT' | 'ARC_JOB'
  | 'DAO' | 'MULTISIG' | 'PROXY' | 'CUSTOM'

export type ContractStatus = 'active' | 'paused' | 'deprecated' | 'unverified'

export interface AbiItem {
  name?:            string
  type:             'function' | 'event' | 'error' | 'constructor' | 'receive' | 'fallback'
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable'
  inputs?:          AbiParam[]
  outputs?:         AbiParam[]
  anonymous?:       boolean
}

export interface AbiParam {
  name:         string
  type:         string
  internalType?: string
  components?:  AbiParam[]
}

export interface ContractEvent {
  id:        string
  name:      string
  txHash:    string
  blockNum:  number
  timestamp: Date
  args:      Record<string, string>
}

export interface HealthFactors {
  verified:     boolean
  compatible:   boolean   // Arc compat score ≥ 80
  security:     boolean   // No critical/high findings
  hasEvents:    boolean
  ownerSet:     boolean
  gasEfficient: boolean
}

export function computeHealthScore(f: HealthFactors): number {
  const weights: Record<keyof HealthFactors, number> = {
    verified:     25,
    compatible:   25,
    security:     20,
    hasEvents:    10,
    ownerSet:     10,
    gasEfficient: 10,
  }
  return Object.entries(f).reduce((sum, [k, v]) => {
    return sum + (v ? weights[k as keyof HealthFactors] : 0)
  }, 0)
}

// Mock contract for UI development (Phase 7)
export interface StoredContract {
  id:           string
  address:      `0x${string}`
  chainId:      number
  name:         string
  type:         ContractType
  abi?:         AbiItem[]
  sourceCode?:  string
  verified:     boolean
  isFavorite:   boolean
  tags:         string[]
  deployedAt:   Date
  deployer:     `0x${string}`
  txHash:       `0x${string}`
  status:       ContractStatus
  metadata:     Record<string, string>
  health:       number    // 0-100
}

// Demo contracts for UI
export const DEMO_CONTRACTS: StoredContract[] = [
  {
    id:         '1',
    address:    '0x3600000000000000000000000000000000000001' as `0x${string}`,
    chainId:    72,
    name:       'ArcToken',
    type:       'ERC20',
    verified:   true,
    isFavorite: true,
    tags:       ['token', 'mintable'],
    deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    deployer:   '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f' as `0x${string}`,
    txHash:     '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1' as `0x${string}`,
    status:     'active',
    metadata:   { symbol: 'ART', decimals: '18', totalSupply: '1000000' },
    health:     94,
  },
  {
    id:         '2',
    address:    '0x3600000000000000000000000000000000000002' as `0x${string}`,
    chainId:    72,
    name:       'ArcNFT Collection',
    type:       'ERC721',
    verified:   false,
    isFavorite: false,
    tags:       ['nft'],
    deployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    deployer:   '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f' as `0x${string}`,
    txHash:     '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
    status:     'active',
    metadata:   { symbol: 'ANFT', maxSupply: '10000' },
    health:     72,
  },
  {
    id:         '3',
    address:    '0x3600000000000000000000000000000000000003' as `0x${string}`,
    chainId:    72,
    name:       'AI Agent Registry',
    type:       'ARC_AGENT',
    verified:   true,
    isFavorite: false,
    tags:       ['erc-8004', 'agent'],
    deployedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deployer:   '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f' as `0x${string}`,
    txHash:     '0x789012abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
    status:     'active',
    metadata:   {},
    health:     88,
  },
]
