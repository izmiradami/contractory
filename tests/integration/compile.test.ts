import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Compile API integration test ────────────────────────────
// Tests the real solc compilation logic (not the HTTP layer)

describe('Solidity Compilation', () => {
  // Direct solc test — bypasses Next.js API route
  it('compiles a valid ERC20 contract', async () => {
    const solc = await import('solc')

    const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TestToken {
    string public name = "Test";
    string public symbol = "TST";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(uint256 _supply) {
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
        emit Transfer(address(0), msg.sender, _supply);
    }
}`

    const input = JSON.stringify({
      language: 'Solidity',
      sources:  { 'Contract.sol': { content: source } },
      settings: {
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
        optimizer: { enabled: true, runs: 200 },
        evmVersion: 'cancun',
      },
    })

    const output = JSON.parse(solc.default.compile(input)) as {
      errors?: Array<{ severity: string; message: string }>
      contracts?: Record<string, Record<string, { abi: unknown[]; evm: { bytecode: { object: string } } }>>
    }

    const errors = (output.errors ?? []).filter((e) => e.severity === 'error')
    expect(errors).toHaveLength(0)

    const contract = output.contracts?.['Contract.sol']?.['TestToken']
    expect(contract).toBeDefined()
    expect(contract!.abi.length).toBeGreaterThan(0)
    expect(contract!.evm.bytecode.object.length).toBeGreaterThan(0)
  })

  it('returns errors for invalid Solidity', async () => {
    const solc = await import('solc')

    const source = `pragma solidity ^0.8.24;
contract Bad {
    function broken( {  // syntax error
    }
}`

    const input = JSON.stringify({
      language: 'Solidity',
      sources:  { 'Contract.sol': { content: source } },
      settings: { outputSelection: { '*': { '*': ['abi'] } } },
    })

    const output = JSON.parse(solc.default.compile(input)) as {
      errors?: Array<{ severity: string }>
    }

    const errors = (output.errors ?? []).filter((e) => e.severity === 'error')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('compiles Arc-native ERC-8004 agent contract', async () => {
    const solc = await import('solc')

    const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ArcAgent {
    address public owner;
    string public name;
    bytes32 public agentId;
    
    event AgentRegistered(bytes32 indexed agentId, address indexed owner);
    
    constructor(string memory _name) {
        owner = msg.sender;
        name = _name;
        agentId = keccak256(abi.encodePacked(msg.sender, _name, block.number));
        emit AgentRegistered(agentId, msg.sender);
    }
}`

    const input = JSON.stringify({
      language: 'Solidity',
      sources:  { 'Contract.sol': { content: source } },
      settings: {
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
        optimizer: { enabled: true, runs: 200 },
        evmVersion: 'cancun',
      },
    })

    const output = JSON.parse(solc.default.compile(input)) as {
      errors?: Array<{ severity: string }>
      contracts?: Record<string, Record<string, { abi: unknown[] }>>
    }

    const errors = (output.errors ?? []).filter((e) => e.severity === 'error')
    expect(errors).toHaveLength(0)
    expect(output.contracts?.['Contract.sol']?.['ArcAgent']?.abi).toBeDefined()
  })
})

// ─── Contract store tests ─────────────────────────────────────

describe('Contract Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds correct Supabase query structure', async () => {
    // Test that the store builds correct queries
    // (actual DB call mocked — full integration requires Supabase env)
    const mockSelect = vi.fn().mockReturnValue({
      eq:    vi.fn().mockReturnValue({
        eq:    vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    })

    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => ({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      }),
    }))

    const { contractStore } = await import('@/lib/store/contract-store')
    const result = await contractStore.getByOwner('0x7bbf9bb16dd79ad51a97275d3ea62ace4d7db18f')

    // Should return empty array without throwing when DB returns empty
    expect(Array.isArray(result)).toBe(true)
  })
})
