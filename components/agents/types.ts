// Contractory — AI Agent Operating Center types (ERC-8004)

export type AgentStatus   = 'online' | 'busy' | 'idle' | 'offline'
export type AgentVisibility = 'private' | 'public' | 'organization' | 'published' | 'featured'

export type AgentCapability =
  | 'contract_analysis'
  | 'security_review'
  | 'deployment'
  | 'payments'
  | 'bridge'
  | 'swap'
  | 'documentation'
  | 'testing'
  | 'code_generation'
  | 'monitoring'

export type AgentPermission =
  | 'deploy'
  | 'payments'
  | 'bridge'
  | 'swap'
  | 'explorer'
  | 'read_contracts'
  | 'write_contracts'

export interface AgentReputation {
  overall:      number  // 0-100
  reliability:  number
  security:     number
  responseTime: number
  jobsCompleted: number
  successRate:  number  // 0-100
}

export interface AgentVersion {
  version:     string
  timestamp:   Date
  changes:     string
  metadataURI: string
}

export interface AgentMemory {
  recentJobs:      string[]
  recentContracts: string[]
  favoriteChains:  string[]
  knownProjects:   string[]
  context:         string
}

export interface StoredAgent {
  id:           string
  agentId:      `0x${string}`   // on-chain keccak256 id
  address:      `0x${string}`   // agent wallet
  owner:        `0x${string}`
  name:         string
  description:  string
  metadataURI:  string
  capabilities: AgentCapability[]
  permissions:  AgentPermission[]
  reputation:   AgentReputation
  status:       AgentStatus
  visibility:   AgentVisibility
  version:      string
  versions:     AgentVersion[]
  memory:       AgentMemory
  registeredAt: Date
  updatedAt:    Date
  chainId:      number
  txHash:       `0x${string}`
}

export const CAPABILITY_LABELS: Record<AgentCapability, string> = {
  contract_analysis: 'Contract Analysis',
  security_review:   'Security Review',
  deployment:        'Deployment',
  payments:          'Payments',
  bridge:            'Bridge',
  swap:              'Swap',
  documentation:     'Documentation',
  testing:           'Testing',
  code_generation:   'Code Generation',
  monitoring:        'Monitoring',
}

export const PERMISSION_LABELS: Record<AgentPermission, string> = {
  deploy:          'Deploy Contracts',
  payments:        'Send Payments',
  bridge:          'Bridge Assets',
  swap:            'Swap Tokens',
  explorer:        'Read Explorer',
  read_contracts:  'Read Contracts',
  write_contracts: 'Write Contracts',
}

// Demo agents
export const DEMO_AGENTS: StoredAgent[] = [
  {
    id:          '1',
    agentId:     '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1' as `0x${string}`,
    address:     '0x1234567890123456789012345678901234567890' as `0x${string}`,
    owner:       '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f' as `0x${string}`,
    name:        'Research Agent',
    description: 'Specialized in contract analysis, security review, and generating comprehensive documentation for Arc smart contracts.',
    metadataURI: 'ipfs://QmExampleMetadata1',
    capabilities: ['contract_analysis', 'security_review', 'documentation', 'monitoring'],
    permissions:  ['read_contracts', 'explorer'],
    reputation:   { overall: 94, reliability: 99, security: 96, responseTime: 92, jobsCompleted: 47, successRate: 98 },
    status:      'online',
    visibility:  'public',
    version:     'v1.2',
    versions:    [
      { version: 'v1.2', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), changes: 'Improved Arc compatibility analysis',    metadataURI: 'ipfs://v1.2' },
      { version: 'v1.1', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), changes: 'Added USDC decimal detection',           metadataURI: 'ipfs://v1.1' },
      { version: 'v1.0', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), changes: 'Initial registration',                  metadataURI: 'ipfs://v1.0' },
    ],
    memory: {
      recentJobs:      ['Security audit for ArcToken', 'ERC721 analysis for ArcNFT'],
      recentContracts: ['0x3600...0001', '0x3600...0002'],
      favoriteChains:  ['Arc Testnet', 'Ethereum'],
      knownProjects:   ['Contractory', 'ArcDeFi'],
      context:         'Focused on Arc-native contract patterns and ERC-8004 compliance.',
    },
    registeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt:    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    chainId:      72,
    txHash:       '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
  },
  {
    id:          '2',
    agentId:     '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
    address:     '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    owner:       '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f' as `0x${string}`,
    name:        'Deploy Agent',
    description: 'Automated deployment pipeline for Arc smart contracts. Handles compile, analyze, deploy, and verify in one flow.',
    metadataURI: 'ipfs://QmExampleMetadata2',
    capabilities: ['deployment', 'code_generation', 'testing', 'monitoring'],
    permissions:  ['deploy', 'read_contracts', 'write_contracts', 'explorer'],
    reputation:   { overall: 88, reliability: 90, security: 85, responseTime: 95, jobsCompleted: 23, successRate: 95 },
    status:      'idle',
    visibility:  'private',
    version:     'v1.0',
    versions:    [
      { version: 'v1.0', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), changes: 'Initial registration', metadataURI: 'ipfs://v1.0' },
    ],
    memory: {
      recentJobs:      ['Deploy ArcToken v2', 'Deploy ArcNFT'],
      recentContracts: ['0x3600...0001'],
      favoriteChains:  ['Arc Testnet'],
      knownProjects:   ['Contractory'],
      context:         'Optimized for Arc Testnet deployments with USDC gas estimation.',
    },
    registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt:    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    chainId:      72,
    txHash:       '0x789012abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
  },
]
