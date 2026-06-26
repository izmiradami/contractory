'use client'

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { HealthRing }            from '@/components/contracts/health-ring'
import { useContracts }          from '@/hooks/features/use-contracts'
import type { StoredContract }   from '@/components/contracts/types'
import { truncateAddress, formatTimeAgo } from '@/lib/utils'
import { cn }                    from '@/lib/utils'
import {
  FileCode, Star, Clock, Archive,
  Plus, Search, Filter, CheckCircle2, AlertCircle,
  ChevronRight, Loader2,
} from 'lucide-react'

type NavSection = 'all' | 'favorites' | 'recent' | 'archived'

const NAV: Array<{ id: NavSection; label: string; icon: React.ElementType }> = [
  { id: 'all',       label: 'My Contracts', icon: FileCode       },
  { id: 'favorites', label: 'Favorites',    icon: Star           },
  { id: 'recent',    label: 'Recent',       icon: Clock          },
  { id: 'archived',  label: 'Archived',     icon: Archive        },
]

const TYPE_COLORS: Record<string, string> = {
  ERC20:     'bg-interactive/10 text-interactive',
  ERC721:    'bg-status-warning/10 text-status-warning',
  ERC1155:   'bg-accent/10 text-accent',
  ARC_AGENT: 'bg-usdc/10 text-usdc',
  ARC_JOB:   'bg-usdc/10 text-usdc',
  CUSTOM:    'bg-background-tertiary text-text-tertiary',
}

function ContractCard({ contract, onClick }: { contract: StoredContract; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-border-subtle bg-background-secondary p-4 hover:border-border-default hover:bg-background-tertiary transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-elevated border border-border-subtle">
            <FileCode size={16} className="text-accent" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{contract.name}</p>
            <p className="text-xs font-mono text-text-tertiary">{truncateAddress(contract.address, 4)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {contract.isFavorite && <Star size={13} className="text-status-warning fill-status-warning" aria-hidden="true" />}
          <HealthRing score={contract.health} size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={cn('rounded-full px-2 py-0.5 text-2xs font-semibold', TYPE_COLORS[contract.type] ?? TYPE_COLORS.CUSTOM)}>
          {contract.type.replace('_', '-')}
        </span>
        {contract.verified
          ? <span className="flex items-center gap-1 text-2xs text-usdc"><CheckCircle2 size={10} aria-hidden="true" />Verified</span>
          : <span className="flex items-center gap-1 text-2xs text-text-tertiary"><AlertCircle size={10} aria-hidden="true" />Unverified</span>
        }
        {contract.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-2xs text-text-disabled bg-background-elevated rounded-full px-2 py-0.5">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-2xs text-text-disabled">
        <span>Deployed {formatTimeAgo(contract.deployedAt)}</span>
        <ChevronRight size={13} className="text-text-disabled group-hover:text-text-tertiary transition-colors" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function ContractsPage() {
  const router                    = useRouter()
  const { contracts, isLoading, error } = useContracts()
  const [section, setSection]     = useState<NavSection>('all')
  const [query,   setQuery]       = useState('')

  const filtered = contracts.filter((c) => {
    if (section === 'favorites' && !c.isFavorite)             return false
    if (section === 'archived'  && c.status !== 'deprecated') return false
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) &&
        !c.address.toLowerCase().includes(query.toLowerCase()))    return false
    return true
  })

  return (
    <div className="animate-fade-in-up flex gap-5 h-[calc(100vh-56px-64px)]">
      {/* Left Nav */}
      <aside className="w-52 shrink-0">
        <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">Contracts</p>
          </div>
          <nav aria-label="Contract sections">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm border-b border-border-subtle last:border-0 transition-colors',
                  section === id
                    ? 'bg-accent-subtle text-accent font-medium'
                    : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                )}
              >
                <Icon size={14} className={section === id ? 'text-accent' : 'text-text-tertiary'} aria-hidden="true" />
                {label}
                {id === 'all' && (
                  <span className="ml-auto text-2xs text-text-disabled">{contracts.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contracts..."
              aria-label="Search contracts"
              className="w-full rounded-lg border border-border-subtle bg-background-secondary pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent hover:border-border-default transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-background-secondary px-3 py-2 text-sm text-text-secondary hover:bg-background-tertiary transition-colors">
            <Filter size={14} aria-hidden="true" />Filter
          </button>
          <div className="flex-1" />
          <button
            onClick={() => router.push('/platform/studio')}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Plus size={14} aria-hidden="true" />Deploy new
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-text-tertiary" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-status-error/20 bg-status-error/5 p-6 text-center">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-border-subtle bg-background-secondary">
            <FileCode size={28} className="text-text-disabled" aria-hidden="true" />
            <p className="text-sm text-text-tertiary">No contracts found</p>
            <button
              onClick={() => router.push('/platform/studio')}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              Deploy your first contract
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 overflow-y-auto pb-4">
            {filtered.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onClick={() => router.push(`/platform/contracts/${contract.address}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
