'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Clock, Sparkles, CheckCircle2, Code2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ComingSoonFeature {
  icon: LucideIcon
  title: string
  desc: string
  status: string
}

export interface ComingSoonProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  heroTitle: string
  heroDescription: string
  features: ComingSoonFeature[]
  availableToday: string[]
  ctaLabel?: string
  ctaHref?: string
}

export function ComingSoon({
  icon: HeroIcon,
  eyebrow,
  title,
  heroTitle,
  heroDescription,
  features,
  availableToday,
  ctaLabel = 'Open Contract Studio',
  ctaHref = '/platform/studio',
}: ComingSoonProps) {
  const router = useRouter()

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <p className="text-2xs font-semibold uppercase tracking-wider text-text-disabled">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-secondary mb-6">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative px-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle">
            <HeroIcon size={30} className="text-accent" aria-hidden="true" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 mb-4">
            <Clock size={12} className="text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold text-accent">Coming Soon</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">{heroTitle}</h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary leading-relaxed">{heroDescription}</p>
        </div>
      </div>

      {/* Feature preview grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {features.map(({ icon: Icon, title: t, desc, status }) => (
          <div key={t} className="rounded-xl border border-border-subtle bg-background-secondary p-5 transition-colors hover:border-border-default">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-background-tertiary">
              <Icon size={18} className="text-text-tertiary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{t}</p>
            <p className="mt-1 text-xs text-text-tertiary leading-relaxed">{desc}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-background-tertiary px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden="true" />
              <span className="text-2xs font-medium text-text-secondary">{status}</span>
            </div>
            <button disabled className="mt-4 w-full rounded-lg border border-border-subtle bg-background-tertiary py-2 text-xs font-medium text-text-disabled cursor-not-allowed">
              Coming in v1.1
            </button>
          </div>
        ))}
      </div>

      {/* What's available today */}
      <div className="rounded-xl border border-border-subtle bg-background-secondary overflow-hidden">
        <div className="border-b border-border-subtle px-5 py-3.5 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-text-primary">What you can do today</p>
        </div>
        <div className="divide-y divide-border-subtle">
          {availableToday.map((item) => (
            <div key={item} className="flex items-center gap-3 px-5 py-3">
              <CheckCircle2 size={15} className="text-usdc shrink-0" aria-hidden="true" />
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border-subtle px-5 py-3.5">
          <button
            onClick={() => router.push(ctaHref)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Code2 size={14} aria-hidden="true" />
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}