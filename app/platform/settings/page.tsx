'use client'

import { useState }            from 'react'
import { useSettingsStore }    from '@/packages/settings-store'
import { useTheme }            from '@/components/design-system/theme-provider'
import { WalletStatus }        from '@/components/blockchain/wallet-status'
import { cn }                  from '@/lib/utils'
import {
  Palette, Code2, Wallet, Globe, Bot, Bell, Shield,
  FlaskConical, Keyboard, ChevronRight
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

type Section = 'appearance' | 'developer' | 'wallet' | 'rpc' | 'ai' |
               'notifications' | 'privacy' | 'experimental' | 'shortcuts'

interface NavSection { id: Section; label: string; icon: React.ElementType }

const SECTIONS: NavSection[] = [
  { id: 'appearance',    label: 'Appearance',          icon: Palette       },
  { id: 'wallet',        label: 'Wallet',               icon: Wallet        },
  { id: 'rpc',           label: 'RPC & Network',        icon: Globe         },
  { id: 'ai',            label: 'AI Provider',          icon: Bot           },
  { id: 'developer',     label: 'Developer',            icon: Code2         },
  { id: 'notifications', label: 'Notifications',        icon: Bell          },
  { id: 'privacy',       label: 'Privacy',              icon: Shield        },
  { id: 'experimental',  label: 'Experimental',         icon: FlaskConical  },
  { id: 'shortcuts',     label: 'Keyboard Shortcuts',   icon: Keyboard      },
]

// ─── UI primitives ────────────────────────────────────────────

function SettingRow({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border-subtle last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="mt-0.5 text-xs text-text-tertiary">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary',
        checked ? 'bg-accent' : 'bg-background-elevated border border-border-default'
      )}
    >
      <span className={cn(
        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0.5'
      )} />
    </button>
  )
}

function Select<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        'rounded-md border border-border-subtle bg-background-tertiary',
        'px-3 py-1.5 text-sm text-text-primary',
        'focus:outline-none focus:ring-2 focus:ring-accent',
        'hover:border-border-default transition-colors'
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ─── Section panels ───────────────────────────────────────────

function AppearanceSection() {
  const { theme, accent, setTheme, setAccent } = useTheme()
  return (
    <div>
      <SettingRow label="Theme" description="Choose your preferred color scheme">
        <Select
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'dark',   label: 'Dark' },
            { value: 'light',  label: 'Light' },
            { value: 'system', label: 'System' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Accent Color" description="Primary brand color for UI elements">
        <div className="flex items-center gap-2">
          {(['indigo', 'violet', 'blue', 'slate'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              aria-label={`${a} accent`}
              className={cn(
                'h-6 w-6 rounded-full transition-all',
                accent === a && 'ring-2 ring-offset-2 ring-offset-background-secondary ring-accent'
              )}
              style={{ background: {
                indigo: '#6366f1', violet: '#8b5cf6', blue: '#3b82f6', slate: '#64748b',
              }[a] }}
            />
          ))}
        </div>
      </SettingRow>
    </div>
  )
}

function WalletSection() {
  return (
    <div className="space-y-4">
      <WalletStatus />
    </div>
  )
}

