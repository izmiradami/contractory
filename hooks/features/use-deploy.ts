'use client'

import { useState, useCallback }        from 'react'
import { useAccount, useWalletClient }  from 'wagmi'
import { createPublicClient, http }     from 'viem'
import { arcTestnet }                   from '@/lib/wagmi/config'
import { contractStore }                from '@/lib/store/contract-store'
import { eventBus }                     from '@/packages/event-bus'
import { createLogger }                 from '@/packages/logger'
import { arcUsdc, analyzeArcCompatibility } from '@/packages/blockchain/providers/arc'
import type { ContractType }            from '@/components/contracts/types'

const logger       = createLogger('deploy')
const publicClient = createPublicClient({ chain: arcTestnet, transport: http() })

// ---

export type DeployPhase =
  | 'idle'
  | 'compiling'
  | 'analyzing'
  | 'estimating'
  | 'deploying'
  | 'confirming'
  | 'verifying'
  | 'saving'
  | 'done'
  | 'error'

export interface DeployResult {
  address:         `0x${string}`
  txHash:          `0x${string}`
  gasUsed:         string
  verified:        boolean
  blockNumber:     bigint
  abi:             unknown[]
  compilerVersion: string
}

export interface DeployError {
  phase:   DeployPhase
  message: string
  detail?: string
}

// ---

async function compileSource(
  source: string,
  contractName: string,
): Promise<{ abi: unknown[]; bytecode: `0x${string}`; compilerVersion: string; warnings: string[] }> {
  const res = await fetch('/api/compile', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ source, contractName, optimize: true, runs: 200 }),
  })

  const data = await res.json() as {
    abi?:             unknown[]
    bytecode?:        string
    compilerVersion?: string
    warnings?:        string[]
    errors?:          string[]
  }

  if (!res.ok || (data.errors && data.errors.length > 0)) {
    const msg = data.errors?.[0] ?? 'Compilation failed'
    throw new Error(msg)
  }

  return {
    abi:             data.abi ?? [],
    bytecode:        (data.bytecode ?? '0x') as `0x${string}`,
    compilerVersion: data.compilerVersion ?? 'unknown',
    warnings:        data.warnings ?? [],
  }
}

// ---
// ArcScan uses Blockscout-compatible verification API

async function verifyOnArcScan(params: {
  address:        string
  contractName:   string
  compilerVersion: string
  source:         string
  optimized:      boolean
  runs:           number
}): Promise<boolean> {
  try {
    const ARCSCAN_API = 'https://testnet.arcscan.app/api'

    const formData = new URLSearchParams({
      module:             'contract',
      action:             'verifysourcecode',
      contractaddress:    params.address,
      sourceCode:         params.source,
      codeformat:         'solidity-single-file',
      contractname:       params.contractName,
      compilerversion:    params.compilerVersion,
      optimizationUsed:   params.optimized ? '1' : '0',
      runs:               String(params.runs),
    })

    const res = await fetch(ARCSCAN_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    formData.toString(),
    })

    if (!res.ok) return false
    const data = await res.json() as { status?: string; result?: string }
    return data.status === '1'

  } catch {
    logger.warn('ArcScan verify failed · will retry later')
    return false
  }
}

// ---

interface UseDeployOptions {
  contractName: string
  contractType: ContractType
  source:       string
}

