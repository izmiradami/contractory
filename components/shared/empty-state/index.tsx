import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon:        LucideIcon
  title:       string
  description: string
  action?:     { label: string; href?: string; onClick?: () => void }
  className?:  string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 rounded-xl border border-border-subtle',
      'bg-background-secondary/50 px-8 py-16 text-center',
      className
    )}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-subtle bg-background-tertiary">
        <Icon size={24} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <div className="max-w-xs">
        <h3 className="mb-1 text-sm font-medium text-text-primary">{title}</h3>
        <p className="text-sm leading-relaxed text-text-tertiary">{description}</p>
      </div>
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
