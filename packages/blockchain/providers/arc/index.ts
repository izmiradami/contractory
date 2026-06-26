// Contractory — Arc Blockchain Adapter (Primary)
// Full implementation of the BlockchainAdapter interface for Arc Testnet.
// Based on official Arc documentation: https://docs.arc.io

import type {
  BlockchainAdapter,
  CompatibilityIssue,
  GasDisplay,
  UsdcUtils,
} from '../../core/interface'

// ─── Arc Constants ────────────────────────────────────────────────────────

export const ARC_CHAIN_ID = 5042002  // Arc Testnet chain ID

export const ARC_CONTRACTS = {
  // Native USDC — ERC-20 interface for the native gas token
  USDC:                   '0x3600000000000000000000000000000000000000',
  // EURC — euro-denominated stablecoin
  EURC:                   '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  // CCTP v2 (domain 26)
  CCTP_TOKEN_MESSENGER:   '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  CCTP_MSG_TRANSMITTER:   '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  CCTP_TOKEN_MINTER:      '0xb43db544E2c27092c107639Ad201b3dEfAbcF192',
  // Gateway
  GATEWAY_WALLET:         '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
  GATEWAY_MINTER:         '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
  // StableFX
  STABLEFX_ESCROW:        '0x867650F5eAe8df91445971f14d89fd84F0C9a9f8',
  // Standard Ethereum contracts (also on Arc)
  MULTICALL3:             '0xcA11bde05977b3631167028862bE2a173976CA11',
  PERMIT2:                '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  CREATE2_FACTORY:        '0x4e59b44847b379578588920cA78FbF26c0B4956C',
} as const

export const ARC_CCTP_DOMAIN = 26

// Gas parameters (Arc Testnet)
export const ARC_GAS = {
  MIN_BASE_FEE_GWEI:   20n,        // 20 Gwei minimum
  MAX_BASE_FEE:        1_000n,     // 1e-3 USDC per gas unit (in micro-USDC)
  TARGET_TX_COST_USD:  0.01,       // ~$0.01 per transaction
  THROUGHPUT_GAS_SEC:  20_000_000, // 20M gas/sec
} as const

// ─── USDC Utilities ───────────────────────────────────────────────────────
// CRITICAL: Arc has two USDC representations:
//   Native:  18 decimals — used for gas accounting and msg.value
//   ERC-20:  6  decimals — used for balanceOf, transfer, display
// NEVER compare or mix them without conversion.

const NATIVE_TO_ERC20_FACTOR = 10n ** 12n  // 10^(18-6)

export const arcUsdc: UsdcUtils = {
  nativeDecimals: 18,
  erc20Decimals:  6,

  toErc20(native: bigint): bigint {
    return native / NATIVE_TO_ERC20_FACTOR
  },

  toNative(erc20: bigint): bigint {
    return erc20 * NATIVE_TO_ERC20_FACTOR
  },

  format(erc20: bigint): string {
    const dollars = Number(erc20) / 1_000_000
    return `$${dollars.toFixed(dollars < 0.01 ? 4 : 2)} USDC`
  },

  parse(display: string): bigint {
    // Accepts: "1.23", "$1.23", "1.23 USDC", "$1.23 USDC"
    const cleaned = display.replace(/[$,\s]*(USDC)?/gi, '').trim()
    const num = parseFloat(cleaned)
    if (isNaN(num)) throw new Error(`Invalid USDC amount: "${display}"`)
    return BigInt(Math.round(num * 1_000_000))
  },
}

// ─── Gas Formatting ───────────────────────────────────────────────────────

function arcFormatGas(gasUsed: bigint, gasPriceWei: bigint): GasDisplay {
  // gasUsed × gasPriceWei = cost in native USDC (18 decimals)
  const costNative = gasUsed * gasPriceWei
  const costErc20  = arcUsdc.toErc20(costNative)
  const formatted  = arcUsdc.format(costErc20)

  return {
    raw:            costNative,
    formatted,
    currencySymbol: 'USDC',
    isStable:       true,
    usdEquivalent:  formatted, // USDC is already USD
  }
}

// ─── Arc Compatibility Analyzer ───────────────────────────────────────────
// Analyzes Solidity source for Arc-specific incompatibilities.
// Flags patterns that work on Ethereum but fail or behave differently on Arc.