export function useDeploy() {
  const { address }         = useAccount()
  const { data: walletClient } = useWalletClient()

  const [phase,    setPhase]   = useState<DeployPhase>('idle')
  const [result,   setResult]  = useState<DeployResult | null>(null)
  const [error,    setError]   = useState<DeployError | null>(null)
  const [gasEst,   setGasEst]  = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const deploy = useCallback(async ({
    contractName,
    contractType,
    source,
  }: UseDeployOptions) => {
    if (!address || !walletClient) {
      setError({ phase: 'idle', message: 'Wallet not connected', detail: 'Connect your wallet before deploying.' })
      return
    }

    setError(null)
    setResult(null)
    setWarnings([])

    try {
      // ---
      setPhase('compiling')
      logger.info('Compiling', { contractName })

      const { abi, bytecode, compilerVersion, warnings: compileWarnings } =
        await compileSource(source, contractName)

      setWarnings(compileWarnings)

      if (!bytecode || bytecode === '0x') {
        throw Object.assign(
          new Error('Compilation produced empty bytecode. Check for abstract contracts.'),
          { phase: 'compiling' }
        )
      }

      // ---
      setPhase('analyzing')
      logger.info('Analyzing Arc compatibility')

      const issues = analyzeArcCompatibility(source)
      const criticalErrors = issues.filter((i) => i.severity === 'error')

      if (criticalErrors.length > 0) {
        throw Object.assign(
          new Error(`${criticalErrors.length} Arc compatibility error(s) must be fixed:\n· ${criticalErrors.map(e => e.description).join('\n· ')}`),
          { phase: 'analyzing' }
        )
      }

      // ---
      setPhase('estimating')
      logger.info('Estimating gas')

      let gasLimit = 800_000n

      try {
        // Try to estimate from wallet client
        const estimated = await publicClient.estimateGas({
          account: address,
          data:    bytecode,
        })
        gasLimit = (estimated * 120n) / 100n  // +20% buffer
      } catch {
        // Fallback: estimate from bytecode size
        gasLimit = BigInt(Math.ceil(bytecode.length / 2 * 68) + 21000 + 200000)
      }

      const gasPrice  = await publicClient.getGasPrice()
      const costNative = gasLimit * gasPrice
      const costUsdc   = arcUsdc.format(arcUsdc.toErc20(costNative))
      setGasEst(costUsdc)

      // ---
      setPhase('deploying')
      logger.info('Deploying to Arc Testnet', { contractName, gasLimit: gasLimit.toString() })

      eventBus.emit('tx.pending', { hash: 'pending', chainId: 5042002 })

      const txHash = await walletClient.deployContract({
        abi,
        bytecode,
        account: address,
        gas:     gasLimit,
      })

      logger.info('TX submitted', { txHash })

      // ---
      setPhase('confirming')
      logger.info('Waiting for Arc confirmation', { txHash })

      const receipt = await publicClient.waitForTransactionReceipt({
        hash:    txHash,
        timeout: 30_000,  // 30s max · Arc is sub-second, but allow network variance
      })

      const deployedAddress = receipt.contractAddress
      if (!deployedAddress) {
        throw Object.assign(
          new Error('Transaction confirmed but no contract address in receipt.'),
          { phase: 'confirming' }
        )
      }

      eventBus.emit('tx.final', { hash: txHash, chainId: 5042002, success: true })
      logger.audit('Deployed', { contractName, address: deployedAddress, txHash, block: receipt.blockNumber.toString() })

      // ---
      setPhase('verifying')
      const verified = await verifyOnArcScan({
        address:        deployedAddress,
        contractName,
        compilerVersion,
        source,
        optimized:      true,
        runs:           200,
      })

      logger.info('Verification', { verified, address: deployedAddress })

      // ---
      setPhase('saving')
      await contractStore.save({
        address:     deployedAddress,
        chainId:     5042002,
        name:        contractName,
        type:        contractType,
        abi:         abi as any,
        sourceCode:  source,
        verified,
        isFavorite:  false,
        tags:        [contractType.toLowerCase().replace('_', '-')],
        deployedAt:  new Date(),
        deployer:    address,
        txHash,
        status:      'active',
        metadata:    { compilerVersion },
        health:      verified ? 90 : 72,
      })

      // ---
      setPhase('done')

      const deployResult: DeployResult = {
        address:         deployedAddress,
        txHash,
        gasUsed:         costUsdc,
        verified,
        blockNumber:     receipt.blockNumber,
        abi,
        compilerVersion,
      }

      setResult(deployResult)
      eventBus.emit('contract.deployed', {
        name:    contractName,
        address: deployedAddress,
        chainId: 5042002,
        type:    contractType,
      })

    } catch (err) {
      const message  = err instanceof Error ? err.message : 'Deployment failed'
      const errPhase = (err as any).phase as DeployPhase | undefined ?? phase
      const detail   = errPhase === 'deploying'
        ? 'Check that your wallet is connected to Arc Testnet and has USDC for gas.'
        : errPhase === 'compiling'
        ? 'Review compilation errors in the Problems panel.'
        : undefined

      setPhase('error')
      setError({ phase: errPhase, message, detail })
      eventBus.emit('tx.failed', { hash: '0x0', chainId: 5042002, reason: message })
      logger.error('Deploy failed', { error: message, phase: errPhase })
    }
  }, [address, walletClient, phase])

  const reset = useCallback(() => {
    setPhase('idle')
    setResult(null)
    setError(null)
    setGasEst(null)
    setWarnings([])
  }, [])

  return { phase, result, error, gasEst, warnings, deploy, reset }
}