'use client'

import { type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/design-system/theme-provider'
import { CommandPaletteProvider } from '@/components/layout/command-palette/provider'
import { Toaster } from 'sonner'
import { wagmiConfig } from '@/lib/wagmi/config'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" defaultAccent="indigo">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            <CommandPaletteProvider>
              {children}
              <Toaster position="bottom-right" theme="dark" />
            </CommandPaletteProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}