export function analyzeArcCompatibility(source: string): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []
  const lines = source.split('\n')

  const stripComments = (line: string): string => {
    let s = line.replace(/\/\/.*$/, '')
    s = s.replace(/\/\*.*?\*\//g, '')
    if (s.trim().startsWith('*')) return ''
    return s
  }

  const check = (
    pattern: RegExp,
    issue: Omit<CompatibilityIssue, 'line'>
  ) => {
    lines.forEach((line, i) => {
      const code = stripComments(line)
      if (code && pattern.test(code)) {
        issues.push({ ...issue, line: i + 1 })
      }
    })
  }

  // PREVRANDAO / block.difficulty → always 0 on Arc
  check(/\bPREVRANDAO\b|\bblock\.difficulty\b|\bblock\.prevrandao\b/, {
    severity: 'error',
    pattern: 'PREVRANDAO',
    description:
      'Arc always returns 0 for PREVRANDAO/block.difficulty. Using it for randomness creates a critical vulnerability.',
    recommendation:
      'Use a VRF oracle (e.g. Chainlink VRF) for randomness on Arc.',
  })

  // Mixing native balance (18dec) with ERC-20 balanceOf (6dec)
  if (/\.balance\b/.test(source) && /balanceOf\s*\(/.test(source)) {
    issues.push({
      severity: 'warning',
      pattern: 'USDC decimal mismatch risk',
      description:
        'Mixing addr.balance (18 decimal native) with USDC.balanceOf (6 decimal ERC-20) is a silent bug on Arc. Both refer to the same underlying asset but with different precision.',
      recommendation:
        'Never compare or arithmetic-combine native USDC (18dec) and ERC-20 USDC (6dec) values directly. Always convert first.',
    })
  }

  // SELFDESTRUCT patterns
  check(/\bselfdestruct\s*\(/, {
    severity: 'warning',
    pattern: 'SELFDESTRUCT',
    description:
      'SELFDESTRUCT behavior differs on Arc: (1) to self with balance reverts, (2) to blocklisted address reverts, (3) to already-destructed account reverts, (4) successful self-destruct emits an EIP-7708 Transfer log.',
    recommendation:
      'Review all SELFDESTRUCT usage. Test against Arc Testnet RPC, not local anvil.',
  })

  // Blob transactions
  check(/\bBLOBHASH\b|\bBLOBBASEFEE\b/, {
    severity: 'error',
    pattern: 'Blob transactions (EIP-4844)',
    description:
      'Blob transactions are not supported on Arc. BLOBHASH returns 0 and BLOBBASEFEE returns 1.',
    recommendation: 'Remove all blob-related logic before deploying to Arc.',
  })

  // Transfer to zero address with value
  check(/transfer\s*\(\s*address\s*\(\s*0\s*\)/, {
    severity: 'error',
    pattern: 'Transfer to zero address',
    description:
      'Native value transfers to address(0) revert on Arc. Burning via zero-address is forbidden.',
    recommendation:
      'Use a dedicated burn mechanism or the native-coin precompile instead of sending to address(0).',
  })

  // ETH-centric assumptions (payable functions expecting ETH)
  if (/msg\.value/.test(source) && !/USDC/i.test(source)) {
    issues.push({
      severity: 'info',
      pattern: 'msg.value usage',
      description:
        'This contract uses msg.value. On Arc, msg.value is USDC (not ETH). Ensure your UI and documentation reflect this. The ERC-20 USDC interface uses 6 decimals; msg.value uses 18.',
      recommendation:
        'Update UI to show USDC amounts. Document the 18-decimal precision for msg.value.',
    })
  }

  // Beacon root (EIP-4788) — returns 0 on Arc
  check(/\bparentBeaconBlockRoot\b|BEACON_ROOTS/, {
    severity: 'warning',
    pattern: 'Beacon root (EIP-4788)',
    description:
      'The EIP-4788 beacon-roots contract is not deployed on Arc. Reads return empty (0x).',
    recommendation:
      'Do not use the beacon-roots oracle on Arc. Use parent execution block hash instead.',
  })

  // Withdrawal assumptions (EIP-4895)
  check(/block\.withdrawals/, {
    severity: 'info',
    pattern: 'block.withdrawals',
    description: 'block.withdrawals is always empty on Arc.',
    recommendation: 'Remove withdrawal-dependent logic.',
  })

  return issues
}

// ─── Arc Adapter ─────────────────────────────────────────────────────────

export const arcAdapter: BlockchainAdapter = {
  id:      'arc',
  name:    'Arc Testnet',
  chainId: ARC_CHAIN_ID,

  nativeCurrency: {
    name:           'USD Coin',
    symbol:         'USDC',
    decimals:       18,  // native precision for gas
    displayDecimals: 6,  // ERC-20 precision for display
    displaySymbol:  'USDC',
    isStablecoin:   true,
    usdPrice:       1,   // USDC = $1
  },

  rpcUrls:    ['https://rpc.testnet.arc.network'],
  explorerUrl: 'https://testnet.arcscan.app',
  faucetUrl:   'https://faucet.circle.com',
  testnet:     true,
  cctpDomain:  ARC_CCTP_DOMAIN,

  capabilities: {
    deterministicFinality: true,   // Sub-second, BFT consensus
    stableFee:             true,   // EWMA-smoothed USDC gas
    nativeStablecoin:      true,   // USDC is the native asset
    unifiedBalance:        true,   // Circle Gateway
    aiAgentRegistry:       true,   // ERC-8004
    aiJobSettlement:       true,   // ERC-8183
    optInPrivacy:          false,  // Future
    accountAbstraction:    true,   // ERC-4337 supported
    blobTransactions:      false,  // EIP-4844 not supported
  },

  contracts: {
    usdc:                  ARC_CONTRACTS.USDC,
    eurc:                  ARC_CONTRACTS.EURC,
    multicall3:            ARC_CONTRACTS.MULTICALL3,
    permit2:               ARC_CONTRACTS.PERMIT2,
    create2Factory:        ARC_CONTRACTS.CREATE2_FACTORY,
    cctpTokenMessenger:    ARC_CONTRACTS.CCTP_TOKEN_MESSENGER,
    cctpMessageTransmitter: ARC_CONTRACTS.CCTP_MSG_TRANSMITTER,
    gatewayWallet:         ARC_CONTRACTS.GATEWAY_WALLET,
    gatewayMinter:         ARC_CONTRACTS.GATEWAY_MINTER,
    stableFxEscrow:        ARC_CONTRACTS.STABLEFX_ESCROW,
  },

  formatGas: arcFormatGas,
  usdc:      arcUsdc,
  analyzeCompatibility: analyzeArcCompatibility,
}
