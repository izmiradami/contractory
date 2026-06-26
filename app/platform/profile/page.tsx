'use client'

import { useAccount }    from 'wagmi'
import { WalletStatus } from '@/components/blockchain/wallet-status'
import { EmptyState }   from '@/components/shared/empty-state'
import { Activity, ShieldCheck } from 'lucide-react'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-secondary p-4 text-center">
      <p className="text-2xl font-semibold text-text-primary tabular">{value}</p>
      <p className="mt-1 text-xs text-text-tertiary">{label}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <EmptyState
        icon={Activity}
        title="Connect your wallet"
        description="Connect a wallet to view your developer profile."
        action={{ label: 'Connect wallet', href: '/auth/connect' }}
      />
    )
  }

  return (
    <div className="animate-fade-in-up space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">Your developer identity on Arc</p>
      </div>

      {/* Avatar + identity */}
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle border border-accent-border">
          <span className="text-2xl font-bold text-accent" aria-hidden="true">
            {address ? address.slice(2, 4).toUpperCase() : '??'}
          </span>
        </div>
        <div>
          <p className="font-mono text-base font-medium text-text-primary">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'â€”'}
          </p>
          <p className="text-sm text-text-tertiary">Arc Testnet Developer</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Contracts"      value={0} />
        <StatBox label="Transactions"   value={0} />
        <StatBox label="Agents"         value={0} />
        <StatBox label="Jobs Created"   value={0} />
      </div>

      {/* Wallet */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-text-primary">Wallet</h2>
        <WalletStatus />
      </div>

      {/* Activity */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-text-primary">Recent Activity</h2>
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Your deployments, transactions and agent activity will appear here."
        />
      </div>
    </div>
  )
}
