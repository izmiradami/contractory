'use client'
import { ComingSoon } from '@/components/shared/coming-soon'
import { Search, Boxes, Receipt, Activity } from 'lucide-react'

export default function ExplorerPage() {
  return (
    <ComingSoon
      icon={Search}
      eyebrow="Developer Tools"
      title="Explorer"
      heroTitle="A native Arc explorer, inside Contractory"
      heroDescription="Browse blocks, transactions and contracts on Arc Testnet without leaving your workspace. Explorer will surface the data you care about as a developer — deployments, verifications and contract activity."
      features={[
        { icon: Boxes,    title: 'Block & Tx Browser', desc: 'Inspect Arc blocks and transactions with developer-friendly decoding.', status: 'Awaiting Arc indexer' },
        { icon: Receipt,  title: 'Contract Lookup',    desc: 'Search any deployed contract and view its ABI, source and events.',     status: 'Planned for v1.1' },
        { icon: Activity, title: 'Live Activity',      desc: 'Real-time feed of deployments and verifications across Arc.',           status: 'Planned for v1.1' },
      ]}
      availableToday={[
        'View your own deployed contracts in the Contracts page',
        'Open any contract on ArcScan directly from Contractory',
      ]}
    />
  )
}