function RpcSection() {
  const { settings, updateBlockchain } = useSettingsStore()
  return (
    <div>
      <SettingRow label="Custom RPC URL" description="Override the default Arc Testnet RPC endpoint">
        <input
          type="url"
          placeholder="https://rpc.testnet.arc.network"
          value={settings.blockchain.customRpcUrl ?? ''}
          onChange={(e) => updateBlockchain({ customRpcUrl: e.target.value || null })}
          className={cn(
            'w-64 rounded-md border border-border-subtle bg-background-tertiary',
            'px-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-accent hover:border-border-default'
          )}
        />
      </SettingRow>
      <SettingRow label="Block Explorer URL" description="Used for tx and address links">
        <input
          type="url"
          value={settings.blockchain.explorerUrl}
          onChange={(e) => updateBlockchain({ explorerUrl: e.target.value })}
          className={cn(
            'w-64 rounded-md border border-border-subtle bg-background-tertiary',
            'px-3 py-1.5 text-sm text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent hover:border-border-default'
          )}
        />
      </SettingRow>
      <SettingRow label="Gas Display" description="How to display gas costs">
        <Select
          value={settings.blockchain.gasDisplay}
          onChange={(v) => updateBlockchain({ gasDisplay: v })}
          options={[
            { value: 'usdc', label: 'USDC (recommended)' },
            { value: 'gwei', label: 'Gwei' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Confirm before send" description="Show confirmation dialog before transactions">
        <Toggle
          checked={settings.blockchain.confirmBeforeSend}
          onChange={(v) => updateBlockchain({ confirmBeforeSend: v })}
        />
      </SettingRow>
    </div>
  )
}

function AiSection() {
  const { settings, updateAi } = useSettingsStore()
  return (
    <div>
      <SettingRow label="AI Provider" description="Default provider for AI-powered features">
        <Select
          value={settings.ai.provider}
          onChange={(v) => updateAi({ provider: v })}
          options={[
            { value: 'claude', label: 'Claude (Anthropic)' },
            { value: 'openai', label: 'OpenAI' },
            { value: 'gemini', label: 'Gemini (Google)' },
          ]}
        />
      </SettingRow>
      <SettingRow label="AI Memory" description="Inject current platform context into every AI request">
        <Toggle checked={settings.ai.memoryEnabled} onChange={(v) => updateAi({ memoryEnabled: v })} />
      </SettingRow>
      <SettingRow label="Stream Responses" description="Show AI responses as they generate">
        <Toggle checked={settings.ai.streamResponses} onChange={(v) => updateAi({ streamResponses: v })} />
      </SettingRow>
    </div>
  )
}

function DeveloperSection() {
  const { settings, updateDeveloper } = useSettingsStore()
  return (
    <div>
      <SettingRow label="Developer Mode" description="Show additional debug information and raw data">
        <Toggle checked={settings.developer.developerMode} onChange={(v) => updateDeveloper({ developerMode: v })} />
      </SettingRow>
      <SettingRow label="Show Raw Hex" description="Display raw hex values alongside formatted values">
        <Toggle checked={settings.developer.showRawHex} onChange={(v) => updateDeveloper({ showRawHex: v })} />
      </SettingRow>
      <SettingRow label="Auto-verify on deploy" description="Automatically submit source code for verification">
        <Toggle checked={settings.developer.autoVerify} onChange={(v) => updateDeveloper({ autoVerify: v })} />
      </SettingRow>
    </div>
  )
}

function NotificationsSection() {
  const { settings, updateNotifications } = useSettingsStore()
  const { notifications: n } = settings
  return (
    <div>
      {([
        ['txConfirmed',    'Transaction confirmed',    'Notify when a transaction is finalized'],
        ['txFailed',       'Transaction failed',       'Notify when a transaction fails'],
        ['bridgeComplete', 'Bridge complete',          'Notify when a bridge operation finishes'],
        ['jobUpdates',     'AI Job updates',           'ERC-8183 job status changes'],
        ['agentEvents',    'Agent events',             'ERC-8004 agent activity'],
      ] as const).map(([key, label, desc]) => (
        <SettingRow key={key} label={label} description={desc}>
          <Toggle checked={n[key]} onChange={(v) => updateNotifications({ [key]: v })} />
        </SettingRow>
      ))}
    </div>
  )
}

function PrivacySection() {
  const { settings, updatePrivacy } = useSettingsStore()
  return (
    <div>
      <SettingRow label="Anonymous Telemetry" description="Help improve Contractory by sharing anonymous usage data">
        <Toggle checked={settings.privacy.telemetryEnabled} onChange={(v) => updatePrivacy({ telemetryEnabled: v })} />
      </SettingRow>
      <SettingRow label="Crash Reports" description="Automatically report errors to improve stability">
        <Toggle checked={settings.privacy.crashReports} onChange={(v) => updatePrivacy({ crashReports: v })} />
      </SettingRow>
    </div>
  )
}

function ExperimentalSection() {
  const { settings, updateDeveloper } = useSettingsStore()
  return (
    <div>
      <div className="mb-4 rounded-lg border border-status-warning/20 bg-status-warning/5 px-4 py-3">
        <p className="text-xs text-status-warning">
          Experimental features may be unstable or change without notice.
        </p>
      </div>
      <SettingRow label="Experimental Features" description="Enable features currently in testing">
        <Toggle
          checked={settings.developer.experimentalFeatures}
          onChange={(v) => updateDeveloper({ experimentalFeatures: v })}
        />
      </SettingRow>
    </div>
  )
}

function ShortcutsSection() {
  const shortcuts = [
    ['⌘K',       'Open command palette'],
    ['⌘,',       'Open settings'],
    ['⌘⇧D',     'Deploy contract'],
    ['⌘⇧B',     'Bridge USDC'],
    ['⌘/',       'Quick search'],
    ['ESC',      'Close / cancel'],
    ['⌘⇧A',     'Open AI Assistant'],
  ]
  return (
    <div className="space-y-1">
      {shortcuts.map(([key, label]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
          <span className="text-sm text-text-secondary">{label}</span>
          <kbd className="rounded border border-border-subtle bg-background-tertiary px-2 py-0.5 text-xs font-mono text-text-tertiary">
            {key}
          </kbd>
        </div>
      ))}
    </div>
  )
}

const SECTION_CONTENT: Record<Section, React.ComponentType> = {
  appearance:    AppearanceSection,
  wallet:        WalletSection,
  rpc:           RpcSection,
  ai:            AiSection,
  developer:     DeveloperSection,
  notifications: NotificationsSection,
  privacy:       PrivacySection,
  experimental:  ExperimentalSection,
  shortcuts:     ShortcutsSection,
}

// ─── Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('appearance')
  const SectionContent = SECTION_CONTENT[active]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your Contractory preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Nav */}
        <nav aria-label="Settings sections" className="w-52 shrink-0">
          <ul className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActive(id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    active === id
                      ? 'bg-accent-subtle text-accent font-medium'
                      : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                  )}
                >
                  <Icon size={15} className={active === id ? 'text-accent' : 'text-text-tertiary'} aria-hidden="true" />
                  {label}
                  {active === id && <ChevronRight size={13} className="ml-auto text-accent" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-border-subtle bg-background-secondary px-6 py-2">
            <SectionContent />
          </div>
        </div>
      </div>
    </div>
  )
}
