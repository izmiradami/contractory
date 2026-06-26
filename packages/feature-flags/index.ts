// Contractory Feature Flags
// Driven by environment variables, overridable at runtime (dev only).
// All flags are typed — no magic strings.

// ─── Flag Definitions ────────────────────────────────────────────────────

export interface FeatureFlags {
  // Core modules
  bridge:           boolean
  swap:             boolean
  aiAssistant:      boolean
  analytics:        boolean
  agentStudio:      boolean   // ERC-8004
  jobCenter:        boolean   // ERC-8183
  explorer:         boolean
  developerToolkit: boolean

  // Advanced
  pluginMarketplace: boolean
  teamWorkspaces:    boolean
  ciCd:              boolean

  // Experimental (opt-in)
  experimental:      boolean
  betaFeatures:      boolean
}

type FlagKey = keyof FeatureFlags

// ─── Default Values (from env) ────────────────────────────────────────────

function parseBool(val: string | undefined, fallback: boolean): boolean {
  if (val === undefined) return fallback
  return val === 'true' || val === '1'
}

const defaultFlags: FeatureFlags = {
  bridge:            parseBool(process.env.NEXT_PUBLIC_FF_BRIDGE,            true),
  swap:              parseBool(process.env.NEXT_PUBLIC_FF_SWAP,              true),
  aiAssistant:       parseBool(process.env.NEXT_PUBLIC_FF_AI_ASSISTANT,      true),
  analytics:         parseBool(process.env.NEXT_PUBLIC_FF_ANALYTICS,         false),
  agentStudio:       parseBool(process.env.NEXT_PUBLIC_FF_AGENT_STUDIO,      true),
  jobCenter:         parseBool(process.env.NEXT_PUBLIC_FF_JOB_CENTER,        true),
  explorer:          parseBool(process.env.NEXT_PUBLIC_FF_EXPLORER,          true),
  developerToolkit:  parseBool(process.env.NEXT_PUBLIC_FF_DEVELOPER_TOOLKIT, true),
  pluginMarketplace: false,
  teamWorkspaces:    false,
  ciCd:              false,
  experimental:      parseBool(process.env.NEXT_PUBLIC_FF_EXPERIMENTAL,      false),
  betaFeatures:      false,
}

// ─── Feature Flag Store ───────────────────────────────────────────────────

class FeatureFlagStore {
  private flags: FeatureFlags = { ...defaultFlags }
  private overrides = new Map<FlagKey, boolean>()
  private readonly isDev = process.env.NODE_ENV === 'development'

  isEnabled(flag: FlagKey): boolean {
    // Dev overrides take priority (stored in localStorage)
    if (this.overrides.has(flag)) return this.overrides.get(flag)!
    return this.flags[flag]
  }

  /**
   * Override a flag at runtime — dev only.
   * Persisted to localStorage for the session.
   */
  override(flag: FlagKey, value: boolean): void {
    if (!this.isDev) {
      console.warn('[FeatureFlags] Runtime overrides are only available in development.')
      return
    }
    this.overrides.set(flag, value)
    try {
      const stored = JSON.parse(localStorage.getItem('contractory-ff-overrides') ?? '{}')
      localStorage.setItem('contractory-ff-overrides', JSON.stringify({ ...stored, [flag]: value }))
    } catch { /* ignore storage errors */ }
  }

  clearOverrides(): void {
    this.overrides.clear()
    localStorage.removeItem('contractory-ff-overrides')
  }

  getAll(): FeatureFlags & { _overrides: Partial<FeatureFlags> } {
    const overridesObj = Object.fromEntries(this.overrides) as Partial<FeatureFlags>
    return { ...this.flags, ...overridesObj, _overrides: overridesObj }
  }

  /** Load dev overrides from localStorage (called once on init) */
  loadOverrides(): void {
    if (!this.isDev || typeof window === 'undefined') return
    try {
      const stored = JSON.parse(localStorage.getItem('contractory-ff-overrides') ?? '{}')
      for (const [key, value] of Object.entries(stored)) {
        if (key in this.flags) {
          this.overrides.set(key as FlagKey, value as boolean)
        }
      }
    } catch { /* ignore */ }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

export const featureFlags = new FeatureFlagStore()

// ─── Convenience Functions ───────────────────────────────────────────────

export const isEnabled = (flag: FlagKey): boolean => featureFlags.isEnabled(flag)
