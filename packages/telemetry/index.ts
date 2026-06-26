// Contractory Telemetry
// Anonymous, opt-in only. No personal data. No wallet addresses.
// Measures: feature usage, performance, crash frequency.
// Users must explicitly enable in Settings > Privacy.

// ─── Types ────────────────────────────────────────────────────────────────

type TelemetryEvent =
  | { name: 'page.view';          props: { path: string } }
  | { name: 'feature.used';       props: { feature: string } }
  | { name: 'contract.deployed';  props: { type: string; chainId: number } }
  | { name: 'bridge.used';        props: { sourceChain: number; destChain: number } }
  | { name: 'ai.prompt';          props: { task: string; provider: string } }
  | { name: 'plugin.installed';   props: { pluginId: string } }
  | { name: 'error.crash';        props: { component: string; message: string } }
  | { name: 'performance.metric'; props: { metric: string; value: number; unit: string } }

// ─── Telemetry Class ─────────────────────────────────────────────────────

class TelemetryService {
  private enabled = false
  private sessionId: string = ''
  // anonymousId is a random ID generated once, no personal data
  private anonymousId: string = ''

  init(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) return

    if (typeof window === 'undefined') return

    // Generate anonymous IDs (no wallet, no address)
    this.anonymousId = this.getOrCreateAnonymousId()
    this.sessionId = crypto.randomUUID()
  }

  track(event: TelemetryEvent): void {
    if (!this.enabled) return

    const payload = {
      event: event.name,
      props: event.props,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      // No wallet addresses, no personal data
    }

    // In production: POST to /api/telemetry (batched)
    if (process.env.NODE_ENV === 'production') {
      this.queue(payload)
    }
  }

  trackPerformance(metric: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms'): void {
    this.track({ name: 'performance.metric', props: { metric, value, unit } })
  }

  trackError(component: string, error: Error): void {
    this.track({
      name: 'error.crash',
      props: { component, message: error.message.substring(0, 100) }, // truncate
    })
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (enabled) {
      this.init(true)
    }
  }

  // ─── Private ───────────────────────────────────────────────────────────

  private queue: ((payload: unknown) => void) = (_payload) => {
    
  }

  private getOrCreateAnonymousId(): string {
    try {
      const stored = localStorage.getItem('contractory-anon-id')
      if (stored) return stored
      const id = crypto.randomUUID()
      localStorage.setItem('contractory-anon-id', id)
      return id
    } catch {
      return crypto.randomUUID()
    }
  }
}

export const telemetry = new TelemetryService()
