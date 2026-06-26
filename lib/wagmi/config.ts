// Contractory — Wagmi + RainbowKit Configuration
// Arc chain definition for wagmi. Arc uses USDC as native currency.

import { http } from 'wagmi'
import { defineChain } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// ─── Arc Chain Definition ────────────────────────────────────────────────

export const arcTestnet = defineChain({
  id:          72,
  name:        'Arc Testnet',
  nativeCurrency: {
    name:     'USD Coin',
    symbol:   'USDC',
    decimals: 18,       // Native precision — NOT for display
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'] },
    public:  { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url:  'https://testnet.arcscan.app',
    },
  },
  testnet:   true,
  contracts: {
    multicall3: {
      address:     '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})

// ─── Wagmi Config ─────────────────────────────────────────────────────────

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

export const wagmiConfig = getDefaultConfig({
  appName:     'Contractory',
  projectId:   walletConnectProjectId,
  chains:      [arcTestnet],
  transports:  { [arcTestnet.id]: http() },
  ssr: true,
})

// ─── Supported Chains (for multi-chain future) ────────────────────────────

export const SUPPORTED_CHAINS = [arcTestnet] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
