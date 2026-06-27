'use client'

import { useEffect }     from 'react'
import { useRouter }     from 'next/navigation'
import { useAccount }    from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArcGrid }       from '@/components/layout/background/arc-grid'
import { Zap, Shield, Bot } from 'lucide-react'

const FEATURES = [
  {
    icon:  Zap,
    title: 'Sub-second finality',
    desc:  'Transactions confirm in under 1 second. No waiting, no uncertainty.',
  },
  {
    icon:  Shield,
    title: 'USDC-native gas',
    desc:  'Pay fees in USDC. No volatile gas token. Always predictable costs.',
  },
  {
    icon:  Bot,
    title: 'Agentic economy',
    desc:  'Deploy and manage AI agents with ERC-8004 and ERC-8183.',
  },
]

export default function ConnectPage() {
  const { isConnected } = useAccount()
  const router          = useRouter()

  useEffect(() => {
    if (isConnected) router.replace('/platform')
  }, [isConnected, router])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background-primary">
      <ArcGrid />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-16 px-6 py-16">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Contractory" className="h-14 w-14 rounded-2xl object-cover shadow-glow-accent" />
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              Contractory
            </h1>
            <p className="mt-1.5 text-base text-text-secondary">
              The Developer Operating System for Arc
            </p>
          </div>
        </div>

        {/* Connect card */}
        <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-background-secondary p-8 shadow-card">
          <h2 className="mb-2 text-lg font-medium text-text-primary">Connect your wallet</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Connect to start deploying contracts, bridging USDC, and managing your Arc environment.
          </p>

          <div className="contractory-connect flex justify-center">
            <ConnectButton label="Connect Wallet" />
          </div>

          <p className="mt-4 text-center text-xs text-text-tertiary">
            MetaMask · Rabby · Coinbase Wallet · WalletConnect
          </p>
        </div>

        {/* Features */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border-subtle bg-background-secondary/60 p-5"
            >
              <Icon
                size={20}
                className="mb-3 text-accent"
                aria-hidden="true"
              />
              <h3 className="mb-1 text-sm font-medium text-text-primary">{title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}