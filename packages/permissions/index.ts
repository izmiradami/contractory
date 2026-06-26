// Contractory Permission System
// Role-based access control for the platform.
// Roles: guest → developer → admin (+ special: plugin, ai, readonly)

// ─── Types ────────────────────────────────────────────────────────────────

export type Role = 'guest' | 'developer' | 'admin' | 'plugin' | 'ai' | 'readonly'

export type Permission =
  // Contract operations
  | 'contracts.read'
  | 'contracts.write'
  | 'contracts.deploy'
  | 'contracts.verify'
  // Wallet operations
  | 'wallet.read'
  | 'wallet.sign'
  // Bridge / Swap
  | 'bridge.use'
  | 'swap.use'
  // AI
  | 'ai.use'
  | 'ai.configure'
  // Agents & Jobs
  | 'agents.read'
  | 'agents.register'
  | 'jobs.read'
  | 'jobs.create'
  | 'jobs.settle'
  // Events
  | 'events.read'
  | 'events.export'
  | 'events.webhook'
  // Batch
  | 'batch.read'
  | 'batch.execute'
  // Settings
  | 'settings.read'
  | 'settings.write'
  // Admin
  | 'admin.users'
  | 'admin.plugins'
  | 'admin.flags'
  // Plugins
  | 'plugins.install'
  | 'plugins.configure'

// ─── Role Definitions ─────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: [
    'contracts.read',
    'agents.read',
    'jobs.read',
    'events.read',
    'settings.read',
  ],

  readonly: [
    'contracts.read',
    'wallet.read',
    'agents.read',
    'jobs.read',
    'events.read',
    'events.export',
    'settings.read',
  ],

  developer: [
    'contracts.read', 'contracts.write', 'contracts.deploy', 'contracts.verify',
    'wallet.read', 'wallet.sign',
    'bridge.use', 'swap.use',
    'ai.use',
    'agents.read', 'agents.register',
    'jobs.read', 'jobs.create', 'jobs.settle',
    'events.read', 'events.export', 'events.webhook',
    'batch.read', 'batch.execute',
    'settings.read', 'settings.write',
    'plugins.install', 'plugins.configure',
  ],

  admin: [
    // All developer permissions
    'contracts.read', 'contracts.write', 'contracts.deploy', 'contracts.verify',
    'wallet.read', 'wallet.sign',
    'bridge.use', 'swap.use',
    'ai.use', 'ai.configure',
    'agents.read', 'agents.register',
    'jobs.read', 'jobs.create', 'jobs.settle',
    'events.read', 'events.export', 'events.webhook',
    'batch.read', 'batch.execute',
    'settings.read', 'settings.write',
    'plugins.install', 'plugins.configure',
    // Admin-only
    'admin.users', 'admin.plugins', 'admin.flags',
  ],

  plugin: [
    'contracts.read',
    'events.read',
    'settings.read',
  ],

  ai: [
    'contracts.read',
    'events.read',
    'ai.use',
    'agents.read',
    'jobs.read',
  ],
}

// ─── Permission Checker ───────────────────────────────────────────────────

class PermissionChecker {
  private currentRole: Role = 'guest'
  private additionalPermissions: Set<Permission> = new Set()

  setRole(role: Role): void {
    this.currentRole = role
  }

  getRole(): Role {
    return this.currentRole
  }

  can(permission: Permission): boolean {
    if (this.additionalPermissions.has(permission)) return true
    return ROLE_PERMISSIONS[this.currentRole].includes(permission)
  }

  canAll(permissions: Permission[]): boolean {
    return permissions.every((p) => this.can(p))
  }

  canAny(permissions: Permission[]): boolean {
    return permissions.some((p) => this.can(p))
  }

  grant(permission: Permission): void {
    this.additionalPermissions.add(permission)
  }

  revoke(permission: Permission): void {
    this.additionalPermissions.delete(permission)
  }

  getPermissions(): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[this.currentRole]
    return [...new Set([...rolePerms, ...this.additionalPermissions])]
  }
}

export const permissions = new PermissionChecker()

// ─── React hook (Phase 5) ─────────────────────────────────────────────────
// export function usePermission(permission: Permission): boolean {
//   — implemented when auth context is available
// }
