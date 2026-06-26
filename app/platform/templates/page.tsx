'use client'
import { ComingSoon } from '@/components/shared/coming-soon'
import { LayoutTemplate, Coins, Image, Bot } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      eyebrow="Developer Tools"
      title="Templates"
      heroTitle="A curated library of Arc-ready contracts"
      heroDescription="Browse, preview and customize audited, Arc-compatible contract templates. A full template gallery with categories, search and one-click loading into Contract Studio is on the way."
      features={[
        { icon: Coins, title: 'Token Templates',  desc: 'ERC20, ERC721 and ERC1155 starters, optimized for Arc USDC gas.', status: 'Available in Studio today' },
        { icon: Image, title: 'NFT Collections',  desc: 'Ready-to-deploy NFT contracts with metadata and minting logic.',  status: 'Planned for v1.1' },
        { icon: Bot,   title: 'Agent Templates',  desc: 'ERC-8004 and ERC-8183 templates for the agentic economy.',        status: 'Available in Studio today' },
      ]}
      availableToday={[
        'Load ERC20, ERC721, ERC1155, ERC-8004 and ERC-8183 templates in Contract Studio',
        'Every template is import-free and Arc-compatible at 100/100',
      ]}
    />
  )
}