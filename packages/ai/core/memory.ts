// Contractory AI Memory System
// The AI Assistant knows the current platform context automatically.
// Context is injected into every AI request — no manual "tell me about my contract" needed.

// ─── Types ────────────────────────────────────────────────────────────────

export interface ContractoryContext {
  // Wallet
  walletAddress: string | null
  chainId:       number
  usdcBalance:   string | null     // Formatted: "$X.XX USDC"

  // Navigation
  currentPage:  string
  currentRoute: string

  // Active items
  activeContract: {
    address: string
    name:    string
    type:    string
    chainId: number
  } | null

  activeTx: {
    hash:   string
    status: 'pending' | 'final' | 'failed'
    method: string
  } | null

  // Recent activity
  recentDeployments: Array<{
    address: string
    name:    string
    type:    string
    deployedAt: string
  }>

  recentErrors: Array<{
    message:   string
    context:   string
    timestamp: string
  }>

  recentTxHashes: string[]

  // Project context
  project: {
    contractCount: number
    agentCount:    number
    openJobCount:  number
  }
}

// ─── Memory Store ─────────────────────────────────────────────────────────

class AIMemoryStore {
  private context: ContractoryContext = {
    walletAddress:     null,
    chainId:           72,
    usdcBalance:       null,
    currentPage:       '/',
    currentRoute:      '/',
    activeContract:    null,
    activeTx:          null,
    recentDeployments: [],
    recentErrors:      [],
    recentTxHashes:    [],
    project: {
      contractCount: 0,
      agentCount:    0,
      openJobCount:  0,
    },
  }

  update(patch: Partial<ContractoryContext>): void {
    Object.assign(this.context, patch)
  }

  setWallet(address: string | null, chainId: number, balance: string | null): void {
    this.context.walletAddress = address
    this.context.chainId = chainId
    this.context.usdcBalance = balance
  }

  setCurrentPage(page: string, route: string): void {
    this.context.currentPage = page
    this.context.currentRoute = route
  }

  setActiveContract(contract: ContractoryContext['activeContract']): void {
    this.context.activeContract = contract
  }

  setActiveTx(tx: ContractoryContext['activeTx']): void {
    this.context.activeTx = tx
  }

  addRecentDeployment(deployment: ContractoryContext['recentDeployments'][0]): void {
    this.context.recentDeployments = [
      deployment,
      ...this.context.recentDeployments,
    ].slice(0, 5)
  }

  addError(error: { message: string; context: string }): void {
    this.context.recentErrors = [
      { ...error, timestamp: new Date().toISOString() },
      ...this.context.recentErrors,
    ].slice(0, 3)
  }

  addTxHash(hash: string): void {
    this.context.recentTxHashes = [hash, ...this.context.recentTxHashes].slice(0, 5)
  }

  getContext(): ContractoryContext {
    return { ...this.context }
  }

  /**
   * Serialize context for injection into AI system prompts.
   * Produces a compact, human-readable summary.
   */
  toSystemContext(): string {
    const ctx = this.context
    const lines: string[] = []

    lines.push('## Current Platform Context')

    if (ctx.walletAddress) {
      lines.push(`- Wallet: ${ctx.walletAddress} (Chain ID: ${ctx.chainId})`)
    } else {
      lines.push('- Wallet: Not connected')
    }

    if (ctx.usdcBalance) {
      lines.push(`- USDC Balance: ${ctx.usdcBalance}`)
    }

    lines.push(`- Current Page: ${ctx.currentPage}`)

    if (ctx.activeContract) {
      lines.push(
        `- Active Contract: ${ctx.activeContract.name} (${ctx.activeContract.type}) at ${ctx.activeContract.address}`
      )
    }

    if (ctx.activeTx) {
      lines.push(`- Active TX: ${ctx.activeTx.hash} — ${ctx.activeTx.status}`)
    }

    if (ctx.recentDeployments.length > 0) {
      lines.push('- Recent Deployments:')
      ctx.recentDeployments.forEach((d) => {
        lines.push(`  • ${d.name} (${d.type}) at ${d.address}`)
      })
    }

    if (ctx.recentErrors.length > 0) {
      lines.push('- Recent Errors:')
      ctx.recentErrors.forEach((e) => {
        lines.push(`  • [${e.context}] ${e.message}`)
      })
    }

    lines.push(
      `- Project: ${ctx.project.contractCount} contracts, ` +
      `${ctx.project.agentCount} agents, ${ctx.project.openJobCount} open jobs`
    )

    return lines.join('\n')
  }
}

export const aiMemory = new AIMemoryStore()
