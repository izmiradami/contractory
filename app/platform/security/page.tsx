'use client'
import { ComingSoon } from '@/components/shared/coming-soon'
import { ShieldCheck, ScanLine, FileWarning, BadgeCheck } from 'lucide-react'

export default function SecurityPage() {
  return (
    <ComingSoon
      icon={ShieldCheck}
      eyebrow="Developer Tools"
      title="Security Center"
      heroTitle="Ship contracts with confidence"
      heroDescription="A dedicated security hub that aggregates static analysis, Arc compatibility and best-practice checks across all your contracts. Continuous monitoring and audit history will arrive in a future release."
      features={[
        { icon: ScanLine,    title: 'Static Analysis',     desc: 'Automated vulnerability scanning for common Solidity pitfalls.',     status: 'Available in Studio today' },
        { icon: FileWarning, title: 'Risk Dashboard',      desc: 'A portfolio-wide view of findings ranked by severity.',             status: 'Planned for v1.1' },
        { icon: BadgeCheck,  title: 'Audit History',       desc: 'Track every scan and verification over the life of a contract.',     status: 'Planned for v1.1' },
      ]}
      availableToday={[
        'Run the Security scanner on any contract in Contract Studio',
        'See Arc compatibility findings before every deployment',
      ]}
    />
  )
}