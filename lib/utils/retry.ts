// Retry utility with exponential backoff
// Use for: RPC calls, Supabase writes, ArcScan verify, event polling
// Never use for: wallet signature requests

export interface RetryOptions {
  maxAttempts:    number
  baseDelayMs:    number
  maxDelayMs:     number
  shouldRetry?:   (error: Error, attempt: number) => boolean
  onRetry?:       (error: Error, attempt: number) => void
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts:  3,
  baseDelayMs:  500,
  maxDelayMs:   10_000,
}

export async function withRetry<T>(
  fn:       () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      // Don't retry wallet rejections
      if (isWalletRejection(error)) throw error

      // Custom predicate
      if (opts.shouldRetry && !opts.shouldRetry(error, attempt)) throw error

      // Last attempt — throw
      if (attempt === opts.maxAttempts) throw error

      opts.onRetry?.(error, attempt)

      // Exponential backoff with jitter
      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200,
        opts.maxDelayMs
      )

      await new Promise((r) => setTimeout(r, delay))
    }
  }

  throw new Error('Retry exhausted')
}

function isWalletRejection(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    msg.includes('rejected by user') ||
    msg.includes('user cancelled') ||
    // MetaMask error codes
    (error as any).code === 4001 ||
    (error as any).code === 'ACTION_REJECTED'
  )
}

// Preset configurations
export const retryPresets = {
  rpc:         { maxAttempts: 3, baseDelayMs: 500,  maxDelayMs: 5_000  },
  supabase:    { maxAttempts: 3, baseDelayMs: 1_000, maxDelayMs: 10_000 },
  arcscan:     { maxAttempts: 5, baseDelayMs: 2_000, maxDelayMs: 30_000 },
  apiRoute:    { maxAttempts: 2, baseDelayMs: 300,  maxDelayMs: 2_000  },
} as const
