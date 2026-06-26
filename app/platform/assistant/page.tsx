'use client'
import { ComingSoon } from '@/components/shared/coming-soon'
import { Sparkles, MessageSquare, Wand2, BookOpen } from 'lucide-react'

export default function AssistantPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      eyebrow="Developer Tools"
      title="AI Assistant"
      heroTitle="Your AI pair-programmer for Arc"
      heroDescription="A conversational assistant that understands your contracts, explains functions, suggests improvements and helps you write Arc-compatible Solidity. A full chat workspace is coming in a future release."
      features={[
        { icon: MessageSquare, title: 'Contract Chat',    desc: 'Ask questions about any contract and get contextual answers.',       status: 'Planned for v1.1' },
        { icon: Wand2,         title: 'Code Suggestions', desc: 'AI-assisted refactors and gas optimizations for Arc.',              status: 'Planned for v1.1' },
        { icon: BookOpen,      title: 'Explain & Document', desc: 'Generate documentation and per-function explanations.',            status: 'Available in Studio today' },
      ]}
      availableToday={[
        'Use AI Assist inside Contract Studio for explanations and reviews',
        'Get per-function explanations in the Contract Control Center',
      ]}
    />
  )
}