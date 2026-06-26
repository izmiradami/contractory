// Contractory Blockchain Provider Interface
// Every chain adapter must implement this interface.
// Arc is the primary adapter — others are stubs for future multi-chain support.

// ─── Types ────────────────────────────────────────────────────────────────

export interface NativeCurrency {
  name:           string
  symbol:         string
  decimals:       number        // Native precision (Arc: 18, ETH: 18)
  displayDecimals: number       // Display precision (Arc: 6, ETH: 18)
  displaySymbol:  string        // 'USDC' | 'ETH' | 'MATIC'
  isStablecoin:   boolean
  usdPrice?:      number        // For non-stablecoins: price in USD
}

export interface ChainCapabilities {
  deterministicFinality: boolean  // Arc: true (sub-second)
  stableFee:             boolean  // Arc: true (USDC gas)
  nativeStablecoin:      boolean  // Arc: true
  unifiedBalance:        boolean  // Arc: true (Circle Gateway)
  aiAgentRegistry:       boolean  // Arc: true (ERC-8004)
  aiJobSettlement:       boolean  // Arc: true (ERC-8183)
  optInPrivacy:          boolean  // Arc: future
  accountAbstraction:    boolean
  blobTransactions:      boolean  // Arc: false
}

export interface ChainContracts {
  usdc?:                 string
  eurc?:                 string
  usyc?:                 string
  multicall3?:           string
  permit2?:              string
  create2Factory?:       string
  cctpTokenMessenger?:   string
  cctpMessageTransmitter?: string
  gatewayWallet?:        string
  gatewayMinter?:        string
  stableFxEscrow?:       string
}

export interface GasDisplay {
  raw:            bigint
  formatted:      string      // Arc: "$0.01 USDC" | ETH: "0.001 ETH"
  currencySymbol: string
  isStable:       boolean
  usdEquivalent?: string
}

export interface CompatibilityIssue {
  severity:       'error' | 'warning' | 'info'
  pattern:        string
  description:    string
  recommendation: string
  line?:          number
}

export interface UsdcUtils {
  nativeDecimals:   number           // 18
  erc20Decimals:    number           // 6
  toErc20:          (native: bigint) => bigint
  toNative:         (erc20: bigint)  => bigint
  format:           (erc20: bigint)  => string  // "$1.23 USDC"
  parse:            (display: string) => bigint  // "1.23" → 1230000n
}

// ─── Blockchain Adapter Interface ─────────────────────────────────────────

export interface BlockchainAdapter {
  // Identity
  id:      string              // 'arc' | 'base' | 'ethereum' | 'polygon'
  name:    string
  chainId: number

  // Currency
  nativeCurrency: NativeCurrency

  // Network
  rpcUrls:     string[]
  explorerUrl: string
  faucetUrl?:  string
  testnet:     boolean
  cctpDomain?: number

  // Capabilities
  capabilities: ChainCapabilities

  // Contracts
  contracts: ChainContracts

  // Gas formatting (chain-specific)
  formatGas: (gasUsed: bigint, gasPriceWei: bigint) => GasDisplay

  // USDC utilities — only defined on Arc (and other USDC-native chains)
  usdc?: UsdcUtils

  // Arc-specific: contract compatibility analysis
  analyzeCompatibility?: (soliditySource: string) => CompatibilityIssue[]
}

// ─── Provider Registry ────────────────────────────────────────────────────

class BlockchainProviderRegistry {
  private adapters = new Map<number, BlockchainAdapter>()
  private defaultChainId: number = 72  // Arc Testnet

  register(adapter: BlockchainAdapter): void {
    this.adapters.set(adapter.chainId, adapter)
  }

  get(chainId: number): BlockchainAdapter | undefined {
    return this.adapters.get(chainId)
  }

  getDefault(): BlockchainAdapter {
    const adapter = this.adapters.get(this.defaultChainId)
    if (!adapter) throw new Error(`Default chain ${this.defaultChainId} not registered`)
    return adapter
  }

  getAll(): BlockchainAdapter[] {
    return Array.from(this.adapters.values())
  }

  setDefault(chainId: number): void {
    this.defaultChainId = chainId
  }
}

export const blockchainRegistry = new BlockchainProviderRegistry()
