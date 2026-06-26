import { NextRequest, NextResponse } from 'next/server'
import { createLogger }             from '@/packages/logger'

const logger = createLogger('compile-api')

// solc must be required at runtime — not imported (ESM/CJS mismatch)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const solc = require('solc') as {
  compile: (input: string) => string
  version: () => string
}

interface CompileRequest {
  source:       string
  contractName: string
  version?:     string
  optimize?:    boolean
  runs?:        number
}

interface SolcError {
  severity:       'error' | 'warning' | 'info'
  formattedMessage: string
  message:        string
  errorCode?:     string
}

interface CompileResult {
  contractName:    string
  abi:             unknown[]
  bytecode:        string
  deployedBytecode: string
  metadata:        string
  compilerVersion: string
  warnings:        string[]
  errors:          string[]
  gasEstimate:     number | null
}

// ─── POST /api/compile ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CompileRequest = await req.json()

    if (!body.source?.trim() || !body.contractName?.trim()) {
      return NextResponse.json(
        { errors: ['source and contractName are required'], warnings: [], abi: [], bytecode: '0x' },
        { status: 400 }
      )
    }

    logger.info('Compile request', { contractName: body.contractName })

    // ── Build solc input ──────────────────────────────────────
    const input = {
      language: 'Solidity',
      sources:  {
        'Contract.sol': { content: body.source },
      },
      settings: {
        outputSelection: {
          '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'metadata', 'evm.gasEstimates'] }
        },
        optimizer: {
          enabled: body.optimize ?? true,
          runs:    body.runs ?? 200,
        },
        // Arc uses Cancun/Osaka-based EVM
        evmVersion: 'cancun',
      },
    }

    // ── Compile ───────────────────────────────────────────────
    const outputRaw = solc.compile(JSON.stringify(input))
    const output    = JSON.parse(outputRaw) as {
      errors?: SolcError[]
      contracts?: Record<string, Record<string, {
        abi:             unknown[]
        metadata:        string
        evm: {
          bytecode:         { object: string; opcodes: string }
          deployedBytecode: { object: string }
          gasEstimates?:    { creation?: { totalCost?: string } }
        }
      }>>
    }

    // ── Extract errors/warnings ───────────────────────────────
    const allErrors  = output.errors ?? []
    const errors     = allErrors.filter((e) => e.severity === 'error').map((e) => e.formattedMessage)
    const warnings   = allErrors.filter((e) => e.severity === 'warning').map((e) => e.formattedMessage)

    // Add Arc-specific warnings
    if (/\bPREVRANDAO\b/.test(body.source)) {
      warnings.push('[Arc] PREVRANDAO always returns 0 on Arc. Use a VRF oracle for randomness.')
    }
    if (/\bselfdestruct\b/i.test(body.source)) {
      warnings.push('[Arc] SELFDESTRUCT to address(0)/blocklisted/destructed addresses reverts on Arc.')
    }
    if (/\b1e18\b|\b10\s*\*\*\s*18\b/.test(body.source)) {
      warnings.push('[Arc] Note: native USDC uses 18 decimals; ERC-20 USDC interface uses 6. Never mix them.')
    }

    if (errors.length > 0) {
      logger.warn('Compile errors', { errors: errors.length, contractName: body.contractName })
      return NextResponse.json({ errors, warnings, abi: [], bytecode: '0x', deployedBytecode: '0x' }, { status: 422 })
    }

    // ── Extract contract output ───────────────────────────────
    const contracts  = output.contracts?.['Contract.sol']
    if (!contracts) {
      return NextResponse.json({ errors: ['No contracts found in source'], warnings, abi: [], bytecode: '0x' }, { status: 422 })
    }

    // Use explicitly named contract or first one
    const name       = body.contractName in contracts ? body.contractName : Object.keys(contracts)[0]
    const contract   = contracts[name]

    if (!contract) {
      const available = Object.keys(contracts).join(', ')
      return NextResponse.json(
        { errors: [`Contract "${body.contractName}" not found. Available: ${available}`], warnings, abi: [], bytecode: '0x' },
        { status: 422 }
      )
    }

    const bytecode         = '0x' + contract.evm.bytecode.object
    const deployedBytecode = '0x' + contract.evm.deployedBytecode.object
    const gasCreation      = contract.evm.gasEstimates?.creation?.totalCost
    const gasEstimate      = gasCreation ? parseInt(gasCreation, 10) : null

    const result: CompileResult = {
      contractName:    name,
      abi:             contract.abi,
      bytecode,
      deployedBytecode,
      metadata:        contract.metadata ?? '',
      compilerVersion: solc.version(),
      warnings,
      errors:          [],
      gasEstimate,
    }

    logger.info('Compile success', {
      contractName: name,
      abiLength:    contract.abi.length,
      bytecodeLen:  bytecode.length,
      warnings:     warnings.length,
    })

    return NextResponse.json(result)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal compilation error'
    logger.error('Compile error', { error: message })
    return NextResponse.json({ errors: [message], warnings: [], abi: [], bytecode: '0x' }, { status: 500 })
  }
}
