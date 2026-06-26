// Contractory Plugin System
// Every major feature is a plugin. Plugins are self-contained,
// declare their dependencies, and communicate only via EventBus.

import type { ComponentType, ReactNode } from 'react'
import type { EventName } from '../../event-bus'

// ─── Plugin Interface ─────────────────────────────────────────────────────

export interface NavItem {
  label:   string
  path:    string
  icon:    string              // Lucide icon name
  group:   string              // 'core' | 'finance' | 'agentic' | 'tools'
  badge?:  string | number
}

export interface PluginRoute {
  path:      string
  component: ComponentType
  title:     string
  exact?:    boolean
}

export interface PluginWidgetProps {
  chainId:       number
  walletAddress: string | undefined
  compact?:      boolean
}

export interface PluginManifest {
  id:          string
  name:        string
  description: string
  version:     string
  icon:        string          // Lucide icon name
  author?:     string

  // Dependencies
  requiredChains?:      string[]   // e.g. ['arc'] for Arc-only plugins
  requiredPermissions?: string[]
  requiredPlugins?:     string[]   // Plugin IDs this depends on

  // Feature flag gate
  featureFlag?: string

  // Navigation
  routes?:   PluginRoute[]
  navItems?: NavItem[]

  // Dashboard
  dashboardWidget?: ComponentType<PluginWidgetProps>
  settingsPanel?:   ComponentType

  // EventBus subscriptions (declared for discoverability)
  subscribesTo?: EventName[]
  emits?:        EventName[]

  // Lifecycle
  onLoad?:        () => Promise<void> | void
  onUnload?:      () => Promise<void> | void
  onChainChange?: (chainId: number) => void
  onWalletChange?: (address: string | undefined) => void
}

// ─── Plugin Status ────────────────────────────────────────────────────────

export type PluginStatus = 'unloaded' | 'loading' | 'active' | 'error' | 'disabled'

export interface LoadedPlugin {
  manifest: PluginManifest
  status:   PluginStatus
  error?:   string
  loadedAt?: number
}

// ─── Plugin Registry ─────────────────────────────────────────────────────

class PluginRegistry {
  private plugins = new Map<string, LoadedPlugin>()
  private listeners: Array<(plugins: LoadedPlugin[]) => void> = []

  register(manifest: PluginManifest): void {
    const existing = this.plugins.get(manifest.id)
    if (existing?.status === 'active') {
      console.warn(`[PluginRegistry] Plugin "${manifest.id}" is already active`)
      return
    }

    this.plugins.set(manifest.id, {
      manifest,
      status: 'unloaded',
    })
  }

  async load(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      console.error(`[PluginRegistry] Plugin "${pluginId}" not registered`)
      return false
    }

    this.update(pluginId, { status: 'loading' })

    try {
      await plugin.manifest.onLoad?.()
      this.update(pluginId, { status: 'active', loadedAt: Date.now() })
      this.notify()
      return true
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      this.update(pluginId, { status: 'error', error })
      console.error(`[PluginRegistry] Failed to load plugin "${pluginId}":`, err)
      return false
    }
  }

  async unload(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || plugin.status !== 'active') return

    try {
      await plugin.manifest.onUnload?.()
    } catch (err) {
      console.error(`[PluginRegistry] Error during unload of "${pluginId}":`, err)
    }

    this.update(pluginId, { status: 'unloaded' })
    this.notify()
  }

  get(id: string): LoadedPlugin | undefined {
    return this.plugins.get(id)
  }

  getAll(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  getActive(): LoadedPlugin[] {
    return this.getAll().filter((p) => p.status === 'active')
  }

  getNavItems(): NavItem[] {
    return this.getActive().flatMap((p) => p.manifest.navItems ?? [])
  }

  getRoutes(): PluginRoute[] {
    return this.getActive().flatMap((p) => p.manifest.routes ?? [])
  }

  getDashboardWidgets(): ComponentType<PluginWidgetProps>[] {
    return this.getActive()
      .map((p) => p.manifest.dashboardWidget)
      .filter((w): w is ComponentType<PluginWidgetProps> => w !== undefined)
  }

  onChainChange(chainId: number): void {
    this.getActive().forEach((p) => p.manifest.onChainChange?.(chainId))
  }

  onWalletChange(address: string | undefined): void {
    this.getActive().forEach((p) => p.manifest.onWalletChange?.(address))
  }

  subscribe(listener: (plugins: LoadedPlugin[]) => void): () => void {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter((l) => l !== listener) }
  }

  private update(id: string, patch: Partial<LoadedPlugin>): void {
    const existing = this.plugins.get(id)
    if (existing) this.plugins.set(id, { ...existing, ...patch })
  }

  private notify(): void {
    const all = this.getAll()
    this.listeners.forEach((l) => l(all))
  }
}

export const pluginRegistry = new PluginRegistry()

// ─── Plugin Context (React) ───────────────────────────────────────────────
// Implemented in Phase 5 when providers are wired up
export type PluginContextValue = {
  plugins:  LoadedPlugin[]
  registry: PluginRegistry
}

// ─── Provider wrapper (stub) ──────────────────────────────────────────────
export function createPluginProvider(children: ReactNode): ReactNode {
  return children // replaced with real context in Phase 5
}
