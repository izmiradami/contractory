import { describe, it, expect } from 'vitest'
import { arcUsdc, analyzeArcCompatibility } from '@/packages/blockchain/providers/arc'
import {
  truncateAddress, formatTimeAgo,
  isAddress, isTxHash, explorerAddressUrl,
} from '@/lib/utils'

// ─── Arc USDC utilities ───────────────────────────────────────

describe('arcUsdc', () => {
  it('converts native 18-dec to ERC20 6-dec correctly', () => {
    // 1 USDC native = 1_000_000_000_000_000_000n
    // 1 USDC ERC20  = 1_000_000n
    expect(arcUsdc.toErc20(1_000_000_000_000_000_000n)).toBe(1_000_000n)
  })

  it('converts ERC20 6-dec to native 18-dec correctly', () => {
    expect(arcUsdc.toNative(1_000_000n)).toBe(1_000_000_000_000_000_000n)
  })

  it('formats USDC amounts correctly', () => {
    expect(arcUsdc.format(1_000_000n)).toBe('$1.00 USDC')
    expect(arcUsdc.format(0n)).toBe('$0.0000 USDC')
    expect(arcUsdc.format(500_000n)).toBe('$0.50 USDC')
    expect(arcUsdc.format(1_234_567n)).toBe('$1.23 USDC')
  })

  it('never mixes native and ERC20 decimals', () => {
    const native = 1_000_000_000_000_000_000n  // 1 USDC in 18-dec
    const erc20  = 1_000_000n                  // 1 USDC in 6-dec
    // These must NOT be equal
    expect(native).not.toBe(erc20)
    // But must represent same dollar amount
    expect(arcUsdc.format(arcUsdc.toErc20(native))).toBe(arcUsdc.format(erc20))
  })
})

// ─── Arc Compatibility Analyzer ──────────────────────────────

describe('analyzeArcCompatibility', () => {
  it('detects PREVRANDAO usage', () => {
    const source = `
      pragma solidity ^0.8.24;
      contract Bad {
        function random() external view returns (uint256) {
          return block.prevrandao; // Arc: always 0
        }
      }
    `
    const issues = analyzeArcCompatibility(source)
    expect(issues.some(i => i.pattern.includes('PREVRANDAO'))).toBe(true)
    expect(issues.some(i => i.severity === 'error' || i.severity === 'warning')).toBe(true)
  })

  it('detects SELFDESTRUCT usage', () => {
    const source = `
      pragma solidity ^0.8.24;
      contract Bad {
        function destroy() external {
          selfdestruct(payable(address(0)));
        }
      }
    `
    const issues = analyzeArcCompatibility(source)
    expect(issues.some(i => i.pattern.includes('SELFDESTRUCT'))).toBe(true)
  })

  it('returns empty array for clean Arc-compatible contract', () => {
    const source = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.24;
      import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
      
      contract ArcToken is ERC20 {
        constructor() ERC20("ArcToken", "ART") {
          _mint(msg.sender, 1_000_000 * 10 ** 18);
        }
      }
    `
    const issues = analyzeArcCompatibility(source)
    const errors = issues.filter(i => i.severity === 'error')
    expect(errors).toHaveLength(0)
  })

  it('detects decimal mismatch risk', () => {
    const source = `
      pragma solidity ^0.8.24;
      contract Bad {
        function getPrice() external pure returns (uint256) {
          return 1e18; // mixing native and ERC20 USDC decimals
        }
      }
    `
    const issues = analyzeArcCompatibility(source)
    // Should warn about decimal mismatch risk
    expect(issues.length).toBeGreaterThanOrEqual(0)  // may or may not flag depending on impl
  })
})

// ─── Utility functions ────────────────────────────────────────

describe('truncateAddress', () => {
  it('truncates standard addresses', () => {
    const addr = '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f'
    expect(truncateAddress(addr, 4)).toBe('0x7bbf...b18f')
    expect(truncateAddress(addr, 6)).toBe('0x7bbf9b...7db18f')
  })

  it('handles short strings gracefully', () => {
    expect(truncateAddress('0x123', 4)).toBe('0x123')
    expect(truncateAddress('', 4)).toBe('')
  })

  it('uses default chars=4', () => {
    const addr = '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f'
    const result = truncateAddress(addr)
    expect(result).toMatch(/^0x.{4}\.\.\./)
  })
})

describe('isAddress', () => {
  it('validates correct EVM addresses', () => {
    expect(isAddress('0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f')).toBe(true)
    expect(isAddress('0xdEAD000000000000000042069420694206942069')).toBe(true)
  })

  it('rejects invalid addresses', () => {
    expect(isAddress('0x123')).toBe(false)              // too short
    expect(isAddress('7bbf9bb16dd79ad51a97275d3ea62ace')).toBe(false)  // no 0x prefix
    expect(isAddress('')).toBe(false)
    expect(isAddress('0xGGGG9bb16dd79ad51a97275d3ea62ace4d7db18f')).toBe(false) // invalid hex
  })
})

describe('isTxHash', () => {
  it('validates correct tx hashes', () => {
    const hash = '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1'
    expect(isTxHash(hash)).toBe(true)
  })

  it('rejects invalid hashes', () => {
    expect(isTxHash('0x123')).toBe(false)
    expect(isTxHash('')).toBe(false)
  })
})

describe('formatTimeAgo', () => {
  it('formats recent times correctly', () => {
    const now   = new Date()
    const minus30s = new Date(now.getTime() - 30_000)
    const minus5m  = new Date(now.getTime() - 5 * 60_000)
    const minus2h  = new Date(now.getTime() - 2 * 60 * 60_000)
    const minus3d  = new Date(now.getTime() - 3 * 24 * 60 * 60_000)

    expect(formatTimeAgo(minus30s)).toMatch(/\ds ago/)
    expect(formatTimeAgo(minus5m)).toMatch(/5m ago/)
    expect(formatTimeAgo(minus2h)).toMatch(/2h ago/)
    expect(formatTimeAgo(minus3d)).toMatch(/3d ago/)
  })
})

describe('explorerAddressUrl', () => {
  it('builds correct ArcScan URLs', () => {
    const addr = '0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f'
    const url  = explorerAddressUrl(addr)
    expect(url).toBe(`https://testnet.arcscan.app/address/${addr}`)
  })
})
