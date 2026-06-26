'use client'

import { type ReactNode, useEffect } from 'react'
import { WagmiProvider }       from 'wagmi'
import { RainbowKitProvider }  from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider }       from '@/components/design-system/theme-provider'
import { CommandPaletteProvider } from '@/components/layout/command-palette/provider'
import { Toaster }             from 'sonner'
import { wagmiConfig }         from '@/lib/wagmi/config'
import { featureFlags }        from '@/packages/feature-flags'
import { telemetry }           from '@/packages/telemetry'
import { commandRegistry, BUILT_IN_COMMANDS } from '@/packages/plugins/core/commands'
import { arcAdapter }          from '@/packages/blockchain/providers/arc'
import { blockchainRegistry }  from '@/packages/blockchain/core/interface'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  60_000,
      retry:      2,
      refetchOnWindowFocus: false,
    },
  },
})

function Initializer() {
  useEffect(() => {
    // Load dev flag overrides
    featureFlags.loadOverrides()

    // Register Arc blockchain provider
    blockchainRegistry.register(arcAdapter)

    // Register built-in commands
    commandRegistry.registerMany(BUILT_IN_COMMANDS)
    commandRegistry.loadRecent()

    // Init telemetry (off by default — user opt-in)
    telemetry.init(false)
  }, [])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" defaultAccent="indigo">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={72}
          >
            <CommandPaletteProvider>
              <Initializer />
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background:   'hsl(224, 14%, 8%)',
                    border:       '1px solid hsl(224, 10%, 16%)',
                    color:        'hsl(220, 18%, 95%)',
                    borderRadius: '8px',
                    fontSize:     '13px',
                  },
                }}
              />
            </CommandPaletteProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
