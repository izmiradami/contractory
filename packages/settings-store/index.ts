// Contractory Settings Store
// Persistent user preferences via Zustand + localStorage.
// All settings typed, no magic strings.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ─── Types ────────────────────────────────────────────────────────────────

type Language = 'en' | 'tr' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko'
type Theme = 'dark' | 'light' | 'system'
type Accent = 'indigo' | 'violet' | 'blue' | 'slate'
type GasDisplay = 'usdc' | 'gwei'    // Contractory default: 'usdc' always

export interface ContractorySettings {
  // Appearance
  appearance: {
    theme:  Theme
    accent: Accent
    reducedMotion: boolean
  }

  // Language
  locale: Language

  // Blockchain
  blockchain: {
    customRpcUrl:    string | null   // null = use default Arc Testnet
    explorerUrl:     string
    gasDisplay:      GasDisplay      // Always default to 'usdc' on Arc
    confirmBeforeSend: boolean
    showTestnets:    boolean
  }

  // AI
  ai: {
    provider:       'claude' | 'openai' | 'gemini'
    memoryEnabled:  boolean          // AI context memory
    streamResponses: boolean
  }

  // Developer
  developer: {
    developerMode:       boolean     // Show extra debug info
    experimentalFeatures: boolean
    showGasInGwei:       boolean     // Override for power users
    showRawHex:          boolean
    autoVerify:          boolean     // Auto-verify on deploy
  }

  // Notifications
  notifications: {
    txConfirmed:   boolean
    txFailed:      boolean
    bridgeComplete: boolean
    jobUpdates:    boolean
    agentEvents:   boolean
  }

  // Keyboard shortcuts
  shortcuts: {
    commandPalette: string           // Default: 'meta+k'
    quickDeploy:    string
    quickBridge:    string
    quickSearch:    string
  }

  // Privacy / Telemetry
  privacy: {
    telemetryEnabled:  boolean
    crashReports:      boolean
    analyticsEnabled:  boolean
  }
}

// ─── Defaults ────────────────────────────────────────────────────────────

export const defaultSettings: ContractorySettings = {
  appearance: {
    theme:  'dark',
    accent: 'indigo',
    reducedMotion: false,
  },
  locale: 'en',
  blockchain: {
    customRpcUrl:      null,
    explorerUrl:       'https://testnet.arcscan.app',
    gasDisplay:        'usdc',       // Arc-native default
    confirmBeforeSend: true,
    showTestnets:      true,
  },
  ai: {
    provider:        'claude',
    memoryEnabled:   true,
    streamResponses: true,
  },
  developer: {
    developerMode:        false,
    experimentalFeatures: false,
    showGasInGwei:        false,
    showRawHex:           false,
    autoVerify:           false,
  },
  notifications: {
    txConfirmed:    true,
    txFailed:       true,
    bridgeComplete: true,
    jobUpdates:     true,
    agentEvents:    false,
  },
  shortcuts: {
    commandPalette: 'meta+k',
    quickDeploy:    'meta+shift+d',
    quickBridge:    'meta+shift+b',
    quickSearch:    'meta+/',
  },
  privacy: {
    telemetryEnabled: false,
    crashReports:     false,
    analyticsEnabled: false,
  },
}

// ─── Store ────────────────────────────────────────────────────────────────

interface SettingsStore {
  settings: ContractorySettings
  updateAppearance: (patch: Partial<ContractorySettings['appearance']>) => void
  updateBlockchain: (patch: Partial<ContractorySettings['blockchain']>) => void
  updateAi:         (patch: Partial<ContractorySettings['ai']>) => void
  updateDeveloper:  (patch: Partial<ContractorySettings['developer']>) => void
  updateNotifications: (patch: Partial<ContractorySettings['notifications']>) => void
  updatePrivacy:    (patch: Partial<ContractorySettings['privacy']>) => void
  setLocale:        (locale: Language) => void
  reset:            () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      settings: defaultSettings,

      updateAppearance: (patch) =>
        set((state) => { Object.assign(state.settings.appearance, patch) }),

      updateBlockchain: (patch) =>
        set((state) => { Object.assign(state.settings.blockchain, patch) }),

      updateAi: (patch) =>
        set((state) => { Object.assign(state.settings.ai, patch) }),

      updateDeveloper: (patch) =>
        set((state) => { Object.assign(state.settings.developer, patch) }),

      updateNotifications: (patch) =>
        set((state) => { Object.assign(state.settings.notifications, patch) }),

      updatePrivacy: (patch) =>
        set((state) => { Object.assign(state.settings.privacy, patch) }),

      setLocale: (locale) =>
        set((state) => { state.settings.locale = locale }),

      reset: () =>
        set((state) => { state.settings = defaultSettings }),
    })),
    {
      name: 'contractory-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
