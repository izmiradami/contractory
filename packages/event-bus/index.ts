// Contractory Event Bus
// Plugins must never call each other directly — they emit events and subscribe.
// This keeps every module decoupled and testable in isolation.

// ─── Event Definitions ────────────────────────────────────────────────────

export interface ContractoryEvents {
  // Wallet
  'wallet.connected':    { address: string; chainId: number }
  'wallet.disconnected': Record<string, never>
  'wallet.chainChanged': { chainId: number }

  // Transactions
  'tx.pending':   { hash: string; chainId: number; description?: string }
  'tx.final':     { hash: string; chainId: number; success: boolean }
  'tx.failed':    { hash: string; chainId: number; reason: string }

  // Contracts
  'contract.deployed':  { address: string; chainId: number; name: string; type: string }
  'contract.verified':  { address: string; chainId: number }
  'contract.called':    { address: string; method: string; success: boolean }

  // Bridge
  'bridge.started':   { sourceChain: number; destChain: number; amount: string }
  'bridge.completed': { sourceChain: number; destChain: number; amount: string; txHash: string }
  'bridge.failed':    { sourceChain: number; destChain: number; reason: string }

  // Swap
  'swap.completed': { chainId: number; tokenIn: string; tokenOut: string; amount: string }

  // AI Agents (ERC-8004)
  'agent.registered': { address: string; onchainId: string; name: string }
  'agent.updated':    { address: string; onchainId: string }

  // AI Jobs (ERC-8183)
  'job.created':   { jobId: string; contractAddress: string; escrowAmount: string }
  'job.completed': { jobId: string; settlementTx: string }
  'job.disputed':  { jobId: string }

  // Notifications
  'notification.created': { id: string; type: string; title: string; body?: string }

  // Plugins
  'plugin.loaded':   { pluginId: string }
  'plugin.unloaded': { pluginId: string }
  'plugin.error':    { pluginId: string; error: string }

  // UI
  'theme.changed':   { theme: string; accent: string }
  'route.changed':   { path: string }
  'search.opened':   Record<string, never>
  'search.closed':   Record<string, never>
}

export type EventName = keyof ContractoryEvents
export type EventPayload<E extends EventName> = ContractoryEvents[E]
type Listener<E extends EventName> = (payload: EventPayload<E>) => void

// ─── Event Bus Implementation ─────────────────────────────────────────────

class EventBus {
  private listeners = new Map<EventName, Set<Listener<EventName>>>()
  private history: Array<{ event: EventName; payload: unknown; timestamp: number }> = []
  private readonly maxHistory = 100

  emit<E extends EventName>(event: E, payload: EventPayload<E>): void {
    // Store in history (useful for debugging)
    this.history.push({ event, payload, timestamp: Date.now() })
    if (this.history.length > this.maxHistory) this.history.shift()

    const handlers = this.listeners.get(event)
    if (!handlers) return

    handlers.forEach((handler) => {
      try {
        ;(handler as Listener<E>)(payload)
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err)
      }
    })
  }

  on<E extends EventName>(event: E, listener: Listener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as Listener<EventName>)
    // Return unsubscribe function
    return () => this.off(event, listener)
  }

  off<E extends EventName>(event: E, listener: Listener<E>): void {
    this.listeners.get(event)?.delete(listener as Listener<EventName>)
  }

  once<E extends EventName>(event: E, listener: Listener<E>): void {
    const wrapped: Listener<E> = (payload) => {
      listener(payload)
      this.off(event, wrapped)
    }
    this.on(event, wrapped)
  }

  clear(event?: EventName): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  getHistory() {
    return [...this.history]
  }

  listenerCount(event: EventName): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

export const eventBus = new EventBus()
