// Environment validation — called at build time and server startup.
// Fails loudly if required server-side secrets are missing.
// Client-side vars are validated at runtime in the browser.

const REQUIRED_SERVER = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const REQUIRED_PUBLIC = [
  'NEXT_PUBLIC_ARC_RPC_URL',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
] as const

export function validateEnv(): void {
  // Only run on server
  if (typeof window !== 'undefined') return

  const missing: string[] = []

  for (const key of REQUIRED_SERVER) {
    if (!process.env[key]) missing.push(key)
  }

  // Public vars — warn but don't throw (have defaults)
  for (const key of REQUIRED_PUBLIC) {
    if (!process.env[key]) {
      console.warn(`[Contractory] Optional env var ${key} is not set — using default`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Contractory] Missing required environment variables:\n` +
      missing.map((k) => `  • ${k}`).join('\n') +
      `\n\nCopy .env.example to .env.local and fill in the values.`
    )
  }
}

// Typed env access (never use process.env directly in app code)
export const env = {
  supabaseUrl:        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  arcRpcUrl:          process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network',
  walletConnectId:    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  appUrl:             process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  isProduction:       process.env.NODE_ENV === 'production',
  isDevelopment:      process.env.NODE_ENV === 'development',
} as const
